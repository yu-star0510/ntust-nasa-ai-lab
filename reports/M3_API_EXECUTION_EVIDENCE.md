# M3-A FD001 API execution evidence

Work item `WO-M3-WEB-001` · 2026-11-25 · UTC+08:00 · Windows, PowerShell 7.6.9, Python 3.12.7. Commands ran from the repository root. The handoff baseline was GitHub `main` commit `0bbf4e7aa1b82cd71e6ca08bdcd8a8c9fbbd2395`. The API used the approved local originals and the accepted `FD001_DATA_CONTRACT v1.0.1`.

## Source SHA-256 before and after

The same command ran before and after the final standalone HTTP and automated test runs. Each invocation exited 0 with empty stderr. The three values match the accepted contract and each other.

```powershell
Get-Date -Format o
python --version
$PSVersionTable.PSVersion.ToString()
$files = 'FD001/train_FD001.txt','FD001/test_FD001.txt','FD001/RUL_FD001.txt'
foreach ($file in $files) {
    $digest = Get-FileHash -Algorithm SHA256 -LiteralPath $file -ErrorAction Stop
    Write-Output "$file $($digest.Hash.ToLowerInvariant())"
}
```

Before stdout:

```text
2026-11-25T09:34:00.2520856+08:00
Python 3.12.7
7.6.9
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

After stdout:

```text
2026-11-25T09:35:07.1393729+08:00
Python 3.12.7
7.6.9
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

## Standalone HTTP startup, requests and shutdown

The child command was `python -B -m web.api --port 8765`. The verification command below ran in the Windows console so it could send Ctrl+Break to the child process group. It made 13 real HTTP requests, checked six original-file references, waited for the standalone server to exit, and confirmed the loopback port no longer accepted connections. Parent exit code 0. Child exit code 0. Parent and child stderr were empty.

Exact PowerShell command:

```powershell
@'
import datetime, http.client, json, signal, socket, subprocess, sys
from pathlib import Path

def now():
    return datetime.datetime.now().astimezone().isoformat()

def request(target, method="GET"):
    connection = http.client.HTTPConnection("127.0.0.1", 8765, timeout=10)
    try:
        connection.request(method, target)
        response = connection.getresponse()
        return response.status, json.load(response)
    finally:
        connection.close()

def crosscheck(data, split, unit, sampled_cycles):
    expected_hash = hashes[split]
    row_index = 0
    matches = {}
    filename = f"FD001/{split}_FD001.txt"
    with Path(filename).open(encoding="utf-8", newline="") as stream:
        for line_number, line in enumerate(stream, 1):
            fields = line.split()
            if not fields:
                continue
            raw_unit, cycle = map(int, fields[:2])
            if raw_unit == unit and cycle in sampled_cycles:
                matches[cycle] = (line_number, row_index, fields[11])
            row_index += 1
    for cycle in sampled_cycles:
        line_number, row_index, token = matches[cycle]
        point = next(point for point in data["points"] if point["cycle"] == cycle)
        assert point == {
            "cycle": cycle, "value": float(token), "sensor_name": "sensor_7",
            "raw_reference": {
                "dataset_split": split, "source_file": filename, "source_sha256": expected_hash,
                "physical_line_number": line_number, "data_row_index": row_index,
                "data_row_index_base": 0, "unit_id": unit, "cycle": cycle,
                "column_name": "sensor_7", "source_column_index": 12,
                "original_value": token, "reread_value": token, "reread_matches": True,
            },
        }
        print("verified_point", json.dumps(point, separators=(",", ":")))

import hashlib
hashes = {split: hashlib.sha256(Path(f"FD001/{split}_FD001.txt").read_bytes()).hexdigest()
          for split in ("train", "test")}
print("start", now(), flush=True)
child = subprocess.Popen([sys.executable, "-B", "-m", "web.api", "--port", "8765"],
                         creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
try:
    line = child.stdout.readline().rstrip()
    if line:
        print("server_stdout:", line)
    assert line == "FD001 API listening on http://127.0.0.1:8765 (ready)"
    history = "/api/history?split=train&unit=1&sensor=7&start=1&end=20"
    checks = [
        ("GET", "/api/health", 200, None),
        ("GET", "/api/catalog", 200, None),
        ("GET", "/api/units?split=train", 200, None),
        ("GET", "/api/units?split=test", 200, None),
        ("GET", history, 200, None),
        ("GET", history.replace("unit=1", "unit=2").replace("end=20", "end=2"), 200, None),
        ("GET", history.replace("split=train&unit=1", "split=test&unit=2").replace("end=20", "end=2"), 200, None),
        ("GET", history.replace("start=1&end=20", "start=192&end=193"), 200, None),
        ("GET", history.replace("start=1&end=20", "start=193&end=194"), 200, None),
        ("GET", history.replace("sensor=7", "sensor=22"), 400, "INVALID_SENSOR"),
        ("GET", history.replace("unit=1", "unit=9999"), 404, "UNKNOWN_UNIT"),
        ("GET", "/api/unknown", 404, "UNKNOWN_ENDPOINT"),
        ("POST", "/api/health", 405, "METHOD_NOT_ALLOWED"),
    ]
    for method, target, expected_status, code in checks:
        status, body = request(target, method)
        assert status == expected_status
        print(f"{method} {target} {status}" + (f" {code}" if code else ""))
        if code:
            assert body["error"]["code"] == code
            if code == "INVALID_SENSOR":
                print("error_json", json.dumps(body, separators=(",", ":")))
            continue
        data = body["data"]
        if target == "/api/health":
            print("health_json", json.dumps(body, separators=(",", ":")))
        if "points" in data:
            print("history_count", data["count"])
            if target == history:
                assert [p["cycle"] for p in data["points"]] == list(range(1, 21))
                crosscheck(data, "train", 1, (1, 10, 20))
            elif "unit=2" in target:
                crosscheck(data, data["dataset_split"], 2, (1,))
            elif "start=192" in target:
                assert [p["cycle"] for p in data["points"]] == [192]
                crosscheck(data, "train", 1, (192,))
            else:
                assert (data["points"], data["count"]) == ([], 0)
finally:
    if child.poll() is None:
        if line.endswith("(ready)"):
            child.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            child.terminate()
    try:
        stdout, stderr = child.communicate(timeout=10)
    except subprocess.TimeoutExpired:
        child.kill()
        child.communicate()
        raise
    for output_line in stdout.splitlines():
        print("server_stdout:", output_line)
    for output_line in stderr.splitlines():
        print("server_stderr:", output_line)
    print("server_exit", child.returncode)
assert child.returncode == 0 and not stderr and stdout.strip() == "FD001 API stopped"
with socket.socket() as probe:
    probe.settimeout(2)
    assert probe.connect_ex(("127.0.0.1", 8765)) != 0
print("loopback_port_closed", now())
'@ | python -B - | ForEach-Object {
    $offset = 0
    do {
        $prefix = if ($offset -eq 0) { 'out:' } else { 'add:' }
        Write-Output ($prefix + $_.Substring($offset, [Math]::Min(62, $_.Length - $offset)))
        $offset += 62
    } while ($offset -lt $_.Length)
}
exit $LASTEXITCODE
```

