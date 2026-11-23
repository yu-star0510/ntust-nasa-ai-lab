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
Historical preflight description only; superseded by the complete rerun command in section B below.
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

---

# Evidence Remediation Rerun

`EVIDENCE_TYPE: EVIDENCE_RERUN`

The earlier summarized evidence above is retained for history. This section records a new execution performed after MAIN identified the evidence gap. It does not claim to be the original 17:43–17:48 execution.

## Public redaction

The only altered output field is the local Windows user path. The actual profile stdout value beginning with `C:\\Users\\<redacted>\\...` is published as `<PROJECT_ROOT>\\synthetic_sensor.csv`. No statistical value, test message, warning, error, timestamp, Exit Code, or SHA-256 value is changed or omitted. Empty streams are explicitly marked `<EMPTY>`.

## A. Environment verification

The environment command used PowerShell built-ins plus `python --version`, `git branch --show-current`, `git rev-parse HEAD`, `Get-Item`, and `Get-FileHash`. Each native command's Exit Code was captured immediately.

```text
EVIDENCE_TYPE=EVIDENCE_RERUN
START_TIMESTAMP=2026-11-23T17:58:41.449+08:00
END_TIMESTAMP=2026-11-23T17:58:41.566+08:00
CURRENT_WORKING_DIRECTORY=<PROJECT_ROOT>
POWERSHELL_VERSION=7.6.9
PYTHON_VERSION=Python 3.12.7
PYTHON_VERSION_EXIT_CODE=0
GIT_BRANCH=main
GIT_BRANCH_EXIT_CODE=0
GIT_HEAD=526641bc83b58f18c4c83a90ae8ac50eb2ff1c2f
GIT_HEAD_EXIT_CODE=0
INPUT_FILE_EXISTS=true
INPUT_FILE_SIZE=234
INPUT_SHA256_BEFORE=cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377
ENVIRONMENT_EXIT_CODE=0
ENVIRONMENT_STDERR=<EMPTY>
```

The working tree was clean before `git pull --ff-only origin main`; the pull fast-forwarded `30ac2a6` to `526641b` and changed only `WORK_ITEM.md`.

## B. CSV preflight

Complete PowerShell here-string and child command:

```powershell
$preflight = @'
import csv
import json
from pathlib import Path

path = Path("synthetic_sensor.csv")
with path.open("r", encoding="utf-8-sig", newline="") as stream:
    records = list(csv.reader(stream))

if not records:
    raise ValueError("CSV is empty")

header = records[0]
rows = records[1:]
if len(rows) != 6:
    raise ValueError(f"Expected 6 data rows, found {len(rows)}")

print(json.dumps({
    "rows": len(rows),
    "columns": len(header),
    "column_names": header,
    "row_widths": [len(row) for row in rows]
}, ensure_ascii=False, indent=2))
'@

python -c $preflight
```

Execution envelope:

```text
START_TIMESTAMP=2026-11-23T17:59:01.273+08:00
END_TIMESTAMP=2026-11-23T17:59:01.355+08:00
EXIT_CODE=0
```

Complete stdout:

```json
{
  "rows": 6,
  "columns": 4,
  "column_names": [
    "timestamp",
    "load_pct",
    "coolant_out_c",
    "oil_pressure_bar"
  ],
  "row_widths": [
    4,
    4,
    4,
    4,
    4,
    4
  ]
}
```

Complete stderr:

```text
<EMPTY>
```

## C. CSV profile rerun

```text
COMMAND=python research/m1_csv_profile.py --input synthetic_sensor.csv
START_TIMESTAMP=2026-11-23T17:59:12.279+08:00
END_TIMESTAMP=2026-11-23T17:59:12.392+08:00
EXIT_CODE=0
```

Complete stdout, with only `input_path` redacted as documented above:

```json
{
  "profile": {
    "input_path": "<PROJECT_ROOT>\\synthetic_sensor.csv",
    "source_type": "SYNTHETIC",
    "has_header": true,
    "header_basis": "The first parsed CSV record supplies unique, non-empty field names.",
    "rows": 6,
    "columns": 4,
    "column_names": [
      "timestamp",
      "load_pct",
      "coolant_out_c",
      "oil_pressure_bar"
    ],
    "duplicate_column_names": false,
    "inconsistent_row_widths": [],
    "duplicates": 1,
    "duplicate_rule": "Count only additional occurrences of raw rows whose complete field tuples match exactly; no normalization is applied.",
    "missing": 1,
    "missing_by_column": {
      "timestamp": 0,
      "load_pct": 0,
      "coolant_out_c": 0,
      "oil_pressure_bar": 1
    },
    "missing_rule": "A raw field is missing when empty or whitespace-only.",
    "numeric_columns": [
      "load_pct",
      "coolant_out_c"
    ],
    "sha256": "cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377"
  },
  "display": {
    "source_type": "SYNTHETIC",
    "column_names": [
      "timestamp",
      "load_pct",
      "coolant_out_c",
      "oil_pressure_bar"
    ],
    "examples": [
      {
        "data_row_index": 1,
        "physical_line_number": 2,
        "values": {
          "timestamp": "2026-01-01T10:00:00",
          "load_pct": "50",
          "coolant_out_c": "78",
          "oil_pressure_bar": "4.0"
        }
      },
      {
        "data_row_index": 6,
        "physical_line_number": 7,
        "values": {
          "timestamp": "2026-01-01T10:04:00",
          "load_pct": "70",
          "coolant_out_c": "84",
          "oil_pressure_bar": "3.8"
        }
      }
    ],
    "note": "Only the first and last data rows are shown; the full CSV is not reproduced."
  }
}
```

