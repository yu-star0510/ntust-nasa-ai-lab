# M5 Chrome UAT — remediation and final integration

`WO-M5-WEB-001` · `M5-NULL-UI-FAIL-CLOSED` · Windows Chrome **158.0.8127.37** · 2026-11-25 UTC+08:00. Real page `http://127.0.0.1:8765/`, isolated Chrome profile. Native keys drove split/Unit/Sensor controls, typed Cycle bounds and used Enter on Load. Native mouse events selected the chart and Copy. Keyboard Space selected source rows. DevTools supplied actual network responses, console events and screenshots. [Full commands and output](M5_EXECUTION_EVIDENCE.md)

## Original failure and corrected null behavior

The original pre-remediation run exited **1**. In the live singleton control, Train/1/Sensor 7/Cycle 1 measured **554.36**; a **SYNTHETIC** Chrome-only override to `null` created a dot on the zero axis, a row with blank measured value and visible source provenance, and “Observations loaded.” The Prompt gate already rejected it. The original command, bounded stdout/stderr and exact assertion remain in the execution record. The original PNG bytes were locally preserved under SHA-256 `db68d33b0ecb20632172e67a99e67224acd6ffa5237870c0535427a9d2a3e141`.

At 11:51:34.829 on the corrected page, a **SYNTHETIC** one-value mutation from `554.36` to `null` in Train/1/Sensor 7/Cycles 1–20 returned actual browser HTTP **200** and displayed `CLIENT_HISTORY_VALIDATION_FAILED`. All 20 previously valid dots/rows were cleared, no source detail or Prompt remained and Copy was disabled. No “Observations loaded” or synthetic zero was shown. Nine additional malformed HTTP 200 injections (undefined, positive/negative nonfinite exponent, numeric text, wrong token/column/count/hash/Cycle) produced the same clear state. VM gate tests independently covered JavaScript NaN and additional raw provenance checks. In the explicitly **SYNTHETIC** singleton zero control, numeric `0` with matching `0.00` tokens and provenance produced exactly one valid dot/row. A live empty request returned `points=[]` and `count=0`, cleared the display and retained the EMPTY message. UNKNOWN remained a classification of insufficient fault/health/RUL evidence.

## Chrome control and Network matrix

Selections are split / Unit / Sensor / start / end. Each result below matches the expected valid, empty, invalid or injected error state. The driver compares every current preview row to the actual response on successful nonempty History requests, including all 100 points, and checks that chart count, table count and provenance occupancy agree.

