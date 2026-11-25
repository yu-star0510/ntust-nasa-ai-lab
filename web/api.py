"""Local, read-only HTTP adapter for the accepted M2 FD001 repository."""

from __future__ import annotations

import argparse
import json
import linecache
import re
import signal
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qsl

PROJECT_ROOT = Path(__file__).resolve().parents[1]
# M2 uses sibling imports and is kept unchanged for this work order.
sys.path.insert(0, str(PROJECT_ROOT / "research"))

from m2_fd001_analysis import CONTRACT_JSON, FD001Repository, validate_contract
from m2_fd001_validate import (
    COLUMN_NAMES, DEFAULT_INPUT_DIR, SENSOR_NAMES, SETTING_NAMES, ValidationError,
    sha256_file,
)

HOST = "127.0.0.1"
VERSION = "1.0.1"
DATASET = "NASA_CMAPSS_FD001"
SOURCE_TYPE = "TRUSTED_LOCAL_FILES"
SPLITS = ("train", "test")
MAX_CYCLE_SPAN = 100
MAX_QUERY_LENGTH = 512
# Approved in WO-M3-WEB-001 and cross-checked against the accepted contract.
SOURCES = {
    "train": ("FD001/train_FD001.txt", "963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8"),
    "test": ("FD001/test_FD001.txt", "3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851"),
    "rul": ("FD001/RUL_FD001.txt", "a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca"),
}
ROUTES = {
    "/api/health": (),
    "/api/catalog": (),
    "/api/units": ("split",),
    "/api/history": ("split", "unit", "sensor", "start", "end"),
}


class APIError(Exception):
    def __init__(self, status: int, code: str, message: str, **details: object):
        super().__init__(message)
        self.status = status
        self.code = code
        self.details = details


def verify_contract() -> None:
    try:
        contract = json.loads(CONTRACT_JSON.read_text(encoding="utf-8"))
        manifest = {
            name: {"path": path, "sha256": digest}
            for name, (path, digest) in SOURCES.items()
        }
        if (
            validate_contract(CONTRACT_JSON)["valid"]
            and contract["main_acceptance"] == "ACCEPTED"
            and contract["source_files"] == manifest
            and contract["dataset"] == DATASET
            and contract["source_type"] == SOURCE_TYPE
            and contract["splits"] == list(SPLITS)
        ):
            return
    except (OSError, TypeError, KeyError, ValueError):
        pass
    raise APIError(503, "CONTRACT_NOT_ACCEPTED", "The approved FD001 contract is unavailable or invalid")


def verify_sources() -> None:
    for name, (relative_path, expected_hash) in SOURCES.items():
        path = PROJECT_ROOT / relative_path
        try:
            if path.resolve(strict=True) != path or not path.is_file():
                raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Unsafe source path", source=name, hash_verified=False)
            digest = sha256_file(path)
        except OSError:
            raise APIError(503, "DATA_NOT_READY", "A required source cannot be read", source=name, hash_verified=False) from None
        except RuntimeError:
            raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Unsafe source path", source=name, hash_verified=False) from None
        if digest != expected_hash:
            raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Source SHA-256 verification failed", source=name, hash_verified=False)


def parse_query(query: str, expected: tuple[str, ...]) -> dict[str, str]:
    try:
        if len(query) > MAX_QUERY_LENGTH:
            raise ValueError
        pairs = parse_qsl(query, keep_blank_values=True, strict_parsing=True,
                          errors="strict", max_num_fields=len(expected))
    except ValueError:
        raise APIError(400, "INVALID_PARAMETER", "Invalid query parameters") from None
    params = dict(pairs)
    if len(pairs) != len(params) or set(params) != set(expected):
        raise APIError(400, "INVALID_PARAMETER", "Supply each required parameter exactly once")
    return params


def integer(params: dict[str, str], name: str) -> int:
    token = params[name]
    if not re.fullmatch(r"[0-9]{1,10}", token):
        raise APIError(400, "INVALID_PARAMETER", "Expected an unsigned decimal integer", parameter=name)
    return int(token)


def ready() -> None:
    verify_contract()
    verify_sources()