Complete stderr:

```text
<EMPTY>
```

## D. Sensor trend rerun

```text
COMMAND=python research/m1_sensor_trend.py --input synthetic_sensor.csv
START_TIMESTAMP=2026-11-23T17:59:24.170+08:00
END_TIMESTAMP=2026-11-23T17:59:24.273+08:00
EXIT_CODE=0
```

Complete stdout:

```json
{
  "trend": {
    "source_type": "SYNTHETIC",
    "x_axis": "Row Index (1-based data row)",
    "y_axis": "load_pct",
    "point_count": 6,
    "points": [
      {
        "x": 1,
        "y": 50.0,
        "raw_y": "50",
        "data_row_index": 1,
        "physical_line_number": 2
      },
      {
        "x": 2,
        "y": 50.0,
        "raw_y": "50",
        "data_row_index": 2,
        "physical_line_number": 3
      },
      {
        "x": 3,
        "y": 70.0,
        "raw_y": "70",
        "data_row_index": 3,
        "physical_line_number": 4
      },
      {
        "x": 4,
        "y": 70.0,
        "raw_y": "70",
        "data_row_index": 4,
        "physical_line_number": 5
      },
      {
        "x": 5,
        "y": 70.0,
        "raw_y": "70",
        "data_row_index": 5,
        "physical_line_number": 6
      },
      {
        "x": 6,
        "y": 70.0,
        "raw_y": "70",
        "data_row_index": 6,
        "physical_line_number": 7
      }
    ],
    "transformations": "NONE: no interpolation, smoothing, filling, or value changes."
  },
  "validation": {
    "all_points_match_source": true,
    "checked_points": 6,
    "source_data_rows": 6
  }
}
```

Complete stderr:

```text
<EMPTY>
```

## E. Unittest rerun

```text
COMMAND=python -m unittest -v tests/test_m1_profile.py
START_TIMESTAMP=2026-11-23T17:59:38.186+08:00
END_TIMESTAMP=2026-11-23T17:59:38.397+08:00
EXIT_CODE=0
TESTS_RUN=7
PASSED=7
FAILED=0
ERRORS=0
```

Complete stdout:

```text
<EMPTY>
```

Complete stderr (normal verbose unittest stream):

```text
test_basic_display_matches_source_rows (tests.test_m1_profile.TestM1SyntheticProfile.test_basic_display_matches_source_rows) ... ok
test_column_count_names_and_widths_match_source (tests.test_m1_profile.TestM1SyntheticProfile.test_column_count_names_and_widths_match_source) ... ok
test_csv_loading_and_actual_row_count (tests.test_m1_profile.TestM1SyntheticProfile.test_csv_loading_and_actual_row_count) ... ok
test_exact_duplicates_match_independent_count (tests.test_m1_profile.TestM1SyntheticProfile.test_exact_duplicates_match_independent_count) ... ok
test_missing_values_match_independent_count (tests.test_m1_profile.TestM1SyntheticProfile.test_missing_values_match_independent_count) ... ok
test_sensor_trend_source_mapping (tests.test_m1_profile.TestM1SyntheticProfile.test_sensor_trend_source_mapping) ... ok
test_sha256_integrity_uses_actual_bytes (tests.test_m1_profile.TestM1SyntheticProfile.test_sha256_integrity_uses_actual_bytes) ... ok

----------------------------------------------------------------------
Ran 7 tests in 0.008s

OK
```

## F. Input integrity after rerun

```text
COMMAND=Get-FileHash -LiteralPath synthetic_sensor.csv -Algorithm SHA256
START_TIMESTAMP=2026-11-23T17:59:51.240+08:00
END_TIMESTAMP=2026-11-23T17:59:51.250+08:00
INPUT_SHA256_BEFORE=cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377
INPUT_SHA256_AFTER=cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377
HASH_MATCH=true
PRIOR_WORKER_REPORTED_SHA256_MATCH=true
EXIT_CODE=0
STDERR=<EMPTY>
```

## Remediation result

All four executable evidence steps returned Exit Code 0. The preflight measured 6 rows and did not trigger the row-count stop condition. The profile and trend output is complete above, the unittest suite ran 7 tests with 7 passes and no failures or errors, and the input SHA-256 remained unchanged. The research algorithms, tests, profile report, trend report, `.gitignore`, and source CSV were not modified during this remediation.