| Time (Taiwan) | Operation | Selection before → after | Relevant request/status | Observed UI and Prompt | Result |
| --- | --- | --- | --- | --- | --- |
| 11:51:34.567 | Initial navigation | Page not loaded → train/1/7/1/20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:35.389 | Restore live response after synthetic validation | train/1/7/1/20 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:35.685 | Select actual singleton for isolated zero control | train/1/7/1/20 → train/1/7/1/1 | `/api/history?split=train&unit=1&sensor=7&start=1&end=1` 200 | 1 dots / 1 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.030 | Return to original live window | train/1/7/1/1 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.201 | Train to Test | train/1/7/1/20 → test/1/7/1/20 | `/api/units?split=test` 200<br>`/api/history?split=test&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.497 | Test cycles 6-8 | test/1/7/1/20 → test/1/7/6/8 | `/api/history?split=test&unit=1&sensor=7&start=6&end=8` 200 | 3 dots / 3 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.606 | Test to Train | test/1/7/6/8 → train/1/7/6/8 | `/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=6&end=8` 200 | 3 dots / 3 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.904 | Return to initial cycle window | train/1/7/6/8 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:36.965 | Unit 1 to Unit 2 | train/1/7/1/20 → train/2/7/1/20 | `/api/history?split=train&unit=2&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:37.077 | Sensor 7 to Sensor 5 | train/2/7/1/20 → train/2/5/1/20 | `/api/history?split=train&unit=2&sensor=5&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:37.369 | Cycles 1–20 to 5–12 | train/2/5/1/20 → train/2/5/5/12 | `/api/history?split=train&unit=2&sensor=5&start=5&end=12` 200 | 8 dots / 8 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:37.432 | Train Unit 2 to Unit 1 | train/2/5/5/12 → train/1/5/5/12 | `/api/history?split=train&unit=1&sensor=5&start=5&end=12` 200 | 8 dots / 8 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:37.725 | Last observed boundary | train/1/5/5/12 → train/1/5/192/193 | `/api/history?split=train&unit=1&sensor=5&start=192&end=193` 200 | 1 dots / 1 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:38.069 | Singleton Cycle 192 | train/1/5/192/193 → train/1/5/192/192 | `/api/history?split=train&unit=1&sensor=5&start=192&end=192` 200 | 1 dots / 1 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:38.359 | Empty window | train/1/5/192/192 → train/1/5/193/194 | `/api/history?split=train&unit=1&sensor=5&start=193&end=194` 200 | 0 dots / 0 rows; source cleared; prompt empty; Copy disabled | PASS |
| 11:51:38.363 | Reversed window | train/1/5/193/194 → train/1/5/20/10 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.367 | Zero Cycle | train/1/5/20/10 → train/1/5/0/10 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.370 | Negative Cycle | train/1/5/0/10 → train/1/5/-1/10 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.374 | Fractional Cycle | train/1/5/-1/10 → train/1/5/1.5/10 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.378 | Malformed Cycle | train/1/5/1.5/10 → train/1/5/bad/10 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.381 | Over 100 cycles | train/1/5/bad/10 → train/1/5/1/101 | No request | 0 dots / 0 rows; source cleared; prompt invalid; Copy disabled | PASS |
| 11:51:38.720 | Exactly 100 cycles | train/1/5/1/101 → train/1/5/1/100 | `/api/history?split=train&unit=1&sensor=5&start=1&end=100` 200 | 100 dots / 100 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:38.859 | Reload page | train/1/5/1/100 → train/1/7/1/20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:38.968 | Rapid split switch | test//7/1/20 → train/1/7/1/20 | `/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:39.031 | Rapid unit switch | train/2/7/1/20 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:39.124 | Rapid Sensor 8 to Sensor 9 while earlier request is paused | train/1/8/1/20 → train/1/9/1/20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:39.169 | SYNTHETIC isolated 503 injection into live page | train/1/9/1/20 → train/1/9/1/20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 503 | 0 dots / 0 rows; source cleared; prompt error; Copy disabled | PASS |
| 11:51:39.217 | Recover after 503 | train/1/9/1/20 → train/1/9/1/20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:39.281 | Select required Train Unit 1 Sensor 7 before genuine outage | train/1/9/1/20 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |
| 11:51:45.281 | Recover in same Chrome page after real API restart | train/1/7/1/20 → train/1/7/1/20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | 20 dots / 20 rows; source shown; prompt valid; Copy enabled | PASS |

Changing Split, Unit and Sensor while a previous request was held at the Chrome request boundary immediately disabled Copy and cleared chart/table/source/preview. All three older requests ended `net::ERR_ABORTED`; the final controls, response and rendered Prompt agreed. Chart mouse click focused Cycle 4 and preserved the full window. Nine selected data points passed the [four-way TXT check](M5_SOURCE_CROSSCHECK.md), including exact SVG coordinates.

## Genuine outage, isolated 503, and recovery

