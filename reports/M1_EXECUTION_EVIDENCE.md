# M1 Execution Evidence

## Environment

- Work item: `WO-M1-RESEARCH-001`, Amendment `001`
- Execution date: 2026-11-23 (Asia/Taipei, UTC+08:00)
- Shell: PowerShell
- Python: `Python 3.12.7`
- Git branch: `main`
- Amendment baseline: `f6e805c783f4e8783203c6c1c55f13319c67e8ba`

Public evidence uses the repository-relative input path to avoid exposing unnecessary local user-path details. The source file remains local and ignored.

Baseline synchronization command:

```text
COMMAND=git pull --ff-only origin main
EXIT_CODE=0
RESULT=Fast-forward c58aec1..f6e805c; WORK_ITEM.md only
```

## Input verification

Timestamp: `2026-11-23T17:43:38+08:00`

Commands:

```text
Get-Item -LiteralPath synthetic_sensor.csv
Get-FileHash -Algorithm SHA256 -LiteralPath synthetic_sensor.csv
git check-ignore -v -- synthetic_sensor.csv
python -c <csv structure preflight using csv.reader>
```

Checks and actual results:

```text
INPUT_PATH=synthetic_sensor.csv
FILE_EXISTS=True
FILE_READABLE=True
FILE_SIZE=234
INPUT_SHA256_BEFORE=cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377
GIT_IGNORE_MATCH=.gitignore:10:synthetic_sensor.csv
EXIT_CODE=0
STDERR=NONE
```

The structure preflight found 7 physical records, consisting of one header and 6 data rows, with width 4 for every record.

## Profile execution

Timestamp: `2026-11-23T17:46:37+08:00`

```text
COMMAND=python research/m1_csv_profile.py --input synthetic_sensor.csv
EXIT_CODE=0
STDERR=NONE
```

Actual stdout results:

```json
{
  "source_type": "SYNTHETIC",
  "has_header": true,
  "rows": 6,
  "columns": 4,
  "column_names": ["timestamp", "load_pct", "coolant_out_c", "oil_pressure_bar"],
  "duplicate_column_names": false,
  "inconsistent_row_widths": [],
  "duplicates": 1,
  "missing": 1,
  "missing_by_column": {
    "timestamp": 0,
    "load_pct": 0,
    "coolant_out_c": 0,
    "oil_pressure_bar": 1
  },
  "numeric_columns": ["load_pct", "coolant_out_c"],
  "sha256": "cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377"
}
```

The command additionally emitted two source-mapped display examples (data rows 1 and 6); they are recorded in `M1_SYNTHETIC_PROFILE.md` rather than reproducing the full CSV.

## Trend execution

Timestamp: `2026-11-23T17:46:37+08:00`

```text
COMMAND=python research/m1_sensor_trend.py --input synthetic_sensor.csv
EXIT_CODE=0
STDERR=NONE
```

Actual stdout results:

```json
{
  "source_type": "SYNTHETIC",
  "x_axis": "Row Index (1-based data row)",
  "y_axis": "load_pct",
  "point_count": 6,
  "transformations": "NONE",
  "validation": {
    "all_points_match_source": true,
    "checked_points": 6,
    "source_data_rows": 6
  }
}
```

The six source mappings and values are recorded in `M1_TREND_VALIDATION.md`.

## Test execution

Timestamp: `2026-11-23T17:46:37+08:00`

```text
COMMAND=python -m unittest -v tests/test_m1_profile.py
EXIT_CODE=0
STDOUT=NONE
STDERR=test runner progress and summary shown below
```

Python `unittest` writes its normal verbose progress to stderr:

```text
test_basic_display_matches_source_rows ... ok
test_column_count_names_and_widths_match_source ... ok
test_csv_loading_and_actual_row_count ... ok
test_exact_duplicates_match_independent_count ... ok
test_missing_values_match_independent_count ... ok
test_sensor_trend_source_mapping ... ok
test_sha256_integrity_uses_actual_bytes ... ok

Ran 7 tests in 0.008s
OK
```

## Post-test integrity

Final timestamp: `2026-11-23T17:48:56+08:00`, after a final 7/7 test rerun (Exit Code 0).

```text
INPUT_SHA256_AFTER=cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377
HASH_MATCH=True
```

No source data, NASA FD001 data, credentials, or secrets are included in the authorized deliverables.
