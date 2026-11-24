# M2 FD001 Quality and Traceable Trends

Work item: `WO-M2-RESEARCH-001`

Prerequisite: Phase A `PASS`

Result: **PHASE B PASS**

## Quality rules

Statistics are computed independently for Train and Test over all observed values. `std` is population standard deviation (`ddof=0`). A column is constant when `max - min = 0`. A nonconstant column is near-constant when its range is at most `max(1e-12, abs(mean) * 1e-4)`. No values were imputed, smoothed, deleted, or altered.

Both splits have zero missing values, parse failures, non-finite values, exact duplicate rows, duplicate unit-cycle keys, cycle gaps, and cycle-order errors. Train has 20,631 rows and Test has 13,096 rows; each has 26 columns and 100 units.

## Train statistics

| Column | Min | Max | Mean | Population std | Flag |
| --- | ---: | ---: | ---: | ---: | --- |
| setting_1 | -0.0087 | 0.0087 | -0.00000887015 | 0.00218726 | — |
| setting_2 | -0.0006 | 0.0006 | 0.00000235083 | 0.000293055 | — |
| setting_3 | 100 | 100 | 100 | 0 | constant |
| sensor_1 | 518.67 | 518.67 | 518.67 | 0 | constant |
| sensor_2 | 641.21 | 644.53 | 642.680934 | 0.500041 | — |
| sensor_3 | 1571.04 | 1616.91 | 1590.523119 | 6.131001 | — |
| sensor_4 | 1382.25 | 1441.49 | 1408.933782 | 9.000387 | — |
| sensor_5 | 14.62 | 14.62 | 14.62 | 0 | constant |
| sensor_6 | 21.60 | 21.61 | 21.609803 | 0.001389 | — |
| sensor_7 | 549.85 | 556.06 | 553.367711 | 0.885071 | — |
| sensor_8 | 2387.90 | 2388.56 | 2388.096652 | 0.070984 | — |
| sensor_9 | 9021.73 | 9244.59 | 9065.242941 | 22.082344 | — |
| sensor_10 | 1.30 | 1.30 | 1.30 | 0 | constant |
| sensor_11 | 46.85 | 48.53 | 47.541168 | 0.267081 | — |
| sensor_12 | 518.69 | 523.38 | 521.413470 | 0.737536 | — |
| sensor_13 | 2387.88 | 2388.56 | 2388.096152 | 0.071917 | — |
| sensor_14 | 8099.94 | 8293.72 | 8143.752722 | 19.075714 | — |
| sensor_15 | 8.3249 | 8.5848 | 8.442146 | 0.037504 | — |
| sensor_16 | 0.03 | 0.03 | 0.03 | 0 | constant |
| sensor_17 | 388 | 400 | 393.210654 | 1.548725 | — |
| sensor_18 | 2388 | 2388 | 2388 | 0 | constant |
| sensor_19 | 100 | 100 | 100 | 0 | constant |
| sensor_20 | 38.14 | 39.43 | 38.816271 | 0.180742 | — |
| sensor_21 | 22.8942 | 23.6184 | 23.289705 | 0.108248 | — |

## Test statistics

| Column | Min | Max | Mean | Population std | Flag |
| --- | ---: | ---: | ---: | ---: | --- |
| setting_1 | -0.0082 | 0.0078 | -0.0000111790 | 0.002202601 | — |
| setting_2 | -0.0006 | 0.0007 | 0.00000423794 | 0.000294019 | — |
| setting_3 | 100 | 100 | 100 | 0 | constant |
| sensor_1 | 518.67 | 518.67 | 518.67 | 0 | constant |
| sensor_2 | 641.13 | 644.30 | 642.475088 | 0.400884 | — |
| sensor_3 | 1569.04 | 1607.55 | 1588.099204 | 5.003083 | — |
| sensor_4 | 1384.39 | 1433.36 | 1404.735362 | 6.688054 | — |
| sensor_5 | 14.62 | 14.62 | 14.62 | 0 | constant |
| sensor_6 | 21.60 | 21.61 | 21.609701 | 0.001704 | — |
| sensor_7 | 550.88 | 555.84 | 553.757523 | 0.681260 | — |
| sensor_8 | 2387.89 | 2388.30 | 2388.070964 | 0.057440 | — |
| sensor_9 | 9024.53 | 9155.03 | 9058.407363 | 11.435824 | — |
| sensor_10 | 1.30 | 1.30 | 1.30 | 0 | constant |
| sensor_11 | 46.80 | 48.26 | 47.416204 | 0.195910 | — |
| sensor_12 | 519.38 | 523.76 | 521.747724 | 0.559605 | — |
| sensor_13 | 2387.89 | 2388.32 | 2388.071025 | 0.056932 | — |
| sensor_14 | 8108.50 | 8220.48 | 8138.947817 | 10.188216 | — |
| sensor_15 | 8.3328 | 8.5414 | 8.425844 | 0.029008 | — |
| sensor_16 | 0.03 | 0.03 | 0.03 | 0 | constant |
| sensor_17 | 389 | 397 | 392.571625 | 1.233530 | — |
| sensor_18 | 2388 | 2388 | 2388 | 0 | constant |
| sensor_19 | 100 | 100 | 100 | 0 | constant |
| sensor_20 | 38.31 | 39.41 | 38.892502 | 0.141675 | — |
| sensor_21 | 22.9354 | 23.6419 | 23.335743 | 0.084117 | — |

For both splits, the constant columns are `setting_3`, `sensor_1`, `sensor_5`, `sensor_10`, `sensor_16`, `sensor_18`, and `sensor_19`. No nonconstant column meets the declared near-constant rule.

## Traceable trend

The reproducible selector chooses the first nonconstant sensor for the first Train unit: `split=train`, `unit_id=1`, `sensor_name=sensor_2`. It contains 192 points ordered by actual cycles 1–192. There is no interpolation, smoothing, imputation, resampling, cross-unit mixing, or Train/Test mixing. This is a raw sensor trend, not a health score or RUL prediction.

| Cycle | Value | Physical line | 0-based data row | Source column | Raw token re-read |
| ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 641.82 | 1 | 0 | 7 | PASS |
| 2 | 642.15 | 2 | 1 | 7 | PASS |
| 3 | 642.35 | 3 | 2 | 7 | PASS |
| 97 | 642.07 | 97 | 96 | 7 | PASS |
| 190 | 643.64 | 190 | 189 | 7 | PASS |
| 191 | 643.34 | 191 | 190 | 7 | PASS |
| 192 | 643.54 | 192 | 191 | 7 | PASS |

All points reference `FD001/train_FD001.txt` with SHA-256 `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`. The local API returns all 192 point references; this public report intentionally shows only a small audit sample.

## Data contract gate

`contracts/FD001_DATA_CONTRACT.md` and `contracts/FD001_DATA_CONTRACT.json` define the schema, provenance, missing-value and error rules, ordering, RUL distinction, version, and all six required interfaces. Their declared contract name is `FD001_DATA_CONTRACT`, remediation version is `1.0.1`, validation status is `PASS`, and MAIN acceptance remains `PENDING` until independent Brain review.