- Before the genuine outage the live selection was Train / Unit 1 / Sensor 7 / Cycles 1–20. Python PID 14464 exited 0 on Windows Ctrl+Break. The OS probe returned 10061.
- At 11:51:41.890, the existing Chrome page used native Enter on Load window. DevTools reported **`net::ERR_CONNECTION_REFUSED`** with no HTTP status. The browser showed the reachability error, cleared plot/table/source/Prompt and disabled Copy. Network interception was disabled.
- Python restarted as PID 33296; direct `/api/health` returned HTTP 200 with all sources verified. At 11:51:45.284, the same page re-requested the original URL and recovered HTTP 200, all 20 points, the actual first selected value 554.36, source details, a verified Prompt and enabled Copy. Final supervised exit was 0 and 8765 refused connections.
- The **SYNTHETIC HTTP 503** test was separate. Chrome fulfilled one request with `DATA_NOT_READY` to check the HTTP 503 UI branch. The output explicitly separates the two cases.

## Clipboard and safety

- 11:51:36.123: real mouse click and native `navigator.clipboard.readText()` agreed on all 4,849 characters and 79 CRLF pairs. Both UTF-8 SHA-256 digests were `eb9c7b34b9d57a23b4186262f82949ec0ba4feae9969a92dc20f43c3c4fd0254`.
- A second native click with isolated **SYNTHETIC** `NotAllowedError` displayed Copy failed and unchanged real clipboard readback. A synthetic delayed write resolved after native focus changed to Cycle 5; the new Prompt remained valid and did not claim it had been copied.
- No Copy request or external page HTTP request occurred. DevTools saw GET only for page traffic, empty local/session storage, zero uncaught JavaScript errors, and only the injected 503 and genuine network-refusal console messages.
- The [real browser montage](M5_BROWSER_SCREENSHOT.png) contains the live view, corrected SYNTHETIC null failure and genuine network outage. Three screenshots from the same Chrome run were scaled into one PNG with labelled gutters. The rendering inside each frame was preserved. PNG SHA-256 `44870bc7487710df0b3ecdcd8d1d9520dcda67b8a6edd879cd514f025d2d54e2`, 326346 bytes.

## Direct real HTTP contract checks

All 17 requests below used the actual recovered local server, outside the browser tab. Every row matched its expected status/code.

| Method | Path | HTTP | Response code |
| --- | --- | ---: | --- |
| GET | `/api/history?split=train&unit=1&sensor=7&start=20&end=1` | 400 | INVALID_CYCLE_RANGE |
| GET | `/api/history?split=train&unit=1&sensor=7&start=0&end=20` | 400 | INVALID_CYCLE_RANGE |
| GET | `/api/history?split=train&unit=1&sensor=7&start=-1&end=20` | 400 | INVALID_PARAMETER |
| GET | `/api/history?split=train&unit=1&sensor=7&start=1.5&end=20` | 400 | INVALID_PARAMETER |
| GET | `/api/history?split=train&unit=1&sensor=7&start=1&end=101` | 400 | INVALID_CYCLE_RANGE |
| GET | `/api/history?split=train&unit=1&sensor=0&start=1&end=20` | 400 | INVALID_SENSOR |
| GET | `/api/history?split=train&unit=1&sensor=22&start=1&end=20` | 400 | INVALID_SENSOR |
| GET | `/api/history?split=bad&unit=1&sensor=7&start=1&end=20` | 400 | INVALID_PARAMETER |
| GET | `/api/history?split=train&unit=9999&sensor=7&start=1&end=20` | 404 | UNKNOWN_UNIT |
| GET | `/api/history?split=train&sensor=7&start=1&end=20` | 400 | INVALID_PARAMETER |
| GET | `/api/history?split=train&unit=1&sensor=7&start=1&end=20&unit=2` | 400 | INVALID_PARAMETER |
| GET | `/api/history?split=train&unit=1&sensor=7&start=1&end=20&unknown=1` | 400 | INVALID_PARAMETER |
| GET | `/api/not-a-route` | 404 | UNKNOWN_ENDPOINT |
| GET | `/FD001/train_FD001.txt` | 404 | UNKNOWN_ENDPOINT |
| POST | `/api/health` | 405 | METHOD_NOT_ALLOWED |
| PUT | `/api/health` | 405 | METHOD_NOT_ALLOWED |
| HEAD | `/api/health` | 405 | HEAD has no body |
