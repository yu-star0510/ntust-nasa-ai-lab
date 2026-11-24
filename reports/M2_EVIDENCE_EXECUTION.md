# M2 Evidence Classification Execution

Work item: `WO-M2-RESEARCH-002`

Execution status: `READY_FOR_REVIEW` (Worker result only; not Research Brain or MAIN acceptance)

Remediation baseline Git commit: `3b2d13644b55a058f2708c4e9f1707b01f14f249`

Time zone: `Taipei Standard Time` (`+08:00`)

## Governance and scope precheck

- `git pull --ff-only origin main` completed before remediation; local `main` was synchronized to the Research Brain review commit above.
- Latest GitHub `main` `AGENTS.md`, `WORK_ITEM.md`, Research Independent Review 001, accepted Data Contract v1.0.1, and prior M2 MAIN PASS were read before remediation.
- Only the five authorized evidence-classification files plus `WORK_ITEM.md` evidence/status changes are permitted; `.gitignore` is not changed in this remediation.
- Existing M2 source/tests/reports/contracts and all FD001 inputs remained read-only.
- `python -m json.tool reports/M2_EVIDENCE_SAMPLES.json`, Python byte compilation, `git diff --check`, and an absolute/private-path scan completed without an evidence-blocking result.

## Remediation hash and functional evidence rerun

`EVIDENCE_TYPE: EVIDENCE_RERUN`

Working Directory: `<PROJECT_ROOT>` (de-identified public notation)

Evidence start: `2026-11-24T16:37:46.5733353+08:00`

Evidence end: `2026-11-24T16:37:55.6050322+08:00`

All commands below were executed after the provenance fix. `System.Diagnostics.Process` captured stdout, stderr, timestamps, and the real child-process Exit Code separately. Each `Get-FileHash` command uses `ErrorActionPreference=Stop`, validates that a hash was returned, and exits explicitly from `try/catch`; no stale `$LASTEXITCODE` is used.

