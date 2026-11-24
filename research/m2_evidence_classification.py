"""Classify small, source-grounded FD001 evidence without diagnosing faults."""

from __future__ import annotations

import argparse
import json
from decimal import Decimal
from pathlib import Path
from typing import Any

from m2_fd001_analysis import FD001Repository
from m2_fd001_validate import DEFAULT_INPUT_DIR, SENSOR_NAMES


SCHEMA_VERSION = "1.0.0"
UNKNOWN_TOPICS = {
    "Fault Type": "The raw 26-column rows contain no verified fault-mode label.",
    "Fault Severity": "No verified severity field or severity scale is present.",
    "Fault Occurrence Time": "Cycle is an ordering field, not a verified fault-time field or wall-clock timestamp.",
    "Health Status": "No verified healthy, abnormal, failed, or diagnostic-status column is present.",
    "Normal/Abnormal Baseline": "No independently accepted diagnostic baseline is supplied by these sources.",
    "Diagnostic Threshold": "The sources do not establish a diagnostic decision threshold.",
    "Alarm Threshold": "The sources do not establish an alarm threshold.",
    "Failure Probability": "No probability model is trained or authorized in this work item.",
    "Model-predicted RUL": "No predictive model is trained or executed in this work item.",
    "Unsupported Physical Sensor Units": "The approved raw schema does not validate physical units for sensor_1..sensor_21.",
    "Unsupported Causal Interpretation": "A selected sensor pattern alone cannot establish a physical cause.",
}


def _record(
    category: str,
    statement: str,
    source_references: list[dict[str, Any]],
    calculation_or_null: dict[str, Any] | None,
    evidence_scope: str,
    limitations: list[str],
) -> dict[str, Any]:
    return {
        "category": category,
        "statement": statement,
        "source_references": source_references,
        "calculation_or_null": calculation_or_null,
        "evidence_scope": evidence_scope,
        "limitations": limitations,
    }


def validate_selector(
    repository: FD001Repository,
    split: str,
    unit_id: int,
    cycle_start: int,
    cycle_end: int,
    sensor_name: str,
) -> list[int]:
    """Validate one isolated split/unit/sensor window and return actual cycles."""

    if split not in {"train", "test"}:
        raise ValueError("split must be 'train' or 'test'")
    if sensor_name not in SENSOR_NAMES:
        raise ValueError("sensor_name must be one of sensor_1..sensor_21")
    if isinstance(unit_id, bool) or not isinstance(unit_id, int) or unit_id <= 0:
        raise ValueError("unit_id must be a positive integer")
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value <= 0
        for value in (cycle_start, cycle_end)
    ):
        raise ValueError("cycle_start and cycle_end must be positive integers")
    if cycle_start > cycle_end:
        raise ValueError("cycle_start must be less than or equal to cycle_end")
    if unit_id not in repository.get_units(split):
        raise KeyError(f"Unknown unit_id={unit_id} for split={split}")
    actual_cycles = repository.get_cycles(split, unit_id)
    actual_cycle_set = set(actual_cycles)
    if cycle_start not in actual_cycle_set or cycle_end not in actual_cycle_set:
        raise KeyError("cycle_start and cycle_end must both be actual cycles for the selected split/unit")
    selected = [cycle for cycle in actual_cycles if cycle_start <= cycle <= cycle_end]
    if len(selected) < 2:
        raise ValueError("the evidence window must contain at least two actual cycles")
    return selected


def _sensor_reference(point: dict[str, Any], sensor_name: str) -> dict[str, Any]:
    raw = point["raw_reference"]
    if not raw["reread_matches"]:
        raise RuntimeError("source row/token reread mismatch")
    return {
        "dataset_split": raw["dataset_split"],
        "unit_id": raw["unit_id"],
        "cycle": raw["cycle"],
        "sensor_name": sensor_name,
        "raw_value": point["value"],
        "original_value": point["value"],
        "original_token": raw["original_value"],
        "source_file": raw["source_file"],
        "source_sha256": raw["source_sha256"],
        "physical_line_number": raw["physical_line_number"],
        "data_row_index": raw["data_row_index"],
        "source_column_index": raw["source_column_index"],
        "reread_matches": raw["reread_matches"],
        "reread_method": "existing approved linecache-backed raw-reference lookup",
    }


