# M1 Synthetic Sensor Trend Validation

## Selection

- Source type: `SYNTHETIC`
- Input: project-root `synthetic_sensor.csv` (not committed)
- X axis: `Row Index (1-based data row)`
- Y axis: `load_pct`
- Points: 6
- Transformations: none

The actual header has no field named `Cycle`. Following the work order, the program therefore uses the 1-based source data-row index. `load_pct` is selected because it is the first field in original column order whose six values all parse as finite numbers without missing values. This selection does not assign a new physical meaning or unit.

## Source mapping

| X / data row | Physical CSV line | Raw `load_pct` | Parsed trend value |
| ---: | ---: | ---: | ---: |
| 1 | 2 | `50` | 50.0 |
| 2 | 3 | `50` | 50.0 |
| 3 | 4 | `70` | 70.0 |
| 4 | 5 | `70` | 70.0 |
| 5 | 6 | `70` | 70.0 |
| 6 | 7 | `70` | 70.0 |

## Validation

For every point, the validator reloads the CSV, uses `data_row_index - 1` to locate the source row, locates `load_pct` from the actual header, and compares both the raw field string and parsed numeric value. It also verifies `physical_line_number = data_row_index + 1`.

Result: `all_points_match_source = true`; 6 of 6 trend points were checked against 6 source rows. No rows from another source were used, and no interpolation, smoothing, filling, or value modification occurred.