### Rerun environment

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { [Console]::Out.WriteLine($PSVersionTable.PSVersion.ToString()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:46.5816461+08:00`

End: `2026-11-24T16:37:46.9345562+08:00`

Complete stdout:

```text
7.6.9
```

Complete stderr: empty.

Exit Code: `0`.

Command: `python --version`

Start: `2026-11-24T16:37:46.9387188+08:00`

End: `2026-11-24T16:37:46.9669330+08:00`

Complete stdout:

```text
Python 3.12.7
```

Complete stderr: empty.

Exit Code: `0`.

### SHA-256 Before — Train

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/train_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/train_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:46.9741181+08:00`

End: `2026-11-24T16:37:47.5073667+08:00`

Complete stdout:

```text
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
```

Complete stderr: empty.

Exit Code: `0`.

### SHA-256 Before — Test

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/test_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/test_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:47.5085509+08:00`

End: `2026-11-24T16:37:48.0289315+08:00`

Complete stdout:

```text
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
```

Complete stderr: empty.

Exit Code: `0`.

### SHA-256 Before — RUL

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/RUL_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/RUL_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:48.0294343+08:00`

End: `2026-11-24T16:37:48.5585939+08:00`

Complete stdout:

```text
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

Complete stderr: empty.

Exit Code: `0`.

### Remediation classification verification

Command: `python research/m2_evidence_classification.py --verification-summary`

Start: `2026-11-24T16:37:48.5588872+08:00`

End: `2026-11-24T16:37:49.6166390+08:00`

Complete stdout:

```json
{"schema_version":"1.0.0","work_item_id":"WO-M2-RESEARCH-002","status":"EVIDENCE_CLASSIFIED_NO_DIAGNOSIS","cases":[{"selector":{"split":"train","unit_id":1,"cycle_start":1,"cycle_end":5,"sensor_name":"sensor_2"},"actual_selected_cycles":[1,2,3,4,5],"observation_count":5,"inference_count":2,"calculations":[{"formula":"endpoint_delta = end_original_value - start_original_value","input_cycles":[1,2,3,4,5],"input_values":[641.82,642.15,642.35,642.35,642.37],"start_cycle":1,"start_value":641.82,"end_cycle":5,"end_value":642.37,"endpoint_delta":0.55,"exact_endpoint_expression":"642.37 - 641.82 = 0.55","selected_window_min":641.82,"selected_window_max":642.37,"endpoint_direction":"increase","monotonicity_claim":"NOT_MADE"},{"classification":"DERIVED","assumption":"Train sequence is treated as run-to-failure and its final observed cycle as the failure endpoint convention.","formula":"derived_train_RUL = final_observed_train_cycle - current_cycle","final_observed_train_cycle":192,"cycles":[1,2,3,4,5],"derived_values":[191,190,189,188,187],"source_input_roles":{"current_cycles":"DERIVED_CURRENT_CYCLE_INPUT","final_cycle":"DERIVED_FINAL_OBSERVED_CYCLE_INPUT"}}]},{"selector":{"split":"test","unit_id":1,"cycle_start":27,"cycle_end":31,"sensor_name":"sensor_2"},"actual_selected_cycles":[27,28,29,30,31],"observation_count":6,"inference_count":1,"calculations":[{"formula":"endpoint_delta = end_original_value - start_original_value","input_cycles":[27,28,29,30,31],"input_values":[642.08,641.93,641.95,642.79,642.58],"start_cycle":27,"start_value":642.08,"end_cycle":31,"end_value":642.58,"endpoint_delta":0.5,"exact_endpoint_expression":"642.58 - 642.08 = 0.50","selected_window_min":641.93,"selected_window_max":642.79,"endpoint_direction":"increase","monotonicity_claim":"NOT_MADE"}]}],"source_sha256":{"FD001/train_FD001.txt":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","FD001/test_FD001.txt":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","FD001/RUL_FD001.txt":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca"},"source_reference_count_in_executed_records":27,"all_source_references_reread_match":true,"derived_train_rul_provenance":{"source_reference_count":6,"selected_cycle_reference_count":5,"final_cycle_reference":{"dataset_split":"train","unit_id":1,"cycle":192,"sensor_name":null,"sensor_name_applicability":"NOT_APPLICABLE_CYCLE_COLUMN","field_name":"cycle","provenance_role":"DERIVED_FINAL_OBSERVED_CYCLE_INPUT","raw_value":192,"original_value":192,"original_token":"192","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":192,"data_row_index":191,"source_column_index":2,"reread_matches":true,"reread_method":"existing approved linecache-backed raw-reference lookup"},"formula":"derived_train_RUL = final_observed_train_cycle - current_cycle","classification":"DERIVED"},"rul_ground_truth":{"test_unit_id":1,"last_observed_cycle":31,"label":112.0,"classification":"GROUND_TRUTH_LABEL_NOT_MODEL_PREDICTION","fresh_reread_verified":true},"unknown_topics":["Fault Type","Fault Severity","Fault Occurrence Time","Health Status","Normal/Abnormal Baseline","Diagnostic Threshold","Alarm Threshold","Failure Probability","Model-predicted RUL","Unsupported Physical Sensor Units","Unsupported Causal Interpretation"],"semantic_classes":["OBSERVED","DERIVED","GROUND_TRUTH_LABEL","UNKNOWN","MODEL_PREDICTION_NOT_AVAILABLE"],"diagnostic_conclusion":"NOT_MADE"}
```

Complete stderr: empty.

Exit Code: `0`.

### Remediation unit tests

Command: `python -m unittest -v tests/test_m2_evidence_classification.py`

Start: `2026-11-24T16:37:49.6169269+08:00`

End: `2026-11-24T16:37:54.1402525+08:00`

Complete stdout: empty.

Complete stderr:

```text
test_bounded_verification_summary_executes_all_evidence_checks (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_bounded_verification_summary_executes_all_evidence_checks) ... ok
test_each_sensor_observation_has_raw_row_column_and_token_evidence (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_each_sensor_observation_has_raw_row_column_and_token_evidence) ... ok
test_public_samples_are_small_deterministic_and_non_diagnostic (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_public_samples_are_small_deterministic_and_non_diagnostic) ... ok
test_selector_rejects_invalid_or_ambiguous_requests (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_selector_rejects_invalid_or_ambiguous_requests) ... ok
test_semantic_matrix_prevents_observed_derived_and_prediction_conflation (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_semantic_matrix_prevents_observed_derived_and_prediction_conflation) ... ok
test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle) ... ok
test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label) ... ok
test_train_and_test_parameterized_windows_use_actual_isolated_cycles (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_train_and_test_parameterized_windows_use_actual_isolated_cycles) ... ok
test_train_rul_is_explicitly_derived_and_not_an_original_label (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_train_rul_is_explicitly_derived_and_not_an_original_label) ... ok
test_unknown_records_cover_required_epistemic_limits (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_unknown_records_cover_required_epistemic_limits) ... ok
test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim) ... ok

----------------------------------------------------------------------
Ran 11 tests in 4.320s

OK
```

Exit Code: `0`.

### SHA-256 After — Train

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/train_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/train_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:54.1406854+08:00`

End: `2026-11-24T16:37:54.6316820+08:00`

Complete stdout:

```text
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
```

Complete stderr: empty.

Exit Code: `0`.

### SHA-256 After — Test

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/test_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/test_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:54.6320561+08:00`

End: `2026-11-24T16:37:55.1127591+08:00`

Complete stdout:

```text
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
```

Complete stderr: empty.

Exit Code: `0`.

### SHA-256 After — RUL

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/RUL_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/RUL_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T16:37:55.1131133+08:00`

End: `2026-11-24T16:37:55.5938547+08:00`

Complete stdout:

```text
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

Complete stderr: empty.

Exit Code: `0`.

### Rerun hash comparison to accepted contract

| Source | Before | After | Accepted contract SHA-256 | Result |
| --- | --- | --- | --- | --- |
| `FD001/train_FD001.txt` | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` | same | same | `UNCHANGED / MATCH` |
| `FD001/test_FD001.txt` | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` | same | same | `UNCHANGED / MATCH` |
| `FD001/RUL_FD001.txt` | `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` | same | same | `UNCHANGED / MATCH` |

Rerun aggregate result: `all_exit_codes_zero=true`; `all_hashes_unchanged_and_accepted=true`.

### Remediation rerun conclusion

- Both deterministic five-cycle Observation cases, endpoint differences, window min/max values, 11 UNKNOWN topics, and Test ground-truth RUL fresh reread were revalidated.
- Train DERIVED RUL now carries five selected Cycle-column references plus the actual final Cycle 192 reference. The final reference is physical line 192, data row 191, source column 2, original token/value `192`, `reread_matches=true`, and linecache-backed.
- The formula remains `derived_train_RUL = final_observed_train_cycle - current_cycle`; it remains `DERIVED`, not an original RUL field and not a model prediction.
- The public JSON is automatically cross-checked against the executable extraction result by the unittest suite.
- No diagnostic threshold, fault classification, model prediction, complete sensor series, or complete RUL mapping was produced.

## Original controlled evidence run (pre-remediation)

Evidence start: `2026-11-24T16:11:27.9796043+08:00`

Evidence end: `2026-11-24T16:11:33.6778427+08:00`

The commands were launched from the repository root with stdout and stderr captured separately by `System.Diagnostics.Process`. The strings below are the complete bounded output for each command; no lines are omitted.

### Source SHA-256 before

```text
FD001/train_FD001.txt  963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt   3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt    a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

### Environment

Command: `python --version`

Start: `2026-11-24T16:11:27.9796043+08:00`

End: `2026-11-24T16:11:28.0373865+08:00`

Exit Code: `0`

Complete stdout:

```text
Python 3.12.7
```

Complete stderr: empty.

### Classification verification

Command: `python research/m2_evidence_classification.py --verification-summary`

Start: `2026-11-24T16:11:28.0402570+08:00`

End: `2026-11-24T16:11:29.1457995+08:00`

Exit Code: `0`

Complete stdout:

```json
{"schema_version":"1.0.0","work_item_id":"WO-M2-RESEARCH-002","status":"EVIDENCE_CLASSIFIED_NO_DIAGNOSIS","cases":[{"selector":{"split":"train","unit_id":1,"cycle_start":1,"cycle_end":5,"sensor_name":"sensor_2"},"actual_selected_cycles":[1,2,3,4,5],"observation_count":5,"inference_count":2,"calculations":[{"formula":"endpoint_delta = end_original_value - start_original_value","input_cycles":[1,2,3,4,5],"input_values":[641.82,642.15,642.35,642.35,642.37],"start_cycle":1,"start_value":641.82,"end_cycle":5,"end_value":642.37,"endpoint_delta":0.55,"exact_endpoint_expression":"642.37 - 641.82 = 0.55","selected_window_min":641.82,"selected_window_max":642.37,"endpoint_direction":"increase","monotonicity_claim":"NOT_MADE"},{"classification":"DERIVED","assumption":"Train sequence is treated as run-to-failure and its final observed cycle as the failure endpoint convention.","formula":"derived_train_RUL = final_observed_train_cycle - current_cycle","final_observed_train_cycle":192,"cycles":[1,2,3,4,5],"derived_values":[191,190,189,188,187]}]},{"selector":{"split":"test","unit_id":1,"cycle_start":27,"cycle_end":31,"sensor_name":"sensor_2"},"actual_selected_cycles":[27,28,29,30,31],"observation_count":6,"inference_count":1,"calculations":[{"formula":"endpoint_delta = end_original_value - start_original_value","input_cycles":[27,28,29,30,31],"input_values":[642.08,641.93,641.95,642.79,642.58],"start_cycle":27,"start_value":642.08,"end_cycle":31,"end_value":642.58,"endpoint_delta":0.5,"exact_endpoint_expression":"642.58 - 642.08 = 0.50","selected_window_min":641.93,"selected_window_max":642.79,"endpoint_direction":"increase","monotonicity_claim":"NOT_MADE"}]}],"source_sha256":{"FD001/train_FD001.txt":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","FD001/test_FD001.txt":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","FD001/RUL_FD001.txt":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca"},"source_reference_count_in_executed_records":26,"all_source_references_reread_match":true,"rul_ground_truth":{"test_unit_id":1,"last_observed_cycle":31,"label":112.0,"classification":"GROUND_TRUTH_LABEL_NOT_MODEL_PREDICTION","fresh_reread_verified":true},"unknown_topics":["Fault Type","Fault Severity","Fault Occurrence Time","Health Status","Normal/Abnormal Baseline","Diagnostic Threshold","Alarm Threshold","Failure Probability","Model-predicted RUL","Unsupported Physical Sensor Units","Unsupported Causal Interpretation"],"semantic_classes":["OBSERVED","DERIVED","GROUND_TRUTH_LABEL","UNKNOWN","MODEL_PREDICTION_NOT_AVAILABLE"],"diagnostic_conclusion":"NOT_MADE"}
```

Complete stderr: empty.

### Unit tests

Command: `python -m unittest -v tests/test_m2_evidence_classification.py`

Start: `2026-11-24T16:11:29.1460921+08:00`

End: `2026-11-24T16:11:33.6703940+08:00`

Exit Code: `0`

Complete stdout: empty.

Complete stderr (Python `unittest -v` writes its progress to stderr):

```text
test_bounded_verification_summary_executes_all_evidence_checks (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_bounded_verification_summary_executes_all_evidence_checks) ... ok
test_each_sensor_observation_has_raw_row_column_and_token_evidence (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_each_sensor_observation_has_raw_row_column_and_token_evidence) ... ok
test_public_samples_are_small_deterministic_and_non_diagnostic (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_public_samples_are_small_deterministic_and_non_diagnostic) ... ok
test_selector_rejects_invalid_or_ambiguous_requests (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_selector_rejects_invalid_or_ambiguous_requests) ... ok
test_semantic_matrix_prevents_observed_derived_and_prediction_conflation (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_semantic_matrix_prevents_observed_derived_and_prediction_conflation) ... ok
test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle) ... ok
test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label) ... ok
test_train_and_test_parameterized_windows_use_actual_isolated_cycles (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_train_and_test_parameterized_windows_use_actual_isolated_cycles) ... ok
test_train_rul_is_explicitly_derived_and_not_an_original_label (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_train_rul_is_explicitly_derived_and_not_an_original_label) ... ok
test_unknown_records_cover_required_epistemic_limits (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_unknown_records_cover_required_epistemic_limits) ... ok
test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim (tests.test_m2_evidence_classification.TestM2EvidenceClassification.test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim) ... ok

----------------------------------------------------------------------
Ran 11 tests in 4.271s

OK
```

## Source SHA-256 after

```text
FD001/train_FD001.txt  963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt   3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt    a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

Result: `hashes_unchanged=true`.

## Original evidence conclusion (historical pre-remediation run)

- Both deterministic five-cycle cases executed from the real local sources.
- All 26 source-reference uses in the executed records reported `reread_matches=true`.
- Train endpoint delta is exactly `0.55`; Test endpoint delta is exactly `0.50`; neither is presented as monotonic or diagnostic.
- Test Unit 1 ground-truth label `112.0` was freshly reread and verified at last observed Cycle 31, and classified as `GROUND_TRUTH_LABEL_NOT_MODEL_PREDICTION`.
- Eleven epistemic unknown topics and all five required semantic classes were emitted.
- The classifier made no diagnostic conclusion and the tests passed 11/11.