def _rul_reference(
    label: dict[str, Any], unit_id: int
) -> dict[str, Any]:
    raw = label["rul_raw_reference"]
    if not raw["reread_matches"]:
        raise RuntimeError("RUL source token reread mismatch")
    return {
        "dataset_split": "test",
        "unit_id": unit_id,
        "cycle": label["last_observed_cycle"],
        "sensor_name": None,
        "sensor_name_applicability": "NOT_APPLICABLE_RUL_LABEL",
        "field_name": "ground_truth_RUL_at_last_observed_test_cycle",
        "raw_value": label["rul_label"],
        "original_value": label["rul_label"],
        "original_token": raw["original_value"],
        "source_file": raw["source_file"],
        "source_sha256": raw["source_sha256"],
        "physical_line_number": raw["physical_line_number"],
        "data_row_index": raw["data_row_index"],
        "source_column_index": raw["source_column_index"],
        "reread_matches": raw["reread_matches"],
        "reread_method": "fresh disk reopen plus SHA-256, line, token, and numeric-value verification",
    }


def _sensor_observations(
    references: list[dict[str, Any]], split: str, unit_id: int, sensor_name: str
) -> list[dict[str, Any]]:
    scope = f"{split} Unit {unit_id}, {sensor_name}, selected actual cycles only"
    return [
        _record(
            "OBSERVATION",
            f"{split} Unit {unit_id} Cycle {ref['cycle']} {sensor_name} has original value {ref['original_value']} (token {ref['original_token']!r}).",
            [ref],
            None,
            scope,
            [
                "This is a source-verifiable sensor value, not a health or fault label.",
                "No physical unit or wall-clock time is asserted.",
                "Train/Test sensor token reread uses the existing approved linecache-backed lookup.",
            ],
        )
        for ref in references
    ]


def _window_inference(
    references: list[dict[str, Any]], split: str, unit_id: int, sensor_name: str
) -> dict[str, Any]:
    start = references[0]
    end = references[-1]
    values = [reference["original_value"] for reference in references]
    delta_decimal = Decimal(end["original_token"]) - Decimal(start["original_token"])
    delta = float(delta_decimal)
    direction = "increase" if delta > 0 else "decrease" if delta < 0 else "no endpoint change"
    return _record(
        "INFERENCE",
        f"Across the selected endpoints, {sensor_name} shows an endpoint {direction}; this does not assert monotonicity or diagnosis.",
        references,
        {
            "formula": "endpoint_delta = end_original_value - start_original_value",
            "input_cycles": [reference["cycle"] for reference in references],
            "input_values": values,
            "start_cycle": start["cycle"],
            "start_value": start["original_value"],
            "end_cycle": end["cycle"],
            "end_value": end["original_value"],
            "endpoint_delta": delta,
            "exact_endpoint_expression": (
                f"{end['original_token']} - {start['original_token']} = {delta_decimal}"
            ),
            "selected_window_min": min(values),
            "selected_window_max": max(values),
            "endpoint_direction": direction,
            "monotonicity_claim": "NOT_MADE",
        },
        f"{split} Unit {unit_id}, {sensor_name}, cycles {start['cycle']}..{end['cycle']}",
        [
            "Endpoint direction does not prove a monotonic trend.",
            "The arithmetic does not establish degradation, abnormality, failure, fault type, health score, failure timing, causality, or RUL prediction.",
        ],
    )


def _train_derived_rul(
    repository: FD001Repository,
    unit_id: int,
    references: list[dict[str, Any]],
) -> dict[str, Any]:
    final_cycle = max(repository.get_cycles("train", unit_id))
    derived = [final_cycle - reference["cycle"] for reference in references]
    return _record(
        "INFERENCE",
        "Train-cycle RUL values shown here are derived under the run-to-failure convention; they are not original columns.",
        references,
        {
            "classification": "DERIVED",
            "assumption": "Train sequence is treated as run-to-failure and its final observed cycle as the failure endpoint convention.",
            "formula": "derived_train_RUL = final_observed_train_cycle - current_cycle",
            "final_observed_train_cycle": final_cycle,
            "cycles": [reference["cycle"] for reference in references],
            "derived_values": derived,
        },
        f"train Unit {unit_id}, selected cycles only",
        [
            "No measured per-cycle RUL column exists in the original 26 Train columns.",
            "These derived values are not a model prediction and do not provide a fault type.",
        ],
    )


