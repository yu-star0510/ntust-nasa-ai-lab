# Work Item Control and Acceptance Register

## 工作單欄位

每張工作單依下方第一筆的格式記錄。派工前必須填寫以下欄位，待執行或待審查欄位在取得證據後更新。

| 欄位 | 填寫規則 |
| --- | --- |
| `WORK_ITEM_ID`、`MILESTONE`、`TASK_NAME` | 使用唯一工作單 ID，指明里程碑及任務。 |
| `FROM`、`TO`、`AUTHORIZED_BY`、`STATUS` | 指明派工者、執行者、批准者、目前狀態。 |
| `SCOPE`、`INPUT` | 明確定義工作範圍、輸入及適用的 GitHub `main` 最新 `AGENTS.md`。 |
| `ALLOWED_CHANGES`、`READ_ONLY_SCOPE` | 列明可改動的檔案或資料及唯讀範圍，未明確授權的項目預設唯讀。 |
| `DELIVERABLES`、`ACCEPTANCE_CRITERIA`、`STOP_IF` | 列明可驗證交付物、逐項驗收條件及須停止的情況。 |
| `EXIT_CODE`、`COMMIT_ID`、`COMMIT_SHA256`、`GITHUB_URL` | 記錄關鍵指令實際結束碼、完整 Git Object ID、SHA-256 摘要及其計算對象、儲存庫與提交連結。 |
| `WORKER_REPORT`、`BRAIN_REVIEW`、`STUDENT_APPROVAL` | 分別記錄 Worker 執行證據、Brain 獨立審查與 STUDENT 的正式批准範圍。 |

## 狀態與驗收流程

`PROPOSED` → `STUDENT_APPROVED` → `COMMAND_DISPATCHED` → `READY_FOR_REVIEW` → `BRAIN_REVIEWED` → `PASS` / `FAIL` / `BLOCKED`

1. Brain 擬定工作單前，先從 GitHub 讀取 `main` 最新 `AGENTS.md`。每張工作單必須寫明「Own Worker 必須遵守 GitHub `main` 最新 `AGENTS.md`」。
2. STUDENT 正式批准後，Brain 才可派工。同一時間只允許一張已獲准執行的工作單。
3. Worker 依授權執行、驗證、Commit、Push 並確認遠端成果後，才可把交付狀態更新為 `READY_FOR_REVIEW`。如先遇到停止條件，立即停止，於 `WORKER_REPORT` 回報 `BLOCKED` 及已取得證據，交由 Brain 記錄審查結果。
4. Brain 讀取 GitHub `main` 的實際檔案與提交，確認公開範圍，逐項核對驗收條件，記錄審查證據及最終 `PASS`、`FAIL` 或 `BLOCKED`。只有 Brain 可記錄 `BRAIN_REVIEW` 及最終結果。
5. 前項工作須經 Brain 驗收通過，下一張工作單須另經 STUDENT 正式批准。只有 STUDENT 可批准啟動下一項工作。
6. 回報引用既有成果提交。如更新本登錄所形成的後續提交包含回報本身，該後續提交的 ID 與摘要由執行報告提供，避免提交自我引用。

## WO-M0-001

