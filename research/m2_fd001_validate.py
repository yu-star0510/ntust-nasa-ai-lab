"""Validate trusted local NASA C-MAPSS FD001 sources without modifying them."""

from __future__ import annotations

import argparse
import hashlib
import json
import linecache
import math
import statistics
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT_DIR = PROJECT_ROOT / "FD001"
TRAIN_FILE = "train_FD001.txt"
TEST_FILE = "test_FD001.txt"
RUL_FILE = "RUL_FD001.txt"
SETTING_NAMES = [f"setting_{index}" for index in range(1, 4)]
SENSOR_NAMES = [f"sensor_{index}" for index in range(1, 22)]
COLUMN_NAMES = ["unit_id", "cycle", *SETTING_NAMES, *SENSOR_NAMES]


class ValidationError(ValueError):
    """Raised when a trusted source does not satisfy the M2 Phase A contract."""


@dataclass(frozen=True)
class SourceRow:
    physical_line_number: int
    data_row_index: int  # 0-based among nonblank data rows
    tokens: tuple[str, ...]
    values: tuple[float, ...]
    unit_id: int
    cycle: int


@dataclass
class SequenceDataset:
    split: str
    path: Path
    source_sha256: str
    rows: list[SourceRow]
    blank_line_numbers: list[int]
    key_to_row: dict[tuple[int, int], SourceRow]


@dataclass(frozen=True)
class RulRow:
    physical_line_number: int
    data_row_index: int  # 0-based among nonblank data rows
    raw_value: str
    value: float


@dataclass
class RulDataset:
    path: Path
    source_sha256: str
    rows: list[RulRow]
    blank_line_numbers: list[int]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _parse_finite(token: str, *, path: Path, line_number: int, column: int) -> float:
    try:
        value = float(token)
    except ValueError as exc:
        raise ValidationError(
            f"{path.name}:{line_number}: column {column} is not numeric: {token!r}"
        ) from exc
    if not math.isfinite(value):
        raise ValidationError(
            f"{path.name}:{line_number}: column {column} is not finite: {token!r}"
        )
    return value


def _positive_integer(value: float, *, field: str, path: Path, line_number: int) -> int:
    if not value.is_integer() or value <= 0:
        raise ValidationError(
            f"{path.name}:{line_number}: {field} must be a positive integer, found {value}"
        )
    return int(value)


def parse_sequence_file(path: Path, split: str) -> SequenceDataset:
    rows: list[SourceRow] = []
    blank_lines: list[int] = []
    key_to_row: dict[tuple[int, int], SourceRow] = {}
    with path.open("r", encoding="utf-8", newline="") as stream:
        for physical_line_number, line in enumerate(stream, start=1):
            tokens = line.split()
            if not tokens:
                blank_lines.append(physical_line_number)
                continue
            if len(tokens) != len(COLUMN_NAMES):
                raise ValidationError(
                    f"{path.name}:{physical_line_number}: expected 26 columns, found {len(tokens)}"
                )
            values = tuple(
                _parse_finite(
                    token,
                    path=path,
                    line_number=physical_line_number,
                    column=column_index,
                )
                for column_index, token in enumerate(tokens, start=1)
            )
            unit_id = _positive_integer(
                values[0], field="unit_id", path=path, line_number=physical_line_number
            )
            cycle = _positive_integer(
                values[1], field="cycle", path=path, line_number=physical_line_number
            )
            key = (unit_id, cycle)
            if key in key_to_row:
                previous = key_to_row[key]
                raise ValidationError(
                    f"{path.name}:{physical_line_number}: duplicate unit/cycle key {key}; "
                    f"first seen at physical line {previous.physical_line_number}"
                )
            row = SourceRow(
                physical_line_number=physical_line_number,
                data_row_index=len(rows),
                tokens=tuple(tokens),
                values=values,
                unit_id=unit_id,
                cycle=cycle,
            )
            rows.append(row)
            key_to_row[key] = row

    if not rows:
        raise ValidationError(f"{path.name}: no data rows")
    return SequenceDataset(
        split=split,
        path=path,
        source_sha256=sha256_file(path),
        rows=rows,
        blank_line_numbers=blank_lines,
        key_to_row=key_to_row,
    )


