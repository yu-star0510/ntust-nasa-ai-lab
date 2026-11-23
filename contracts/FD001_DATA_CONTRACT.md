# FD001 Data Contract

| Metadata | Value |
| --- | --- |
| `contract_name` | `FD001_DATA_CONTRACT` |
| `schema_version` | `1.0.0` |
| `dataset` | `NASA_CMAPSS_FD001` |
| `source_type` | `TRUSTED_LOCAL_FILES` |
| `validation_status` | `PASS` |
| `main_acceptance` | `PENDING` |

This Research contract was produced only after the M2 Phase A gate passed. `PENDING` means STUDENT-MAIN Brain has not yet accepted it for Web use.

## Dataset and provenance

Train and Test rows contain 26 whitespace-delimited finite numeric fields: split-local positive `unit_id`, positive `cycle`, `setting_1..setting_3`, and `sensor_1..sensor_21`. Row provenance includes repository-relative `source_file`, lowercase SHA-256, 1-based `physical_line_number`, 0-based `data_row_index`, and 1-based `source_column_index`.

| Source | Relative path | SHA-256 |
| --- | --- | --- |
| Train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| Test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |
| RUL | `FD001/RUL_FD001.txt` | `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` |

## Semantics and policies

- Train contains training engine operating sequences. Train and Test Unit IDs are identifiers local to their split.
- Test contains partial observations. Its last observed Cycle is not a failure Cycle.
- RUL contains one ground-truth remaining-life label for each Test Unit at its last observed Cycle. It is neither a prediction nor an original per-Cycle sensor field.
- RUL has no Unit ID. File order maps to Test Units only after Test first-appearance order equals ascending Unit ID order and counts match.
- Results are sorted by numeric Cycle within one split and Unit. Unit listings are ascending.
- Missing or structurally invalid data is never filled, interpolated, deleted, or rewritten. Invalid width/type, non-finite values, invalid keys, ambiguous RUL mapping, or hash changes block validated use.

## Required fields and types

- `dataset_split`: enum `train | test`
- `unit_id`, `cycle`: positive integers
- `setting_1..setting_3`, `sensor_1..sensor_21`: finite numbers
- `source_file`: repository-relative string
- `source_sha256`: 64-character lowercase hexadecimal
- `physical_line_number`: 1-based positive integer
- `data_row_index`: 0-based non-negative integer
- `source_column_index`: 1-based positive integer

## Required interfaces

### `get_units(split)`

- Input: valid `train | test` split.
- Output: ascending `list[int]` Unit IDs parsed from that split.
- Errors: `ValueError` for invalid split.

### `get_cycles(split, unit_id)`

- Input: valid split and positive split-local Unit ID.
- Output: ascending `list[int]` Cycles.
- Errors: `ValueError` for invalid split; `KeyError` for unknown Unit.

### `get_sensor_series(split, unit_id, sensor_name)`

- Input: valid split, Unit, and `sensor_1..sensor_21`.
- Output: Cycle-sorted `list[{cycle, value, raw_reference}]` without smoothing, interpolation, or filling.
- Errors: `ValueError` for invalid split/sensor; `KeyError` for unknown Unit.
- Provenance: every point includes a RawReference.

### `get_raw_reference(split, unit_id, cycle, column_name)`

- Input: valid split, Unit/Cycle key, and one of the 26 mapped source columns.
- Output: `{dataset_split, source_file, source_sha256, physical_line_number, data_row_index, data_row_index_base, unit_id, cycle, column_name, source_column_index, original_value, reread_value, reread_matches}`.
- Errors: `ValueError` for invalid split; `KeyError` for invalid key/column.
- Provenance: implementation rereads the token at the recorded physical line and column.

### `get_test_rul_label(unit_id)`

- Input: valid positive Test Unit ID.
- Output: `{test_unit_id, rul_physical_line_number, rul_data_row_index, last_observed_cycle, rul_label, rul_raw_value}`.
- Errors: `KeyError` for unknown Test Unit.
- Semantics: applies only at the last observed Test Cycle and is not a prediction.

### `get_quality_summary(split)`

- Input: valid split.
- Output: aggregate rows, columns, units, cycle lengths, missing/duplicate metrics, per-column min/max/mean/population standard deviation, and constant/near-constant flags.
- Errors: `ValueError` for invalid split.
- Provenance: computed directly from the validated selected split; population standard deviation uses `ddof=0`.

## Disclosure boundary

Raw FD001 files, full Raw Indexes, complete RUL mappings, and complete Sensor series remain local. GitHub deliverables contain code, contracts, aggregate statistics, and only small traceability examples.
