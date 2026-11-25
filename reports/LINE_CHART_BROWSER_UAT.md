# Sensor Trend line chart browser UAT

`WO-VIS-WEB-001` · Chrome **158.0.8127.37** · Windows · 2026-11-25, UTC+08:00. The Chrome DevTools protocol captured native keyboard and mouse events, live Network request/response bodies, DOM state and actual viewport images. The actual UI used `http://127.0.0.1:8765/` throughout the primary browser tests.

## BEFORE and AFTER at the requested endpoint

The existing 8765 process had been launched in the workspace with `python -B -m web.api --port 8765`. Before and after attaching, the driver verified that all three served static assets were byte-for-byte identical to the local code. The before and after used the same Train Unit 1 / Sensor 9 / Cycles 1–100 selection.

| Actual Chrome state | HTTP | Original circles | Trend paths | Path commands |
| --- | ---: | ---: | ---: | --- |
| BEFORE | 200 | 100 | 0 | None |
| AFTER | 200 | 100 | 1 | 1 move and 99 straight line segments |

The driver independently calculated every original X/Y from the live API using the accepted scale. Each AFTER command matched the corresponding SVG circle, exactly. First and last commands (rounded here) were `M 89 165.094656` and `L 721 169.105973`. A SHA-256 fingerprint of all circle geometry/value/title tuples was identical before and after. The same comparison passed for the unfocused Prompt. The line was behind all markers and computed pointer-events was `none`. A native click on Cycle 10 selected its source and Prompt focus while retaining all 100 rows. Native keyboard selection of table rows also updated Provenance, circle selection and Prompt. [Original-source checks](LINE_CHART_SOURCE_CROSSCHECK.md)

The [three-frame PNG](LINE_CHART_BROWSER_SCREENSHOT.png) includes actual BEFORE and AFTER captures at the requested 8765 endpoint and a second AFTER case, Train Unit 2 / Sensor 5 / Cycles 5–12. Captures were scaled and given separate label bands. The PNG does not contain a complete Prompt.

## Live and negative browser scenarios

Selection order is split / unit / sensor / start / end. The driver verifies every available table/Prompt row against the current nonempty response, observes chart and provenance state, and validates the original SVG endpoints. Each final scenario met the asserted result.

