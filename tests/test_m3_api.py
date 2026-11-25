from __future__ import annotations

import hashlib
import http.client
import json
import subprocess
import sys
import tempfile
import threading
import unittest
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

from web import api


ROOT = Path(__file__).resolve().parents[1]
HISTORY = "/api/history?split=train&unit=1&sensor=7&start=1&end=20"
VALID_REQUESTS = ("/api/health", "/api/catalog", "/api/units?split=train", HISTORY)


def local_hashes() -> dict[str, str]:
    return {name: hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
            for name, (path, _) in api.SOURCES.items()}


def raw_observations(split: str, unit: int, start: int, end: int) -> list[tuple]:
    """Independently scan the original text without M2 or API parsing/indexes."""
    filename = ROOT / "FD001" / f"{split}_FD001.txt"
    points = []
    data_row = 0
    with filename.open(encoding="utf-8", newline="") as stream:
        for physical_line, line in enumerate(stream, start=1):
            fields = line.split()
            if not fields:
                continue
            actual_unit, cycle = int(fields[0]), int(fields[1])
            if actual_unit == unit and start <= cycle <= end:
                if len(fields) != 26:
                    raise AssertionError("Unexpected source row width")
                points.append((cycle, physical_line, data_row, fields[11]))
            data_row += 1
    return sorted(points)


@contextmanager
def running_server(service):
    with api.FD001Server(0, service) as server:
        thread = threading.Thread(target=server.serve_forever, kwargs={"poll_interval": 0.01})
        thread.start()
        try:
            yield server
        finally:
            server.shutdown()
            thread.join()


def request(server, path, method="GET", headers=None):
    connection = http.client.HTTPConnection("127.0.0.1", server.server_port, timeout=10)
    try:
        connection.request(method, path, headers=headers or {})
        response = connection.getresponse()
        content = response.read()
        return response.status, dict(response.getheaders()), json.loads(content) if content else {}
    finally:
        connection.close()


