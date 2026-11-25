# FD001 local read-only API

Run these commands in PowerShell from the repository root. The API uses Python 3.12 and the standard library. It reads the accepted Data Contract v1.0.1 and the existing `FD001/train_FD001.txt`, `FD001/test_FD001.txt`, and `FD001/RUL_FD001.txt`. Source paths and expected SHA-256 values are fixed by the work order.

```powershell
python --version
python -B -m web.api --port 8765
```

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
python -B -m unittest discover -s tests -v
```

The listener accepts only direct loopback requests. Use this server for local development. See the [HTTP contract](../contracts/M3_API_CONTRACT.md) and [execution evidence](../reports/M3_API_EXECUTION_EVIDENCE.md).
