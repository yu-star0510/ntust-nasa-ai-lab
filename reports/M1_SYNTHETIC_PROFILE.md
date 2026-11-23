# M1 Synthetic CSV Profile

## Scope and provenance

- Work item: `WO-M1-RESEARCH-001`, Amendment `001`
- Input: project-root `synthetic_sensor.csv`
- Source type: `SYNTHETIC`
- Access mode: `READ_ONLY`
- File size: 234 bytes
- SHA-256 before analysis: `cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`

The source CSV is excluded by `.gitignore` and is not included in this repository. No NASA FD001 file was read.

## Parsing decision

Python's standard `csv` parser loaded the file as UTF-8 with optional BOM handling and preserved field strings. The first parsed record is treated as the header because it provides four unique, non-empty field names. There are seven physical records: one header and six data rows. Every parsed record has four fields, so no inconsistent-width data row was found.

## Measured profile

| Metric | Result |
| --- | --- |
| Data rows | 6 |
| Columns | 4 |
| Column order | `timestamp`, `load_pct`, `coolant_out_c`, `oil_pressure_bar` |
| Duplicate column names | 0 |
| Inconsistent-width data rows | 0 |
| Exact duplicate rows | 1 |
| Missing fields | 1 |

An exact duplicate is an additional occurrence of a raw row whose complete field tuple matches a previous tuple. No trimming, type conversion, or other normalization is used for duplicate detection.

A field is missing when its raw value is empty or contains only whitespace. No value is filled or corrected.

| Column | Missing count |
| --- | ---: |
| `timestamp` | 0 |
| `load_pct` | 0 |
| `coolant_out_c` | 0 |
| `oil_pressure_bar` | 1 |
| **Total** | **1** |

The total equals the sum of the per-column counts. The complete finite numeric columns are `load_pct` and `coolant_out_c`. `oil_pressure_bar` contains a missing field and therefore is not selected automatically for the M1 trend.

## Basic display validation

The CLI labels the source `SYNTHETIC`, retains the original field names, and shows only the first and last data rows instead of reproducing the complete CSV.

| Data row | Physical line | `timestamp` | `load_pct` | `coolant_out_c` | `oil_pressure_bar` |
| ---: | ---: | --- | ---: | ---: | ---: |
| 1 | 2 | `2026-01-01T10:00:00` | 50 | 78 | 4.0 |
| 6 | 7 | `2026-01-01T10:04:00` | 70 | 84 | 3.8 |

The tests independently parse the source and compare each displayed field to its referenced data row.