def _test_rul_observation(
    repository: FD001Repository, unit_id: int, selected_cycles: list[int]
) -> dict[str, Any] | None:
    label = repository.get_test_rul_label(unit_id)
    if label["last_observed_cycle"] not in selected_cycles:
        return None
    reference = _rul_reference(label, unit_id)
    return _record(
        "OBSERVATION",
        f"Test Unit {unit_id} has ground-truth RUL label {label['rul_label']} mapped at its last observed Cycle {label['last_observed_cycle']}.",
        [reference],
        None,
        f"RUL_FD001.txt mapping for Test Unit {unit_id} at the last observed cycle",
        [
            "The label is ground truth, not a predictive model output.",
            "The last observed Test cycle is not the failure point.",
            "The label is not a raw per-cycle sensor value and is not extrapolated to earlier Test cycles.",
        ],
    )


def extract_case(
    repository: FD001Repository,
    split: str,
    unit_id: int,
    cycle_start: int,
    cycle_end: int,
    sensor_name: str,
) -> dict[str, Any]:
    selected_cycles = validate_selector(
        repository, split, unit_id, cycle_start, cycle_end, sensor_name
    )
    selected_set = set(selected_cycles)
    points = [
        point
        for point in repository.get_sensor_series(split, unit_id, sensor_name)
        if point["cycle"] in selected_set
    ]
    references = [_sensor_reference(point, sensor_name) for point in points]
    if [reference["cycle"] for reference in references] != selected_cycles:
        raise RuntimeError("selected source points do not match the validated cycle window")
    observations = _sensor_observations(references, split, unit_id, sensor_name)
    inferences = [_window_inference(references, split, unit_id, sensor_name)]
    if split == "train":
        inferences.append(_train_derived_rul(repository, unit_id, references))
    else:
        rul_observation = _test_rul_observation(repository, unit_id, selected_cycles)
        if rul_observation is not None:
            observations.append(rul_observation)
    return {
        "selector": {
            "split": split,
            "unit_id": unit_id,
            "cycle_start": cycle_start,
            "cycle_end": cycle_end,
            "sensor_name": sensor_name,
        },
        "actual_selected_cycles": selected_cycles,
        "observations": observations,
        "inferences": inferences,
    }


def unknown_records() -> list[dict[str, Any]]:
    return [
        _record(
            "UNKNOWN",
            f"{topic}: UNKNOWN.",
            [],
            None,
            "FD001 raw 26-column Train/Test structure, RUL labels, and this non-modeling work item",
            [reason, "UNKNOWN is an epistemic classification; it is not an original-data null or missing value."],
        )
        for topic, reason in UNKNOWN_TOPICS.items()
    ]


def semantic_matrix() -> list[dict[str, str]]:
    return [
        {
            "semantic_class": "OBSERVED",
            "train": "Original selected sensor tokens/values and provenance.",
            "test": "Original selected sensor tokens/values and provenance.",
            "rul": "Not applicable to Train; Test ground-truth label is observed from RUL_FD001.txt only at the mapped last observed cycle.",
        },
        {
            "semantic_class": "DERIVED",
            "train": "Selected-window arithmetic; optional RUL = final observed train cycle - current cycle under run-to-failure convention.",
            "test": "Selected-window arithmetic only; no per-cycle Test RUL is derived.",
            "rul": "No transformation of the Test label into earlier-cycle labels.",
        },
        {
            "semantic_class": "GROUND_TRUTH_LABEL",
            "train": "No original per-cycle RUL label column.",
            "test": "One mapped RUL label at the last observed Test cycle; that cycle is not the failure point.",
            "rul": "Freshly reread from RUL_FD001.txt and verified against SHA, row, token, and numeric value.",
        },
        {
            "semantic_class": "UNKNOWN",
            "train": "Fault type/time/severity, diagnostic status, thresholds, physical units, and cause are not established.",
            "test": "Fault type/time/severity, diagnostic status, thresholds, physical units, and cause are not established.",
            "rul": "A RUL label does not supply those diagnostic facts.",
        },
        {
            "semantic_class": "MODEL_PREDICTION_NOT_AVAILABLE",
            "train": "No model is trained or executed.",
            "test": "No model-predicted RUL or failure probability is produced.",
            "rul": "Ground truth must not be presented as a prediction.",
        },
    ]


