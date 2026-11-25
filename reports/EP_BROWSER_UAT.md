# Evidence Prompt browser UAT

`WO-EP-WEB-001` · Windows · 2026-11-25 · UTC+08:00.

Chrome **158.0.8127.37** operated the live Sensor Explorer at `http://127.0.0.1:8765/` using a temporary isolated profile. The driver used native mouse and keyboard input, actual browser Network response bodies and Console events. A separate visible in-app browser preview confirmed that the panel and Copy button were present. [Exact command, output and exit codes](EP_EXECUTION_EVIDENCE.md)

## Actual observations and prompt state

Selection columns are split / Unit / Sensor / start / end. Native controls were operated with Home, Down, typed Cycle bounds and Enter on Load window. All listed Network requests used GET. Browser post-action readings included the number of chart dots/table rows, prompt length, current scope and Copy enabled state.

| Time (Taiwan) | Operation | Before → after | Actual Network request and status | Prompt and table after |
| --- | --- | --- | --- | --- |
| 10:50:39.106 | Initial navigation | Page not loaded → train / 1 / 7 / 1 / 20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | valid, 4740 chars, Copy enabled, 20 rows |
| 10:50:39.381 | Train to Test | train / 1 / 7 / 1 / 20 → test / 1 / 7 / 1 / 20 | `/api/units?split=test` 200<br>`/api/history?split=test&unit=1&sensor=7&start=1&end=20` 200 | valid, 4738 chars, Copy enabled, 20 rows |
| 10:50:39.725 | Test cycles 6-8 | test / 1 / 7 / 1 / 20 → test / 1 / 7 / 6 / 8 | `/api/history?split=test&unit=1&sensor=7&start=6&end=8` 200 | valid, 4004 chars, Copy enabled, 3 rows |
| 10:50:39.834 | Test to Train | test / 1 / 7 / 6 / 8 → train / 1 / 7 / 6 / 8 | `/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=6&end=8` 200 | valid, 4015 chars, Copy enabled, 3 rows |
| 10:50:40.176 | Return to initial cycle window | train / 1 / 7 / 6 / 8 → train / 1 / 7 / 1 / 20 | `/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | valid, 4740 chars, Copy enabled, 20 rows |
| 10:50:40.284 | Unit 1 to Unit 2 | train / 1 / 7 / 1 / 20 → train / 2 / 7 / 1 / 20 | `/api/history?split=train&unit=2&sensor=7&start=1&end=20` 200 | valid, 4803 chars, Copy enabled, 20 rows |
| 10:50:40.441 | Sensor 7 to Sensor 5 | train / 2 / 7 / 1 / 20 → train / 2 / 5 / 1 / 20 | `/api/history?split=train&unit=2&sensor=5&start=1&end=20` 200 | valid, 4754 chars, Copy enabled, 20 rows |
| 10:50:40.771 | Cycles 1–20 to 5–12 | train / 2 / 5 / 1 / 20 → train / 2 / 5 / 5 / 12 | `/api/history?split=train&unit=2&sensor=5&start=5&end=12` 200 | valid, 4227 chars, Copy enabled, 8 rows |
| 10:50:40.879 | Train Unit 2 to Unit 1 | train / 2 / 5 / 5 / 12 → train / 1 / 5 / 5 / 12 | `/api/history?split=train&unit=1&sensor=5&start=5&end=12` 200 | valid, 4200 chars, Copy enabled, 8 rows |
| 10:50:41.209 | Last observed boundary | train / 1 / 5 / 5 / 12 → train / 1 / 5 / 192 / 193 | `/api/history?split=train&unit=1&sensor=5&start=192&end=193` 200 | valid, 3936 chars, Copy enabled, 1 rows |
| 10:50:41.549 | Singleton Cycle 192 | train / 1 / 5 / 192 / 193 → train / 1 / 5 / 192 / 192 | `/api/history?split=train&unit=1&sensor=5&start=192&end=192` 200 | valid, 3936 chars, Copy enabled, 1 rows |
| 10:50:41.925 | Empty window | train / 1 / 5 / 192 / 192 → train / 1 / 5 / 193 / 194 | `/api/history?split=train&unit=1&sensor=5&start=193&end=194` 200 | empty, 0 chars, Copy disabled, 0 rows |
| 10:50:41.952 | Reversed window | train / 1 / 5 / 193 / 194 → train / 1 / 5 / 20 / 10 | No API request | invalid, 0 chars, Copy disabled, 0 rows |
| 10:50:41.976 | Over 100 cycles | train / 1 / 5 / 20 / 10 → train / 1 / 5 / 1 / 101 | No API request | invalid, 0 chars, Copy disabled, 0 rows |
| 10:50:42.484 | Exactly 100 cycles | train / 1 / 5 / 1 / 101 → train / 1 / 5 / 1 / 100 | `/api/history?split=train&unit=1&sensor=5&start=1&end=100` 200 | valid, 8064 chars, Copy enabled, 100 rows |
| 10:50:42.702 | Reload page | train / 1 / 5 / 1 / 100 → train / 1 / 7 / 1 / 20 | `/` 200<br>`/style.css` 200<br>`/ui.js` 200<br>`/api/health` 200<br>`/api/catalog` 200<br>`/api/units?split=train` 200<br>`/api/history?split=train&unit=1&sensor=7&start=1&end=20` 200 | valid, 4740 chars, Copy enabled, 20 rows |
| 10:50:42.976 | Rapid Sensor 8 to Sensor 9 while earlier request is paused | train / 1 / 8 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | valid, 4796 chars, Copy enabled, 20 rows |
| 10:50:43.037 | SYNTHETIC isolated 503 injection into live page | train / 1 / 9 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 503 | error, 0 chars, Copy disabled, 0 rows |
| 10:50:43.165 | Recover after 503 | train / 1 / 9 / 1 / 20 → train / 1 / 9 / 1 / 20 | `/api/history?split=train&unit=1&sensor=9&start=1&end=20` 200 | valid, 4796 chars, Copy enabled, 20 rows |

A native click at 10:50:39.137 selected Chart Cycle 4. The focused observation changed and the original 20-window rows remained. Real keyboard table navigation also changed the focus without dropping any observation. For every successful nonempty History scenario the driver compared all prompt rows against the actual API body. The 100-Cycle test verified all 100 rows in memory. The singleton omitted the endpoint delta. [Four-way source checks](EP_SOURCE_CROSSCHECK.md)

When Sensor 8 was paused at the browser request boundary, preview length was zero and Copy was disabled. Switching to Sensor 9 gave HTTP 200 and kept its own prompt; the previous request finished as `net::ERR_ABORTED`. For the isolated **SYNTHETIC HTTP 503** the full preview was cleared and Copy disabled. A normal retry restored the prompt.

## Real Clipboard readback

- 10:50:39.195 — Native mouse click on **Copy prompt** for Train Unit 1, Sensor 7, Cycles 1–20, focused Cycle 4. The live History request returned HTTP 200. Chrome's native `navigator.clipboard.readText()` matched the preview's `textContent` exactly, all 4,849 characters, including 79 CRLF line breaks. The browser reported “Copied to clipboard.”
- Preview and real clipboard text independently yielded the same UTF-8 SHA-256 `eb9c7b34b9d57a23b4186262f82949ec0ba4feae9969a92dc20f43c3c4fd0254`. The driver granted clipboard permissions only to this loopback origin for the isolated test profile and reset them after the check. The copy itself was an actual browser write.
- 10:50:39.271 — Native mouse click under an explicitly **SYNTHETIC** `NotAllowedError` override of the write method. The live UI reported “Copy failed. Select and copy the preview manually.” The preview remained available and the earlier clipboard contents were unchanged on a second native read.
- DevTools recorded 0 external page HTTP requests, zero HTTP requests from Copy, and GET only for page traffic. Local and session storage were empty. Console reported zero uncaught JavaScript exceptions and one expected network error for the injected HTTP 503.

## Screenshot

Captured at 10:50:39.262 after the successful native clipboard readback. The clipped browser surface shows the current selection, the Copy button, verified source metadata, the visible top of the preview and “Copied to clipboard.” It contains only the limited visible excerpt. PNG 1338 × 418, 66644 bytes, SHA-256 `f49afc950a9280372bfd9f42aea7f96b468cbb554d06a67dd46cf814849fd0b3`. [Actual browser screenshot](EP_BROWSER_SCREENSHOT.png)