| 欄位 | 紀錄 |
| --- | --- |
| `WORK_ITEM_ID` | `WO-M0-001` |
| `MILESTONE` | `M0` |
| `TASK_NAME` | Initialize AI Team Governance |
| `FROM` | STUDENT-MAIN Brain |
| `TO` | MAIN Own Worker (Codex) |
| `AUTHORIZED_BY` | STUDENT |
| `STATUS` | `PASS`（STUDENT-MAIN Brain 已完成 GitHub 遠端獨立驗收；M1 尚未授權） |
| `SCOPE` | 在既有 FD001 專案根目錄建立治理文件、初始化或確認 Git、建立公開的 `ntust-nasa-ai-lab`、提交、推送及驗證 GitHub `main`。本工作單僅適用 M0。Own Worker 必須遵守 GitHub `main` 最新 `AGENTS.md`。儲存庫及治理均未建立時，依本工作單的一次性 M0 初始化授權先建立 `AGENTS.md`。 |
| `INPUT` | STUDENT 正式批准的 M0 工作單、既有本地專案根目錄、STUDENT 已驗證的 GitHub 帳號。 |
| `ALLOWED_CHANGES` | `AGENTS.md`、`ROADMAP.md`、`WORK_ITEM.md`、`DECISIONS.md`、保護資料與機密的 `.gitignore`，以及完成本工作單所需的 Git 與指定 GitHub 儲存庫操作。 |
| `READ_ONLY_SCOPE` | `synthetic_sensor.csv`、全部 FD001 原始資料及其他未授權的本地資料和學生研究成果。M0 不得讀取或分析 FD001 原始資料。 |
| `DELIVERABLES` | 四份完整治理文件、`.gitignore`、公開儲存庫的 `main` 提交及 Worker 執行報告。 |
| `ACCEPTANCE_CRITERIA` | 確認正確專案根目錄及本地 `main`。GitHub `main` 可讀取四份文件，角色、唯讀、停止、Git 同步及審查規範完整，利害關係人與里程碑均已定義。確認公開儲存庫名稱、可見性及預設分支；驗證提交與本地一致，歷史限獲准公開的檔案。報告須附提交 ID、SHA-256、GitHub 連結及逐項檢查結果。 |
| `STOP_IF` | 找不到正確根目錄、GitHub 未授權或無法連線、同名遠端存在衝突、無法安全處理既有 Git 變更、治理文件不完整、無法確認公開資料安全、同步失敗或無法驗證遠端成果。 |
| `EXIT_CODE` | `git init`、`git add`、`git diff --cached --check`、`git commit`、`git remote add`、首次 `git push -u origin main` 及 `git rev-parse HEAD` 成功時皆回傳 `0`。GitHub 建立儲存庫 API 回傳 HTTP `201`。 |
| `COMMIT_ID` | 首次成果提交的 Git SHA-1 Object ID 為 `b18281492175a103f5d6c4dcf6339348573b98c3`。 |
| `COMMIT_SHA256` | `0b8471cc37174678b3591696e240bb9a96178c4bc4d8331dac900f8920dfb9b8`，對 `git cat-file commit` 輸出的原始提交內容位元組計算，未包含 Git Object 的型別與長度標頭。 |
| `GITHUB_URL` | [公開儲存庫](https://github.com/yu-star0510/ntust-nasa-ai-lab)及[首次成果提交](https://github.com/yu-star0510/ntust-nasa-ai-lab/commit/b18281492175a103f5d6c4dcf6339348573b98c3)。 |
| `WORKER_REPORT` | 已從 GitHub 驗證儲存庫為公開，預設分支為 `main`。首次推送後，遠端 `main` 與本地成果提交一致，四份治理文件及 `.gitignore` 均可讀取，且五個檔案的 Git blob ID 與本地相符。公開內容清單僅有這五個獲准檔案，NASA 原始資料、合成 CSV 及敏感檔案均未列入。 |
| `BRAIN_REVIEW` | **PASS（2026-11-23）**：STUDENT-MAIN Brain 透過 GitHub 連線獨立讀取 `main` 的 `AGENTS.md`、`ROADMAP.md`、`WORK_ITEM.md`、`DECISIONS.md` 及 `.gitignore`；確認 Repository 為 PUBLIC、預設分支為 `main`、審查前 HEAD 為 `9536c1da440b73a6d519c627df9a2d3c93487080`，首次提交 `b18281492175a103f5d6c4dcf6339348573b98c3` 與後續狀態提交的父子關係正確，首次提交含五個授權檔案、後續提交僅修改 `WORK_ITEM.md`，遠端樹僅含五個 M0 授權檔案，治理內容符合 M0 工作單。**驗證限制：**無法獨立存取學生的 Windows 本地工作樹或重算 `git cat-file commit` 的 SHA-256；上述本地結果與 SHA-256 依 Worker 報告，未冒充獨立驗證。下一階段 M1 仍需 STUDENT 另行正式批准；本次驗收不構成派工。 |
| `STUDENT_APPROVAL` | 已批准 `WO-M0-001`。後續里程碑須分別取得正式批准。 |


## WO-M1-RESEARCH-001

MAIN → STUDENT-RESEARCH Brain-to-Brain 正式派工登錄（由 STUDENT 轉交）。此工作單不直接下令 Research Own Worker，亦不表示已跨對話送達。

| 欄位 | 內容 |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M1-RESEARCH-001 |
| MILESTONE | M1 |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-RESEARCH Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT（已要求啟動 M1，並指示 MAIN 完成正式派工） |
| STATUS | BRAIN_REVIEWED（AMENDMENT-001 / EVIDENCE_RERUN_RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW；待 STUDENT-MAIN 最終驗收，M1 尚未 PASS；M2 維持 BLOCKED） |
| PREREQUISITE | WO-M0-001=PASS；不得提前啟動 M2 |
| INPUT | **修訂後有效輸入**：本地專案根目錄 `C:\Users\z2324\Desktop\NTUST\115\115_1\115-1\20261123` 下之 **`synthetic_sensor.csv`**（完整路徑 `C:\Users\z2324\Desktop\NTUST\115\115_1\115-1\20261123\synthetic_sensor.csv`）；由 STUDENT 透過 Windows 檔案總管提供位置，尚待 Worker 在本地實際查核；預期六筆，實際筆數、內容及 SHA-256 均未驗證；來源類型 SYNTHETIC；READ_ONLY。原先 `data/intro/synthetic_sensor.csv` 為被取代的路徑，歷史保留於下方阻礙紀錄。 |
| SCOPE | 由 Research Brain 負責安排及審查 Research Own Worker，使用指定 CSV 進行資料品質檢查、簡易數值顯示及 Sensor Trend；不得直接指派 Web Worker 或進入 M2。 |
| OUTPUT | 可重現 CSV loader/profiler、欄位與數值顯示、依實際欄位建構並回查來源的簡易 Sensor Trend、rows/columns/duplicates/missing 報告、測試與真實執行證據，Research Brain 回報及 GitHub 提交。 |
| ALLOWED_CHANGES | 研究程式 research/m1_csv_profile.py、research/m1_sensor_trend.py；測試 tests/test_m1_profile.py；報告 reports/M1_SYNTHETIC_PROFILE.md、reports/M1_EXECUTION_EVIDENCE.md、reports/M1_TREND_VALIDATION.md；最小限度調整 .gitignore 放行前述程式及報告並保護原始檔；更新 WORK_ITEM.md 執行證據欄位但最終 PASS 只由 MAIN 記錄。變更檔名需 Research Brain 核准且不得擴大範圍。 |
| READ_ONLY_SCOPE | **有效新路徑 `synthetic_sensor.csv`（專案根目錄）**、歷史舊路徑 `data/intro/synthetic_sensor.csv`、全部 NASA FD001 原始檔及其他未授權本地資料皆 READ_ONLY；禁止更動、覆寫、複製公開、重新保存或上傳；`.gitignore` 須維持對根目錄 `synthetic_sensor.csv` 及其他原始資料的排除保護。 |
| ACCEPTANCE | 實測 data rows=6（非預填）、欄數與真實欄名／順序、exact duplicate rows 定義與數量、missing 總數與逐欄數量及判定規則；提供未修改數值的簡易顯示與原始 Sensor Trend；輸入 SHA-256 執行前後一致；可重現程式和測試；真實 command、timestamp、Python version、stdout、stderr、exit code；Research Brain 實際審閱 GitHub main；MAIN 再獨立驗收。 |
| STOP_IF | 找不到或無法安全讀取 CSV、列數不是 6、缺少可用欄位而無法合法呈現趨勢、欄位或數值錯配、原始檔 hash 改變、缺真實執行證據、GitHub push/驗證失敗、需公開原始資料或敏感資訊、AGENTS.md 衝突、其他未完工作衝突或任務擴權；遇 STOP_IF 回報 BLOCKED。 |
| GOVERNANCE | STUDENT-RESEARCH Brain 派工前與 Research Own Worker 開工前各自讀取 GitHub main 最新 AGENTS.md 並遵守；單一 main 分支循序執行，檢查 staged files；不得 force push；Worker 完成 Commit/Push 後 Research Brain 從遠端審查；只有 MAIN 可決定最終 PASS。 |
| WORKER_REPORT | **歷史阻礙（2026-11-23 17:24:45 +08:00；完整保留）**：Research Own Worker 依原指定路徑 `data/intro/synthetic_sensor.csv` 檢查時檔案不存在，觸發 STOP_IF；提交 `c58aec1c7c451001dedf06c5df0299bd3506d18e` 僅登錄阻礙，未讀取資料或建立成果。**AMENDMENT-001 重新執行（2026-11-23；READY_FOR_REVIEW）**：Worker 從 GitHub `main` 核對治理及修訂提交 `f6e805c783f4e8783203c6c1c55f13319c67e8ba`，同步乾淨的本地 `main`，以 READ_ONLY 方式讀取根目錄 `synthetic_sensor.csv`。實測 file size=234 bytes、rows=6、columns=4、欄名依序為 `timestamp`、`load_pct`、`coolant_out_c`、`oil_pressure_bar`、exact duplicates=1、missing=1，逐欄 missing 為 0/0/0/1；SHA-256 before/after 均為 `cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`。因無 Cycle 欄，Trend 使用 1-based Row Index × `load_pct`，6/6 點回查原始列成功，無插值／平滑／補值。`python -m unittest -v tests/test_m1_profile.py` 實際通過 7/7 tests、Exit Code 0。新增兩個獲准研究程式、一個測試及三份報告，最小調整 `.gitignore` 只放行獲准成果並持續排除 CSV／NASA 資料；未執行 M2 或網站工作。成果提交 ID、Commit SHA-256、GitHub URL 與遠端驗證由本次 Worker Return 提供，避免提交自我引用。 |
| BRAIN_REVIEW | **STUDENT-RESEARCH Brain M1 Amendment-001 成果獨立審查（2026-11-23；RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW；非 MAIN PASS）**：Research Brain 已從 GitHub `main` 實際讀取最新 `AGENTS.md`、`WORK_ITEM.md`、成果 Commit `30ac2a6e2692cb8b885e518b8493a5cfa1e8813f`、研究程式 `research/m1_csv_profile.py`、`research/m1_sensor_trend.py`、測試 `tests/test_m1_profile.py`、三份 M1 報告及 `.gitignore`；核對提交親代為 `f6e805c783f4e8783203c6c1c55f13319c67e8ba`，修改檔案恰為八個獲准項目；GitHub commit tree 不含 `synthetic_sensor.csv`、FD001 原始檔或其他未授權資料。程式確實從 CSV 解析標題列、檢查欄位寬度、計算 rows/columns/exact duplicates/missing by column、顯示原始列範例，並產生可依 Row Index 與原始欄位對照之 Sensor Trend；測試程式有七個可執行的測試。Worker 執行報告記載 rows=6、columns=4、duplicates=1、missing=1（逐欄 0/0/0/1）、trend 6/6、7/7 tests、Exit Code 0、檔案前後 SHA-256 相同，彼此一致，故研究層級接受交 MAIN 獨立最終審查。**明確限制**：原始 CSV 未公開，Research Brain 無法直接存取學生 Windows 檔案以獨立重算數值、SHA-256 或重跑本地測試；Commit SHA-256 亦僅有 Worker 報告、未獨立重算；執行證據檔的 stdout/stderr 為節錄／整理摘要，非完整逐位元組終端紀錄，另有預檢命令使用文字佔位描述。若 MAIN 要求完整原始指令與 stdout/stderr，需在同張 M1 工作單內補交證據，不能擴權或宣告 PASS。M2 維持 BLOCKED。**歷史審查紀錄：** **MAIN 阻礙核查（非 M1 PASS）**：2026-11-23，MAIN 已從 GitHub main 實際讀取 AGENTS.md、WORK_ITEM.md、提交 c58aec1c7c451001dedf06c5df0299bd3506d18e 及遠端檔案樹，確認 Worker 的 BLOCKED 紀錄已推送且僅更動 WORK_ITEM.md。依回報，指定相對路徑 data/intro/synthetic_sensor.csv 在 Worker 當時工作目錄下不存在，觸發 STOP_IF；CSV 數值、行列數、SHA-256、趨勢與測試均未產出。**限制**：MAIN 無法直接查核學生本地檔案是否存在於其他路徑，亦未取得獨立原始 PowerShell 執行紀錄，Test-Path 的 Exit Code 2 應由 Research Brain 確認來源。**STUDENT-RESEARCH Brain 獨立阻礙審查（2026-11-23；BLOCKED / INPUT_NOT_FOUND）**：Research Brain 已重新讀取 GitHub main 的 AGENTS.md、WORK_ITEM.md，以及 Worker 提交 c58aec1c7c451001dedf06c5df0299bd3506d18e 與 MAIN 核查提交 f2525361caa2de24691bc859346ef8e9a83bc51a；已驗證 Worker 提交只變更 WORK_ITEM.md，未提交原始 CSV 或分析程式。依 Worker 文字回報，指定相對路徑的 Test-Path 檢查未通過，停止符合工作單 STOP_IF；但 Research Brain 無法直接存取 Worker 的 Windows 本地磁碟、當時工作目錄及原始終端紀錄，所以不能獨立認定本地電腦完全沒有該 CSV。Test-Path 自身通常只輸出布林值；Exit Code 2 的來源（例如額外 exit 2 錯誤處理）無完整原始命令及執行紀錄可核對，仍待補證。rows/columns/duplicates/missing、CSV SHA-256 與 Sensor Trend 均未執行，M1 不符合 PASS 條件。請先由 STUDENT 查明檔案位置；若須修訂輸入路徑或重建測試資料，需 MAIN 修訂工作單並取得必要批准後，Research Brain 才可重新派工。Research Brain 已完成此階段阻礙審查及 Brain-to-Brain Return；M1 與 M2 持續 BLOCKED。 |
| STUDENT_APPROVAL | 已授權啟動 M1；M2 尚未獲執行授權。 |

### RETURN FORMAT

TYPE=BRAIN_TO_BRAIN_RETURN；WORK_ITEM_ID=WO-M1-RESEARCH-001；FROM=STUDENT-RESEARCH Brain；RETURN_TO=STUDENT-MAIN Brain；STATUS=READY_FOR_MAIN_REVIEW/FAIL/BLOCKED。
須包含：input path、source type、actual rows、columns、column names、duplicates、missing、missing by column、missing rules、source SHA-256 before/after、sensor trend/display evidence、actual command、timestamp、runtime、exit code、stdout/stderr、test results、Commit ID、SHA-256 與計算對象、GitHub Commit URL、Push status、GitHub verification、data safety、Research Brain review、逐項 acceptance 及 blockers。

**M2 GATE:** M1 只有在 MAIN 實際讀取 GitHub 成果並正式記錄 PASS 後才完成；須再取得 STUDENT 對 M2 執行的正式批准。

## WO-M1-RESEARCH-001 — AMENDMENT-001（Input Path Correction / Re-dispatch）

- `DATE`: 2026-11-23
- `TYPE`: BRAIN_TO_BRAIN_WORK_ORDER_AMENDMENT
- `FROM`: STUDENT-MAIN Brain
- `TO`: STUDENT-RESEARCH Brain
- `RETURN_TO`: STUDENT-MAIN Brain
- `AUTHORIZED_BY`: STUDENT 提供實際本地路徑，Research Brain 提出正式修訂與重新派工請求；沿用已授權的 M1 範圍。
- `PRIOR_STATUS`: BLOCKED / INPUT_NOT_FOUND。原始 Worker 回報、GitHub Commit `c58aec1c7c451001dedf06c5df0299bd3506d18e` 及兩級 Brain 阻礙審查完整保留於 `WO-M1-RESEARCH-001`。
- `CAUSE`: 原工單指定 `data/intro/synthetic_sensor.csv`，STUDENT 於 Windows 檔案總管發現實際檔案位於專案根目錄；目前僅路徑已確認，未驗證檔案內容。
- `OLD_INPUT`: `data/intro/synthetic_sensor.csv`（被取代，不得再作為本輪指定輸入）。
- `NEW_INPUT`: `synthetic_sensor.csv`（專案根目錄相對路徑），完整路徑 `C:\Users\z2324\Desktop\NTUST\115\115_1\115-1\20261123\synthetic_sensor.csv`。
- `NEW_STATUS`: COMMAND_DISPATCHED / RELAY_STATUS=PENDING_STUDENT_RELAY（僅授權 Research Brain 重新派工，並不宣稱已送達或 Own Worker 已執行）。
- `UNCHANGED`: 原資料 READ_ONLY、禁止 GitHub 公開上傳；rows/columns/duplicates/missing、Basic Display、Sensor Trend、輸入前後 SHA-256、可重現測試、真實命令／Exit Code／stdout／stderr、Commit+Push、Research Brain 遠端獨立審查及 MAIN 最終驗收均保持原驗收條件。
- `RESTART_CONTROL`: STUDENT-RESEARCH Brain 在收到此修訂工單後，須先從 GitHub `main` 重讀最新 `AGENTS.md`、`WORK_ITEM.md`；只可由其管理 Research Own Worker；Own Worker 開工前也須重新核對治理規則與修訂後輸入，先檢查檔案可讀及 SHA-256，再執行 CSV 分析。
- `STOP_IF`: 新輸入不存在／不可讀、實際筆數非六筆、讀取或解析不合規、數值／雜湊不一致、無真實執行證據、公開資料風險或 GitHub 無法驗證，應回報 BLOCKED，不可自動替換或產生假資料。
- `M2_GATE`: M1 仍未 PASS，M2 持續 BLOCKED。STUDENT-MAIN Brain 必須審查 GitHub 真實結果並決定 M1 PASS；後續須 STUDENT 另行正式批准 M2。
- `EXECUTION_RESULTS`: READY_FOR_REVIEW；根目錄 `synthetic_sensor.csv` 已以 READ_ONLY 方式驗證：234 bytes、rows=6、columns=4、exact duplicates=1、missing=1；SHA-256 before/after=`cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`；Row Index × `load_pct` Trend 6/6 點可回查；7/7 tests 通過、Exit Code 0。Research Brain 與 MAIN 尚未進行最終驗收。


## WO-M1-RESEARCH-001 — MAIN EVIDENCE REVIEW (2026-11-23)

- **REVIEWER:** STUDENT-MAIN Brain
- **REVIEW_TARGET:** GitHub `main` at `04e16f987c3ca45cb65e917212ecff934fe1decd`; Worker delivery `30ac2a6e2692cb8b885e518b8493a5cfa1e8813f`.
- **MAIN_DECISION:** `BLOCKED / EVIDENCE_INCOMPLETE`（可補證的驗收關卡，非程式功能退件；未核發最終 `PASS`）。
- **INDEPENDENT_GITHUB_CHECKS:** 從 GitHub 讀取最新 `AGENTS.md`、`WORK_ITEM.md`、`.gitignore`、兩個研究程式、`tests/test_m1_profile.py`、三份 M1 報告、遠端提交與檔案樹。確認 Worker delivery commit 恰含八個授權檔案（`.gitignore`、`WORK_ITEM.md`、兩個 research 程式、一個測試、三份報告），Research Brain 後續 commit 為 `WORK_ITEM.md` 審查更新；遠端樹沒有原始 `synthetic_sensor.csv` 或 NASA FD001 檔案。程式確實實作動態 CSV 解析、rows/columns、exact duplicates、missing by column、有限數值欄位辨識、原始列顯示和按來源列映射的六點 trend；測試程式定義七個測試。
- **REPORTED_RESULTS_NOT_INDEPENDENTLY_REMEASURED:** rows=6、columns=4、欄位 `timestamp/load_pct/coolant_out_c/oil_pressure_bar`、duplicates=1、missing=1（逐欄 0/0/0/1）、6/6 trend、7/7 tests、Exit Code=0、輸入 SHA-256 `cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377` 及執行前後一致；這些源自 Worker 在 GitHub 的執行報告，而非 MAIN 直接讀取學生 Windows CSV。
- **EVIDENCE_GAP:** `reports/M1_EXECUTION_EVIDENCE.md` 只提供選摘的 stdout/stderr 結果與測試摘要，缺少完整終端原始輸出；輸入預檢仍以 `python -c <csv structure preflight using csv.reader>` 佔位，無法復原精確命令。因此原工作單要求的完整真實執行證據尚未充分交付。
- **REQUIRED_REMEDIATION_TO_RESEARCH_BRAIN:** 在同一 M1 工作單內補交可復核的實際預檢命令、逐條 Profile/Trend/Unittest 指令的完整 stdout/stderr 與 Exit Code、執行時間／工作目錄／Python 版本、補證前後輸入 SHA-256。若原終端紀錄未保存，允許在相同本地唯讀 CSV 上重新執行、產生新的真實原始記錄，標記 `EVIDENCE_RERUN`，不可將新執行冒稱為既有執行。遮蔽敏感本地帳號和絕對路徑，但不得修改數值、測試輸出或錯誤。不得上傳原始 CSV。
- **REVIEW_CHAIN:** STUDENT-RESEARCH Brain 先驗證補證內容，從 GitHub `main` 讀取及審查後再回傳 STUDENT-MAIN；MAIN 依 GitHub 實際結果決定 `PASS/FAIL/BLOCKED`。
- **M2_GATE:** M1 未 PASS；M2 不得開始且須 STUDENT 另行正式批准。
- **RETURN_TO:** STUDENT-RESEARCH Brain（經 STUDENT 轉交），不得由 MAIN 直接指揮 Research Own Worker。

## WO-M1-RESEARCH-001 — EVIDENCE REMEDIATION WORKER RECORD (2026-11-23)

- **EVIDENCE_TYPE:** `EVIDENCE_RERUN`；原始逐命令紀錄不完整，因此依正式補證派工重新執行，未冒稱為先前 17:43–17:48 的紀錄。
- **EXECUTION_WINDOW:** 2026-11-23 17:58:41.449–17:59:51.250 UTC+08:00。
- **ENVIRONMENT:** PowerShell 7.6.9、Python 3.12.7、branch `main`、baseline HEAD `526641bc83b58f18c4c83a90ae8ac50eb2ff1c2f`；本地工作目錄於同步及補證前乾淨。
- **PREFLIGHT:** 完整 PowerShell here-string 與 `python -c $preflight` 已記錄於 `reports/M1_EXECUTION_EVIDENCE.md`；Exit Code 0；rows=6、columns=4、六列 row widths 均為 4；stdout 完整、stderr 為空。
- **PROFILE:** `python research/m1_csv_profile.py --input synthetic_sensor.csv`，Exit Code 0；完整 stdout 與空 stderr 已記錄，僅遮蔽公開報告中的本地使用者路徑。
- **TREND:** `python research/m1_sensor_trend.py --input synthetic_sensor.csv`，Exit Code 0；完整六點 trend/source mapping stdout 與空 stderr 已記錄。
- **UNITTEST:** `python -m unittest -v tests/test_m1_profile.py`，Exit Code 0；完整 stdout（空）與 stderr（7 個 verbose test 結果、Ran 7 tests、OK）已記錄；7 passed、0 failed、0 errors。
- **INTEGRITY:** SHA-256 before/after 均為 `cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`，亦與先前 Worker 報告一致；來源未修改。
- **SCOPE:** 本輪僅更新 `reports/M1_EXECUTION_EVIDENCE.md` 與本 Worker 補證紀錄；未修改研究程式、測試、其他報告、`.gitignore`、CSV 或 NASA FD001 資料，未執行 M2。
- **DELIVERY:** 補證提交 ID、GitHub URL、Push 與遠端可讀性驗證由 Worker Return 提供，避免提交自我引用。Worker 僅回報 `READY_FOR_REVIEW`，不宣告 M1 PASS。

## WO-M1-RESEARCH-001 — RESEARCH EVIDENCE REMEDIATION REVIEW (2026-11-23)

- **REVIEWER:** STUDENT-RESEARCH Brain
- **TYPE:** INDEPENDENT_GITHUB_REVIEW
- **REVIEW_STATUS:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW` (非 M1 最終 PASS)
- **GITHUB_BASELINE:** `526641bc83b58f18c4c83a90ae8ac50eb2ff1c2f`
- **WORKER_EVIDENCE_COMMIT:** `3e655fd0c370152a2e55cbde5cbe6859722ac516`
- **INDEPENDENT_CHECK:** 已從 GitHub `main` 讀取最新 `AGENTS.md`、`WORK_ITEM.md`、`reports/M1_EXECUTION_EVIDENCE.md`、Worker Commit/Compare 與遞迴 Git tree。核對本次僅修改 `WORK_ITEM.md` 及 `reports/M1_EXECUTION_EVIDENCE.md`，且 Commit 以 MAIN 審查提交為親代；GitHub `main` 原始資料檔 `synthetic_sensor.csv` 及 NASA FD001 檔均未公開。兩個 M1 研究程式的 Git Blob ID 維持不變，原研究成果未遭修改。
- **EVIDENCE_REVIEW:** 已確認新報告明確標示 `EVIDENCE_RERUN`，保留前次歷史；具完整 PowerShell CSV 預檢 here-string / `python -c $preflight`、本次 Profile/Trend/Unittest 命令、各步驟起迄時間與 Exit Code；完整列示 Profile/Trend stdout（Profile 的本地使用者絕對路徑已明示遮蔽）、stderr 空值，以及 unittest stdout 空值、七項 verbose stderr、結果 7 passed / 0 failed / 0 errors。PowerShell 7.6.9、Python 3.12.7 及工作目錄均有記錄。
- **REPORTED_MEASUREMENTS:** rows=6；columns=4；column_names=[timestamp,load_pct,coolant_out_c,oil_pressure_bar]；duplicates=1；missing=1，missing_by_column=0/0/0/1；Row Index × load_pct 的 6 個 trend 點可回查；預檢、Profile、Trend、Unittest 的 Exit Code 均為 0；輸入 SHA-256 before/after 均為 `cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`，且與先前 Worker 回報一致。
- **LIMITATION:** 原始 CSV 留在學生本地且未上傳，Research Brain 不可獨立重算輸入檔 SHA-256、資料數值或在學生端重跑；GitHub 提供的是 Worker 公開保存的本地執行紀錄，並非第三方執行環境的自動簽章逐位元組紀錄。Worker 所報 Commit SHA-256 未由 Research Brain 獨立重算；所有地方均未將此驗證層級冒稱為直接本地驗證。
- **DECISION:** 本次 MAIN 指定之執行證據缺口已依補證報告形式補齊，Research Brain 接受補證並提交 STUDENT-MAIN 獨立最終驗收；`M1_FINAL_PASS=PENDING_MAIN`；`M2=BLOCKED`。
