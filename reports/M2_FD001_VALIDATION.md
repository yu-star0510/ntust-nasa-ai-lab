# M2 FD001 Validation

Work item: `WO-M2-RESEARCH-001`

Validation date: 2026-11-24 remediation `EVIDENCE_RERUN` (Asia/Taipei)

Result: **PHASE A PASS**

## Trust and source integrity

The three inputs were found only in the trusted local `FD001/` directory and were opened read-only. No download or external source lookup was performed. The files remain excluded by `.gitignore` and are not deliverables.

| Source | Size (bytes) | SHA-256 before | SHA-256 after |
| --- | ---: | --- | --- |
| `FD001/train_FD001.txt` | 3,515,356 | `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8` | same |
| `FD001/test_FD001.txt` | 2,228,855 | `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851` | same |
| `FD001/RUL_FD001.txt` | 429 | `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca` | same |

The final remediation before-hash observation was at `2026-11-24T15:25:51.425+08:00`; the final after-hash observation was at `2026-11-24T15:27:21.811+08:00`, after Phase A, Phase B, and the complete test suite for the final implementation. All values remained identical.

## Schema and semantics

Train and Test each have exactly 26 whitespace-delimited numeric columns: source columns 1–2 are `unit_id` and `cycle`, 3–5 are `setting_1` through `setting_3`, and 6–26 are `sensor_1` through `sensor_21`. `unit_id` and `cycle` are positive integers and all numeric values are finite.

Train contains full observed sequences through each training engine's recorded endpoint. Test contains partial observed sequences; its final cycle is not treated as failure. RUL has one non-negative label per Test unit and represents remaining life after that unit's last observed Test cycle. It is not a prediction and is not a raw per-cycle Test column.

| Check | Train | Test | RUL |
| --- | ---: | ---: | ---: |
| Data rows | 20,631 | 13,096 | 100 |
| Columns | 26 | 26 | 1 |
| Units | 100 | 100 | N/A |
| Unit IDs | 1–100 | 1–100 | N/A |
| Cycle range | 1–362 | 1–303 | N/A |
| Cycle-length min / max / mean / median | 128 / 362 / 206.31 / 199 | 31 / 303 / 130.96 / 133.5 | N/A |
| Missing values | 0 | 0 | 0 |
| Non-finite / parse errors | 0 | 0 | 0 |
| Exact duplicate rows | 0 | 0 | 0 |
| Duplicate `(unit_id, cycle)` keys | 0 | 0 | N/A |
| Cycle gaps / ordering errors | 0 / 0 | 0 / 0 | N/A |
| Blank physical lines | 0 | 0 | 0 |

## Per-unit cycle counts

These counts are aggregate structure evidence, not sensor records.

**Train:** 1:192, 2:287, 3:179, 4:189, 5:269, 6:188, 7:259, 8:150, 9:201, 10:222, 11:240, 12:170, 13:163, 14:180, 15:207, 16:209, 17:276, 18:195, 19:158, 20:234, 21:195, 22:202, 23:168, 24:147, 25:230, 26:199, 27:156, 28:165, 29:163, 30:194, 31:234, 32:191, 33:200, 34:195, 35:181, 36:158, 37:170, 38:194, 39:128, 40:188, 41:216, 42:196, 43:207, 44:192, 45:158, 46:256, 47:214, 48:231, 49:215, 50:198, 51:213, 52:213, 53:195, 54:257, 55:193, 56:275, 57:137, 58:147, 59:231, 60:172, 61:185, 62:180, 63:174, 64:283, 65:153, 66:202, 67:313, 68:199, 69:362, 70:137, 71:208, 72:213, 73:213, 74:166, 75:229, 76:210, 77:154, 78:231, 79:199, 80:185, 81:240, 82:214, 83:293, 84:267, 85:188, 86:278, 87:178, 88:213, 89:217, 90:154, 91:135, 92:341, 93:155, 94:258, 95:283, 96:336, 97:202, 98:156, 99:185, 100:200.

**Test:** 1:31, 2:49, 3:126, 4:106, 5:98, 6:105, 7:160, 8:166, 9:55, 10:192, 11:83, 12:217, 13:195, 14:46, 15:76, 16:113, 17:165, 18:133, 19:135, 20:184, 21:148, 22:39, 23:130, 24:186, 25:48, 26:76, 27:140, 28:158, 29:171, 30:143, 31:196, 32:145, 33:50, 34:203, 35:198, 36:126, 37:121, 38:125, 39:37, 40:133, 41:123, 42:156, 43:172, 44:54, 45:152, 46:146, 47:73, 48:78, 49:303, 50:74, 51:144, 52:189, 53:164, 54:121, 55:113, 56:136, 57:160, 58:176, 59:94, 60:147, 61:159, 62:232, 63:155, 64:168, 65:71, 66:147, 67:71, 68:187, 69:54, 70:152, 71:68, 72:131, 73:112, 74:137, 75:88, 76:205, 77:162, 78:72, 79:101, 80:133, 81:213, 82:162, 83:73, 84:172, 85:34, 86:110, 87:56, 88:68, 89:177, 90:146, 91:234, 92:150, 93:244, 94:133, 95:89, 96:97, 97:134, 98:121, 99:97, 100:198.

## RUL mapping validation

Test unit first-appearance order was measured as 1 through 100 and independently matched the sorted unique Test unit IDs. RUL has exactly 100 rows, so RUL physical line `n` maps to Test unit `n`. The implementation refuses the mapping if order or row count differs.

| Test unit | RUL physical line | Last observed cycle | RUL label |
| ---: | ---: | ---: | ---: |
| 1 | 1 | 31 | 112 |
| 51 | 51 | 144 | 114 |
| 100 | 100 | 198 | 20 |

## Raw-index traceability

Every Train/Test value retains `split`, project-relative path, file SHA-256, 1-based physical line, explicit 0-based data-row index, unit, cycle, 1-based source-column index, contract column name, parsed value, and original token. Lookup re-reads the identified physical line and checks the token before declaring a match. Default, relative, and absolute in-project input-directory arguments all publish the same `FD001/...` paths; directories outside the authorized project root are rejected before loading.

For RUL, every mapping entry freshly reopens `FD001/RUL_FD001.txt`, verifies that the file SHA-256 is unchanged, rereads the recorded physical line and source column 1, parses the token, and compares both token and numeric label with the validated row. All 100 RUL references passed. Tests explicitly cover valid fresh rereads, unavailable physical lines, mismatched stored values, project-relative path consistency, blank-line-aware addressing, source-column correctness, malformed input rejection, duplicate keys, cycle gaps, and unsafe RUL ordering.

## Phase A gate

All eleven Phase A gate checks passed: three files loaded, hashes recorded, both sequence schemas, RUL schema, Train/Test semantic separation, stable RUL mapping, Train/Test unit-cycle integrity, Train/Test raw-reference reread, fresh RUL raw-reference reread, and the 3-setting/21-sensor mapping. Phase B was therefore permitted to run.