def parse_rul_file(path: Path) -> RulDataset:
    rows: list[RulRow] = []
    blank_lines: list[int] = []
    with path.open("r", encoding="utf-8", newline="") as stream:
        for physical_line_number, line in enumerate(stream, start=1):
            tokens = line.split()
            if not tokens:
                blank_lines.append(physical_line_number)
                continue
            if len(tokens) != 1:
                raise ValidationError(
                    f"{path.name}:{physical_line_number}: expected 1 column, found {len(tokens)}"
                )
            value = _parse_finite(
                tokens[0], path=path, line_number=physical_line_number, column=1
            )
            if value < 0:
                raise ValidationError(
                    f"{path.name}:{physical_line_number}: RUL label must be non-negative"
                )
            rows.append(
                RulRow(
                    physical_line_number=physical_line_number,
                    data_row_index=len(rows),
                    raw_value=tokens[0],
                    value=value,
                )
            )
    if not rows:
        raise ValidationError(f"{path.name}: no RUL labels")
    return RulDataset(
        path=path,
        source_sha256=sha256_file(path),
        rows=rows,
        blank_line_numbers=blank_lines,
    )


def _ordered_unique(values: Iterable[int]) -> list[int]:
    return list(dict.fromkeys(values))


def profile_sequence(dataset: SequenceDataset) -> dict[str, Any]:
    units_in_first_appearance_order = _ordered_unique(row.unit_id for row in dataset.rows)
    unit_ids = sorted(units_in_first_appearance_order)
    cycles_by_unit: dict[int, list[int]] = defaultdict(list)
    for row in dataset.rows:
        cycles_by_unit[row.unit_id].append(row.cycle)

    cycle_gaps: dict[str, list[dict[str, int]]] = {}
    out_of_order_units: list[int] = []
    non_starting_at_one_units: list[int] = []
    for unit_id, cycles in cycles_by_unit.items():
        if cycles != sorted(cycles):
            out_of_order_units.append(unit_id)
        if cycles[0] != 1:
            non_starting_at_one_units.append(unit_id)
        gaps = [
            {"after": previous, "before": current, "gap_size": current - previous - 1}
            for previous, current in zip(cycles, cycles[1:])
            if current != previous + 1
        ]
        if gaps:
            cycle_gaps[str(unit_id)] = gaps

    token_rows = [row.tokens for row in dataset.rows]
    frequencies = Counter(token_rows)
    duplicate_rows = sum(count - 1 for count in frequencies.values() if count > 1)
    cycle_counts = {str(unit_id): len(cycles_by_unit[unit_id]) for unit_id in unit_ids}
    lengths = list(cycle_counts.values())
    missing_by_column = {name: 0 for name in COLUMN_NAMES}

    return {
        "split": dataset.split,
        "source_file": dataset.path.as_posix(),
        "source_sha256": dataset.source_sha256,
        "rows": len(dataset.rows),
        "columns": len(COLUMN_NAMES),
        "column_names": COLUMN_NAMES,
        "unit_count": len(unit_ids),
        "unit_ids": unit_ids,
        "unit_first_appearance_order": units_in_first_appearance_order,
        "unit_order_matches_sorted": units_in_first_appearance_order == unit_ids,
        "cycle_min": min(row.cycle for row in dataset.rows),
        "cycle_max": max(row.cycle for row in dataset.rows),
        "cycle_counts": cycle_counts,
        "cycle_length_distribution": {
            "min": min(lengths),
            "max": max(lengths),
            "mean": statistics.fmean(lengths),
            "median": statistics.median(lengths),
        },
        "cycle_gaps": cycle_gaps,
        "out_of_order_units": out_of_order_units,
        "non_starting_at_one_units": non_starting_at_one_units,
        "exact_duplicate_rows": duplicate_rows,
        "duplicate_unit_cycle_keys": len(dataset.rows) - len(dataset.key_to_row),
        "missing_total": 0,
        "missing_by_column": missing_by_column,
        "parsing_errors": 0,
        "non_finite_values": 0,
        "blank_line_numbers": dataset.blank_line_numbers,
        "schema_valid": True,
        "unit_cycle_integrity_valid": (
            not cycle_gaps
            and not out_of_order_units
            and not non_starting_at_one_units
            and len(dataset.rows) == len(dataset.key_to_row)
        ),
    }


