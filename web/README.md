# FD001 Sensor Explorer and local read-only API

Run these commands in PowerShell from the repository root. The API uses Python 3.12 and the standard library. It reads the accepted Data Contract v1.0.1 and the existing `FD001/train_FD001.txt`, `FD001/test_FD001.txt`, and `FD001/RUL_FD001.txt`. Source paths and expected SHA-256 values are fixed by the work order.

```powershell
python --version
python -B -m web.api --port 8765
```

Open [the local Sensor Explorer](http://127.0.0.1:8765/) in Chrome or Edge while the server is running. Choose a dataset split, engine unit, sensor and inclusive cycle range. The controls load the split's actual units and refresh the trend automatically. Use **Load window** to submit the current selection immediately or retry a failed request. A window can span at most 100 cycles.

Click a plotted observation or focus a Cycle button in **Observed values** and press Enter or Space to view the source file, SHA-256, physical line, data row, source column and original token. The plot uses dots at observed cycles. An empty range or unavailable API clears the chart, table and provenance.

Use **Evidence prompt** to jump to the preview. The preview includes all actual observations for the current window, the original TXT provenance, split-wide quality, window-only statistics, and the known/inference/unknown limits. Selecting a plot point or table row adds a focused observation while retaining the whole window. Copy becomes available once the response matches the selection and source references. If copy fails, focus the preview and use Ctrl+A then Ctrl+C to copy its text manually. The page prepares the text locally and clipboard writes require a click or keyboard activation of **Copy prompt**.

In a second PowerShell window, send requests directly to `127.0.0.1`.

```powershell
curl.exe -i 'http://127.0.0.1:8765/api/health'
curl.exe -i 'http://127.0.0.1:8765/api/catalog'
curl.exe -i 'http://127.0.0.1:8765/api/units?split=train'
curl.exe -i 'http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20'
```

Ready startup prints `FD001 API listening on http://127.0.0.1:8765 (ready)`. If `/api/health` returns `503`, use its error code to check the accepted contract and local originals. Restart after resolving a startup failure. Press `Ctrl+C` in the server window to stop. Windows `Ctrl+Break` also works. A normal shutdown prints `FD001 API stopped` and exits with code `0`.

Run the API integration tests on the same machine as the approved source files. They start their own loopback listener on an OS-assigned port and close it at the end.

```powershell
python -B -m unittest discover -s tests -p test_m3_api.py -v
python -B -m unittest discover -s tests -p test_m4_ui.py -v
python -B -m unittest discover -s tests -v
node --test tests/test_evidence_prompt.mjs
```

The listener accepts only direct loopback requests and serves three fixed UI assets. See the [HTTP contract](../contracts/M3_API_CONTRACT.md), [M4 browser UAT](../reports/M4_BROWSER_UAT.md), and [Evidence Prompt browser UAT](../reports/EP_BROWSER_UAT.md).

Run the M5 gate tests and real browser integration from the repository root on Windows with Node and Chrome installed. Close any existing service listening on loopback port 8765 before launching this test. The supervisor starts its own API process, stops and restarts it for the browser outage check, and shuts it down on exit. It verifies the final port refusal.

```powershell
node tests/test_m5_browser_uat.mjs --gate-unit
python -X utf8 -B tests/test_m5_browser_uat.py
```

The second command uses a temporary Chrome profile, performs a real clipboard write/readback, and captures the approved M5 montage. See the [M5 runtime evidence](../reports/M5_EXECUTION_EVIDENCE.md) for the exact capture command and expected results.
