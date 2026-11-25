# M4 UI, live API and original TXT crosscheck

`WO-M4-WEB-001` · Chrome 158.0.8127.37 · 2026-11-25 Taiwan time.

For each sample, a keyboard action activated the corresponding row in the browser. The driver read the row, the selected SVG circle's Cycle and value and its actual SVG coordinates, and all displayed source fields. DevTools supplied the response body for the precise request issued by the page. Independently, the driver opened the original TXT read-only, hashed its bytes, enumerated physical lines and nonblank rows, and located Unit and Cycle using source columns 1 and 2. The driver compared the three records.

| Sample | Taiwan time | API window (split / Unit / sensor / Cycles) | Original Cycle | TXT token | Browser/API number | Physical line | Data row | Source column | Browser SVG x, y |
| ---: | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| 1 | 10:08:34.073 | train / 1 / sensor_7 / 1–20 | 1 | `554.36` | 554.36 | 1 | 0 | 12 | 89.000, 94.120 |
| 2 | 10:08:34.077 | train / 1 / sensor_7 / 1–20 | 10 | `553.59` | 553.59 | 10 | 9 | 12 | 388.368, 192.024 |
| 3 | 10:08:34.080 | train / 1 / sensor_7 / 1–20 | 20 | `554.81` | 554.81 | 20 | 19 | 12 | 721.000, 36.903 |
| 4 | 10:08:34.260 | test / 1 / sensor_7 / 1–20 | 1 | `553.90` | 553.9 | 1 | 0 | 12 | 89.000, 159.484 |
| 5 | 10:08:34.473 | train / 2 / sensor_7 / 1–20 | 1 | `554.53` | 554.53 | 193 | 192 | 12 | 89.000, 113.848 |
| 6 | 10:08:35.021 | train / 2 / sensor_5 / 5–12 | 5 | `14.62` | 14.62 | 197 | 196 | 10 | 89.000, 124.000 |
| 7 | 10:08:35.026 | train / 2 / sensor_5 / 5–12 | 12 | `14.62` | 14.62 | 204 | 203 | 10 | 721.000, 124.000 |
| 8 | 10:08:35.469 | train / 1 / sensor_5 / 192–193 | 192 | `14.62` | 14.62 | 192 | 191 | 10 | 89.000, 124.000 |

Every History request associated with the eight samples returned HTTP 200. The records agreed on split, Unit, Cycle, sensor, number, original token, relative source file, SHA-256, physical line, data-row index, and source-column index. The API and displayed `reread_matches` were `true`, API `reread_value` matched the exact original token, and the API row index base was zero. SVG coordinates above are rounded for display. The execution output records exact coordinates and sample requests.

| Split | Original file | Independently computed SHA-256 |
| --- | --- | --- |
| train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |

Initial request `/api/history?split=train&unit=1&sensor=7&start=1&end=20`. Sensor 7 mapped to column 12 and Sensor 5 to column 10. Train Unit 2 and Test Unit 1 came from actual independent TXT scans. The 192–193 window held the last Train Unit 1 observation at Cycle 192. The subsequent 193–194 window produced zero chart points, table rows, or source fields. [Browser UAT](M4_BROWSER_UAT.md) · [Execution transcript](M4_UI_EXECUTION_EVIDENCE.md)