Complete public-safe stdout below. The transcript joins the console's `out:` and `add:` display chunks and omits terminal control sequences. The client printed selected JSON only. All displayed sample values came from the live response.

```text
start 2026-11-25T09:34:50.710923+08:00
server_stdout: FD001 API listening on http://127.0.0.1:8765 (ready)
GET /api/health 200
health_json {"status":"ok","data":{"service":"fd001-api","readiness":"ready","contract_version":"1.0.1","source_type":"TRUSTED_LOCAL_FILES","validation_status":"PASS","sources":{"train":{"hash_verified":true},"test":{"hash_verified":true},"rul":{"hash_verified":true}}},"meta":{"schema_version":"1.0","source":"FD001_DATA_CONTRACT v1.0.1"}}
GET /api/catalog 200
GET /api/units?split=train 200
GET /api/units?split=test 200
GET /api/history?split=train&unit=1&sensor=7&start=1&end=20 200
history_count 20
verified_point {"cycle":1,"value":554.36,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":1,"data_row_index":0,"data_row_index_base":0,"unit_id":1,"cycle":1,"column_name":"sensor_7","source_column_index":12,"original_value":"554.36","reread_value":"554.36","reread_matches":true}}
verified_point {"cycle":10,"value":553.59,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":10,"data_row_index":9,"data_row_index_base":0,"unit_id":1,"cycle":10,"column_name":"sensor_7","source_column_index":12,"original_value":"553.59","reread_value":"553.59","reread_matches":true}}
verified_point {"cycle":20,"value":554.81,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":20,"data_row_index":19,"data_row_index_base":0,"unit_id":1,"cycle":20,"column_name":"sensor_7","source_column_index":12,"original_value":"554.81","reread_value":"554.81","reread_matches":true}}
GET /api/history?split=train&unit=2&sensor=7&start=1&end=2 200
history_count 2
verified_point {"cycle":1,"value":554.53,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":193,"data_row_index":192,"data_row_index_base":0,"unit_id":2,"cycle":1,"column_name":"sensor_7","source_column_index":12,"original_value":"554.53","reread_value":"554.53","reread_matches":true}}
GET /api/history?split=test&unit=2&sensor=7&start=1&end=2 200
history_count 2
verified_point {"cycle":1,"value":553.14,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"test","source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","physical_line_number":32,"data_row_index":31,"data_row_index_base":0,"unit_id":2,"cycle":1,"column_name":"sensor_7","source_column_index":12,"original_value":"553.14","reread_value":"553.14","reread_matches":true}}
GET /api/history?split=train&unit=1&sensor=7&start=192&end=193 200
history_count 1
verified_point {"cycle":192,"value":551.25,"sensor_name":"sensor_7","raw_reference":{"dataset_split":"train","source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":192,"data_row_index":191,"data_row_index_base":0,"unit_id":1,"cycle":192,"column_name":"sensor_7","source_column_index":12,"original_value":"551.25","reread_value":"551.25","reread_matches":true}}
GET /api/history?split=train&unit=1&sensor=7&start=193&end=194 200
history_count 0
GET /api/history?split=train&unit=1&sensor=22&start=1&end=20 400 INVALID_SENSOR
error_json {"status":"error","error":{"code":"INVALID_SENSOR","message":"Sensor must be in 1..21","details":{}}}
GET /api/history?split=train&unit=9999&sensor=7&start=1&end=20 404 UNKNOWN_UNIT
GET /api/unknown 404 UNKNOWN_ENDPOINT
POST /api/health 405 METHOD_NOT_ALLOWED
server_stdout: FD001 API stopped
server_exit 0
loopback_port_closed 2026-11-25T09:34:55.017739+08:00
```

