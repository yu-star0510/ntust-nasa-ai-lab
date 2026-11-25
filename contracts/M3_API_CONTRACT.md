# M3-A FD001 HTTP API contract

HTTP envelope schema `1.0` · Accepted Research Data Contract `FD001_DATA_CONTRACT v1.0.1`.

The service binds IPv4 `127.0.0.1` on port `8765` by default. A caller may choose another port at launch. The request target uses origin form and the `Host` header must use `127.0.0.1` with the selected port or without a port. Responses use `Content-Type: application/json; charset=utf-8` and `Cache-Control: no-store`. The only supported method is `GET`.

## Endpoints

| GET endpoint | Query parameters | HTTP 200 `data` |
| --- | --- | --- |
| `/api/health` | None | `service`, `readiness: "ready"`, `contract_version`, `source_type`, `validation_status: "PASS"`, and `sources` with `hash_verified: true` for `train`, `test`, and `rul`. |
| `/api/catalog` | None | Dataset identity `NASA_CMAPSS_FD001`, `source_type: "TRUSTED_LOCAL_FILES"`, `contract_version`, `splits`, per-split `summary` of rows, columns, Unit count and missing count, `sensors`, `operational_settings`, and `max_history_cycle_span`. |
| `/api/units` | Required `split=train` or `split=test` | `dataset_split`, ascending `unit_ids`, `count`, project-relative `source_file`, and `source_sha256` for that split. |
| `/api/history` | Required `split`, `unit`, `sensor`, `start`, `end` | `dataset_split`, `unit_id`, `sensor_name`, `start`, `end`, `points`, and `count`. |

Every expected query parameter must appear once. Names and split values are case-sensitive. The query string has a 512-character limit. Integer parameters contain one to ten ASCII decimal digits. `unit` and `start` are positive. `sensor` ranges from 1 to 21. The inclusive range requires `start <= end` and allows at most 100 cycles (`end - start + 1`).

Catalog entries include `index`, `name`, and 1-based `source_column_index`. The original settings use columns 3–5 and the sensors use columns 6–26. Sensor 7 is `sensor_7` at column 12. The catalog describes original fields and aggregate counts.

## History and provenance

`GET /api/history?split=train&unit=1&sensor=7&start=1&end=20` selects one Train Unit and one sensor. The API returns observed points in ascending Cycle order. It keeps Unit identifiers local to the selected split and includes both bounds when observed. A valid range with no observations returns `points: []` and `count: 0`. The current data and all response envelopes contain no JSON `null` values. Missing observations produce no point. Dataset validation failures produce a 503 error envelope.

Each point includes `cycle`, finite numeric `value`, and `sensor_name`. Its `raw_reference` contains `dataset_split`, `unit_id`, `cycle`, `column_name`, project-relative `source_file`, lowercase `source_sha256`, 1-based `physical_line_number`, 0-based `data_row_index` among nonblank lines, `data_row_index_base: 0`, 1-based `source_column_index`, `original_value` and `reread_value` as verbatim tokens, and `reread_matches: true`. Point values come from the referenced original tokens. The service uses the validated M2 Repository for Cycle enumeration and rereads of source references. Physical line positions are independent of cycle numbers.

Illustrative success for an empty window:

```json
{
  "status": "ok",
  "data": {
    "dataset_split": "train", "unit_id": 1, "sensor_name": "sensor_7",
    "start": 9999, "end": 9999, "points": [], "count": 0
  },
  "meta": {"schema_version": "1.0", "source": "FD001_DATA_CONTRACT v1.0.1"}
}
```

## Errors and readiness

| HTTP | `error.code` | Condition |
| --- | --- | --- |
| 400 | `INVALID_PARAMETER` | Missing, duplicate, unknown or malformed parameter, invalid split, invalid integer representation, or nonpositive Unit. |
| 400 | `INVALID_SENSOR` | Decimal sensor selector outside 1–21. |
| 400 | `INVALID_CYCLE_RANGE` | Zero start, reversed bounds, or a window wider than 100 cycles. |
| 400 | `INVALID_REQUEST` | Invalid request syntax, target, or Host. HTTP parser-level errors such as oversized targets or headers may use 414 or 431 with the same code. |
| 404 | `UNKNOWN_UNIT` | Valid Unit number absent from the selected split. |
| 404 | `UNKNOWN_ENDPOINT` | Path outside the four listed routes, including direct dataset-file requests. |
| 405 | `METHOD_NOT_ALLOWED` | Unsupported method. The response includes `Allow: GET`. `HEAD` carries headers only. |
| 503 | `DATA_NOT_READY` | Missing or unreadable source, or repository initialization failed. |
| 503 | `SOURCE_INTEGRITY_ERROR` | Unsafe source path, different approved SHA-256, or failed History source reference. |
| 503 | `CONTRACT_NOT_ACCEPTED` | Contract unavailable, invalid, unaccepted, or inconsistent with the approved manifest. |

Illustrative error:

```json
{
  "status": "error",
  "error": {"code": "INVALID_SENSOR", "message": "Sensor must be in 1..21", "details": {}}
}
```

Readiness checks the accepted contract, all three fixed source files and their SHA-256 values, and successful M2 repository initialization. All four recognized GET routes verify the contract and the sources before preparing data and again before returning success. The API fails closed with 503 if the contract or any source fails validation. A startup failure requires a restart after the cause is resolved. Error details use safe names such as `source: "rul"` and `hash_verified: false`. Raw files and the complete Raw Index stay on the workstation. RUL is used only in upstream dataset validation. The HTTP API exposes observed sensor points and a bounded cycle window per request.
