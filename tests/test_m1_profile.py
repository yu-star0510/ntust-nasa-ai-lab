from __future__ import annotations

import csv
import hashlib
import sys
import unittest
from collections import Counter
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = PROJECT_ROOT / "research"
sys.path.insert(0, str(RESEARCH_DIR))

from m1_csv_profile import (  # noqa: E402
    DEFAULT_INPUT,
    basic_display,
    is_missing,
    load_csv,
    profile_csv,
    sha256_file,
)
from m1_sensor_trend import build_trend, validate_trend  # noqa: E402


class TestM1SyntheticProfile(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.input_path = DEFAULT_INPUT
        cls.before_hash = sha256_file(cls.input_path)

    @classmethod
    def tearDownClass(cls) -> None:
        after_hash = sha256_file(cls.input_path)
        if cls.before_hash != after_hash:
            raise AssertionError("Synthetic CSV SHA-256 changed during tests")

    def independently_parse(self) -> tuple[list[str], list[list[str]]]:
        with self.input_path.open("r", encoding="utf-8-sig", newline="") as stream:
            parsed = list(csv.reader(stream))
        return parsed[0], parsed[1:]

    def test_csv_loading_and_actual_row_count(self) -> None:
        header, rows = load_csv(self.input_path)
        self.assertTrue(header)
        self.assertEqual(len(rows), 6)

    def test_column_count_names_and_widths_match_source(self) -> None:
        source_header, source_rows = self.independently_parse()
        profile = profile_csv(self.input_path)
        self.assertEqual(profile["column_names"], source_header)
        self.assertEqual(profile["columns"], len(source_header))
        self.assertTrue(all(len(row) == len(source_header) for row in source_rows))
        self.assertFalse(profile["duplicate_column_names"])

    def test_exact_duplicates_match_independent_count(self) -> None:
        _, source_rows = self.independently_parse()
        counts = Counter(tuple(row) for row in source_rows)
        expected = sum(count - 1 for count in counts.values() if count > 1)
        self.assertEqual(profile_csv(self.input_path)["duplicates"], expected)

    def test_missing_values_match_independent_count(self) -> None:
        header, rows = self.independently_parse()
        expected = {
            name: sum(is_missing(row[index]) for row in rows)
            for index, name in enumerate(header)
        }
        profile = profile_csv(self.input_path)
        self.assertEqual(profile["missing_by_column"], expected)
        self.assertEqual(profile["missing"], sum(expected.values()))

    def test_basic_display_matches_source_rows(self) -> None:
        header, rows = self.independently_parse()
        display = basic_display(self.input_path)
        for example in display["examples"]:
            source = rows[example["data_row_index"] - 1]
            self.assertEqual(example["values"], dict(zip(header, source, strict=True)))
            self.assertEqual(example["physical_line_number"], example["data_row_index"] + 1)

    def test_sensor_trend_source_mapping(self) -> None:
        trend = build_trend(self.input_path)
        validation = validate_trend(self.input_path, trend)
        self.assertEqual(trend["x_axis"], "Row Index (1-based data row)")
        self.assertEqual(trend["point_count"], profile_csv(self.input_path)["rows"])
        self.assertTrue(validation["all_points_match_source"])
        self.assertEqual(validation["checked_points"], validation["source_data_rows"])

    def test_sha256_integrity_uses_actual_bytes(self) -> None:
        expected = hashlib.sha256(self.input_path.read_bytes()).hexdigest()
        self.assertEqual(sha256_file(self.input_path), expected)
        self.assertEqual(self.before_hash, expected)


if __name__ == "__main__":
    unittest.main(verbosity=2)