## Automated tests

The first sandboxed M3 run could bind the listener but Windows denied loopback client connections (WinError 10013, exit 1). The authorized loopback run completed. The final suite below ran against the delivered code with real loopback HTTP requests. It passed 59/59 tests (19 M3 API, 22 M2 core, 11 M2 evidence classification, and 7 M1). Negative source-state tests use an isolated temporary directory or explicitly synthetic simulated failure. The real sources remain read-only.

```powershell
Get-Date -Format o
python -B -m unittest discover -s tests -v
$code = $LASTEXITCODE
Get-Date -Format o
Write-Output "exit=$code"
exit $code
```

Complete output. The wall-clock timestamps and exit indicator are stdout. The unittest runner writes the case results and summary to stderr.

```text
2026-11-25T09:34:09.4295066+08:00
test_basic_display_matches_source_rows (test_m1_profile.TestM1SyntheticProfile.test_basic_display_matches_source_rows) ... ok
test_column_count_names_and_widths_match_source (test_m1_profile.TestM1SyntheticProfile.test_column_count_names_and_widths_match_source) ... ok
test_csv_loading_and_actual_row_count (test_m1_profile.TestM1SyntheticProfile.test_csv_loading_and_actual_row_count) ... ok
test_exact_duplicates_match_independent_count (test_m1_profile.TestM1SyntheticProfile.test_exact_duplicates_match_independent_count) ... ok
test_missing_values_match_independent_count (test_m1_profile.TestM1SyntheticProfile.test_missing_values_match_independent_count) ... ok
test_sensor_trend_source_mapping (test_m1_profile.TestM1SyntheticProfile.test_sensor_trend_source_mapping) ... ok
test_sha256_integrity_uses_actual_bytes (test_m1_profile.TestM1SyntheticProfile.test_sha256_integrity_uses_actual_bytes) ... ok
test_bounded_verification_summary_executes_all_evidence_checks (test_m2_evidence_classification.TestM2EvidenceClassification.test_bounded_verification_summary_executes_all_evidence_checks) ... ok
test_each_sensor_observation_has_raw_row_column_and_token_evidence (test_m2_evidence_classification.TestM2EvidenceClassification.test_each_sensor_observation_has_raw_row_column_and_token_evidence) ... ok
test_public_samples_are_small_deterministic_and_non_diagnostic (test_m2_evidence_classification.TestM2EvidenceClassification.test_public_samples_are_small_deterministic_and_non_diagnostic) ... ok
test_selector_rejects_invalid_or_ambiguous_requests (test_m2_evidence_classification.TestM2EvidenceClassification.test_selector_rejects_invalid_or_ambiguous_requests) ... ok
test_semantic_matrix_prevents_observed_derived_and_prediction_conflation (test_m2_evidence_classification.TestM2EvidenceClassification.test_semantic_matrix_prevents_observed_derived_and_prediction_conflation) ... ok
test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle (test_m2_evidence_classification.TestM2EvidenceClassification.test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle) ... ok
test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label (test_m2_evidence_classification.TestM2EvidenceClassification.test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label) ... ok
test_train_and_test_parameterized_windows_use_actual_isolated_cycles (test_m2_evidence_classification.TestM2EvidenceClassification.test_train_and_test_parameterized_windows_use_actual_isolated_cycles) ... ok
test_train_rul_is_explicitly_derived_and_not_an_original_label (test_m2_evidence_classification.TestM2EvidenceClassification.test_train_rul_is_explicitly_derived_and_not_an_original_label) ... ok
test_unknown_records_cover_required_epistemic_limits (test_m2_evidence_classification.TestM2EvidenceClassification.test_unknown_records_cover_required_epistemic_limits) ... ok
test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim (test_m2_evidence_classification.TestM2EvidenceClassification.test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim) ... ok
test_input_directory_outside_project_is_rejected (test_m2_fd001.TestM2PhaseA.test_input_directory_outside_project_is_rejected) ... ok
test_phase_a_gate_is_computed_from_validation_results (test_m2_fd001.TestM2PhaseA.test_phase_a_gate_is_computed_from_validation_results) ... ok
test_raw_reference_rereads_actual_source_positions (test_m2_fd001.TestM2PhaseA.test_raw_reference_rereads_actual_source_positions) ... ok
test_rul_has_one_nonnegative_finite_value_per_row (test_m2_fd001.TestM2PhaseA.test_rul_has_one_nonnegative_finite_value_per_row) ... ok
test_rul_reference_freshly_rereads_source (test_m2_fd001.TestM2PhaseA.test_rul_reference_freshly_rereads_source) ... ok
test_rul_reference_rejects_incorrect_physical_line (test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_incorrect_physical_line) ... ok
test_rul_reference_rejects_mismatched_value (test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_mismatched_value) ... ok
test_source_paths_are_project_relative_for_default_and_explicit_inputs (test_m2_fd001.TestM2PhaseA.test_source_paths_are_project_relative_for_default_and_explicit_inputs) ... ok
test_sources_exist_readable_and_hashes_use_actual_bytes (test_m2_fd001.TestM2PhaseA.test_sources_exist_readable_and_hashes_use_actual_bytes) ... ok
test_test_units_map_to_rul_rows_by_verified_order (test_m2_fd001.TestM2PhaseA.test_test_units_map_to_rul_rows_by_verified_order) ... ok
test_train_and_test_have_26_mapped_columns (test_m2_fd001.TestM2PhaseA.test_train_and_test_have_26_mapped_columns) ... ok
test_unit_cycle_integrity (test_m2_fd001.TestM2PhaseA.test_unit_cycle_integrity) ... ok
test_contract_json_and_markdown_are_consistent (test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent) ... ok
test_contract_rejects_invalid_identity_structure_or_validation_status (test_m2_fd001.TestM2PhaseB.test_contract_rejects_invalid_identity_structure_or_validation_status) ... ok
test_contract_rejects_unaccepted_or_missing_acceptance_state (test_m2_fd001.TestM2PhaseB.test_contract_rejects_unaccepted_or_missing_acceptance_state) ... ok
test_interface_error_behavior (test_m2_fd001.TestM2PhaseB.test_interface_error_behavior) ... ok
test_phase_b_gate_uses_phase_a_and_contract_validation (test_m2_fd001.TestM2PhaseB.test_phase_b_gate_uses_phase_a_and_contract_validation) ... ok
test_quality_statistics_recompute_from_actual_values (test_m2_fd001.TestM2PhaseB.test_quality_statistics_recompute_from_actual_values) ... ok
test_repository_source_paths_match_for_default_and_explicit_inputs (test_m2_fd001.TestM2PhaseB.test_repository_source_paths_match_for_default_and_explicit_inputs) ... ok
test_rul_label_mapping_matches_local_rul_row (test_m2_fd001.TestM2PhaseB.test_rul_label_mapping_matches_local_rul_row) ... ok
test_sensor_trend_is_sorted_and_source_traceable (test_m2_fd001.TestM2PhaseB.test_sensor_trend_is_sorted_and_source_traceable) ... ok
test_train_test_and_unit_isolation (test_m2_fd001.TestM2PhaseB.test_train_test_and_unit_isolation) ... ok
test_catalog_fields_and_safe_summary (test_m3_api.TestM3API.test_catalog_fields_and_safe_summary) ... ok
test_cycle_boundary_singleton_and_empty_windows (test_m3_api.TestM3API.test_cycle_boundary_singleton_and_empty_windows) ... ok
test_failure_to_load_repository_fails_all_routes_closed (test_m3_api.TestM3API.test_failure_to_load_repository_fails_all_routes_closed) ... ok
test_hash_mismatch_fails_all_routes_closed (test_m3_api.TestM3API.test_hash_mismatch_fails_all_routes_closed) ... ok
test_health_ready_and_all_sources_verified (test_m3_api.TestM3API.test_health_ready_and_all_sources_verified) ... ok
test_invalid_and_unknown_units (test_m3_api.TestM3API.test_invalid_and_unknown_units) ... ok
test_invalid_sensor_boundaries (test_m3_api.TestM3API.test_invalid_sensor_boundaries) ... ok
test_invalid_source_path_and_failed_reread_fail_closed (test_m3_api.TestM3API.test_invalid_source_path_and_failed_reread_fail_closed) ... ok
test_invalid_split (test_m3_api.TestM3API.test_invalid_split) ... ok
test_json_null_policy (test_m3_api.TestM3API.test_json_null_policy) ... ok
test_loopback_only_and_rejects_external_host (test_m3_api.TestM3API.test_loopback_only_and_rejects_external_host) ... ok
test_missing_extra_duplicate_and_malformed_parameters (test_m3_api.TestM3API.test_missing_extra_duplicate_and_malformed_parameters) ... ok
test_missing_source_at_startup_and_during_service (test_m3_api.TestM3API.test_missing_source_at_startup_and_during_service) ... ok
test_required_history_and_full_provenance_against_raw_file (test_m3_api.TestM3API.test_required_history_and_full_provenance_against_raw_file) ... ok
test_reversed_zero_and_excessive_cycle_ranges (test_m3_api.TestM3API.test_reversed_zero_and_excessive_cycle_ranges) ... ok
test_split_and_unit_isolation_against_raw_files (test_m3_api.TestM3API.test_split_and_unit_isolation_against_raw_files) ... ok
test_unaccepted_and_tampered_contract_fails_all_routes_closed (test_m3_api.TestM3API.test_unaccepted_and_tampered_contract_fails_all_routes_closed) ... ok
test_units_sorted_and_scoped_to_verified_source (test_m3_api.TestM3API.test_units_sorted_and_scoped_to_verified_source) ... ok
test_unsupported_methods_and_unknown_endpoint (test_m3_api.TestM3API.test_unsupported_methods_and_unknown_endpoint) ... ok

----------------------------------------------------------------------
Ran 59 tests in 42.399s

OK
2026-11-25T09:34:52.3539823+08:00
exit=0
```

