"""Compute FD001 quality summaries and source-traceable trends after Phase A passes."""

from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path
from typing import Any

from m2_fd001_validate import (
    COLUMN_NAMES,
    DEFAULT_INPUT_DIR,
    SENSOR_NAMES,
    SETTING_NAMES,
    RulDataset,
    SequenceDataset,
    build_rul_mapping,
    get_raw_reference,
    load_sources,
    profile_sequence,
    run_phase_a,
)


CONTRACT_JSON = Path(__file__).resolve().parents[1] / "contracts" / "FD001_DATA_CONTRACT.json"
STATISTIC_COLUMNS = [*SETTING_NAMES, *SENSOR_NAMES]
NEAR_CONSTANT_RELATIVE_RANGE = 1e-4
NEAR_CONSTANT_ABSOLUTE_FLOOR = 1e-12


def column_statistics(dataset: SequenceDataset) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for column_name in STATISTIC_COLUMNS:
        column_index = COLUMN_NAMES.index(column_name)
        values = [row.values[column_index] for row in dataset.rows]
        minimum = min(values)
        maximum = max(values)
        mean = statistics.fmean(values)
        population_std = statistics.pstdev(values)
        value_range = maximum - minimum
        threshold = max(NEAR_CONSTANT_ABSOLUTE_FLOOR, abs(mean) * NEAR_CONSTANT_RELATIVE_RANGE)
        is_constant = value_range == 0.0
        result[column_name] = {
            "min": minimum,
            "max": maximum,
            "mean": mean,
            "population_std": population_std,
            "range": value_range,
            "constant": is_constant,
            "near_constant": not is_constant and value_range <= threshold,
            "near_constant_threshold": threshold,
        }
    return result


def quality_summary(dataset: SequenceDataset) -> dict[str, Any]:
    profile = profile_sequence(dataset)
    statistics_by_column = column_statistics(dataset)
    return {
        "split": dataset.split,
        "rows": profile["rows"],
        "columns": profile["columns"],
        "unit_count": profile["unit_count"],
        "cycle_counts": profile["cycle_counts"],
        "cycle_length_distribution": profile["cycle_length_distribution"],
        "missing_total": profile["missing_total"],
        "missing_by_column": profile["missing_by_column"],
        "exact_duplicate_rows": profile["exact_duplicate_rows"],
        "duplicate_unit_cycle_keys": profile["duplicate_unit_cycle_keys"],
        "parsing_errors": profile["parsing_errors"],
        "non_finite_values": profile["non_finite_values"],
        "statistics_formula": "Population standard deviation (statistics.pstdev, ddof=0).",
        "near_constant_rule": (
            "Non-constant column with range <= max(1e-12, abs(mean) * 1e-4)."
        ),
        "column_statistics": statistics_by_column,
        "constant_columns": [
            name for name, values in statistics_by_column.items() if values["constant"]
        ],
        "near_constant_columns": [
            name
            for name, values in statistics_by_column.items()
            if values["near_constant"]
        ],
        "quality_warnings": [
            *(
                ["Constant columns are present; values are reported without removal."]
                if any(values["constant"] for values in statistics_by_column.values())
                else []
            ),
            *(
                ["Near-constant columns are present under the documented rule."]
                if any(values["near_constant"] for values in statistics_by_column.values())
                else []
            ),
        ],
    }


class FD001Repository:
    """Local read-only data interface implementing the M2 contract."""

    def __init__(self, input_dir: Path = DEFAULT_INPUT_DIR) -> None:
        phase_a = run_phase_a(input_dir)
        if phase_a["phase_a_status"] != "PASS":
            raise RuntimeError("Phase A must pass before constructing the repository")
        self.train, self.test, self.rul = load_sources(input_dir)
        mapping = build_rul_mapping(self.test, self.rul)
        self.rul_by_unit = {
            entry["test_unit_id"]: entry for entry in mapping["entries"]
        }

    def _dataset(self, split: str) -> SequenceDataset:
        if split == "train":
            return self.train
        if split == "test":
            return self.test
        raise ValueError("split must be 'train' or 'test'")

    def get_units(self, split: str) -> list[int]:
        dataset = self._dataset(split)
        return sorted({row.unit_id for row in dataset.rows})

    def get_cycles(self, split: str, unit_id: int) -> list[int]:
        dataset = self._dataset(split)
        if unit_id not in self.get_units(split):
            raise KeyError(f"Unknown unit_id={unit_id} for split={split}")
        return sorted(row.cycle for row in dataset.rows if row.unit_id == unit_id)

    def get_sensor_series(
        self, split: str, unit_id: int, sensor_name: str
    ) -> list[dict[str, Any]]:
        if sensor_name not in SENSOR_NAMES:
            raise ValueError(f"sensor_name must be one of sensor_1..sensor_21: {sensor_name}")
        dataset = self._dataset(split)
        cycles = self.get_cycles(split, unit_id)
        return [
            {
                "cycle": cycle,
                "value": float(
                    dataset.key_to_row[(unit_id, cycle)].tokens[
                        COLUMN_NAMES.index(sensor_name)
                    ]
                ),
                "raw_reference": get_raw_reference(
                    dataset, unit_id, cycle, sensor_name
                ),
            }
            for cycle in cycles
        ]

    def get_raw_reference(
        self, split: str, unit_id: int, cycle: int, column_name: str
    ) -> dict[str, Any]:
        return get_raw_reference(self._dataset(split), unit_id, cycle, column_name)

    def get_test_rul_label(self, unit_id: int) -> dict[str, Any]:
        try:
            return dict(self.rul_by_unit[unit_id])
        except KeyError as exc:
            raise KeyError(f"Unknown Test unit_id={unit_id}") from exc

    def get_quality_summary(self, split: str) -> dict[str, Any]:
        return quality_summary(self._dataset(split))


