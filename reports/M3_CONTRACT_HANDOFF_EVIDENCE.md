# M3 Contract Handoff Execution Evidence

Work item: `WO-M3-HANDOFF-001`

`EVIDENCE_TYPE: CONTROLLED_HANDOFF_EXECUTION`

Worker result: `READY_FOR_REVIEW` only. Research Brain and MAIN review remain pending.

Working directory: `<PROJECT_ROOT>` (public de-identified notation)

Timezone: `Taipei Standard Time` (`UTC+08:00`)

Controlled evidence start: `2026-11-24T17:38:52.6786102+08:00`

Controlled evidence end: `2026-11-24T17:41:10.2852080+08:00`

Phase B full-output supplement end: `2026-11-24T17:42:16.4861645+08:00`

All commands used `System.Diagnostics.Process` to capture the real child-process stdout, stderr and Exit Code separately. Hash commands use `ErrorActionPreference=Stop`, validate that `Get-FileHash` returned a value, and set an explicit process exit from `try/catch`; they do not use a stale `$LASTEXITCODE`.

Evidence sections are grouped by validation purpose rather than strict execution order. The recorded Start and End timestamps are authoritative for the actual sequence.

## Environment

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { [Console]::Out.WriteLine($PSVersionTable.PSVersion.ToString()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T17:38:52.6864407+08:00`

End: `2026-11-24T17:38:52.9993041+08:00`

Complete stdout:

```text
7.6.9
```

Complete stderr: empty. Exit Code: `0`.

## Phase B

The initial controlled Phase B command ran from `2026-11-24T17:38:56.1009044+08:00` to `2026-11-24T17:39:30.7118594+08:00` with Exit Code `0`. Because the combined multi-command evidence envelope truncated its large stdout at the display layer, the identical command was immediately rerun alone to capture the complete output below. A separate bounded diagnostic was also executed and is recorded after the full output.

Command: `python research/m2_fd001_analysis.py --input-dir FD001`

Full-output supplement start: `2026-11-24T17:42:03.6866373+08:00`; End: `2026-11-24T17:42:16.4861645+08:00`

Complete stdout:

```json
{"phase_a_status":"PASS","phase_b_status":"PASS","train_quality":{"split":"train","rows":20631,"columns":26,"unit_count":100,"cycle_length_distribution":{"min":128,"max":362,"mean":206.31,"median":199.0},"missing_total":0,"missing_by_column":{"unit_id":0,"cycle":0,"setting_1":0,"setting_2":0,"setting_3":0,"sensor_1":0,"sensor_2":0,"sensor_3":0,"sensor_4":0,"sensor_5":0,"sensor_6":0,"sensor_7":0,"sensor_8":0,"sensor_9":0,"sensor_10":0,"sensor_11":0,"sensor_12":0,"sensor_13":0,"sensor_14":0,"sensor_15":0,"sensor_16":0,"sensor_17":0,"sensor_18":0,"sensor_19":0,"sensor_20":0,"sensor_21":0},"exact_duplicate_rows":0,"duplicate_unit_cycle_keys":0,"parsing_errors":0,"non_finite_values":0,"statistics_formula":"Population standard deviation (statistics.pstdev, ddof=0).","near_constant_rule":"Non-constant column with range <= max(1e-12, abs(mean) * 1e-4).","column_statistics":{"setting_1":{"min":-0.0087,"max":0.0087,"mean":-8.870146866366146e-06,"population_std":0.0021872604380133807,"constant":false,"near_constant":false},"setting_2":{"min":-0.0006,"max":0.0006,"mean":2.3508312733265476e-06,"population_std":0.0002930550220098974,"constant":false,"near_constant":false},"setting_3":{"min":100.0,"max":100.0,"mean":100.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_1":{"min":518.67,"max":518.67,"mean":518.67,"population_std":0.0,"constant":true,"near_constant":false},"sensor_2":{"min":641.21,"max":644.53,"mean":642.6809335466046,"population_std":0.50004115093577,"constant":false,"near_constant":false},"sensor_3":{"min":1571.04,"max":1616.91,"mean":1590.5231186079202,"population_std":6.131000927188836,"constant":false,"near_constant":false},"sensor_4":{"min":1382.25,"max":1441.49,"mean":1408.9337816877514,"population_std":9.000386644877734,"constant":false,"near_constant":false},"sensor_5":{"min":14.62,"max":14.62,"mean":14.62,"population_std":0.0,"constant":true,"near_constant":false},"sensor_6":{"min":21.6,"max":21.61,"mean":21.60980320876351,"population_std":0.001388951249730616,"constant":false,"near_constant":false},"sensor_7":{"min":549.85,"max":556.06,"mean":553.367711211284,"population_std":0.8850708068616236,"constant":false,"near_constant":false},"sensor_8":{"min":2387.9,"max":2388.56,"mean":2388.0966516407348,"population_std":0.07098375851045081,"constant":false,"near_constant":false},"sensor_9":{"min":9021.73,"max":9244.59,"mean":9065.242940720276,"population_std":22.082344331737623,"constant":false,"near_constant":false},"sensor_10":{"min":1.3,"max":1.3,"mean":1.3,"population_std":0.0,"constant":true,"near_constant":false},"sensor_11":{"min":46.85,"max":48.53,"mean":47.54116814502448,"population_std":0.26708092559826174,"constant":false,"near_constant":false},"sensor_12":{"min":518.69,"max":523.38,"mean":521.4134700208425,"population_std":0.7375355171108342,"constant":false,"near_constant":false},"sensor_13":{"min":2387.88,"max":2388.56,"mean":2388.0961523920314,"population_std":0.07191717269564055,"constant":false,"near_constant":false},"sensor_14":{"min":8099.94,"max":8293.72,"mean":8143.752722117202,"population_std":19.075713652092396,"constant":false,"near_constant":false},"sensor_15":{"min":8.3249,"max":8.5848,"mean":8.442145581891328,"population_std":0.037504128992332054,"constant":false,"near_constant":false},"sensor_16":{"min":0.03,"max":0.03,"mean":0.03,"population_std":0.0,"constant":true,"near_constant":false},"sensor_17":{"min":388.0,"max":400.0,"mean":393.2106538703892,"population_std":1.548725489308388,"constant":false,"near_constant":false},"sensor_18":{"min":2388.0,"max":2388.0,"mean":2388.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_19":{"min":100.0,"max":100.0,"mean":100.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_20":{"min":38.14,"max":39.43,"mean":38.81627066065629,"population_std":0.18074204736330857,"constant":false,"near_constant":false},"sensor_21":{"min":22.8942,"max":23.6184,"mean":23.289705360864716,"population_std":0.10824825121269076,"constant":false,"near_constant":false}},"constant_columns":["setting_3","sensor_1","sensor_5","sensor_10","sensor_16","sensor_18","sensor_19"],"near_constant_columns":[],"quality_warnings":["Constant columns are present; values are reported without removal."],"cycle_counts_summary":{"unit_entries":100,"total_cycles":20631,"minimum":128,"maximum":362,"complete_counts_recorded_in_quality_report":true}},"test_quality":{"split":"test","rows":13096,"columns":26,"unit_count":100,"cycle_length_distribution":{"min":31,"max":303,"mean":130.96,"median":133.5},"missing_total":0,"missing_by_column":{"unit_id":0,"cycle":0,"setting_1":0,"setting_2":0,"setting_3":0,"sensor_1":0,"sensor_2":0,"sensor_3":0,"sensor_4":0,"sensor_5":0,"sensor_6":0,"sensor_7":0,"sensor_8":0,"sensor_9":0,"sensor_10":0,"sensor_11":0,"sensor_12":0,"sensor_13":0,"sensor_14":0,"sensor_15":0,"sensor_16":0,"sensor_17":0,"sensor_18":0,"sensor_19":0,"sensor_20":0,"sensor_21":0},"exact_duplicate_rows":0,"duplicate_unit_cycle_keys":0,"parsing_errors":0,"non_finite_values":0,"statistics_formula":"Population standard deviation (statistics.pstdev, ddof=0).","near_constant_rule":"Non-constant column with range <= max(1e-12, abs(mean) * 1e-4).","column_statistics":{"setting_1":{"min":-0.0082,"max":0.0078,"mean":-1.117898594990837e-05,"population_std":0.002202600981573831,"constant":false,"near_constant":false},"setting_2":{"min":-0.0006,"max":0.0007,"mean":4.2379352474037876e-06,"population_std":0.00029401934091301393,"constant":false,"near_constant":false},"setting_3":{"min":100.0,"max":100.0,"mean":100.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_1":{"min":518.67,"max":518.67,"mean":518.67,"population_std":0.0,"constant":true,"near_constant":false},"sensor_2":{"min":641.13,"max":644.3,"mean":642.4750878130727,"population_std":0.40088403560655406,"constant":false,"near_constant":false},"sensor_3":{"min":1569.04,"max":1607.55,"mean":1588.099204337202,"population_std":5.003082903489313,"constant":false,"near_constant":false},"sensor_4":{"min":1384.39,"max":1433.36,"mean":1404.735361942578,"population_std":6.688053931091294,"constant":false,"near_constant":false},"sensor_5":{"min":14.62,"max":14.62,"mean":14.62,"population_std":0.0,"constant":true,"near_constant":false},"sensor_6":{"min":21.6,"max":21.61,"mean":21.609700671960905,"population_std":0.0017040196935390493,"constant":false,"near_constant":false},"sensor_7":{"min":550.88,"max":555.84,"mean":553.757522907758,"population_std":0.6812600978682368,"constant":false,"near_constant":false},"sensor_8":{"min":2387.89,"max":2388.3,"mean":2388.070964416616,"population_std":0.05743959099863069,"constant":false,"near_constant":false},"sensor_9":{"min":9024.53,"max":9155.03,"mean":9058.407363317043,"population_std":11.435823881196022,"constant":false,"near_constant":false},"sensor_10":{"min":1.3,"max":1.3,"mean":1.3,"population_std":0.0,"constant":true,"near_constant":false},"sensor_11":{"min":46.8,"max":48.26,"mean":47.41620418448381,"population_std":0.19590976512899858,"constant":false,"near_constant":false},"sensor_12":{"min":519.38,"max":523.76,"mean":521.7477237324374,"population_std":0.5596053869476156,"constant":false,"near_constant":false},"sensor_13":{"min":2387.89,"max":2388.32,"mean":2388.0710247403786,"population_std":0.05693213655110635,"constant":false,"near_constant":false},"sensor_14":{"min":8108.5,"max":8220.48,"mean":8138.9478168906535,"population_std":10.188215975736007,"constant":false,"near_constant":false},"sensor_15":{"min":8.3328,"max":8.5414,"mean":8.425843967623702,"population_std":0.029008219959997146,"constant":false,"near_constant":false},"sensor_16":{"min":0.03,"max":0.03,"mean":0.03,"population_std":0.0,"constant":true,"near_constant":false},"sensor_17":{"min":389.0,"max":397.0,"mean":392.5716249236408,"population_std":1.2335297272825934,"constant":false,"near_constant":false},"sensor_18":{"min":2388.0,"max":2388.0,"mean":2388.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_19":{"min":100.0,"max":100.0,"mean":100.0,"population_std":0.0,"constant":true,"near_constant":false},"sensor_20":{"min":38.31,"max":39.41,"mean":38.892501527183875,"population_std":0.1416753458875796,"constant":false,"near_constant":false},"sensor_21":{"min":22.9354,"max":23.6419,"mean":23.335742692425168,"population_std":0.08411706841592928,"constant":false,"near_constant":false}},"constant_columns":["setting_3","sensor_1","sensor_5","sensor_10","sensor_16","sensor_18","sensor_19"],"near_constant_columns":[],"quality_warnings":["Constant columns are present; values are reported without removal."],"cycle_counts_summary":{"unit_entries":100,"total_cycles":13096,"minimum":31,"maximum":303,"complete_counts_recorded_in_quality_report":true}},"sensor_trend":{"split":"train","unit_id":1,"sensor_name":"sensor_2","x_axis":"cycle","y_axis":"original sensor value","point_count":192,"transformations":"NONE","sample_points":[{"cycle":1,"value":641.82,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":1,"data_row_index":0,"data_row_index_base":0,"unit_id":1,"cycle":1,"column_name":"sensor_2","source_column_index":7,"original_value":"641.82","reread_value":"641.82","reread_matches":true}},{"cycle":2,"value":642.15,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":2,"data_row_index":1,"data_row_index_base":0,"unit_id":1,"cycle":2,"column_name":"sensor_2","source_column_index":7,"original_value":"642.15","reread_value":"642.15","reread_matches":true}},{"cycle":3,"value":642.35,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":3,"data_row_index":2,"data_row_index_base":0,"unit_id":1,"cycle":3,"column_name":"sensor_2","source_column_index":7,"original_value":"642.35","reread_value":"642.35","reread_matches":true}},{"cycle":97,"value":642.07,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":97,"data_row_index":96,"data_row_index_base":0,"unit_id":1,"cycle":97,"column_name":"sensor_2","source_column_index":7,"original_value":"642.07","reread_value":"642.07","reread_matches":true}},{"cycle":190,"value":643.64,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":190,"data_row_index":189,"data_row_index_base":0,"unit_id":1,"cycle":190,"column_name":"sensor_2","source_column_index":7,"original_value":"643.64","reread_value":"643.64","reread_matches":true}},{"cycle":191,"value":643.34,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":191,"data_row_index":190,"data_row_index_base":0,"unit_id":1,"cycle":191,"column_name":"sensor_2","source_column_index":7,"original_value":"643.34","reread_value":"643.34","reread_matches":true}},{"cycle":192,"value":643.54,"raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":192,"data_row_index":191,"data_row_index_base":0,"unit_id":1,"cycle":192,"column_name":"sensor_2","source_column_index":7,"original_value":"643.54","reread_value":"643.54","reread_matches":true}}],"sample_point_count":7,"disclosure_note":"Only selected traceability points are emitted publicly; the complete local series remains available through get_sensor_series."},"contract_validation":{"checks":{"contract_name":true,"schema_version":true,"required_interfaces":true,"required_fields":true,"validation_status":true,"main_acceptance_accepted":true},"valid":true}}
```

Complete stderr: empty. Exit Code: `0`.

### Bounded Phase B diagnostic

This real bounded command was executed because the combined evidence envelope truncated the first large Phase B stdout. It independently executes `run_phase_b` and emits only gate, contract and count fields.

Command:

```text
python -c "import json,sys; from pathlib import Path; sys.path.insert(0,'research'); from m2_fd001_analysis import run_phase_b; r=run_phase_b(Path('FD001')); out={'phase_a_status':r['phase_a_status'],'phase_b_status':r['phase_b_status'],'contract_validation':r['contract_validation'],'train_rows':r['train_quality']['rows'],'train_units':r['train_quality']['unit_count'],'test_rows':r['test_quality']['rows'],'test_units':r['test_quality']['unit_count'],'trend_split':r['sensor_trend']['split'],'trend_unit_id':r['sensor_trend']['unit_id'],'trend_sensor_name':r['sensor_trend']['sensor_name'],'trend_point_count':r['sensor_trend']['point_count']}; print(json.dumps(out,separators=(',',':')))"
```

Start: `2026-11-24T17:41:34.6947492+08:00`; End: `2026-11-24T17:41:47.9317494+08:00`

Complete stdout:

```json
{"phase_a_status":"PASS","phase_b_status":"PASS","contract_validation":{"checks":{"contract_name":true,"schema_version":true,"required_interfaces":true,"required_fields":true,"validation_status":true,"main_acceptance_accepted":true},"valid":true},"train_rows":20631,"train_units":100,"test_rows":13096,"test_units":100,"trend_split":"train","trend_unit_id":1,"trend_sensor_name":"sensor_2","trend_point_count":192}
```

Complete stderr: empty. Exit Code: `0`.

Command: `python --version`

Start: `2026-11-24T17:38:53.0023410+08:00`

End: `2026-11-24T17:38:53.0261367+08:00`

Complete stdout:

```text
Python 3.12.7
```

Complete stderr: empty. Exit Code: `0`.

## Source SHA-256 Before

### Train

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/train_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/train_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T17:38:53.0308681+08:00`; End: `2026-11-24T17:38:53.5235377+08:00`

Complete stdout:

```text
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
```

Complete stderr: empty. Exit Code: `0`.

### Test

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/test_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/test_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T17:38:53.5246553+08:00`; End: `2026-11-24T17:38:54.0006339+08:00`

Complete stdout:

```text
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
```

Complete stderr: empty. Exit Code: `0`.

### RUL

Command:

```powershell
pwsh -NoProfile -Command "& { $ErrorActionPreference='Stop'; try { $r=Get-FileHash -LiteralPath 'FD001/RUL_FD001.txt' -Algorithm SHA256; if ($null -eq $r -or [string]::IsNullOrWhiteSpace($r.Hash)) { throw 'Get-FileHash returned no SHA-256' }; [Console]::Out.WriteLine('FD001/RUL_FD001.txt ' + $r.Hash.ToLowerInvariant()); exit 0 } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }"
```

Start: `2026-11-24T17:38:54.0010962+08:00`; End: `2026-11-24T17:38:54.4758716+08:00`

Complete stdout:

```text
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

Complete stderr: empty. Exit Code: `0`.

## Structured contract semantic diff

Command:

```text
python -c "import json,subprocess,pathlib; before=json.loads(subprocess.check_output(['git','show','HEAD:contracts/FD001_DATA_CONTRACT.json'],text=True,encoding='utf-8')); after=json.loads(pathlib.Path('contracts/FD001_DATA_CONTRACT.json').read_text(encoding='utf-8')); changed=sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k)); b=dict(before); a=dict(after); b.pop('main_acceptance',None); a.pop('main_acceptance',None); result={'changed_top_level_fields':changed,'before_main_acceptance':before.get('main_acceptance'),'after_main_acceptance':after.get('main_acceptance'),'other_fields_equal':b==a,'schema_version_unchanged':before.get('schema_version')==after.get('schema_version')=='1.0.1','six_interfaces_unchanged':before.get('interfaces')==after.get('interfaces') and len(after.get('interfaces',{}))==6,'required_fields_unchanged':before.get('required_fields')==after.get('required_fields'),'source_files_unchanged':before.get('source_files')==after.get('source_files'),'semantics_unchanged':before.get('semantics')==after.get('semantics')}; assert changed==['main_acceptance'] and result['other_fields_equal'] and result['schema_version_unchanged'] and result['six_interfaces_unchanged'] and result['required_fields_unchanged'] and result['source_files_unchanged'] and result['semantics_unchanged']; print(json.dumps(result,separators=(',',':')))"
```

Start: `2026-11-24T17:38:54.4772072+08:00`; End: `2026-11-24T17:38:54.5803169+08:00`

Complete stdout:

```json
{"changed_top_level_fields":["main_acceptance"],"before_main_acceptance":"PENDING","after_main_acceptance":"ACCEPTED","other_fields_equal":true,"schema_version_unchanged":true,"six_interfaces_unchanged":true,"required_fields_unchanged":true,"source_files_unchanged":true,"semantics_unchanged":true}
```

Complete stderr: empty. Exit Code: `0`.

## Focused positive and negative contract tests

Command:

```text
python -m unittest -v tests.test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_unaccepted_or_missing_acceptance_state tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_invalid_identity_structure_or_validation_status
```

Start: `2026-11-24T17:38:54.5805988+08:00`; End: `2026-11-24T17:38:55.5817496+08:00`

Complete stdout: empty.

Complete stderr:

```text
test_contract_json_and_markdown_are_consistent (tests.test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent) ... ok
test_contract_rejects_unaccepted_or_missing_acceptance_state (tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_unaccepted_or_missing_acceptance_state) ... ok
test_contract_rejects_invalid_identity_structure_or_validation_status (tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_invalid_identity_structure_or_validation_status) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.807s

OK
```

Exit Code: `0`.

## M2 regression tests

Command: `python -m unittest -v tests/test_m2_fd001.py`

Start: `2026-11-24T17:39:30.7123996+08:00`; End: `2026-11-24T17:41:02.8833654+08:00`

Complete stdout: empty.

Complete stderr:

```text
test_input_directory_outside_project_is_rejected (tests.test_m2_fd001.TestM2PhaseA.test_input_directory_outside_project_is_rejected) ... ok
test_phase_a_gate_is_computed_from_validation_results (tests.test_m2_fd001.TestM2PhaseA.test_phase_a_gate_is_computed_from_validation_results) ... ok
test_raw_reference_rereads_actual_source_positions (tests.test_m2_fd001.TestM2PhaseA.test_raw_reference_rereads_actual_source_positions) ... ok
test_rul_has_one_nonnegative_finite_value_per_row (tests.test_m2_fd001.TestM2PhaseA.test_rul_has_one_nonnegative_finite_value_per_row) ... ok
test_rul_reference_freshly_rereads_source (tests.test_m2_fd001.TestM2PhaseA.test_rul_reference_freshly_rereads_source) ... ok
test_rul_reference_rejects_incorrect_physical_line (tests.test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_incorrect_physical_line) ... ok
test_rul_reference_rejects_mismatched_value (tests.test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_mismatched_value) ... ok
test_source_paths_are_project_relative_for_default_and_explicit_inputs (tests.test_m2_fd001.TestM2PhaseA.test_source_paths_are_project_relative_for_default_and_explicit_inputs) ... ok
test_sources_exist_readable_and_hashes_use_actual_bytes (tests.test_m2_fd001.TestM2PhaseA.test_sources_exist_readable_and_hashes_use_actual_bytes) ... ok
test_test_units_map_to_rul_rows_by_verified_order (tests.test_m2_fd001.TestM2PhaseA.test_test_units_map_to_rul_rows_by_verified_order) ... ok
test_train_and_test_have_26_mapped_columns (tests.test_m2_fd001.TestM2PhaseA.test_train_and_test_have_26_mapped_columns) ... ok
test_unit_cycle_integrity (tests.test_m2_fd001.TestM2PhaseA.test_unit_cycle_integrity) ... ok
test_contract_json_and_markdown_are_consistent (tests.test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent) ... ok
test_contract_rejects_invalid_identity_structure_or_validation_status (tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_invalid_identity_structure_or_validation_status) ... ok
test_contract_rejects_unaccepted_or_missing_acceptance_state (tests.test_m2_fd001.TestM2PhaseB.test_contract_rejects_unaccepted_or_missing_acceptance_state) ... ok
test_interface_error_behavior (tests.test_m2_fd001.TestM2PhaseB.test_interface_error_behavior) ... ok
test_phase_b_gate_uses_phase_a_and_contract_validation (tests.test_m2_fd001.TestM2PhaseB.test_phase_b_gate_uses_phase_a_and_contract_validation) ... ok
test_quality_statistics_recompute_from_actual_values (tests.test_m2_fd001.TestM2PhaseB.test_quality_statistics_recompute_from_actual_values) ... ok
test_repository_source_paths_match_for_default_and_explicit_inputs (tests.test_m2_fd001.TestM2PhaseB.test_repository_source_paths_match_for_default_and_explicit_inputs) ... ok
test_rul_label_mapping_matches_local_rul_row (tests.test_m2_fd001.TestM2PhaseB.test_rul_label_mapping_matches_local_rul_row) ... ok
test_sensor_trend_is_sorted_and_source_traceable (tests.test_m2_fd001.TestM2PhaseB.test_sensor_trend_is_sorted_and_source_traceable) ... ok
test_train_test_and_unit_isolation (tests.test_m2_fd001.TestM2PhaseB.test_train_test_and_unit_isolation) ... ok

----------------------------------------------------------------------
Ran 22 tests in 91.748s

OK
```

Exit Code: `0`.

## Evidence classification regression tests

Command: `python -m unittest -v tests/test_m2_evidence_classification.py`

Start: `2026-11-24T17:41:02.8836520+08:00`; End: `2026-11-24T17:41:09.1149651+08:00`

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
Ran 11 tests in 5.980s

OK
```

Exit Code: `0`.

## Source SHA-256 After

The After commands are identical to the corresponding Before commands and were executed independently after both test suites.

| Source | Start | End | Complete stdout | Complete stderr | Exit Code |
| --- | --- | --- | --- | --- | ---: |
| Train | `2026-11-24T17:41:09.1154122+08:00` | `2026-11-24T17:41:09.5063095+08:00` | `FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` | empty | 0 |
| Test | `2026-11-24T17:41:09.5066598+08:00` | `2026-11-24T17:41:09.8845366+08:00` | `FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` | empty | 0 |
| RUL | `2026-11-24T17:41:09.8848053+08:00` | `2026-11-24T17:41:10.2738712+08:00` | `FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` | empty | 0 |

## Hash comparison

| Source | Before | After | Accepted contract SHA-256 | Result |
| --- | --- | --- | --- | --- |
| Train | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` | same | same | `UNCHANGED / MATCH` |
| Test | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` | same | same | `UNCHANGED / MATCH` |
| RUL | `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` | same | same | `UNCHANGED / MATCH` |

Aggregate capture result: `all_exit_codes_zero=true`; `all_hashes_unchanged_and_accepted=true`.

## Evidence conclusion

- JSON lifecycle transition is exactly `PENDING` → `ACCEPTED`; every other JSON contract field is structurally equal.
- Markdown agrees with JSON and identifies the original M2 MAIN FINAL ACCEPTANCE as authority.
- Exact `ACCEPTED` passes; PENDING, invalid, missing and malformed contract states fail closed.
- Phase A and Phase B pass; Phase B reports `main_acceptance_accepted=true` and `valid=true`.
- M2 regression is 22/22 OK and Evidence Classification regression is 11/11 OK.
- Three input hashes are unchanged and match the accepted contract.
- No raw input, private absolute path, Web code or out-of-scope data behavior was changed or published.

## Phase A

Command: `python research/m2_fd001_validate.py --input-dir FD001`

Start: `2026-11-24T17:38:55.5820883+08:00`; End: `2026-11-24T17:38:56.1006033+08:00`

Complete stdout:

```json
{"phase_a_status":"PASS","data_row_index_base":0,"column_mapping":{"1":"unit_id","2":"cycle","3":"setting_1","4":"setting_2","5":"setting_3","6":"sensor_1","7":"sensor_2","8":"sensor_3","9":"sensor_4","10":"sensor_5","11":"sensor_6","12":"sensor_7","13":"sensor_8","14":"sensor_9","15":"sensor_10","16":"sensor_11","17":"sensor_12","18":"sensor_13","19":"sensor_14","20":"sensor_15","21":"sensor_16","22":"sensor_17","23":"sensor_18","24":"sensor_19","25":"sensor_20","26":"sensor_21"},"train":{"split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","rows":20631,"columns":26,"column_names":["unit_id","cycle","setting_1","setting_2","setting_3","sensor_1","sensor_2","sensor_3","sensor_4","sensor_5","sensor_6","sensor_7","sensor_8","sensor_9","sensor_10","sensor_11","sensor_12","sensor_13","sensor_14","sensor_15","sensor_16","sensor_17","sensor_18","sensor_19","sensor_20","sensor_21"],"unit_count":100,"unit_order_matches_sorted":true,"cycle_min":1,"cycle_max":362,"cycle_length_distribution":{"min":128,"max":362,"mean":206.31,"median":199.0},"cycle_gaps":{},"out_of_order_units":[],"non_starting_at_one_units":[],"exact_duplicate_rows":0,"duplicate_unit_cycle_keys":0,"missing_total":0,"missing_by_column":{"unit_id":0,"cycle":0,"setting_1":0,"setting_2":0,"setting_3":0,"sensor_1":0,"sensor_2":0,"sensor_3":0,"sensor_4":0,"sensor_5":0,"sensor_6":0,"sensor_7":0,"sensor_8":0,"sensor_9":0,"sensor_10":0,"sensor_11":0,"sensor_12":0,"sensor_13":0,"sensor_14":0,"sensor_15":0,"sensor_16":0,"sensor_17":0,"sensor_18":0,"sensor_19":0,"sensor_20":0,"sensor_21":0},"parsing_errors":0,"non_finite_values":0,"blank_line_numbers":[],"schema_valid":true,"unit_cycle_integrity_valid":true,"unit_ids_summary":{"count":100,"min":1,"max":100,"contiguous":true},"unit_first_appearance_order_summary":{"count":100,"min":1,"max":100,"matches_sorted":true},"cycle_counts_summary":{"unit_entries":100,"total_cycles":20631,"minimum":128,"maximum":362,"complete_counts_recorded_in_validation_report":true}},"test":{"split":"test","source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","rows":13096,"columns":26,"column_names":["unit_id","cycle","setting_1","setting_2","setting_3","sensor_1","sensor_2","sensor_3","sensor_4","sensor_5","sensor_6","sensor_7","sensor_8","sensor_9","sensor_10","sensor_11","sensor_12","sensor_13","sensor_14","sensor_15","sensor_16","sensor_17","sensor_18","sensor_19","sensor_20","sensor_21"],"unit_count":100,"unit_order_matches_sorted":true,"cycle_min":1,"cycle_max":303,"cycle_length_distribution":{"min":31,"max":303,"mean":130.96,"median":133.5},"cycle_gaps":{},"out_of_order_units":[],"non_starting_at_one_units":[],"exact_duplicate_rows":0,"duplicate_unit_cycle_keys":0,"missing_total":0,"missing_by_column":{"unit_id":0,"cycle":0,"setting_1":0,"setting_2":0,"setting_3":0,"sensor_1":0,"sensor_2":0,"sensor_3":0,"sensor_4":0,"sensor_5":0,"sensor_6":0,"sensor_7":0,"sensor_8":0,"sensor_9":0,"sensor_10":0,"sensor_11":0,"sensor_12":0,"sensor_13":0,"sensor_14":0,"sensor_15":0,"sensor_16":0,"sensor_17":0,"sensor_18":0,"sensor_19":0,"sensor_20":0,"sensor_21":0},"parsing_errors":0,"non_finite_values":0,"blank_line_numbers":[],"schema_valid":true,"unit_cycle_integrity_valid":true,"unit_ids_summary":{"count":100,"min":1,"max":100,"contiguous":true},"unit_first_appearance_order_summary":{"count":100,"min":1,"max":100,"matches_sorted":true},"cycle_counts_summary":{"unit_entries":100,"total_cycles":13096,"minimum":31,"maximum":303,"complete_counts_recorded_in_validation_report":true}},"rul":{"source_file":"FD001/RUL_FD001.txt","source_sha256":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca","rows":100,"columns":1,"unit_id":"N/A","cycle":"N/A","unit_cycle_key":"N/A","blank_line_numbers":[],"parsing_errors":0,"missing_or_invalid_values":0,"label_min":7.0,"label_max":145.0,"schema_valid":true},"rul_mapping":{"mapping_rule":"RUL rows map in file order to Test Units after verifying that Test Unit first-appearance order equals ascending Unit ID order. The RUL file itself contains no Unit ID.","orders_match":true,"rul_rows_match_test_units":true,"test_unit_order_summary":{"count":100,"min":1,"max":100,"first_appearance_equals_sorted":true},"entry_count":100,"sample_entries":[{"test_unit_id":1,"rul_physical_line_number":1,"rul_data_row_index":0,"last_observed_cycle":31,"rul_label":112.0,"rul_raw_value":"112","rul_raw_reference":{"source_file":"FD001/RUL_FD001.txt","source_sha256":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca","physical_line_number":1,"data_row_index":0,"data_row_index_base":0,"column_name":"rul_label","source_column_index":1,"original_value":"112","reread_value":"112","rul_label":112.0,"reread_matches":true}},{"test_unit_id":51,"rul_physical_line_number":51,"rul_data_row_index":50,"last_observed_cycle":144,"rul_label":114.0,"rul_raw_value":"114","rul_raw_reference":{"source_file":"FD001/RUL_FD001.txt","source_sha256":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca","physical_line_number":51,"data_row_index":50,"data_row_index_base":0,"column_name":"rul_label","source_column_index":1,"original_value":"114","reread_value":"114","rul_label":114.0,"reread_matches":true}},{"test_unit_id":100,"rul_physical_line_number":100,"rul_data_row_index":99,"last_observed_cycle":198,"rul_label":20.0,"rul_raw_value":"20","rul_raw_reference":{"source_file":"FD001/RUL_FD001.txt","source_sha256":"a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca","physical_line_number":100,"data_row_index":99,"data_row_index_base":0,"column_name":"rul_label","source_column_index":1,"original_value":"20","reread_value":"20","rul_label":20.0,"reread_matches":true}}],"disclosure_note":"Only three mapping examples are emitted publicly; the complete mapping remains available to local read-only functions and tests."},"raw_reference_samples":[{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":1,"data_row_index":0,"data_row_index_base":0,"unit_id":1,"cycle":1,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true},{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":10316,"data_row_index":10315,"data_row_index_base":0,"unit_id":52,"cycle":194,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true},{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":20631,"data_row_index":20630,"data_row_index_base":0,"unit_id":100,"cycle":200,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true},{"dataset_split":"test","source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","physical_line_number":1,"data_row_index":0,"data_row_index_base":0,"unit_id":1,"cycle":1,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true},{"dataset_split":"test","source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","physical_line_number":6549,"data_row_index":6548,"data_row_index_base":0,"unit_id":52,"cycle":66,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true},{"dataset_split":"test","source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","physical_line_number":13096,"data_row_index":13095,"data_row_index_base":0,"unit_id":100,"cycle":198,"column_name":"sensor_1","source_column_index":6,"original_value":"518.67","reread_value":"518.67","reread_matches":true}],"gate_checks":{"three_files_loaded":true,"sha256_recorded":true,"train_schema_valid":true,"test_schema_valid":true,"rul_schema_valid":true,"train_test_semantics_separated":true,"rul_mapping_verified":true,"unit_cycle_integrity_verified":true,"raw_index_traceability_verified":true,"rul_raw_reference_verified":true,"settings_and_sensors_mapped":true}}
```

Complete stderr: empty. Exit Code: `0`.