class TestM3API(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.hashes_before = local_hashes()
        cls.expected_hashes = {name: digest for name, (_, digest) in api.SOURCES.items()}
        if cls.hashes_before != cls.expected_hashes:
            raise AssertionError("Local FD001 hashes do not match the accepted contract")
        cls.service = api.FD001API()
        context = running_server(cls.service)
        cls.server = context.__enter__()
        cls.addClassCleanup(context.__exit__, None, None, None)

    @classmethod
    def tearDownClass(cls):
        if local_hashes() != cls.hashes_before:
            raise AssertionError("Local FD001 hashes changed during the API tests")

    def success(self, path):
        status, headers, body = request(self.server, path)
        self.assertEqual(status, 200, body)
        self.assertEqual(headers["Content-Type"], "application/json; charset=utf-8")
        self.assertEqual(headers["Cache-Control"], "no-store")
        self.assertEqual(set(body), {"status", "data", "meta"})
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["meta"], {"schema_version": "1.0", "source": "FD001_DATA_CONTRACT v1.0.1"})
        return body["data"]

    def error(self, path, expected_status, code, method="GET", server=None, headers=None):
        status, response_headers, body = request(server or self.server, path, method, headers)
        self.assertEqual(status, expected_status, body)
        self.assertEqual(response_headers["Content-Type"], "application/json; charset=utf-8")
        self.assertEqual(set(body), {"status", "error"})
        self.assertEqual(body["status"], "error")
        self.assertEqual(set(body["error"]), {"code", "message", "details"})
        self.assertEqual(body["error"]["code"], code)
        self.assertNotIn(str(ROOT), json.dumps(body))
        self.assertNotIn("Traceback", json.dumps(body))
        return response_headers

    def unavailable(self, code, server=None):
        for path in VALID_REQUESTS:
            with self.subTest(path=path):
                self.error(path, 503, code, server=server)

    def assert_no_nulls(self, value):
        self.assertIsNotNone(value)
        if isinstance(value, dict):
            for item in value.values():
                self.assert_no_nulls(item)
        elif isinstance(value, list):
            for item in value:
                self.assert_no_nulls(item)

    def crosscheck(self, split, unit, start, end):
        route = f"/api/history?split={split}&unit={unit}&sensor=7&start={start}&end={end}"
        data = self.success(route)
        expected = raw_observations(split, unit, start, end)
        self.assertEqual(data["count"], len(expected))
        self.assertEqual(len(data["points"]), len(expected))
        self.assertEqual((data["dataset_split"], data["unit_id"], data["sensor_name"], data["start"], data["end"]),
                         (split, unit, "sensor_7", start, end))
        for point, (cycle, line, row, token) in zip(data["points"], expected, strict=True):
            self.assertEqual(point, {
                "cycle": cycle, "value": float(token), "sensor_name": "sensor_7", "raw_reference": {
                    "dataset_split": split, "unit_id": unit, "cycle": cycle,
                    "source_file": f"FD001/{split}_FD001.txt", "source_sha256": self.hashes_before[split],
                    "physical_line_number": line, "data_row_index": row, "data_row_index_base": 0,
                    "source_column_index": 12, "column_name": "sensor_7", "original_value": token,
                    "reread_value": token, "reread_matches": True,
                },
            })
        return data

    def test_health_ready_and_all_sources_verified(self):
        health = self.success("/api/health")
        self.assertEqual(health["readiness"], "ready")
        self.assertEqual(health["validation_status"], "PASS")
        self.assertEqual(health["sources"], {name: {"hash_verified": True} for name in self.expected_hashes})

    def test_catalog_fields_and_safe_summary(self):
        catalog = self.success("/api/catalog")
        self.assertEqual(catalog["dataset"], "NASA_CMAPSS_FD001")
        self.assertEqual(catalog["source_type"], "TRUSTED_LOCAL_FILES")
        self.assertEqual(catalog["contract_version"], "1.0.1")
        self.assertEqual(catalog["splits"], ["train", "test"])
        self.assertEqual(catalog["summary"], {
            "train": {"rows": 20631, "columns": 26, "unit_count": 100, "missing_total": 0},
            "test": {"rows": 13096, "columns": 26, "unit_count": 100, "missing_total": 0},
        })
        for field, prefix, count, offset in (("sensors", "sensor", 21, 5), ("operational_settings", "setting", 3, 2)):
            self.assertEqual(catalog[field], [{"index": index, "name": f"{prefix}_{index}",
                                              "source_column_index": index + offset}
                                             for index in range(1, count + 1)])

    def test_units_sorted_and_scoped_to_verified_source(self):
        for split in ("train", "test"):
            filename = f"FD001/{split}_FD001.txt"
            with (ROOT / filename).open(encoding="utf-8") as stream:
                units = sorted({int(fields[0]) for line in stream if (fields := line.split())})
            self.assertEqual(self.success(f"/api/units?split={split}"), {
                "dataset_split": split, "unit_ids": units, "count": len(units),
                "source_file": filename, "source_sha256": self.hashes_before[split],
            })

    def test_required_history_and_full_provenance_against_raw_file(self):
        data = self.crosscheck("train", 1, 1, 20)
        self.assertEqual([point["cycle"] for point in data["points"]], list(range(1, 21)))

    def test_split_and_unit_isolation_against_raw_files(self):
        train_1 = self.crosscheck("train", 1, 1, 2)["points"]
        train_2 = self.crosscheck("train", 2, 1, 2)["points"]
        test_2 = self.crosscheck("test", 2, 1, 2)["points"]
        self.assertEqual(len(train_2), 2)
        self.assertEqual(len(test_2), 2)
        self.assertNotEqual(train_1, train_2)
        self.assertNotEqual(train_2, test_2)
        self.assertGreater(train_2[0]["raw_reference"]["physical_line_number"], 1)

    def test_cycle_boundary_singleton_and_empty_windows(self):
        last_cycle = raw_observations("train", 1, 1, 10_000)[-1][0]
        boundary = self.crosscheck("train", 1, last_cycle, last_cycle + 1)
        self.assertEqual([point["cycle"] for point in boundary["points"]], [last_cycle])
        self.assertEqual(self.crosscheck("train", 1, 1, 1)["count"], 1)
        empty = self.crosscheck("train", 1, last_cycle + 1, last_cycle + 2)
        self.assertEqual((empty["points"], empty["count"]), ([], 0))

    def test_invalid_and_unknown_units(self):
        self.error(HISTORY.replace("unit=1", "unit=0"), 400, "INVALID_PARAMETER")
        self.error(HISTORY.replace("unit=1", "unit=9999"), 404, "UNKNOWN_UNIT")

    def test_invalid_sensor_boundaries(self):
        for sensor in (0, 22):
            self.error(HISTORY.replace("sensor=7", f"sensor={sensor}"), 400, "INVALID_SENSOR")

    def test_invalid_split(self):
        self.error("/api/units?split=validation", 400, "INVALID_PARAMETER")
        self.error(HISTORY.replace("split=train", "split=Train"), 400, "INVALID_PARAMETER")

    def test_reversed_zero_and_excessive_cycle_ranges(self):
        for start, end in ((20, 1), (0, 1), (1, 101)):
            route = f"/api/history?split=train&unit=1&sensor=7&start={start}&end={end}"
            self.error(route, 400, "INVALID_CYCLE_RANGE")
        self.assertEqual(self.success(HISTORY.replace("end=20", "end=100"))["count"], 100)

    def test_missing_extra_duplicate_and_malformed_parameters(self):
        for route in (
            HISTORY.replace("unit=1", "unit=1.0"), HISTORY.replace("unit=1", "unit=1e0"),
            HISTORY.replace("unit=1", "unit=%FF"), HISTORY.replace("&unit=1", ""),
            HISTORY.replace("unit=1", "unit="), HISTORY.replace("unit=1", "unit=12345678901"),
            HISTORY + "&x=1", HISTORY + "&unit=1", "/api/units?split", "/api/units",
            "/api/health?x=1", "/api/catalog?path=..%2FFD001%2Ftrain_FD001.txt",
        ):
            with self.subTest(route=route):
                self.error(route, 400, "INVALID_PARAMETER")

    def test_missing_source_at_startup_and_during_service(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(api, "PROJECT_ROOT", Path(directory)):
            self.unavailable("DATA_NOT_READY")
            startup = api.FD001API()
            self.assertIsNone(startup.repository)
            with running_server(startup) as server:
                self.unavailable("DATA_NOT_READY", server)

    def test_hash_mismatch_fails_all_routes_closed(self):
        actual_hash = api.sha256_file
        wrong_hash = hashlib.sha256(b"SYNTHETIC corrupt RUL fixture").hexdigest()
        with patch.object(api, "sha256_file", side_effect=lambda path: (
            wrong_hash if path.name == "RUL_FD001.txt" else actual_hash(path)
        )):
            self.unavailable("SOURCE_INTEGRITY_ERROR")
            startup = api.FD001API()
            self.assertIsNone(startup.repository)
            self.assertEqual(startup.startup_error, "SOURCE_INTEGRITY_ERROR")

    def test_unaccepted_and_tampered_contract_fails_all_routes_closed(self):
        approved = json.loads(api.CONTRACT_JSON.read_text(encoding="utf-8"))
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "contract.json"
            for altered in (dict(approved, main_acceptance="PENDING"), dict(approved, source_files={})):
                path.write_text(json.dumps(altered), encoding="utf-8")
                with patch.object(api, "CONTRACT_JSON", path):
                    self.unavailable("CONTRACT_NOT_ACCEPTED")

    def test_invalid_source_path_and_failed_reread_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / api.SOURCES["train"][0]).mkdir(parents=True)
            with patch.object(api, "PROJECT_ROOT", root):
                self.unavailable("SOURCE_INTEGRITY_ERROR")
        repository = self.service.repository
        original = repository.get_raw_reference

        def mismatch(*args):
            return dict(original(*args), reread_matches=False)

        with patch.object(repository, "get_raw_reference", side_effect=mismatch):
            self.error(HISTORY, 503, "SOURCE_INTEGRITY_ERROR")

    def test_failure_to_load_repository_fails_all_routes_closed(self):
        with patch.object(api, "FD001Repository", side_effect=RuntimeError("SYNTHETIC loader failure")):
            startup = api.FD001API()
        with running_server(startup) as server:
            self.unavailable("DATA_NOT_READY", server)

    def test_unsupported_methods_and_unknown_endpoint(self):
        for method in ("POST", "PUT", "DELETE", "PATCH", "OPTIONS", "CUSTOM"):
            headers = self.error("/api/health", 405, "METHOD_NOT_ALLOWED", method)
            self.assertEqual(headers["Allow"], "GET")
        status, headers, body = request(self.server, "/api/health", "HEAD")
        self.assertEqual((status, headers["Allow"], body), (405, "GET", {}))
        for route in ("/api/unknown", "/FD001/train_FD001.txt", "/api/../FD001/train_FD001.txt"):
            self.error(route, 404, "UNKNOWN_ENDPOINT")

    def test_loopback_only_and_rejects_external_host(self):
        self.assertEqual(self.server.socket.getsockname(), ("127.0.0.1", self.server.server_port))
        self.error("/api/health", 400, "INVALID_REQUEST", headers={"Host": "example.invalid"})
        self.error("http://example.invalid/api/health", 400, "INVALID_REQUEST")
        process = subprocess.run([sys.executable, "-B", "-m", "web.api", "--host", "0.0.0.0"],
                                 cwd=ROOT, capture_output=True, text=True, timeout=10)
        self.assertEqual(process.returncode, 2)

    def test_json_null_policy(self):
        for path in (*VALID_REQUESTS, HISTORY.replace("start=1&end=20", "start=9999&end=9999"),
                     "/api/unknown", HISTORY.replace("sensor=7", "sensor=0")):
            self.assert_no_nulls(request(self.server, path)[2])


if __name__ == "__main__":
    unittest.main()