def build_rul_mapping(test: SequenceDataset, rul: RulDataset) -> dict[str, Any]:
    first_order = _ordered_unique(row.unit_id for row in test.rows)
    sorted_units = sorted(first_order)
    if first_order != sorted_units:
        raise ValidationError(
            "Test Unit first-appearance order differs from sorted Unit order; RUL mapping is ambiguous"
        )
    if len(rul.rows) != len(sorted_units):
        raise ValidationError(
            f"RUL row count {len(rul.rows)} does not match Test Unit count {len(sorted_units)}"
        )
    last_cycles = {
        unit_id: max(row.cycle for row in test.rows if row.unit_id == unit_id)
        for unit_id in sorted_units
    }
    entries = [
        {
            "test_unit_id": unit_id,
            "rul_physical_line_number": rul_row.physical_line_number,
            "rul_data_row_index": rul_row.data_row_index,
            "last_observed_cycle": last_cycles[unit_id],
            "rul_label": rul_row.value,
            "rul_raw_value": rul_row.raw_value,
        }
        for unit_id, rul_row in zip(sorted_units, rul.rows, strict=True)
    ]
    return {
        "mapping_rule": (
            "RUL rows map in file order to Test Units after verifying that Test Unit "
            "first-appearance order equals ascending Unit ID order. The RUL file itself "
            "contains no Unit ID."
        ),
        "test_unit_first_appearance_order": first_order,
        "test_unit_sorted_order": sorted_units,
        "orders_match": True,
        "rul_rows_match_test_units": True,
        "entries": entries,
    }


def _reread_token(path: Path, physical_line_number: int, source_column_index: int) -> str:
    line = linecache.getline(str(path.resolve()), physical_line_number)
    if line == "":
        raise KeyError("physical_line_number not found")
    tokens = line.split()
    if source_column_index < 1 or source_column_index > len(tokens):
        raise KeyError("source_column_index out of range")
    return tokens[source_column_index - 1]


def get_raw_reference(
    dataset: SequenceDataset, unit_id: int, cycle: int, column_name: str
) -> dict[str, Any]:
    if column_name not in COLUMN_NAMES:
        raise KeyError(f"Unknown column: {column_name}")
    try:
        row = dataset.key_to_row[(unit_id, cycle)]
    except KeyError as exc:
        raise KeyError(
            f"No {dataset.split} row for unit_id={unit_id}, cycle={cycle}"
        ) from exc
    column_index = COLUMN_NAMES.index(column_name)
    source_column_index = column_index + 1
    original_value = row.tokens[column_index]
    reread_value = _reread_token(
        dataset.path, row.physical_line_number, source_column_index
    )
    return {
        "dataset_split": dataset.split,
        "source_file": dataset.path.as_posix(),
        "source_sha256": dataset.source_sha256,
        "physical_line_number": row.physical_line_number,
        "data_row_index": row.data_row_index,
        "data_row_index_base": 0,
        "unit_id": row.unit_id,
        "cycle": row.cycle,
        "column_name": column_name,
        "source_column_index": source_column_index,
        "original_value": original_value,
        "reread_value": reread_value,
        "reread_matches": reread_value == original_value,
    }


def load_sources(input_dir: Path = DEFAULT_INPUT_DIR) -> tuple[SequenceDataset, SequenceDataset, RulDataset]:
    train = parse_sequence_file(input_dir / TRAIN_FILE, "train")
    test = parse_sequence_file(input_dir / TEST_FILE, "test")
    rul = parse_rul_file(input_dir / RUL_FILE)
    return train, test, rul


