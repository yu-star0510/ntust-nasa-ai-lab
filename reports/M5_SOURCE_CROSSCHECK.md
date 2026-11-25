# M5 four-way original-source crosscheck

Chrome 158.0.8127.37 · 2026-11-25 UTC+08:00 · nine genuine observations from the corrected integration run.

For each row, native keyboard selection highlighted the corresponding chart point and table row. The driver compared browser controls, displayed provenance, SVG Cycle/value and coordinates, table cells and the matching focused prompt row against the **actual Chrome HTTP 200 History response body**. It independently reopened the appropriate local TXT read-only, hashed the bytes, counted physical lines and nonblank data rows, and located Unit/Cycle via source columns 1 and 2. Sensor N is 1-based column N+5. No synthetic test case is included here.

| # | Split / Unit / sensor / requested window | Cycle | Numeric value | Original token | Physical line (1-based) | Data row (0-based) | Source column | SVG x, y | Complete-window count |
| ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- | ---: |
| 1 | train / 1 / sensor_7 / 1–20 | 1 | 554.36 | `554.36` | 1 | 0 | 12 | 89.000, 94.120 | 20 |
| 2 | train / 1 / sensor_7 / 1–20 | 10 | 553.59 | `553.59` | 10 | 9 | 12 | 388.368, 192.024 | 20 |
| 3 | train / 1 / sensor_7 / 1–20 | 20 | 554.81 | `554.81` | 20 | 19 | 12 | 721.000, 36.903 | 20 |
| 4 | test / 1 / sensor_7 / 6–8 | 6 | 554.22 | `554.22` | 6 | 5 | 12 | 89.000, 36.903 | 3 |
| 5 | test / 1 / sensor_7 / 6–8 | 8 | 553.59 | `553.59` | 8 | 7 | 12 | 721.000, 211.097 | 3 |
| 6 | train / 2 / sensor_7 / 1–20 | 1 | 554.53 | `554.53` | 193 | 192 | 12 | 89.000, 113.848 | 20 |
| 7 | train / 2 / sensor_5 / 5–12 | 5 | 14.62 | `14.62` | 197 | 196 | 10 | 89.000, 124.000 | 8 |
| 8 | train / 2 / sensor_5 / 5–12 | 12 | 14.62 | `14.62` | 204 | 203 | 10 | 721.000, 124.000 | 8 |
| 9 | train / 1 / sensor_5 / 192–193 | 192 | 14.62 | `14.62` | 192 | 191 | 10 | 89.000, 124.000 | 1 |

| Split | Source path | Independently computed SHA-256 matched in API, UI and Prompt |
| --- | --- | --- |
| train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |

All nine rows matched the actual source tokens, numeric values and indexes. The API `reread_value` matched the token and `reread_matches` was `true`. The browser and prompt displayed the same reread status. Selecting a focus row kept every observation in the request window. The driver computed the geometry from the window bounds and actual values, and checked the live SVG attributes. Sensor 7 mapped to column 12 and Sensor 5 mapped to column 10. Coordinates displayed above are rounded for reporting. [Actual sampled rows, requests and timestamps](M5_EXECUTION_EVIDENCE.md)