class FD001API:
    def __init__(self) -> None:
        self.repository = None
        self.startup_error = None
        try:
            ready()
            linecache.clearcache()
            repository = FD001Repository(DEFAULT_INPUT_DIR)
            for name, (_, digest) in SOURCES.items():
                if getattr(repository, name).source_sha256 != digest:
                    raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Loaded source failed SHA-256 verification",
                                   source=name, hash_verified=False)
            self.summary = {}
            for split in SPLITS:
                quality = repository.get_quality_summary(split)
                self.summary[split] = {
                    key: quality[key] for key in ("rows", "columns", "unit_count", "missing_total")
                }
            ready()
            self.repository = repository
        except APIError as error:
            self.startup_error = error.code
        except (OSError, RuntimeError, ValidationError, KeyError):
            self.startup_error = "DATA_NOT_READY"

    def get(self, path: str, query: str) -> dict:
        if path not in ROUTES:
            raise APIError(404, "UNKNOWN_ENDPOINT", "Unknown API endpoint")
        ready()
        if self.repository is None:
            raise APIError(503, "DATA_NOT_READY", "Validated data did not load at startup. Restart the service")
        params = parse_query(query, ROUTES[path])
        if path == "/api/health":
            data = {
                "service": "fd001-api", "readiness": "ready", "contract_version": VERSION,
                "source_type": SOURCE_TYPE, "validation_status": "PASS",
                "sources": {name: {"hash_verified": True} for name in SOURCES},
            }
        elif path == "/api/catalog":
            data = {
                "dataset": DATASET, "source_type": SOURCE_TYPE, "contract_version": VERSION,
                "splits": list(SPLITS), "summary": self.summary,
                "sensors": self.column_catalog(SENSOR_NAMES),
                "operational_settings": self.column_catalog(SETTING_NAMES),
                "max_history_cycle_span": MAX_CYCLE_SPAN,
            }
        else:
            split = params["split"]
            if split not in SPLITS:
                raise APIError(400, "INVALID_PARAMETER", "Split must be train or test", parameter="split")
            if path == "/api/units":
                units = self.repository.get_units(split)
                source_file, source_sha256 = SOURCES[split]
                data = {"dataset_split": split, "unit_ids": units, "count": len(units),
                        "source_file": source_file, "source_sha256": source_sha256}
            else:
                data = self.history(split, params)
        ready()
        return data

    @staticmethod
    def column_catalog(names: list[str]) -> list[dict]:
        return [
            {"index": index, "name": name, "source_column_index": COLUMN_NAMES.index(name) + 1}
            for index, name in enumerate(names, start=1)
        ]

    def history(self, split: str, params: dict[str, str]) -> dict:
        unit = integer(params, "unit")
        sensor = integer(params, "sensor")
        start, end = integer(params, "start"), integer(params, "end")
        if unit < 1:
            raise APIError(400, "INVALID_PARAMETER", "Unit must be positive", parameter="unit")
        if not 1 <= sensor <= len(SENSOR_NAMES):
            raise APIError(400, "INVALID_SENSOR", "Sensor must be in 1..21")
        if start < 1 or end < start or end - start + 1 > MAX_CYCLE_SPAN:
            raise APIError(400, "INVALID_CYCLE_RANGE", "Invalid inclusive cycle range", max_cycle_span=MAX_CYCLE_SPAN)
        try:
            cycles = self.repository.get_cycles(split, unit)
        except KeyError:
            raise APIError(404, "UNKNOWN_UNIT", "Unit was not found in the selected split") from None

        name = SENSOR_NAMES[sensor - 1]
        source_file, digest = SOURCES[split]
        # M2 loads the file on its first reference and reuses that read within this request.
        linecache.clearcache()
        points = []
        for cycle in cycles:
            if not start <= cycle <= end:
                continue
            try:
                ref = self.repository.get_raw_reference(split, unit, cycle, name)
            except (KeyError, OSError, ValidationError):
                raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Source row verification failed") from None
            if (
                not ref["reread_matches"]
                or ref["source_file"] != source_file
                or ref["source_sha256"] != digest
                or (ref["dataset_split"], ref["unit_id"], ref["cycle"], ref["column_name"])
                != (split, unit, cycle, name)
                or ref["source_column_index"] != COLUMN_NAMES.index(name) + 1
            ):
                raise APIError(503, "SOURCE_INTEGRITY_ERROR", "Source row verification failed")
            points.append({"cycle": cycle, "value": float(ref["original_value"]),
                           "sensor_name": name, "raw_reference": ref})
        return {"dataset_split": split, "unit_id": unit, "sensor_name": name,
                "start": start, "end": end, "points": points, "count": len(points)}


class FD001Handler(BaseHTTPRequestHandler):
    default_request_version = "HTTP/1.0"

    def log_message(self, format, *args) -> None:
        # Request targets and headers are client-controlled and are not logged.
        pass

    def send_error(self, code, message=None, explain=None) -> None:
        self.send_api_error(APIError(code, "INVALID_REQUEST", "Invalid HTTP request"))

    def parse_request(self) -> bool:
        if not super().parse_request():
            return False
        if self.request_version == "HTTP/0.9":
            self.request_version = "HTTP/1.0"
            self.send_error(400)
            return False
        if self.command != "GET":
            self.send_api_error(APIError(405, "METHOD_NOT_ALLOWED", "Only GET is supported"))
            return False
        return True

    def do_GET(self) -> None:
        try:
            target = self.requestline.split()[1]
            host = f"{HOST}:{self.server.server_port}"
            if self.headers.get_all("Host") not in ([host], [HOST]):
                raise APIError(400, "INVALID_REQUEST", "Use the loopback server address in Host")
            if (not target.startswith("/") or target.startswith("//") or "#" in target
                or any(not 33 <= ord(char) <= 126 for char in target)):
                raise APIError(400, "INVALID_REQUEST", "Expected an origin-form request target")
            path, _, query = target.partition("?")
            data = self.server.api.get(path, query)
            self.send_json(200, {"status": "ok", "data": data,
                                 "meta": {"schema_version": "1.0", "source": f"FD001_DATA_CONTRACT v{VERSION}"}})
        except APIError as error:
            self.send_api_error(error)
        except (ConnectionError, TimeoutError):
            pass

    def send_api_error(self, error: APIError) -> None:
        self.send_json(error.status, {"status": "error", "error": {
            "code": error.code, "message": str(error), "details": error.details,
        }})

    def send_json(self, status: int, body: dict) -> None:
        payload = json.dumps(body, allow_nan=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Connection", "close")
        if status == 405:
            self.send_header("Allow", "GET")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(payload)


class FD001Server(HTTPServer):
    def __init__(self, port: int, api: FD001API) -> None:
        self.api = api
        super().__init__((HOST, port), FD001Handler)

    def get_request(self):
        connection, address = super().get_request()
        connection.settimeout(5)
        return connection, address


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve the local read-only FD001 API")
    parser.add_argument("--port", type=int, default=8765, help="TCP port (default: 8765)")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("port must be in 1..65535")
    api = FD001API()
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, signal.default_int_handler)
    try:
        with FD001Server(args.port, api) as server:
            state = api.startup_error or "ready"
            print(f"FD001 API listening on http://{HOST}:{server.server_port} ({state})", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
        print("FD001 API stopped", flush=True)
        return 0
    except OSError:
        print("FD001 API could not listen on the requested loopback port", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