def run_phase_a(input_dir: Path = DEFAULT_INPUT_DIR) -> dict[str, Any]:
    train, test, rul = load_sources(input_dir)
    train_profile = profile_sequence(train)
    test_profile = profile_sequence(test)
    mapping = build_rul_mapping(test, rul)
    sample_references = [
        get_raw_reference(
            dataset,
            dataset.rows[index].unit_id,
            dataset.rows[index].cycle,
            "sensor_1",
        )
        for dataset in (train, test)
        for index in (0, len(dataset.rows) // 2, len(dataset.rows) - 1)
    ]
    checks = {
        "three_files_loaded": True,
        "sha256_recorded": all(
            len(value) == 64
            for value in (train.source_sha256, test.source_sha256, rul.source_sha256)
        ),
        "train_schema_valid": train_profile["schema_valid"],
        "test_schema_valid": test_profile["schema_valid"],
        "rul_schema_valid": True,
        "train_test_semantics_separated": train.split == "train" and test.split == "test",
        "rul_mapping_verified": mapping["orders_match"]
        and mapping["rul_rows_match_test_units"],
        "unit_cycle_integrity_verified": train_profile["unit_cycle_integrity_valid"]
        and test_profile["unit_cycle_integrity_valid"],
        "raw_index_traceability_verified": all(
            reference["reread_matches"] for reference in sample_references
        ),
        "settings_and_sensors_mapped": len(SETTING_NAMES) == 3
        and len(SENSOR_NAMES) == 21
        and len(COLUMN_NAMES) == 26,
    }
    status = "PASS" if all(checks.values()) else "BLOCKED"
    return {
        "phase_a_status": status,
        "data_row_index_base": 0,
        "column_mapping": {
            str(index): name for index, name in enumerate(COLUMN_NAMES, start=1)
        },
        "train": train_profile,
        "test": test_profile,
        "rul": {
            "source_file": rul.path.as_posix(),
            "source_sha256": rul.source_sha256,
            "rows": len(rul.rows),
            "columns": 1,
            "unit_id": "N/A",
            "cycle": "N/A",
            "unit_cycle_key": "N/A",
            "blank_line_numbers": rul.blank_line_numbers,
            "parsing_errors": 0,
            "missing_or_invalid_values": 0,
            "label_min": min(row.value for row in rul.rows),
            "label_max": max(row.value for row in rul.rows),
            "schema_valid": True,
        },
        "rul_mapping": mapping,
        "raw_reference_samples": sample_references,
        "gate_checks": checks,
    }


def public_phase_a_summary(result: dict[str, Any]) -> dict[str, Any]:
    """Return a GitHub-safe summary without publishing the complete RUL label mapping."""

    public_result = dict(result)
    for split in ("train", "test"):
        profile = dict(result[split])
        unit_ids = profile.pop("unit_ids")
        first_order = profile.pop("unit_first_appearance_order")
        cycle_counts = profile.pop("cycle_counts")
        profile["unit_ids_summary"] = {
            "count": len(unit_ids),
            "min": min(unit_ids),
            "max": max(unit_ids),
            "contiguous": unit_ids == list(range(min(unit_ids), max(unit_ids) + 1)),
        }
        profile["unit_first_appearance_order_summary"] = {
            "count": len(first_order),
            "min": min(first_order),
            "max": max(first_order),
            "matches_sorted": first_order == unit_ids,
        }
        profile["cycle_counts_summary"] = {
            "unit_entries": len(cycle_counts),
            "total_cycles": sum(cycle_counts.values()),
            "minimum": min(cycle_counts.values()),
            "maximum": max(cycle_counts.values()),
            "complete_counts_recorded_in_validation_report": True,
        }
        public_result[split] = profile
    mapping = dict(result["rul_mapping"])
    entries = mapping.pop("entries")
    first_order = mapping.pop("test_unit_first_appearance_order")
    sorted_order = mapping.pop("test_unit_sorted_order")
    sample_indices = sorted({0, len(entries) // 2, len(entries) - 1})
    mapping["test_unit_order_summary"] = {
        "count": len(first_order),
        "min": min(first_order),
        "max": max(first_order),
        "first_appearance_equals_sorted": first_order == sorted_order,
    }
    mapping["entry_count"] = len(entries)
    mapping["sample_entries"] = [entries[index] for index in sample_indices]
    mapping["disclosure_note"] = (
        "Only three mapping examples are emitted publicly; the complete mapping remains "
        "available to local read-only functions and tests."
    )
    public_result["rul_mapping"] = mapping
    return public_result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    args = parser.parse_args()
    try:
        result = run_phase_a(args.input_dir)
    except (OSError, ValidationError) as exc:
        print(json.dumps({"phase_a_status": "BLOCKED", "error": str(exc)}, indent=2))
        return 2
    print(json.dumps(public_phase_a_summary(result), ensure_ascii=False, indent=2))
    return 0 if result["phase_a_status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
