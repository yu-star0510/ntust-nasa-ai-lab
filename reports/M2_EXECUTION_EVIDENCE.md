# M2 Execution Evidence

Work item: `WO-M2-RESEARCH-001`

Worker result: `READY_FOR_REVIEW` after successful push and remote verification

Public working directory notation: `<PROJECT_ROOT>`

This record contains the actual commands, timestamps, exit codes, and complete public-safe console results used for the M2 gate. Absolute private paths are replaced by `<PROJECT_ROOT>`. No source data row or full sensor series is published.

## Environment and governance baseline

The Worker read the latest GitHub `main` governance before execution, confirmed M1 `PASS`, the STUDENT-approved M2 work item, and starting commit `79392158d20b9fcf657e2329ead6aaf2921ebdc9`. PowerShell was `7.6.9`; Python was `3.12.7`. The local branch was clean, on `main`, and fast-forwarded to that starting commit.

## Trusted local input discovery and before hashes

Command (PowerShell, read-only):

```powershell
Get-ChildItem -LiteralPath FD001 -File
Get-FileHash -Algorithm SHA256 -LiteralPath FD001/train_FD001.txt,FD001/test_FD001.txt,FD001/RUL_FD001.txt
```

Start `2026-11-23T18:14:09.049+08:00`; end `2026-11-23T18:14:09.225+08:00`; exit code `0`; stderr empty.

Complete public-safe stdout:

```text
FD001/train_FD001.txt|3515356|963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt|2228855|3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt|429|a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
COUNT_train_FD001.txt=1
COUNT_test_FD001.txt=1
COUNT_RUL_FD001.txt=1
```

## Phase A validation

Command:

```powershell
python research/m2_fd001_validate.py --input-dir FD001
```

Final run start `2026-11-23T18:27:51.642+08:00`; end `2026-11-23T18:27:52.102+08:00`; exit code `0`; stderr empty. The command's stdout was a valid JSON object. The complete public-safe result is recorded below in a normalized, lossless gate summary; complete per-unit counts are in `M2_FD001_VALIDATION.md`.

```text
phase_a_status=PASS
data_row_index_base=0
column_mapping=1:unit_id,2:cycle,3-5:setting_1..setting_3,6-26:sensor_1..sensor_21
train=source:FD001/train_FD001.txt,sha256:963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8,rows:20631,columns:26,units:100,unit_ids:1..100,cycle_min:1,cycle_max:362,length_min:128,length_max:362,length_mean:206.31,length_median:199
test=source:FD001/test_FD001.txt,sha256:3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851,rows:13096,columns:26,units:100,unit_ids:1..100,cycle_min:1,cycle_max:303,length_min:31,length_max:303,length_mean:130.96,length_median:133.5
rul=source:FD001/RUL_FD001.txt,sha256:a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca,rows:100,columns:1,label_min:7,label_max:145,unit_id:N/A,cycle:N/A
train_integrity=missing:0,duplicates:0,duplicate_keys:0,gaps:0,order_errors:0,parse_errors:0,nonfinite:0,blank_lines:0
test_integrity=missing:0,duplicates:0,duplicate_keys:0,gaps:0,order_errors:0,parse_errors:0,nonfinite:0,blank_lines:0
rul_integrity=invalid:0,parse_errors:0,blank_lines:0
rul_mapping=orders_match:true,row_count_matches:true,entries:100
rul_samples=unit1:line1:last_cycle31:label112;unit51:line51:last_cycle144:label114;unit100:line100:last_cycle198:label20
raw_reference_samples=6;all_reread_matches=true
gate_checks=three_files_loaded:true,sha256_recorded:true,train_schema_valid:true,test_schema_valid:true,rul_schema_valid:true,train_test_semantics_separated:true,rul_mapping_verified:true,unit_cycle_integrity_verified:true,raw_index_traceability_verified:true,settings_and_sensors_mapped:true
```

An earlier dedicated Phase A suite ran from `2026-11-23T18:17:12.887+08:00` to `2026-11-23T18:17:13.810+08:00`, exit code `0`, with 7/7 tests passing. Phase B was not started until this gate passed.

## Phase B quality, trend, and contract validation

Command:

```powershell
python research/m2_fd001_analysis.py --input-dir FD001
```

Final run start `2026-11-23T18:27:52.104+08:00`; end `2026-11-23T18:27:58.103+08:00`; exit code `0`; stderr empty. The complete stdout was valid JSON; every column statistic is preserved in `M2_FD001_QUALITY_TRENDS.md`. Complete public-safe gate stdout:

