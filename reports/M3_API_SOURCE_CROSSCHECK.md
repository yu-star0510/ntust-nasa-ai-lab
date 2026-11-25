# M3-A original FD001 source crosscheck

`WO-M3-WEB-001` · Windows workspace · 2026-11-25 09:34:50–09:34:55 (UTC+08:00).

The standalone process served the accepted local FD001 files on `127.0.0.1:8765`. An independent client opened the original TXT files read-only and enumerated their actual physical lines. For each nonblank line it counted a zero-based data row, read Unit and Cycle from columns 1 and 2, and selected the original token from 1-based column 12. It separately computed SHA-256 from the source bytes. The client compared each displayed point against the complete expected provenance object and the numeric value converted from the token. The commands and bounded JSON are in [M3_API_EXECUTION_EVIDENCE.md](M3_API_EXECUTION_EVIDENCE.md).

| Original split | Original Unit | Original Cycle | Physical line (1-based) | Data row (0-based) | Original column | Original token | API value | `reread_matches` |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | --- |
| train | 1 | 1 | 1 | 0 | 12 | `554.36` | 554.36 | true |
| train | 1 | 10 | 10 | 9 | 12 | `553.59` | 553.59 | true |
| train | 1 | 20 | 20 | 19 | 12 | `554.81` | 554.81 | true |
| train | 2 | 1 | 193 | 192 | 12 | `554.53` | 554.53 | true |
| test | 2 | 1 | 32 | 31 | 12 | `553.14` | 553.14 | true |
| train | 1 | 192 | 192 | 191 | 12 | `551.25` | 551.25 | true |

For each row, `sensor_name` and `column_name` both equal `sensor_7`, and the original and reread token match exactly. The `raw_reference` file and hash matched the independently read source for all six points.

| Split | `source_file` | `source_sha256` |
| --- | --- | --- |
| train | `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` |
| test | `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` |

| History query | HTTP | Observed result |
| --- | ---: | --- |
| `split=train&unit=1&sensor=7&start=1&end=20` | 200 | 20 points, ascending Cycles 1–20. The standalone client checked Cycles 1, 10 and 20. The automated suite compared all 20 points with the original TXT. |
| `split=train&unit=2&sensor=7&start=1&end=2` | 200 | Two points. Cycle 1 is physical line 193 in Train. |
| `split=test&unit=2&sensor=7&start=1&end=2` | 200 | Two points. Cycle 1 is physical line 32 in Test. |
| `split=train&unit=1&sensor=7&start=192&end=193` | 200 | One point at Cycle 192. The first bound is observed and Cycle 193 is absent for this Unit. |
| `split=train&unit=1&sensor=7&start=193&end=194` | 200 | `points: []`, `count: 0`. |

The client and server both exited with code 0. The test suite also checked a singleton inclusive window, two points in each second-Unit split, and all three source hashes before and after HTTP testing. These samples contain only the selected sensor token and its provenance.