def build_public_samples(input_dir: Path = DEFAULT_INPUT_DIR) -> dict[str, Any]:
    repository = FD001Repository(input_dir)
    train_cycles = repository.get_cycles("train", 1)
    test_cycles = repository.get_cycles("test", 1)
    return {
        "schema_version": SCHEMA_VERSION,
        "work_item_id": "WO-M2-RESEARCH-002",
        "status": "EVIDENCE_CLASSIFIED_NO_DIAGNOSIS",
        "cases": [
            extract_case(repository, "train", 1, train_cycles[0], train_cycles[4], "sensor_2"),
            extract_case(repository, "test", 1, test_cycles[-5], test_cycles[-1], "sensor_2"),
        ],
        "unknowns": unknown_records(),
        "semantic_matrix": semantic_matrix(),
        "global_limitations": [
            "Sensor trends alone are not evidence of a fault.",
            "No diagnostic baseline, threshold, anomaly class, physical sensor unit, model output, or causal conclusion is created.",
            "Published examples are bounded five-cycle samples, not full sensor traces or a full RUL mapping.",
        ],
    }


def verification_summary(input_dir: Path = DEFAULT_INPUT_DIR) -> dict[str, Any]:
    """Execute all deterministic cases and emit bounded audit evidence."""

    samples = build_public_samples(input_dir)
    references = [
        reference
        for case in samples["cases"]
        for group in (case["observations"], case["inferences"])
        for record in group
        for reference in record["source_references"]
    ]
    unique_sources = {
        reference["source_file"]: reference["source_sha256"]
        for reference in references
    }
    return {
        "schema_version": SCHEMA_VERSION,
        "work_item_id": "WO-M2-RESEARCH-002",
        "status": samples["status"],
        "cases": [
            {
                "selector": case["selector"],
                "actual_selected_cycles": case["actual_selected_cycles"],
                "observation_count": len(case["observations"]),
                "inference_count": len(case["inferences"]),
                "calculations": [
                    record["calculation_or_null"]
                    for record in case["inferences"]
                ],
            }
            for case in samples["cases"]
        ],
        "source_sha256": unique_sources,
        "source_reference_count_in_executed_records": len(references),
        "all_source_references_reread_match": all(
            reference["reread_matches"] for reference in references
        ),
        "rul_ground_truth": {
            "test_unit_id": 1,
            "last_observed_cycle": samples["cases"][1]["actual_selected_cycles"][-1],
            "label": samples["cases"][1]["observations"][-1]["source_references"][0]["original_value"],
            "classification": "GROUND_TRUTH_LABEL_NOT_MODEL_PREDICTION",
            "fresh_reread_verified": samples["cases"][1]["observations"][-1]["source_references"][0]["reread_matches"],
        },
        "unknown_topics": list(UNKNOWN_TOPICS),
        "semantic_classes": [row["semantic_class"] for row in samples["semantic_matrix"]],
        "diagnostic_conclusion": "NOT_MADE",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    parser.add_argument("--public-samples", action="store_true")
    parser.add_argument("--verification-summary", action="store_true")
    parser.add_argument("--split", choices=("train", "test"))
    parser.add_argument("--unit-id", type=int)
    parser.add_argument("--cycle-start", type=int)
    parser.add_argument("--cycle-end", type=int)
    parser.add_argument("--sensor-name")
    args = parser.parse_args()
    selectors = [args.split, args.unit_id, args.cycle_start, args.cycle_end, args.sensor_name]
    try:
        if args.public_samples and args.verification_summary:
            raise ValueError("choose only one output mode")
        if (args.public_samples or args.verification_summary) and any(
            value is not None for value in selectors
        ):
            raise ValueError("sample/verification modes cannot be combined with selector arguments")
        if args.verification_summary:
            result = verification_summary(args.input_dir)
        elif args.public_samples:
            result = build_public_samples(args.input_dir)
        elif all(value is not None for value in selectors):
            repository = FD001Repository(args.input_dir)
            result = {
                "schema_version": SCHEMA_VERSION,
                "work_item_id": "WO-M2-RESEARCH-002",
                "status": "EVIDENCE_CLASSIFIED_NO_DIAGNOSIS",
                "cases": [
                    extract_case(
                        repository,
                        args.split,
                        args.unit_id,
                        args.cycle_start,
                        args.cycle_end,
                        args.sensor_name,
                    )
                ],
                "unknowns": unknown_records(),
                "semantic_matrix": semantic_matrix(),
            }
        else:
            raise ValueError(
                "use --public-samples, --verification-summary, or provide all five selector arguments"
            )
    except (OSError, ValueError, KeyError, RuntimeError) as exc:
        print(json.dumps({"status": "BLOCKED", "error": str(exc)}, separators=(",", ":")))
        return 2
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