```text
phase_a_status=PASS
phase_b_status=PASS
statistics_formula=population standard deviation,ddof=0
near_constant_rule=nonconstant range<=max(1e-12,abs(mean)*1e-4)
train_quality=rows:20631,columns:26,units:100,missing:0,duplicates:0,duplicate_keys:0,parse_errors:0,nonfinite:0
test_quality=rows:13096,columns:26,units:100,missing:0,duplicates:0,duplicate_keys:0,parse_errors:0,nonfinite:0
train_constant_columns=setting_3,sensor_1,sensor_5,sensor_10,sensor_16,sensor_18,sensor_19
test_constant_columns=setting_3,sensor_1,sensor_5,sensor_10,sensor_16,sensor_18,sensor_19
train_near_constant_columns=[]
test_near_constant_columns=[]
trend=split:train,unit_id:1,sensor_name:sensor_2,cycles:1..192,point_count:192,transformations:NONE
trend_samples=cycle1:value641.82:line1:row0:column7:match;cycle2:value642.15:line2:row1:column7:match;cycle3:value642.35:line3:row2:column7:match;cycle97:value642.07:line97:row96:column7:match;cycle190:value643.64:line190:row189:column7:match;cycle191:value643.34:line191:row190:column7:match;cycle192:value643.54:line192:row191:column7:match
contract_checks=contract_name:true,schema_version:true,required_interfaces:true,required_fields:true,validation_status:true,main_acceptance_pending:true
contract_valid=true
```

## Final test suite

Command:

```powershell
python -m unittest -v tests/test_m2_fd001.py
```

Start `2026-11-23T18:27:58.104+08:00`; end `2026-11-23T18:28:10.990+08:00`; exit code `0`; stdout empty. Complete stderr:

```text
test_phase_a_gate_is_computed_from_validation_results (tests.test_m2_fd001.TestM2PhaseA.test_phase_a_gate_is_computed_from_validation_results) ... ok
test_raw_reference_rereads_actual_source_positions (tests.test_m2_fd001.TestM2PhaseA.test_raw_reference_rereads_actual_source_positions) ... ok
test_rul_has_one_nonnegative_finite_value_per_row (tests.test_m2_fd001.TestM2PhaseA.test_rul_has_one_nonnegative_finite_value_per_row) ... ok
test_sources_exist_readable_and_hashes_use_actual_bytes (tests.test_m2_fd001.TestM2PhaseA.test_sources_exist_readable_and_hashes_use_actual_bytes) ... ok
test_test_units_map_to_rul_rows_by_verified_order (tests.test_m2_fd001.TestM2PhaseA.test_test_units_map_to_rul_rows_by_verified_order) ... ok
test_train_and_test_have_26_mapped_columns (tests.test_m2_fd001.TestM2PhaseA.test_train_and_test_have_26_mapped_columns) ... ok
test_unit_cycle_integrity (tests.test_m2_fd001.TestM2PhaseA.test_unit_cycle_integrity) ... ok
test_contract_json_and_markdown_are_consistent (tests.test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent) ... ok
test_interface_error_behavior (tests.test_m2_fd001.TestM2PhaseB.test_interface_error_behavior) ... ok
test_phase_b_gate_uses_phase_a_and_contract_validation (tests.test_m2_fd001.TestM2PhaseB.test_phase_b_gate_uses_phase_a_and_contract_validation) ... ok
test_quality_statistics_recompute_from_actual_values (tests.test_m2_fd001.TestM2PhaseB.test_quality_statistics_recompute_from_actual_values) ... ok
test_rul_label_mapping_matches_local_rul_row (tests.test_m2_fd001.TestM2PhaseB.test_rul_label_mapping_matches_local_rul_row) ... ok
test_sensor_trend_is_sorted_and_source_traceable (tests.test_m2_fd001.TestM2PhaseB.test_sensor_trend_is_sorted_and_source_traceable) ... ok
test_train_test_and_unit_isolation (tests.test_m2_fd001.TestM2PhaseB.test_train_test_and_unit_isolation) ... ok

----------------------------------------------------------------------
Ran 14 tests in 12.629s

OK
```

## After hashes

Command:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath FD001/train_FD001.txt,FD001/test_FD001.txt,FD001/RUL_FD001.txt
```

Observed `2026-11-23T18:30:05.955+08:00`, after the final Phase A, Phase B, and test commands; exit code `0`; stderr empty. Complete stdout:

```text
FD001/train_FD001.txt|963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt|3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt|a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

All after hashes match their before hashes.

## Data safety and Git evidence boundary

The implementation reads the three inputs without writing them. `.gitignore` continues to exclude `FD001/`, common dataset directories, CSV data, environment files, credentials, and keys; it only adds exact allow-list exceptions for the authorized M2 deliverables. Public outputs contain aggregate metrics and small traceability examples, never a dataset copy, full source rows, full sensor series, secrets, or private absolute paths. No M3 or Web work was performed.

The exact staged file list, staged diff, raw-data exclusion check, commit ID, commit-object SHA-256, push result, remote `main` equality, and GitHub URLs are necessarily produced after this report is frozen into its own commit. They are supplied in the Worker return rather than self-referentially embedded here.
