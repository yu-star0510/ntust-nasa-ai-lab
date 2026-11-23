from __future__ import annotations

import hashlib
import json
import statistics
import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = PROJECT_ROOT / "research"
sys.path.insert(0, str(RESEARCH_DIR))

from m2_fd001_validate import (  # noqa: E402
    COLUMN_NAMES,
    DEFAULT_INPUT_DIR,
    RUL_FILE,
    SENSOR_NAMES,
    SETTING_NAMES,
    TEST_FILE,
    TRAIN_FILE,
    build_rul_mapping,
    get_raw_reference,
    load_sources,
    profile_sequence,
    run_phase_a,
    sha256_file,
)
from m2_fd001_analysis import (  # noqa: E402
    CONTRACT_JSON,
    FD001Repository,
    STATISTIC_COLUMNS,
    column_statistics,
    run_phase_b,
    select_traceable_trend,
    validate_contract,
)


class TestM2PhaseA(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.paths = [
            DEFAULT_INPUT_DIR / TRAIN_FILE,
            DEFAULT_INPUT_DIR / TEST_FILE,
            DEFAULT_INPUT_DIR / RUL_FILE,
        ]
        cls.before_hashes = {path.name: sha256_file(path) for path in cls.paths}
        cls.train, cls.test, cls.rul = load_sources(DEFAULT_INPUT_DIR)

    @classmethod
    def tearDownClass(cls) -> None:
        after_hashes = {path.name: sha256_file(path) for path in cls.paths}
        if cls.before_hashes != after_hashes:
            raise AssertionError("One or more FD001 source hashes changed during tests")

    def test_sources_exist_readable_and_hashes_use_actual_bytes(self) -> None:
        for path in self.paths:
            self.assertTrue(path.is_file())
            expected = hashlib.sha256(path.read_bytes()).hexdigest()
            self.assertEqual(sha256_file(path), expected)

    def test_train_and_test_have_26_mapped_columns(self) -> None:
        self.assertEqual(len(COLUMN_NAMES), 26)
        self.assertEqual(len(SETTING_NAMES), 3)
        self.assertEqual(len(SENSOR_NAMES), 21)
        for dataset in (self.train, self.test):
            self.assertTrue(dataset.rows)
            self.assertTrue(all(len(row.tokens) == 26 for row in dataset.rows))

    def test_rul_has_one_nonnegative_finite_value_per_row(self) -> None:
        self.assertTrue(self.rul.rows)
        self.assertTrue(all(row.value >= 0 for row in self.rul.rows))
        self.assertTrue(all(len(row.raw_value.split()) == 1 for row in self.rul.rows))

    def test_unit_cycle_integrity(self) -> None:
        for dataset in (self.train, self.test):
            profile = profile_sequence(dataset)
            self.assertTrue(profile["unit_cycle_integrity_valid"])
            self.assertEqual(profile["duplicate_unit_cycle_keys"], 0)
            self.assertEqual(profile["cycle_gaps"], {})
            self.assertEqual(profile["out_of_order_units"], [])

    def test_test_units_map_to_rul_rows_by_verified_order(self) -> None:
        mapping = build_rul_mapping(self.test, self.rul)
        self.assertTrue(mapping["orders_match"])
        self.assertTrue(mapping["rul_rows_match_test_units"])
        self.assertEqual(len(mapping["entries"]), len(set(row.unit_id for row in self.test.rows)))

    def test_raw_reference_rereads_actual_source_positions(self) -> None:
        for dataset in (self.train, self.test):
            for index in (0, len(dataset.rows) // 2, len(dataset.rows) - 1):
                row = dataset.rows[index]
                for column_name in ("setting_1", "sensor_1", "sensor_21"):
                    reference = get_raw_reference(
                        dataset, row.unit_id, row.cycle, column_name
                    )
                    self.assertTrue(reference["reread_matches"])
                    self.assertEqual(reference["data_row_index"], row.data_row_index)
                    self.assertEqual(reference["physical_line_number"], row.physical_line_number)

    def test_phase_a_gate_is_computed_from_validation_results(self) -> None:
        result = run_phase_a(DEFAULT_INPUT_DIR)
        self.assertEqual(result["phase_a_status"], "PASS")
        self.assertTrue(all(result["gate_checks"].values()))


class TestM2PhaseB(unittest.TestCase):
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
            raise AssertionError("One or more FD001 source hashes changed during Phase B tests")

    def test_quality_statistics_recompute_from_actual_values(self) -> None:
        for dataset in (self.repository.train, self.repository.test):
            calculated = column_statistics(dataset)
            for column_name in (STATISTIC_COLUMNS[0], STATISTIC_COLUMNS[-1]):
                index = COLUMN_NAMES.index(column_name)
                values = [row.values[index] for row in dataset.rows]
                self.assertEqual(calculated[column_name]["min"], min(values))
                self.assertEqual(calculated[column_name]["max"], max(values))
                self.assertAlmostEqual(calculated[column_name]["mean"], statistics.fmean(values))
                self.assertAlmostEqual(
                    calculated[column_name]["population_std"], statistics.pstdev(values)
                )

    def test_sensor_trend_is_sorted_and_source_traceable(self) -> None:
        trend = select_traceable_trend(self.repository)
        cycles = [point["cycle"] for point in trend["points"]]
        self.assertEqual(cycles, sorted(cycles))
        self.assertEqual(len(cycles), len(self.repository.get_cycles("train", trend["unit_id"])))
        for point in trend["points"]:
            self.assertTrue(point["raw_reference"]["reread_matches"])
            self.assertEqual(point["raw_reference"]["dataset_split"], trend["split"])
            self.assertEqual(point["raw_reference"]["unit_id"], trend["unit_id"])

    def test_train_test_and_unit_isolation(self) -> None:
        for split in ("train", "test"):
            units = self.repository.get_units(split)
            selected = units[len(units) // 2]
            series = self.repository.get_sensor_series(split, selected, "sensor_1")
            self.assertTrue(series)
            self.assertTrue(
                all(point["raw_reference"]["dataset_split"] == split for point in series)
            )
            self.assertTrue(
                all(point["raw_reference"]["unit_id"] == selected for point in series)
            )

    def test_rul_label_mapping_matches_local_rul_row(self) -> None:
        units = self.repository.get_units("test")
        for unit_id in (units[0], units[len(units) // 2], units[-1]):
            label = self.repository.get_test_rul_label(unit_id)
            source_row = self.repository.rul.rows[label["rul_data_row_index"]]
            self.assertEqual(label["rul_raw_value"], source_row.raw_value)
            self.assertEqual(label["rul_label"], source_row.value)
            self.assertEqual(
                label["last_observed_cycle"],
                max(self.repository.get_cycles("test", unit_id)),
            )

    def test_contract_json_and_markdown_are_consistent(self) -> None:
        contract = json.loads(CONTRACT_JSON.read_text(encoding="utf-8"))
        markdown = CONTRACT_JSON.with_suffix(".md").read_text(encoding="utf-8")
        validation = validate_contract(CONTRACT_JSON)
        self.assertTrue(validation["valid"])
        self.assertIn(contract["contract_name"], markdown)
        self.assertIn(contract["schema_version"], markdown)
        self.assertIn(contract["validation_status"], markdown)
        self.assertIn(contract["main_acceptance"], markdown)
        for interface_name in contract["interfaces"]:
            self.assertIn(f"`{interface_name}", markdown)

    def test_interface_error_behavior(self) -> None:
        with self.assertRaises(ValueError):
            self.repository.get_units("invalid")
        with self.assertRaises(KeyError):
            self.repository.get_cycles("train", -1)
        with self.assertRaises(ValueError):
            self.repository.get_sensor_series("train", 1, "not_a_sensor")
        with self.assertRaises(KeyError):
            self.repository.get_raw_reference("test", -1, 1, "sensor_1")
        with self.assertRaises(KeyError):
            self.repository.get_test_rul_label(-1)

    def test_phase_b_gate_uses_phase_a_and_contract_validation(self) -> None:
        result = run_phase_b(DEFAULT_INPUT_DIR)
        self.assertEqual(result["phase_a_status"], "PASS")
        self.assertEqual(result["phase_b_status"], "PASS")
        self.assertTrue(result["contract_validation"]["valid"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
