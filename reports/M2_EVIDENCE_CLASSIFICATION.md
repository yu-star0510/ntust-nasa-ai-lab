# M2 FD001 Evidence Classification

Work item: `WO-M2-RESEARCH-002`

Schema: `1.0.0`

Result: `EVIDENCE_CLASSIFIED_NO_DIAGNOSIS`

## Purpose and boundaries

This supplement classifies bounded FD001 evidence as `OBSERVATION`, `INFERENCE`, or `UNKNOWN`. It reuses the accepted M2 `FD001Repository`; it does not train a model, diagnose a fault, create a baseline or threshold, infer a physical sensor unit, or build M3/M4/Web functionality.

Every record has this schema:

- `category`
- `statement`
- `source_references`
- `calculation_or_null`
- `evidence_scope`
- `limitations`

`UNKNOWN` is an epistemic classification: the available verified evidence does not establish the proposition. It is not the same as an original-data missing or null value.

## Deterministic selections

| Split | Unit | Sensor | Actual cycles | Purpose |
| --- | ---: | --- | --- | --- |
| Train | 1 | `sensor_2` | 1–5 | Source observations, bounded arithmetic, explicitly derived Train RUL example |
| Test | 1 | `sensor_2` | 27–31 | Source observations, bounded arithmetic, ground-truth RUL at the last observed cycle |

Both windows contain five actual cycles and remain isolated to one split and one Unit. The selector rejects an invalid split, unknown Unit, invalid sensor, reversed range, nonexistent endpoint, or a window containing fewer than two cycles.

## OBSERVATION

Train Unit 1 `sensor_2` original values/tokens are `641.82`, `642.15`, `642.35`, `642.35`, and `642.37` at Cycles 1–5. They correspond to physical lines 1–5, zero-based data rows 0–4, and one-based source column 7 of `FD001/train_FD001.txt`.

Test Unit 1 `sensor_2` original values/tokens are `642.08`, `641.93`, `641.95`, `642.79`, and `642.58` at Cycles 27–31. They correspond to physical lines 27–31, zero-based data rows 26–30, and one-based source column 7 of `FD001/test_FD001.txt`.

The selected Train/Test sensor references report `reread_matches=true`. Their approved raw-reference implementation is linecache-backed; this report does not call it a fresh disk reopen.

For Test Unit 1, `RUL_FD001.txt` physical line 1 / data row 0 / source column 1 contains original token `112`, numeric ground-truth label `112.0`, mapped to last observed Test Cycle 31. The approved RUL reference freshly reopens the file and verifies the source SHA-256, physical line, token, numeric value, and `reread_matches=true`.

## INFERENCE

The bounded endpoint formula is:

```text
endpoint_delta = end_original_value - start_original_value
```

| Case | Exact endpoint expression | Window min | Window max | Endpoint direction |
| --- | --- | ---: | ---: | --- |
| Train Unit 1 | `642.37 - 641.82 = 0.55` | 641.82 | 642.37 | increase |
| Test Unit 1 | `642.58 - 642.08 = 0.50` | 641.93 | 642.79 | increase |

The direction describes endpoints only. It does not assert monotonicity. Neither an endpoint increase nor any selected sensor pattern establishes degradation, abnormality, failure, fault type, health score, failure timing, causality, or a RUL prediction.

For the Train example only, the run-to-failure convention permits a transparent derived value:

```text
derived_train_RUL = final_observed_train_cycle - current_cycle
```

Train Unit 1 ends at Cycle 192, so selected Cycles 1–5 yield `191, 190, 189, 188, 187`. These are `DERIVED` under the documented convention, not measured original columns and not model predictions.

The classifier does not hard-code the final Cycle's source position. It obtains the actual Unit 1 cycle list from `FD001Repository.get_cycles("train", 1)`, selects its maximum as Cycle 192, and then calls the approved `get_raw_reference("train", 1, 192, "cycle")`. The resulting final-input reference is `FD001/train_FD001.txt`, physical line 192, zero-based data row 191, one-based source column 2, original token/value `192`, with `reread_matches=true`. Its reread behavior is correctly described as the existing approved linecache-backed lookup, not a fresh disk reopen.

The published DERIVED record contains six bounded Cycle-column references: selected Cycles 1–5 tagged `DERIVED_CURRENT_CYCLE_INPUT`, plus Cycle 192 tagged `DERIVED_FINAL_OBSERVED_CYCLE_INPUT`. Thus both operands of `final_observed_train_cycle - current_cycle` are source-traceable without publishing a complete Train sensor series.

## UNKNOWN

The classifier returns `UNKNOWN` with a precise reason for each of the following:

- Fault Type
- Fault Severity
- Fault Occurrence Time
- Health Status
- Normal/Abnormal Baseline
- Diagnostic Threshold
- Alarm Threshold
- Failure Probability
- Model-predicted RUL
- Unsupported Physical Sensor Units
- Unsupported Causal Interpretation

The existing M2 constant/near-constant quality rule is a descriptive data-quality rule, not a fault-diagnosis baseline.

## Train / Test / RUL semantic matrix

| Semantic class | Train | Test | RUL file |
| --- | --- | --- | --- |
| `OBSERVED` | Original selected sensor tokens/values and provenance | Original selected sensor tokens/values and provenance | Test ground-truth label observed only at the mapped last observed Test cycle |
| `DERIVED` | Bounded arithmetic; optional RUL under the run-to-failure convention | Bounded sensor arithmetic only; no per-cycle Test RUL | No transformation into earlier-cycle labels |
| `GROUND_TRUTH_LABEL` | No original per-cycle RUL label column | One mapped label at the last observed Test cycle; that cycle is not failure | Freshly reread and verified from `RUL_FD001.txt` |
| `UNKNOWN` | Fault/health/baseline/threshold/unit/cause claims are not established | Same | A RUL label does not establish them |
| `MODEL_PREDICTION_NOT_AVAILABLE` | No model trained or executed | No predicted RUL or failure probability | Ground truth must not be presented as prediction |

## Reproduction

Public deterministic samples:

```powershell
python research/m2_evidence_classification.py --public-samples
```

Parameterized single window:

```powershell
python research/m2_evidence_classification.py --split train --unit-id 1 --cycle-start 1 --cycle-end 5 --sensor-name sensor_2
```

The machine-readable checked sample is [M2_EVIDENCE_SAMPLES.json](M2_EVIDENCE_SAMPLES.json). Execution details and complete bounded command output are in [M2_EVIDENCE_EXECUTION.md](M2_EVIDENCE_EXECUTION.md).
