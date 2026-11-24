# M3 FD001 Data Contract Handoff

Work item: `WO-M3-HANDOFF-001`

Worker status: `READY_FOR_REVIEW` only. Research Brain and MAIN acceptance remain pending; `WO-M3-WEB-001` remains blocked and no Web Worker was started.

## Acceptance authority and handoff cause

FD001 Data Contract v1.0.1 was formally accepted by STUDENT-MAIN Brain in the original `WO-M2-RESEARCH-001 — MAIN FINAL ACCEPTANCE` record in `WORK_ITEM.md`. Later M2 evidence-classification work was also accepted. The JSON, Markdown, and `validate_contract()` check still carried the earlier lifecycle value `PENDING`, creating a stale handoff state even though the authoritative governance record already said accepted.

This work item synchronizes that lifecycle metadata. It does not create a new contract version or alter dataset semantics.

## Contract synchronization

| Check | Before | After |
| --- | --- | --- |
| Contract version | `1.0.1` | `1.0.1` |
| JSON `main_acceptance` | `PENDING` | `ACCEPTED` |
| Markdown `main_acceptance` | `PENDING` | `ACCEPTED` |
| `validation_status` | `PASS` | `PASS` |
| Six interfaces | unchanged | unchanged |
| Required fields | unchanged | unchanged |
| Source hashes | unchanged | unchanged |
| Dataset/RUL semantics | unchanged | unchanged |

A structured comparison against Git `HEAD` found exactly one changed JSON top-level field: `main_acceptance`. Removing that field made the before/after JSON objects exactly equal. Schema version, interfaces, required fields, source files and semantic objects were independently reported unchanged.

The Markdown metadata and its lifecycle explanation were updated to state that the acceptance authority is the original M2 MAIN FINAL ACCEPTANCE and that `WO-M3-HANDOFF-001` performs metadata synchronization only.

## Validator compatibility

`validate_contract()` now reports the check `main_acceptance_accepted` and requires the exact case-sensitive value `ACCEPTED`.

The validator rejects:

- `PENDING`, `REJECTED`, unknown values, lowercase `accepted`, empty string, `null`, and a missing acceptance field;
- incorrect contract name or schema version;
- missing or additional interface names;
- missing or additional required fields;
- `validation_status` other than `PASS`.

`run_phase_b()` still runs Phase A first and returns Phase B PASS only when contract validation succeeds. No repository, sensor, trend, quality, RUL or provenance behavior was changed.

## Execution results

| Validation | Result |
| --- | --- |
| Focused positive/negative contract tests | 3/3 OK |
| Phase A | `PASS` |
| Phase B | `PASS` |
| Contract validation | `valid=true`; all six checks true, including `main_acceptance_accepted` |
| M2 regression tests | 22/22 OK |
| Evidence classification tests | 11/11 OK |

Phase A retained Train 20,631 rows / 100 Units, Test 13,096 rows / 100 Units and RUL 100 labels. Phase B retained the existing bounded Train Unit 1 `sensor_2` traceability trend and quality summaries.

## Source integrity

| Source | Before | After | Accepted contract | Result |
| --- | --- | --- | --- | --- |
| Train | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` | same | same | `MATCH` |
| Test | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` | same | same | `MATCH` |
| RUL | `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` | same | same | `MATCH` |

All inputs remained read-only. RUL remains a ground-truth label at the mapped last observed Test cycle, not a prediction or raw per-cycle sensor field.

## Scope and safety

- No raw FD001 file, full sensor series, full raw index or private absolute path is published.
- No Web/API/UI/M4 code was created or modified.
- No model, prediction, baseline, threshold, sensor calculation or RUL logic was changed.
- The two handoff reports contain public-safe bounded evidence only.
- `.gitignore` receives only the two report allowlist entries authorized by this work item.

Complete commands, timestamps, stdout, stderr and Exit Codes are recorded in [M3_CONTRACT_HANDOFF_EVIDENCE.md](M3_CONTRACT_HANDOFF_EVIDENCE.md).

## Remaining gate

This Worker completes only the Research-owned dependency correction. Research Brain must independently inspect GitHub, then STUDENT-MAIN Brain must decide the handoff result. Until MAIN records acceptance, `WO-M3-HANDOFF-001` is not final PASS, `WO-M3-WEB-001` remains blocked, and no Web or M4 execution is authorized.