def select_traceable_trend(repository: FD001Repository) -> dict[str, Any]:
    for sensor_name in SENSOR_NAMES:
        for unit_id in repository.get_units("train"):
            series = repository.get_sensor_series("train", unit_id, sensor_name)
            values = [point["value"] for point in series]
            if len(values) > 1 and min(values) != max(values):
                return {
                    "split": "train",
                    "unit_id": unit_id,
                    "sensor_name": sensor_name,
                    "x_axis": "cycle",
                    "y_axis": "original sensor value",
                    "point_count": len(series),
                    "points": series,
                    "transformations": "NONE",
                }
    raise RuntimeError("No non-constant sensor series is available for a legal trend")


def _public_trend(trend: dict[str, Any]) -> dict[str, Any]:
    points = trend["points"]
    sample_indices = sorted(
        {
            0,
            1,
            2,
            len(points) // 2,
            len(points) - 3,
            len(points) - 2,
            len(points) - 1,
        }
    )
    return {
        key: value for key, value in trend.items() if key != "points"
    } | {
        "sample_points": [points[index] for index in sample_indices],
        "sample_point_count": len(sample_indices),
        "disclosure_note": (
            "Only selected traceability points are emitted publicly; the complete local "
            "series remains available through get_sensor_series."
        ),
    }


def _public_quality(summary: dict[str, Any]) -> dict[str, Any]:
    public = dict(summary)
    cycle_counts = public.pop("cycle_counts")
    public["cycle_counts_summary"] = {
        "unit_entries": len(cycle_counts),
        "total_cycles": sum(cycle_counts.values()),
        "minimum": min(cycle_counts.values()),
        "maximum": max(cycle_counts.values()),
        "complete_counts_recorded_in_quality_report": True,
    }
    public["column_statistics"] = {
        name: {
            key: values[key]
            for key in ("min", "max", "mean", "population_std", "constant", "near_constant")
        }
        for name, values in summary["column_statistics"].items()
    }
    return public


def validate_contract(contract_path: Path = CONTRACT_JSON) -> dict[str, Any]:
    contract = json.loads(contract_path.read_text(encoding="utf-8"))
    required_interfaces = {
        "get_units",
        "get_cycles",
        "get_sensor_series",
        "get_raw_reference",
        "get_test_rul_label",
        "get_quality_summary",
    }
    actual_interfaces = set(contract["interfaces"])
    required_fields = {
        "dataset_split",
        "unit_id",
        "cycle",
        *SETTING_NAMES,
        *SENSOR_NAMES,
        "source_file",
        "source_sha256",
        "physical_line_number",
        "data_row_index",
        "source_column_index",
    }
    actual_fields = set(contract["required_fields"])
    checks = {
        "contract_name": contract["contract_name"] == "FD001_DATA_CONTRACT",
        "schema_version": contract["schema_version"] == "1.0.0",
        "required_interfaces": required_interfaces == actual_interfaces,
        "required_fields": required_fields == actual_fields,
        "validation_status": contract["validation_status"] == "PASS",
        "main_acceptance_pending": contract["main_acceptance"] == "PENDING",
    }
    return {"checks": checks, "valid": all(checks.values())}


def run_phase_b(input_dir: Path = DEFAULT_INPUT_DIR) -> dict[str, Any]:
    phase_a = run_phase_a(input_dir)
    if phase_a["phase_a_status"] != "PASS":
        raise RuntimeError("PHASE_A_NOT_PASSED")
    repository = FD001Repository(input_dir)
    train_quality = repository.get_quality_summary("train")
    test_quality = repository.get_quality_summary("test")
    trend = select_traceable_trend(repository)
    contract_validation = validate_contract()
    status = "PASS" if contract_validation["valid"] else "BLOCKED"
    return {
        "phase_a_status": "PASS",
        "phase_b_status": status,
        "train_quality": _public_quality(train_quality),
        "test_quality": _public_quality(test_quality),
        "sensor_trend": _public_trend(trend),
        "contract_validation": contract_validation,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    args = parser.parse_args()
    try:
        result = run_phase_b(args.input_dir)
    except (OSError, ValueError, KeyError, RuntimeError) as exc:
        print(json.dumps({"phase_b_status": "BLOCKED", "error": str(exc)}, indent=2))
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["phase_b_status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
