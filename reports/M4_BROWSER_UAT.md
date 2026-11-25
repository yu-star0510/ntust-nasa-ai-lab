# M4 browser UAT

`WO-M4-WEB-001` · Windows · 2026-11-25 · Taiwan time (UTC+08:00).

Chrome **158.0.8127.37** ran the actual page at `http://127.0.0.1:8765/` in a 1440 × 1020 viewport with a temporary isolated profile. Chrome DevTools Protocol 1.3 supplied native keyboard and mouse events, Network requests, response bodies, Console logs, and the PNG screenshot. The visible in-app browser independently confirmed the controls, plot, source fields and reload. [Exact command and captured output](M4_UI_EXECUTION_EVIDENCE.md)

## Operations and DevTools Network

Selections below are split / unit / sensor / start / end. Chrome opened and reloaded the page, used Home and Down in the native selects, typed into the Cycle inputs, used Space on focused table buttons, selected a chart point with the mouse, and used Enter on Load window to retry. The Network column records GET requests. Counts and source visibility came from the live page after each action.

| Time (UTC+08:00) | Browser operation | Before → after selection | Network request and status | Rendered result |
| --- | --- | --- | --- | --- |
| 10:08:34.061 | Initial navigation | Page not loaded → train / 1 / 7 / 1 / 20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:34.248 | Train to Test | train / 1 / 7 / 1 / 20 → test / 1 / 7 / 1 / 20 | `/api/units?split=test` 200<br>`/api/history?split=test&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:34.359 | Test to Train | test / 1 / 7 / 1 / 20 → train / 1 / 7 / 1 / 20 | `/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:34.468 | Unit 1 to Unit 2 | train / 1 / 7 / 1 / 20 → train / 2 / 7 / 1 / 20 | `/api/history?split=train&unit=2&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:34.623 | Sensor 7 to Sensor 5 | train / 2 / 7 / 1 / 20 → train / 2 / 5 / 1 / 20 | `/api/history?split=train&unit=2&sensor=5&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:35.011 | Cycles 1–20 to 5–12 | train / 2 / 5 / 1 / 20 → train / 2 / 5 / 5 / 12 | `/api/history?split=train&unit=2&sensor=5&start=5&end=12` 200 | 8 dots / 8 rows. Source shown. Observations loaded. |
| 10:08:35.167 | Train Unit 2 to Unit 1 | train / 2 / 5 / 5 / 12 → train / 1 / 5 / 5 / 12 | `/api/history?split=train&unit=1&sensor=5&start=5&end=12` 200 | 8 dots / 8 rows. Source shown. Observations loaded. |
| 10:08:35.465 | Last observed boundary | train / 1 / 5 / 5 / 12 → train / 1 / 5 / 192 / 193 | `/api/history?split=train&unit=1&sensor=5&start=192&end=193` 200 | 1 dots / 1 rows. Source shown. Observations loaded. |
| 10:08:35.764 | Empty window | train / 1 / 5 / 192 / 193 → train / 1 / 5 / 193 / 194 | `/api/history?split=train&unit=1&sensor=5&start=193&end=194` 200 | 0 dots / 0 rows. No observations in this cycle range. |
| 10:08:35.768 | Reversed window | train / 1 / 5 / 193 / 194 → train / 1 / 5 / 20 / 10 | No API request | 0 dots / 0 rows. Invalid range. Start cycle must be less than or equal to end cycle. |
| 10:08:35.772 | Over 100 cycles | train / 1 / 5 / 20 / 10 → train / 1 / 5 / 1 / 101 | No API request | 0 dots / 0 rows. Invalid range. Choose at most 100 inclusive cycles. |
| 10:08:36.162 | Exactly 100 cycles | train / 1 / 5 / 1 / 101 → train / 1 / 5 / 1 / 100 | `/api/history?split=train&unit=1&sensor=5&start=1&end=100` 200 | 100 dots / 100 rows. Source shown. Observations loaded. |
| 10:08:36.311 | Reload page | train / 1 / 5 / 1 / 100 → train / 1 / 7 / 1 / 20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:36.451 | Rapid Sensor 8 to Sensor 9 while earlier request is paused | train / 1 / 8 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |
| 10:08:36.513 | SYNTHETIC isolated 503 injection into live page | train / 1 / 9 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 503 | 0 dots / 0 rows. Data unavailable (HTTP 503 · DATA_NOT_READY). SYNTHETIC UAT source fault injection |
| 10:08:36.656 | Recover after 503 | train / 1 / 9 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | 20 dots / 20 rows. Source shown. Observations loaded. |

## Race, faults and Console

- The driver held the earlier Sensor 8 request at the browser boundary. The page showed loading with zero dots, rows and source fields. Selecting Sensor 9 produced HTTP 200 for Sensor 9 and `net::ERR_ABORTED` for Sensor 8. Sensor 9 remained displayed.
- A **SYNTHETIC fault injection** in Chrome supplied one History HTTP 503 while the live page processed the actual control event. The displayed error identified HTTP 503 and `DATA_NOT_READY`. Chart, table and source fields cleared. Removing the interception and retrying returned live HTTP 200 and restored 20 observations. Python integration tests separately exercised the real server's 503 responses using an isolated source-verification stub.
- Console showed 0 uncaught JavaScript exceptions. Its sole warning/error record was the expected network error for the injected 503. The invalid windows sent zero API requests.
- Keyboard row selection updated the highlighted SVG dot and the source fields. Browser Network response bodies, DOM data and original TXT agreed on eight samples. [Three-way checks](M4_UI_API_SOURCE_CROSSCHECK.md)

## Screenshot

At 10:08:34.143, Chrome captured the live page after a mouse click on Cycle 4. The capture shows Train Unit 1, Sensor 7, Cycles 1–20, the highlighted table row, value 554.45 and its source fields. PNG 1440 × 1020, 86,548 bytes, SHA-256 `532200a26ac314ece2272e547d261a64e75f622c23e98b91d878f15a7847775b`. Browser chrome and profile details are outside the capture. The capture came from the final UAT application files and was staged with them. [Browser screenshot](M4_BROWSER_SCREENSHOT.png)
