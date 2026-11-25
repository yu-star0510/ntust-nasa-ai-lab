# M5 final integration checklist

Worker technical verification complete · `WO-M5-WEB-001` · `M5-NULL-UI-FAIL-CLOSED`.

`WEB_DOMAIN_ACCEPTANCE = PENDING`

`MAIN_FINAL_ACCEPTANCE = PENDING`

| Requirement | Expected | Actual | Result | Evidence | Unresolved issue |
| --- | --- | --- | --- | --- | --- |
| Authorization and original failure | One main; approved limited scope; preserve original failed UAT | Verified D-M5-002 at `745b187`; preserved original command, stdout/stderr, code 1 and screenshot | PASS | [Execution](M5_EXECUTION_EVIDENCE.md) | None |
| Loopback launch and readiness | Real server and real Chrome; verified input hashes | Page and health 200, 3/3 hashes verified | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Selectors, boundaries and native input | Train/Test, Units, Sensors, actual first/final, single, <=100, reload, chart/table focus | 30 timeline scenarios, verified SVG/table/provenance/Prompt synchronization | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Browser fail-closed validation | Reject bad HTTP 200 before rendering; preserve legal empty and zero | 10 injected bad shapes rejected, SYNTHETIC proven zero rendered, real 200 empty cleared | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Four-way FD001 evidence | >=8 independent original rows across both splits, two Units and sensor columns | 9/9 rows; exact tokens, physical lines, data indexes and hashes | PASS | [Crosscheck](M5_SOURCE_CROSSCHECK.md) | None |
| All raw values and UNKNOWN semantics | Full 100 points; no unsupported assertions; empty distinguished from null | 100 rows matched per-row; UNKNOWN and RUL boundaries verified; zero outside synthetic excluded | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Invalid input and HTTP contract | Local invalid ranges blocked; documented HTTP 400/404/405 | Browser blocked without requests; 17 direct status checks matched | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Stale requests | Older Split, Unit, Sensor requests cannot restore obsolete state | Three aborted; data and Copy cleared while loading | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Browser API 503 | Isolated check separate from actual outage | 503 synthetic and recovery handled | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Genuine interruption and recovery | Stop actual process; Chrome refusal; restart and restore same selection; port closed | Refusal with no HTTP code; same page regained 200 and 554.36; both stops 0 / port 10061 | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Clipboard and privacy | Actual Copy, exact readback incl. CRLF, denied and late state, no external transmission/storage | 4,849 chars and 79 CRLF matched; denial and late write truthful; no external page traffic | PASS | [UAT](M5_BROWSER_UAT.md) | None |
| Regression and lint | Original suites and explicit gate cases successful | 64 Python + 11 Prompt + 14 gate cases, syntax check and supervised browser driver all exit 0 | PASS | [Execution](M5_EXECUTION_EVIDENCE.md) | None |
| Original integrity and evidence | Equal pre/post hashes; bounded true screenshot and disclosure checks | Three SHA-256 pairs match; three-state montage | PASS | [Execution](M5_EXECUTION_EVIDENCE.md) · [Montage](M5_BROWSER_SCREENSHOT.png) | None |
| Two-tier acceptance | Review performed independently at each gate | Worker prepared evidence; Web Domain and MAIN decide separately | PENDING | WORK_ITEM.md | Web Domain and MAIN acceptance |
