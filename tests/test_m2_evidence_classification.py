from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = PROJECT_ROOT / "research"
sys.path.insert(0, str(RESEARCH_DIR))

from m2_evidence_classification import (  # noqa: E402
    UNKNOWN_TOPICS,
    build_public_samples,
    extract_case,
    semantic_matrix,
    unknown_records,
    validate_selector,
    verification_summary,
)
from m2_fd001_analysis import FD001Repository  # noqa: E402
from m2_fd001_validate import (  # noqa: E402
    DEFAULT_INPUT_DIR,
    RUL_FILE,
    TEST_FILE,
    TRAIN_FILE,
    sha256_file,
)


class TestM2EvidenceClassification(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.paths = [
            DEFAULT_INPUT_DIR / TRAIN_FILE,
            DEFAULT_INPUT_DIR / TEST_FILE,
            DEFAULT_INPUT_DIR / RUL_FILE,
        ]
        cls.before_hashes = {path.name: sha256_file(path) for path in cls.paths}
        cls.repository = FD001Repository(DEFAULT_INPUT_DIR)

    @classmethod
    def tearDownClass(cls) -> None:
        after_hashes = {path.name: sha256_file(path) for path in cls.paths}
        if cls.before_hashes != after_hashes:
            raise AssertionError("One or more FD001 source hashes changed during evidence tests")

    def test_train_and_test_parameterized_windows_use_actual_isolated_cycles(self) -> None:
        train = extract_case(self.repository, "train", 1, 1, 5, "sensor_2")
        test_cycles = self.repository.get_cycles("test", 1)
        test = extract_case(
            self.repository, "test", 1, test_cycles[-5], test_cycles[-1], "sensor_2"
        )
        self.assertEqual(train["actual_selected_cycles"], [1, 2, 3, 4, 5])
        self.assertEqual(test["actual_selected_cycles"], test_cycles[-5:])
        for case in (train, test):
            selector = case["selector"]
            for observation in case["observations"]:
                for reference in observation["source_references"]:
                    self.assertEqual(reference["dataset_split"], selector["split"])
                    self.assertEqual(reference["unit_id"], selector["unit_id"])

    def test_each_sensor_observation_has_raw_row_column_and_token_evidence(self) -> None:
        case = extract_case(self.repository, "train", 1, 1, 5, "sensor_2")
        required = {
            "dataset_split",
            "unit_id",
            "cycle",
            "sensor_name",
            "raw_value",
            "original_value",
            "original_token",
            "source_file",
            "source_sha256",
            "physical_line_number",
            "data_row_index",
            "source_column_index",
            "reread_matches",
            "reread_method",
        }
        for observation in case["observations"]:
            self.assertEqual(observation["category"], "OBSERVATION")
            reference = observation["source_references"][0]
            self.assertTrue(required <= set(reference))
            self.assertEqual(reference["source_column_index"], 7)
            self.assertTrue(reference["reread_matches"])
            self.assertFalse(Path(reference["source_file"]).is_absolute())
            self.assertEqual(float(reference["original_token"]), reference["original_value"])
            self.assertEqual(reference["raw_value"], reference["original_value"])

    def test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim(self) -> None:
        case = extract_case(self.repository, "train", 1, 1, 5, "sensor_2")
        calculation = case["inferences"][0]["calculation_or_null"]
        values = calculation["input_values"]
        self.assertAlmostEqual(calculation["endpoint_delta"], values[-1] - values[0])
        self.assertEqual(calculation["exact_endpoint_expression"], "642.37 - 641.82 = 0.55")
        self.assertEqual(calculation["selected_window_min"], min(values))
        self.assertEqual(calculation["selected_window_max"], max(values))
        self.assertEqual(calculation["monotonicity_claim"], "NOT_MADE")
        limitations = " ".join(case["inferences"][0]["limitations"]).lower()
        self.assertIn("does not prove a monotonic trend", limitations)
        self.assertIn("does not establish degradation", limitations)

    def test_train_rul_is_explicitly_derived_and_not_an_original_label(self) -> None:
        case = extract_case(self.repository, "train", 1, 1, 5, "sensor_2")
        derived = case["inferences"][1]
        calculation = derived["calculation_or_null"]
        final_cycle = max(self.repository.get_cycles("train", 1))
        self.assertEqual(calculation["classification"], "DERIVED")
        self.assertEqual(calculation["derived_values"], [final_cycle - cycle for cycle in range(1, 6)])
        self.assertIn("not original columns", derived["statement"])
        references = derived["source_references"]
        self.assertEqual(len(references), 6)
        self.assertEqual(
            [reference["cycle"] for reference in references[:-1]],
            [1, 2, 3, 4, 5],
        )
        self.assertTrue(
            all(
                reference["provenance_role"] == "DERIVED_CURRENT_CYCLE_INPUT"
                for reference in references[:-1]
            )
        )
        final_reference = references[-1]
        self.assertEqual(
            final_reference["provenance_role"],
            "DERIVED_FINAL_OBSERVED_CYCLE_INPUT",
        )
        self.assertEqual(final_reference["cycle"], final_cycle)
        approved = self.repository.get_raw_reference("train", 1, final_cycle, "cycle")
        self.assertEqual(final_reference["physical_line_number"], approved["physical_line_number"])
        self.assertEqual(final_reference["data_row_index"], approved["data_row_index"])
        self.assertEqual(final_reference["source_column_index"], 2)
        self.assertEqual(final_reference["original_token"], approved["original_value"])
        self.assertTrue(final_reference["reread_matches"])
        self.assertIn("linecache-backed", final_reference["reread_method"])

    def test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle(self) -> None:
        cycles = self.repository.get_cycles("test", 1)
        case = extract_case(
            self.repository, "test", 1, cycles[-5], cycles[-1], "sensor_2"
        )
        rul_observation = case["observations"][-1]
        reference = rul_observation["source_references"][0]
        approved_label = self.repository.get_test_rul_label(1)
        self.assertEqual(reference["cycle"], cycles[-1])
        self.assertIsNone(reference["sensor_name"])
        self.assertEqual(reference["sensor_name_applicability"], "NOT_APPLICABLE_RUL_LABEL")
        self.assertEqual(reference["raw_value"], approved_label["rul_label"])
        self.assertEqual(reference["original_value"], approved_label["rul_label"])
        self.assertEqual(reference["original_token"], approved_label["rul_raw_value"])
        self.assertTrue(reference["reread_matches"])
        self.assertEqual(reference["source_file"], "FD001/RUL_FD001.txt")
        self.assertIn("fresh disk reopen", reference["reread_method"])
        self.assertIn(
            "ground truth, not a predictive model output",
            " ".join(rul_observation["limitations"]),
        )

    def test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label(self) -> None:
        case = extract_case(self.repository, "test", 1, 1, 5, "sensor_2")
        statements = " ".join(record["statement"] for record in case["observations"])
        self.assertNotIn("ground-truth RUL label", statements)

    def test_unknown_records_cover_required_epistemic_limits(self) -> None:
        records = unknown_records()
        self.assertEqual(len(records), len(UNKNOWN_TOPICS))
        self.assertTrue(all(record["category"] == "UNKNOWN" for record in records))
        text = " ".join(record["statement"] for record in records)
        for topic in UNKNOWN_TOPICS:
            self.assertIn(topic, text)
        self.assertTrue(
            all(
                "not an original-data null or missing value" in record["limitations"][-1]
                for record in records
            )
        )

    def test_semantic_matrix_prevents_observed_derived_and_prediction_conflation(self) -> None:
        classes = {row["semantic_class"] for row in semantic_matrix()}
        self.assertEqual(
            classes,
            {
                "OBSERVED",
                "DERIVED",
                "GROUND_TRUTH_LABEL",
                "UNKNOWN",
                "MODEL_PREDICTION_NOT_AVAILABLE",
            },
        )

    def test_public_samples_are_small_deterministic_and_non_diagnostic(self) -> None:
        first = build_public_samples(DEFAULT_INPUT_DIR)
        second = build_public_samples(DEFAULT_INPUT_DIR)
        self.assertEqual(first, second)
        self.assertEqual(len(first["cases"]), 2)
        self.assertTrue(all(len(case["actual_selected_cycles"]) == 5 for case in first["cases"]))
        self.assertIn("Sensor trends alone are not evidence of a fault.", first["global_limitations"])

        published = json.loads(
            (PROJECT_ROOT / "reports" / "M2_EVIDENCE_SAMPLES.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(
            [case["selector"] for case in published["cases"]],
            [case["selector"] for case in first["cases"]],
        )
        self.assertEqual(
            [case["actual_selected_cycles"] for case in published["cases"]],
            [case["actual_selected_cycles"] for case in first["cases"]],
        )
        self.assertEqual(
            published["cases"][0]["inferences"][0]["calculation_or_null"]["endpoint_delta"],
            first["cases"][0]["inferences"][0]["calculation_or_null"]["endpoint_delta"],
        )
        self.assertEqual(
            published["cases"][0]["inferences"][1]["source_references"],
            first["cases"][0]["inferences"][1]["source_references"],
        )
        self.assertEqual(
            published["cases"][1]["observations"][-1]["source_references"][0]["original_value"],
            first["cases"][1]["observations"][-1]["source_references"][0]["original_value"],
        )
        for case in published["cases"]:
            for observation in case["observations"]:
                for reference in observation["source_references"]:
                    self.assertIn("raw_value", reference)
                    self.assertIn("original_token", reference)

    def test_bounded_verification_summary_executes_all_evidence_checks(self) -> None:
        summary = verification_summary(DEFAULT_INPUT_DIR)
        self.assertEqual(summary["status"], "EVIDENCE_CLASSIFIED_NO_DIAGNOSIS")
        self.assertEqual(len(summary["cases"]), 2)
        self.assertTrue(summary["all_source_references_reread_match"])
        self.assertEqual(
            summary["derived_train_rul_provenance"]["source_reference_count"], 6
        )
        self.assertEqual(
            summary["derived_train_rul_provenance"]["selected_cycle_reference_count"],
            5,
        )
        self.assertEqual(
            summary["derived_train_rul_provenance"]["final_cycle_reference"]["cycle"],
            192,
        )
        self.assertTrue(summary["rul_ground_truth"]["fresh_reread_verified"])
        self.assertEqual(summary["rul_ground_truth"]["classification"], "GROUND_TRUTH_LABEL_NOT_MODEL_PREDICTION")
        self.assertEqual(summary["diagnostic_conclusion"], "NOT_MADE")

    def test_selector_rejects_invalid_or_ambiguous_requests(self) -> None:
        invalid_requests = [
            ("invalid", 1, 1, 5, "sensor_2", ValueError),
            ("train", -1, 1, 5, "sensor_2", ValueError),
            ("train", 999, 1, 5, "sensor_2", KeyError),
            ("train", 1, 5, 1, "sensor_2", ValueError),
            ("train", 1, 1, 9999, "sensor_2", KeyError),
            ("train", 1, 1, 5, "sensor_99", ValueError),
            ("train", 1, 1, 1, "sensor_2", ValueError),
        ]
        for split, unit_id, start, end, sensor, error_type in invalid_requests:
            with self.subTest(split=split, unit_id=unit_id, start=start, end=end, sensor=sensor):
                with self.assertRaises(error_type):
                    validate_selector(self.repository, split, unit_id, start, end, sensor)


if __name__ == "__main__":
    unittest.main(verbosity=2)