## Git scope and data protection

The checkout began on local `main` at `3770f87d033097bc9e0c033de37c98900aed4caa`. GitHub compare confirmed a three-commit fast-forward, touching only `ROADMAP.md` and `WORK_ITEM.md`. `git pull --ff-only origin main` exited 0 and brought the clean checkout to the verified remote baseline. `git ls-remote origin refs/heads/main` and the GitHub Connector agreed on its SHA.

Before staging, `git diff --check` exited 0. `git ls-files -- FD001 synthetic_sensor.csv` exited 0 with no matches, and `git check-ignore -- FD001/train_FD001.txt FD001/test_FD001.txt FD001/RUL_FD001.txt synthetic_sensor.csv` exited 0 and reported all four paths as ignored. The allowlist contains only the API code, run instructions, API tests, API contract and two reports. The scoped work item entry records Worker delivery; the GitHub commit SHA and independent remote comparison are part of the Worker return.

Staged verification used `git --no-optional-locks status --short --branch --untracked-files=all`, `git diff --cached --check`, `git diff --cached --name-only`, `git ls-files`, and `git check-ignore`. The Worker compared the staged names to the eight-file allowlist, reviewed the staged content, and checked added lines for private paths, credential patterns and full raw rows. Selected output:

```text
## main...origin/main
M  .gitignore
M  WORK_ITEM.md
A  contracts/M3_API_CONTRACT.md
A  reports/M3_API_EXECUTION_EVIDENCE.md
A  reports/M3_API_SOURCE_CROSSCHECK.md
A  tests/test_m3_api.py
A  web/README.md
A  web/api.py
cached_diff_check_exit=0
FD001/train_FD001.txt
FD001/test_FD001.txt
FD001/RUL_FD001.txt
synthetic_sensor.csv
scope_and_protected_files_check_exit=0
staged_disclosure_check_exit=0
```