| Time (Taiwan) | Native input / action | Before → after | Actual request and HTTP | Observed |
| --- | --- | --- | --- | --- |
| 14:56:47.409 | Live landing and default Sensor 7 window | Page not loaded → train/1/7/1/20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 1 paths / 20 rows; source shown; Prompt valid; Copy enabled |
| 14:56:47.819 | Train Unit 1 Sensor 9, Cycles 1-100 | train/1/7/1/20 → train/1/9/1/100 | `/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |
| 14:56:48.261 | Train Unit 1 Sensor 7, Cycles 1-20 | train/1/9/1/100 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 1 paths / 20 rows; source shown; Prompt valid; Copy enabled |
| 14:56:48.763 | Train Unit 2 Sensor 5, Cycles 5-12 | train/1/7/1/20 → train/2/5/5/12 | `/api/history?split=train&unit=2&sensor=5&start=5&end=12` 200 | 8 dots / 1 paths / 8 rows; source shown; Prompt valid; Copy enabled |
| 14:56:48.947 | Test Unit 1 Sensor 7, Cycles 5-12 | train/2/5/5/12 → test/1/7/5/12 | `/api/units?split=test` 200<br>`/api/history?split=test&unit=1&sensor=7&start=5&end=12` 200 | 8 dots / 1 paths / 8 rows; source shown; Prompt valid; Copy enabled |
| 14:56:49.301 | Live Test singleton | test/1/7/5/12 → test/1/7/31/31 | `/api/history?split=test&unit=1&sensor=7&start=31&end=31` 200 | 1 dots / 0 paths / 1 rows; source shown; Prompt valid; Copy enabled |
| 14:56:49.593 | Live Test empty | test/1/7/31/31 → test/1/7/32/33 | `/api/history?split=test&unit=1&sensor=7&start=32&end=33` 200 | 0 dots / 0 paths / 0 rows; source clear; Prompt empty; Copy disabled |
| 14:56:49.597 | Reversed Cycles | test/1/7/32/33 → test/1/7/20/1 | No API request | 0 dots / 0 paths / 0 rows; source clear; Prompt invalid; Copy disabled |
| 14:56:49.601 | Oversized range | test/1/7/20/1 → test/1/7/1/101 | No API request | 0 dots / 0 paths / 0 rows; source clear; Prompt invalid; Copy disabled |
| 14:56:50.230 | Reload and restore primary live case | test/1/7/1/101 → train/1/9/1/100 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200<br>`/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |
| 14:56:51.221 | Clear synthetic observations and restore live data | train/1/9/1/100 → train/1/9/1/100 | `/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |
| 14:56:51.447 | Rapid split switch | test//9/1/100 → train/1/9/1/100 | `/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |
| 14:56:51.690 | Rapid unit switch | train/2/9/1/100 → train/1/9/1/100 | `/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |
| 14:56:51.972 | Rapid sensor switch | train/1/8/1/100 → train/1/9/1/100 | `/api/history?split=train&unit=1&sensor=9&start=1&end=100` 200 | 100 dots / 1 paths / 100 rows; source shown; Prompt valid; Copy enabled |

## SYNTHETIC — NOT NASA FD001 gap fixtures

Each isolated fixture reused verified record shape and deliberately selected a subset in its Chrome-only response. FD001 sources were not edited. In particular, the missing Cycle 3 test does not assert a gap exists in the accepted NASA source. Every path command and raw circle position matched the independently calculated expectation.

| Case | Actual circles by Cycle | Straight segments | Connected spans |
| --- | --- | ---: | --- |
| two consecutive observations | 1, 2 | 1 | 1→2 |
| two nonconsecutive observations | 1, 4 | 0 | None |
| Cycle 1, 2, 4 | 1, 2, 4 | 1 | 1→2 |
| multiple separated runs | 1, 2, 4, 5, 7, 9, 10 | 3 | 1→2, 4→5, 9→10 |
| singleton | 4 | 0 | None |
| empty | None | 0 | None |

Valid zero with proven synthetic `0.00` yielded one true marker and no line. Isolated null, omitted value, nonfinite number and wrong SHA-256 responses remained real browser HTTP 200 and displayed the client validation error. Isolated 503 remained HTTP 503. All five error cases cleared every marker, line, row, provenance and Prompt and disabled Copy. The real empty view returned `points=[]` and `count=0`. Split, Unit and Sensor race fixtures each aborted an earlier request and restored only the current selection and path.

## Genuine stop and restart, separate from HTTP 503

The pre-existing 8765 listener was left running. The Worker started a separate owned instance with `python -B -m web.api --port 8766` on the same Windows workspace and ran the same UI suite. Two distinct owned Python PIDs were used in sequence. Ctrl+Break stopped the first process with exit 0; the OS probe returned 10061. At 14:56:40.004 the same Chrome tab requested the active Sensor 9 window and got `net::ERR_CONNECTION_REFUSED` with no HTTP status. Chart, lines, table, provenance and Prompt became empty and Copy disabled. After Python restart, the same tab recovered HTTP 200 and all 100 original markers plus the verified path. The final Python stop exited 0 and the port refused new connections.

## Clipboard and network

A native click and browser-native clipboard readback matched all **4849** characters including **79 CRLF** pairs. Synthetic permission denial and late completion after a new selection did not report success. Normal-page network was GET only and local. The traces reported no external HTTP requests, local/session storage entries or uncaught JavaScript exceptions. The expected 503 and real refusal console messages are in the [execution transcript](LINE_CHART_EXECUTION_EVIDENCE.md).
