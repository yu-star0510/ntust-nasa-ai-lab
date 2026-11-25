# Sensor Trend original-source crosscheck

`WO-VIS-WEB-001` · Chrome 158.0.8127.37 · 2026-11-25 UTC+08:00 · nine live observations.

The driver selected each observed cycle in the real browser from the active split/Unit/Sensor selection. It captured the selected SVG dot, its matching `M` or `L` coordinate in the actual rendered path, the table row, Source Provenance and the focused Prompt row. Chrome DevTools supplied the actual HTTP 200 History body. Separately, the driver reopened the original whitespace-separated TXT read-only, hashed its bytes, located Unit/Cycle using fields 1–2, counted physical lines and nonblank data rows, and read the original sensor token. Every value, token, index and hash matched all four surfaces. No synthetic fixture is counted.

| # | Split / Unit / sensor / requested window | Cycle | Sensor value | Original token | Physical line | 0-based row | 1-based column | SVG circle and path X, Y (command) |
| ---: | --- | ---: | ---: | --- | ---: | ---: | ---: | --- |
| 1 | train / 1 / sensor_9 / 1–100 | 1 | 9046.19 | `9046.19` | 1 | 0 | 14 | 89.000, 165.095 (`M`) |
| 2 | train / 1 / sensor_9 / 1–100 | 10 | 9051.7 | `9051.70` | 10 | 9 | 14 | 146.455, 118.068 (`L`) |
| 3 | train / 1 / sensor_9 / 1–100 | 100 | 9045.72 | `9045.72` | 100 | 99 | 14 | 721.000, 169.106 (`L`) |
| 4 | train / 1 / sensor_7 / 1–20 | 1 | 554.36 | `554.36` | 1 | 0 | 12 | 89.000, 94.120 (`M`) |
| 5 | train / 1 / sensor_7 / 1–20 | 20 | 554.81 | `554.81` | 20 | 19 | 12 | 721.000, 36.903 (`L`) |
| 6 | train / 2 / sensor_5 / 5–12 | 5 | 14.62 | `14.62` | 197 | 196 | 10 | 89.000, 124.000 (`M`) |
| 7 | train / 2 / sensor_5 / 5–12 | 12 | 14.62 | `14.62` | 204 | 203 | 10 | 721.000, 124.000 (`L`) |
| 8 | test / 1 / sensor_7 / 5–12 | 5 | 554.16 | `554.16` | 5 | 4 | 12 | 89.000, 120.833 (`M`) |
| 9 | test / 1 / sensor_7 / 5–12 | 12 | 554.35 | `554.35` | 12 | 11 | 12 | 721.000, 90.745 (`L`) |

| Split | Source file | Independently hashed SHA-256 |
| --- | --- | --- |
| train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |

All reference rereads returned `true` and the same raw token. Before/after verification found unchanged marker values, SVG coordinates, titles and unfocused Prompt for the full 100-observation window. The report above rounds SVG coordinates only for readability. The execution trace contains the exact bounded sample coordinates and codes. [Execution evidence](LINE_CHART_EXECUTION_EVIDENCE.md)
