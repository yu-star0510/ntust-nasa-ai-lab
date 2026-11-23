"""Profile the authorized M1 synthetic CSV without modifying it."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from collections import Counter
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "synthetic_sensor.csv"
SOURCE_TYPE = "SYNTHETIC"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def is_missing(value: str) -> bool:
    """Treat empty or whitespace-only fields as missing; preserve raw values."""

    return value == "" or value.strip() == ""


def load_csv(path: Path) -> tuple[list[str], list[list[str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        parsed = list(csv.reader(stream))

    if not parsed:
        raise ValueError("CSV is empty; a header row is required")

    header = parsed[0]
    rows = parsed[1:]
    if not header or any(is_missing(name) for name in header):
        raise ValueError("CSV header contains an empty column name")
    if len(set(header)) != len(header):
        raise ValueError("CSV header contains duplicate column names")

    expected_width = len(header)
    inconsistent = [
        row_index
        for row_index, row in enumerate(rows, start=1)
        if len(row) != expected_width
    ]
    if inconsistent:
        raise ValueError(f"CSV data rows have inconsistent widths: {inconsistent}")

    return header, rows


def numeric_columns(header: list[str], rows: list[list[str]]) -> list[str]:
    result: list[str] = []
    for column_index, column_name in enumerate(header):
        if not rows:
            continue
        values = [row[column_index] for row in rows]
        if any(is_missing(value) for value in values):
            continue
        try:
            numbers = [float(value) for value in values]
        except ValueError:
            continue
        if all(math.isfinite(value) for value in numbers):
            result.append(column_name)
    return result


def profile_csv(path: Path = DEFAULT_INPUT) -> dict[str, Any]:
    header, rows = load_csv(path)
    row_tuples = [tuple(row) for row in rows]
    frequencies = Counter(row_tuples)
    duplicates = sum(count - 1 for count in frequencies.values() if count > 1)
    missing_by_column = {
        column_name: sum(is_missing(row[index]) for row in rows)
        for index, column_name in enumerate(header)
    }

    return {
        "input_path": str(path.resolve()),
        "source_type": SOURCE_TYPE,
        "has_header": True,
        "header_basis": "The first parsed CSV record supplies unique, non-empty field names.",
        "rows": len(rows),
        "columns": len(header),
        "column_names": header,
        "duplicate_column_names": False,
        "inconsistent_row_widths": [],
        "duplicates": duplicates,
        "duplicate_rule": (
            "Count only additional occurrences of raw rows whose complete field tuples "
            "match exactly; no normalization is applied."
        ),
        "missing": sum(missing_by_column.values()),
        "missing_by_column": missing_by_column,
        "missing_rule": "A raw field is missing when empty or whitespace-only.",
        "numeric_columns": numeric_columns(header, rows),
        "sha256": sha256_file(path),
    }


def basic_display(path: Path = DEFAULT_INPUT) -> dict[str, Any]:
    header, rows = load_csv(path)
    if not rows:
        raise ValueError("CSV contains no data rows")
    selected_indices = sorted({0, len(rows) - 1})
    examples = [
        {
            "data_row_index": index + 1,
            "physical_line_number": index + 2,
            "values": dict(zip(header, rows[index], strict=True)),
        }
        for index in selected_indices
    ]
    return {
        "source_type": SOURCE_TYPE,
        "column_names": header,
        "examples": examples,
        "note": "Only the first and last data rows are shown; the full CSV is not reproduced.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    args = parser.parse_args()
    output = {"profile": profile_csv(args.input), "display": basic_display(args.input)}
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
