# Evidence Prompt source crosscheck

`WO-EP-WEB-001` · Chrome 158.0.8127.37 · 2026-11-25, UTC+08:00.

For each sample, native keyboard actions selected its visible browser row. The driver read that row, the active SVG point, selected provenance and plain-text preview. It captured the actual HTTP 200 History response body from the same page request. It then independently opened the original TXT read-only, hashed its bytes, counted physical lines and nonblank rows, and matched Unit and Cycle using source columns 1 and 2 before looking up column `5 + Sensor`. The independent raw token and indexes agreed with the API, browser and prompt on all nine points.

In the excerpt column the fields are Cycle / Numeric Value / Original Token / Physical Line Number (1-based) / Data Row Index (0-based) / Source Column Index (1-based) / Reread Matches.

| Sample | Time (Taiwan) | History selection split / Unit / Sensor / requested window | Exact matched prompt row | Whole-window count |
| ---: | --- | --- | --- | ---: |
| 1 | 10:50:39.121 | train / 1 / sensor_7 / 1–20 | `1 \| 554.36 \| 554.36 \| 1 \| 0 \| 12 \| true` | 20 |
| 2 | 10:50:39.126 | train / 1 / sensor_7 / 1–20 | `10 \| 553.59 \| 553.59 \| 10 \| 9 \| 12 \| true` | 20 |
| 3 | 10:50:39.130 | train / 1 / sensor_7 / 1–20 | `20 \| 554.81 \| 554.81 \| 20 \| 19 \| 12 \| true` | 20 |
| 4 | 10:50:39.733 | test / 1 / sensor_7 / 6–8 | `6 \| 554.22 \| 554.22 \| 6 \| 5 \| 12 \| true` | 3 |
| 5 | 10:50:39.738 | test / 1 / sensor_7 / 6–8 | `8 \| 553.59 \| 553.59 \| 8 \| 7 \| 12 \| true` | 3 |
| 6 | 10:50:40.291 | train / 2 / sensor_7 / 1–20 | `1 \| 554.53 \| 554.53 \| 193 \| 192 \| 12 \| true` | 20 |
| 7 | 10:50:40.775 | train / 2 / sensor_5 / 5–12 | `5 \| 14.62 \| 14.62 \| 197 \| 196 \| 10 \| true` | 8 |
| 8 | 10:50:40.780 | train / 2 / sensor_5 / 5–12 | `12 \| 14.62 \| 14.62 \| 204 \| 203 \| 10 \| true` | 8 |
| 9 | 10:50:41.214 | train / 1 / sensor_5 / 192–193 | `192 \| 14.62 \| 14.62 \| 192 \| 191 \| 10 \| true` | 1 |

The initial sample used `/api/history?split=train&unit=1&sensor=7&start=1&end=20`. The later Test window was Cycles 6–8. Train Unit 2 with Sensor 5 used Cycles 5–12. Source Column was 12 for Sensor 7 and 10 for Sensor 5. The two splits retained different source hashes and matching relative TXT paths. Every reference had `reread_matches=true`, and the returned reread token equaled the original token. The focus line mirrored the selected observation; the window table still contained all other observations.

| Split | Original TXT path | Independent SHA-256 matched against API and preview |
| --- | --- | --- |
| train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |

The prompt reports raw observations as KNOWN, selected-window arithmetic as INFERENCE, and faults, health status, thresholds, failure timing, causal claims, RUL predictions and unsupported units as UNKNOWN / INSUFFICIENT EVIDENCE. The preview labels split quality separately and explicitly tells the reader to preserve provenance and avoid inventing observations, diagnoses or RUL. [Bounded DevTools output and command](EP_EXECUTION_EVIDENCE.md)
