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
| STATUS | PASS（AMENDMENT-001 / EVIDENCE_RERUN；STUDENT-MAIN Brain 已完成 GitHub 獨立審查並正式驗收 M1；M2 尚未取得 STUDENT 執行批准） |
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

## WO-M1-RESEARCH-001 — MAIN FINAL ACCEPTANCE (2026-11-23)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** `WO-M1-RESEARCH-001` / `AMENDMENT-001`
- **FROM:** STUDENT-MAIN Brain
- **RESEARCH_RETURN:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW`
- **MAIN_DECISION:** `PASS`（M1 驗收結案；先前 INPUT_NOT_FOUND 與 EVIDENCE_INCOMPLETE 歷史保留）。
- **REVIEWED_GITHUB_HEAD:** `adb1f6760052d928173e517c2f33e2dcdc8836d2`
- **WORKER_EVIDENCE_COMMIT:** `3e655fd0c370152a2e55cbde5cbe6859722ac516`；已從 GitHub 核對其變更僅 `WORK_ITEM.md` 和 `reports/M1_EXECUTION_EVIDENCE.md`。
- **RESEARCH_REVIEW_COMMIT:** `adb1f6760052d928173e517c2f33e2dcdc8836d2`；已從 GitHub 核對其變更僅 `WORK_ITEM.md`。
- **EVIDENCE_INSPECTED:** GitHub 最新 `AGENTS.md`、`WORK_ITEM.md`、兩個 M1 研究程式、七項測試定義、三份 M1 報告、完整 `EVIDENCE_RERUN` 區段、補證與 Research 審查 Commit、Git tree。輸入 CSV 與 NASA FD001 原始檔未出現在遠端樹。
- **MEASUREMENTS_FROM_WORKER_RERUN_EVIDENCE:** 預檢/profile/trend/unittest 各 Exit Code=0；rows=6；columns=4；欄位依序 `timestamp` / `load_pct` / `coolant_out_c` / `oil_pressure_bar`；exact duplicates=1；missing=1，逐欄 0/0/0/1；Sensor Trend 採 Row Index × `load_pct` 且原始資料映射 6/6；7 tests passed、0 failed、0 errors。
- **SOURCE_INTEGRITY_REPORTED:** `SHA-256 before = SHA-256 after = cd536b46eb628909fdc986bbad956c24a2e50afb287968998374befc62204377`。CSV 保持 `SYNTHETIC`、READ_ONLY 並從公開 Git 排除。
- **EVIDENCE_GAP_CLOSED:** GitHub `reports/M1_EXECUTION_EVIDENCE.md` 補證段已具完整 PowerShell here-string、實際 `python -c $preflight`、Profile/Trend/Unittest 命令、執行時間、Exit Code、完整（公開路徑遮蔽）stdout/stderr、Python/PowerShell 版本、前後 hash。未將補證冒稱原先執行紀錄。
- **VERIFICATION_LIMITATIONS:** MAIN 審查的是 GitHub 保存的 Worker 本地執行紀錄與 GitHub 程式，無法直接存取學生 Windows 原始 CSV、獨立重算其 SHA-256 或重新執行本地測試；Commit SHA-256 未獨立重算。這些不是 M1 所授權的公開資料要求，報告已披露驗證層級，足以完成本次程式與執行證據驗收。
- **ACCEPTANCE:** 本工作單所要求的 Profile、Basic Display、Sensor Trend、Source Integrity、真實執行證據、Research Brain 審查與 GitHub 提交均符合；最終 `M1=PASS`。
- **NEXT_GATE:** `M2=NOT_AUTHORIZED / BLOCKED_PENDING_STUDENT_APPROVAL`。須 STUDENT 另行正式批准 M2，MAIN 在下一張派工前重新讀取 GitHub main 最新 `AGENTS.md`，並確認工作單與資料契約交接條件；不自動派送 Research Own Worker 或開始 NASA FD001 資料解析。
- **RETURN_TO:** STUDENT（由 STUDENT 決定是否批准 M2）。


## WO-M2-RESEARCH-001 — FD001 Trusted Local Data Validation, Trends and Data Contract

| 欄位 | 正式內容 |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M2-RESEARCH-001 |
| MILESTONE | M2 — Real FD001 Data Integration |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-RESEARCH Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT（2026-11-23 本對話正式指示「進行M2」） |
| STATUS | PASS（2026-11-24；STUDENT-MAIN Brain 已獨立審查 GitHub 成果、接受 Phase A/B 與 FD001_DATA_CONTRACT v1.0.1；M3 尚未取得 STUDENT 授權） |
| PREREQUISITE | WO-M0-001=PASS；WO-M1-RESEARCH-001=PASS，MAIN final acceptance commit 661df6e9741b2d17c86e022776adfba91caa36d4 |
| GOVERNANCE_BASELINE | GitHub main AGENTS.md，派工前已由 MAIN 從 661df6e9741b2d17c86e022776adfba91caa36d4 讀取；Research Brain 與 Own Worker 開工前仍各自重讀最新版本 |
| PROJECT_ROOT | C:\Users\z2324\Desktop\NTUST\115\115_1\115-1\20261123（僅作定位，不需公開私人絕對路徑） |
| INPUT | 已依 Worker 實際執行證據確認本地專案相對路徑 FD001/train_FD001.txt、FD001/test_FD001.txt、FD001/RUL_FD001.txt；TRUSTED_LOCAL、READ_ONLY、NO_EXTERNAL_SOURCE_LOOKUP、NO_DOWNLOAD；原始資料未公開提交。 |
| READ_ONLY_SCOPE | 三個 FD001 原始文字檔、synthetic_sensor.csv、其他學生原始資料、現有 M0/M1 程式及其結果；不得刪除、覆寫、重新保存、移動或公開 Git 上傳原始資料 |
| ALLOWED_CHANGES | 僅限 M2 必要來源程式 research/m2_fd001_validate.py、research/m2_fd001_analysis.py、測試 tests/test_m2_fd001.py、報告 reports/M2_FD001_VALIDATION.md、reports/M2_FD001_QUALITY_TRENDS.md、reports/M2_EXECUTION_EVIDENCE.md、契約 contracts/FD001_DATA_CONTRACT.md、contracts/FD001_DATA_CONTRACT.json、最小限度安全修改 .gitignore 以放行上述成果並持續排除資料，以及 WORK_ITEM.md 的本工作單執行回報。變更檔名/範圍需先由 Research Brain 協調 MAIN 核准。 |
| OUTPUT | Phase A 三檔來源／格式／RUL 語意與 Raw Index 驗證、Phase B 品質統計與可追溯趨勢、欄位定義及網站可使用的 Data Contract（Markdown + JSON）、可重現程式與測試、完整實際執行證據、Research Brain GitHub 獨立審查回報。 |
| ACCEPTANCE | Phase A 全部通過才能 Phase B；行列/Unit/Cycle/3 Settings/21 Sensors/Train-Test-RUL mapping/Raw Index 實際檢查；趨勢和品質結果可回查；Data Contract schema/interface/error handling/provenance 完整；GitHub main 只有獲准程式與非原始資料摘要；Worker Commit+Push、Research Brain 審查、MAIN 再獨立驗收。 |
| STOP_IF | M1 未 PASS、三檔不存在或不可讀、原始 SHA-256 異常變化、schema/Unit-Cycle/RUL 映射不可可靠驗證、Raw Index 無法回查、Phase A 未 PASS、無真實執行證據、需要下載或上網重新查核來源、原始資料公開風險、GitHub 無法 Commit/Push/驗證、與最新 AGENTS.md 衝突、越權觸及 Web/M3。立即 BLOCKED 並回報。 |
| WORKER_REPORT | **2026-11-23 Research Own Worker 執行完成**：開工前從 GitHub `main` 核對治理與 M1 PASS，起始提交 `79392158d20b9fcf657e2329ead6aaf2921ebdc9`。以 READ_ONLY 方式確認 `FD001/train_FD001.txt`、`FD001/test_FD001.txt`、`FD001/RUL_FD001.txt`；before/after SHA-256 分別為 `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`、`3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`、`a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`，前後一致。Phase A PASS：Train=20,631×26、Test=13,096×26、RUL=100×1；Train/Test 各 100 Units，Unit/Cycle/schema/RUL order mapping/Raw Index 全部可驗證，missing/duplicate key/parse/non-finite/cycle gap/order error 均為 0。Phase B PASS：完成 3 settings+21 sensors 的 split-wise min/max/mean/population std、constant/near-constant 規則、可回查的 Train Unit 1 Sensor 2 共 192 點趨勢，以及 `FD001_DATA_CONTRACT` v1.0.0 Markdown/JSON 與六個介面。`python -m unittest -v tests/test_m2_fd001.py` 實際 14/14 通過，Exit Code 0。僅新增/修改工作單授權的程式、測試、三份 M2 報告、兩份契約、最小 `.gitignore` 與本欄；原始資料持續排除，未執行 M3/Web。Commit ID、Commit SHA-256、GitHub URL 與遠端驗證由 Worker Return 提供，避免提交自我引用。 |
| BRAIN_REVIEW | STUDENT-RESEARCH Brain：RESEARCH_ACCEPTED（Commit b739d3ea96306e2136f0f2e6faa9815aa7be01b1）；STUDENT-MAIN Brain：PASS（2026-11-24，見下方 MAIN FINAL ACCEPTANCE）。本地來源數值與雜湊依公開之 Worker EVIDENCE_RERUN 紀錄，非 MAIN 直接存取 Windows 原始資料；Data Contract v1.0.1 獲治理層正式接受，其檔內 main_acceptance=PENDING 是送審狀態，後續交接前需同步元資料並重測。 |
| STUDENT_APPROVAL | 已批准進行 M2；不包含 M3、Web 建置或 M4 Evidence Prompt 執行授權。 |

### M2 Phase A — Trust & Source Semantics (MANDATORY GATE)

1. **Find local files:** 僅在學生既有本地專案中確認 train_FD001.txt / test_FD001.txt / RUL_FD001.txt 的實際相對路徑、檔案存在性、可讀性及大小；不再上網比對 NASA 來源、不下載替代檔。逐檔在檢查前後計算 SHA-256。
2. **Semantics:** Train 是訓練引擎至運轉終點的序列；Test 是各引擎部分觀測的序列，不可將其最後 Cycle 當失效；RUL 為各 Test Engine 在其最後觀測 Cycle 的剩餘壽命標籤，並非模型預測或 Train 原生逐列資料。驗證 Test Unit 的實際順序（以 Unit 首次出現順序及其他可查資料檢查）與 RUL 行數一一對應，不得假設排序而忽略映射風險；若映射不能可靠建立則 BLOCKED。
3. **Schema:** Train/Test 預期每個有效資料列剛好 26 欄、1-based 位置為 1: Unit ID、2: Cycle、3–5: Operational Setting 1–3、6–26: Sensor 1–21；RUL 預期每有效行 1 個非負數值欄。採空白分隔，忽略合法尾端空白但不可忽略實際多餘資料欄；檢查數值型態及 finite、Unit/Cycle 的正整數性。不得預填常見 FD001 rows/units 數量。
4. **Shape & keys:** 分別量測三檔行數、欄數、資料列數、Unit IDs、Unit Count、每 Unit Cycle min/max/長度、Cycle 是否有缺口／倒序、主鍵唯一性（split,unit_id,cycle）、空值、重複及解析異常；RUL 不存在 Unit/Cycle 欄位需標 N/A，不可虛構。
5. **Raw Index & traceability:** Train/Test 每個資料點可回查 split、source-relative-path、source_sha256、physical_line_number (1-based)、data_row_index (明示 0-based 或 1-based)、unit_id、cycle、原始 source_column_index (1-based)、column_name、原始字串或未更動數值。RUL 提供 physical_line_number、Test Unit 映射、last_observed_cycle 及 RUL label。若有空行，physical line number 不等於資料列索引加固定常數，務必以實際行號定位。禁止以合成數值取代原始記錄。
6. **Phase A exit criteria:** 三檔可讀且 SHA-256 穩定；Train/Test 26 欄及 RUL 1 欄解析正確；Train/Test/RUL 語意與映射確認；Unit/Cycle 結構與 Raw Index 可驗證；實際測試與命令/退出碼/輸出證據完整。未全部通過不得開始 Phase B，也不得將契約標為 VALIDATED。

### M2 Phase B — Quality, Traceable Trend, Data Contract (ONLY AFTER A PASS)

1. **Quality:** 每個 split 的 rows/columns/unit counts、各 Unit Cycle 長度、重複整列與重複鍵、missing total/by column、finite 數值檢查、3 Operational Settings + 21 Sensors 的 min/max/mean/std、constant/near-constant 條件及規則。資料品質異常須報告，不得自行補值、刪除原始資料或將所有異常都誤判為來源失效。
2. **Trend:** 依 split + unit_id + sensor_{1..21} 以實際 Cycle 遞增，提供至少一組真實來源對應的趨勢；每一點具 raw source reference，檢查 points 數量、值、cycle、原始行號與欄位一致；不得跨 Train/Test 或 Unit 混合。不得把 Trend 宣稱成健康分數或未實作的 RUL 預測。
3. **Data Contract:** Markdown + JSON 規定 contract_name=FD001_DATA_CONTRACT、schema_version、split、unit_id、cycle、setting_1..3、sensor_1..21、row provenance、file hash、型別、缺失值規則、排序、異常處理及版本。提供 get_units(split)、get_cycles(split,unit_id)、get_sensor_series(split,unit_id,sensor_name)、get_raw_reference(split,unit_id,cycle,column_name)、get_test_rul_label(unit_id)、get_quality_summary(split) 之輸入/輸出/錯誤契約與驗證測試；RUL 原始標籤與衍生 RUL 必須區隔，且不得在未定義與未驗證時將 RUL 當成逐 Cycle 原始值。
4. **Disclosure boundary:** GitHub 僅提交可重現程式、聚合品質指標、契約規格及必要的小量可查證例子／源行號，不得提交完整原始文字列、全量衍生的原始感測器數列、資料集副本或敏感本地路徑。真正逐點 raw lookup 僅在學生本地程式以唯讀方式運作。

### M2 Execution Evidence / Git

- 每個關鍵步驟須記錄完整實際命令、時間、工作目錄（公開前遮蔽敏感部分）、Python/PowerShell 版本、exit code、公開安全的 stdout/stderr 與測試結果；輸入 SHA-256 before/after 分別提供。
- Research Own Worker 僅由 STUDENT-RESEARCH Brain 下令。Brain 派工前與 Worker 開工前都須重讀 GitHub main 最新 AGENTS.md；若範圍衝突，STOP_IF。
- Commit 前查 staged diff、.gitignore 排除與實際 Git tree（包括歷史敏感檔風險）；僅推送 main，禁止 force push。Worker 推送後只可報 READY_FOR_REVIEW；Research Brain 從 GitHub 實際審查，然後向 MAIN 返回 BRAIN_TO_BRAIN_RETURN。
- MAIN 須再次從 GitHub 讀取程式、契約、證據與 Commit，才能核發 M2 PASS。資料契約只有 MAIN 正式接受後才可交給 STUDENT-WEB Brain；不得提前啟動 M3。

### M2 Return Contract

TYPE=BRAIN_TO_BRAIN_RETURN; WORK_ITEM_ID=WO-M2-RESEARCH-001; FROM=STUDENT-RESEARCH Brain; RETURN_TO=STUDENT-MAIN Brain; STATUS=READY_FOR_MAIN_REVIEW/FAIL/BLOCKED。
須附 Phase A PASS/FAIL/BLOCKED、Phase B PASS/FAIL/BLOCKED/NOT_STARTED、三檔實際相對路徑、三組 SHA-256 before/after、Train/Test/RUL rows/columns、Train/Test Unit/Cycle 驗證、RUL mapping、Raw Index 檢查結果、Missing/Duplicates/Quality、Trend 與來源核對、Data Contract 文件/JSON GitHub 路徑、實際命令與執行證據、Exit Codes、Tests、Commit ID/Commit SHA256 計算對象、遠端 Commit URL、GitHub Verify、Data Safety、Research Brain Review 與 blockers。

**M2 CURRENT STATUS:** Research Own Worker remediation complete; Phase A=`PASS`, Phase B=`PASS`, tests=20/20; pending remediation commit/push verification and independent Research Brain/Main review. Worker does not claim final M2 acceptance and does not authorize M3/Web.

## WO-M2-RESEARCH-001 — RESEARCH INDEPENDENT REVIEW 001 (2026-11-24)

- **TYPE:** RESEARCH_BRAIN_INDEPENDENT_GITHUB_REVIEW
- **REVIEWED_COMMIT:** `6fbab1307e4188838a1c784f795641b0c9b3642a` (GitHub `main` HEAD at review).
- **GOVERNANCE:** Research Brain 已讀取 GitHub main 最新 `AGENTS.md`、`WORK_ITEM.md`。M0/M1 已由 MAIN 記錄 PASS；M2 已獲 STUDENT 授權；M3/Web 尚未授權。
- **VERIFIED_DELIVERY:** GitHub main 的提交與完整遞迴 Git tree 可讀取，提交包含恰好十個 M2 授權檔案，未包含 FD001 三份原始檔或合成 CSV；.gitignore 持續排除 FD001/。研究程式、測試、三份報告與兩份 Data Contract 已從 GitHub 實際讀取。
- **REPORTED_LOCAL_RESULTS:** Worker 報告 Phase A=PASS、Phase B=PASS、14/14 tests (exit 0)、Train=20631×26 (100 units)、Test=13096×26 (100 units)、RUL=100×1，三檔 SHA-256 前後一致。Research Brain 獨立將 GitHub 驗證報告所列兩組各 100 Units 之 Cycle counts 加總，分別與 20631 / 13096 一致。未存取學生本地 FD001 檔或獨立重算來源 SHA-256。
- **FINDING 1 — CONTRACT_PROVENANCE_MISMATCH (verified code defect):** Data Contract 明定 `source_file` 為 project/repository-relative 路徑，但 `research/m2_fd001_validate.py` 使用 `dataset.path.as_posix()` / `rul.path.as_posix()` 直接傳出路徑；`DEFAULT_INPUT_DIR = PROJECT_ROOT / "FD001"` 為絕對路徑，故預設 `FD001Repository()` 及 `run_phase_a()` 將可能回傳本地絕對路徑，與契約不符並有公開 Windows 私人路徑風險。現有測試沒有檢查 source_file 相對路徑保證。
- **FINDING 2 — RUL_RAW_REREAD_UNPROVEN:** `reports/M2_FD001_VALIDATION.md` 宣稱 RUL references 重新從來源讀取，但 `get_test_rul_label()` 僅回傳已存記憶體之 mapping；`tests/test_m2_fd001.py` 的 RUL 測試只比對 `self.repository.rul.rows` 已解析資料，未重新開啟原始 RUL 檔並檢查相同 physical line/token/來源 hash。缺少可獨立復核之本地 RUL raw-reference reread 實作與測試證據；不能以此證明已完成。
- **FINDING 3 — EVIDENCE_INCOMPLETE:** `reports/M2_EXECUTION_EVIDENCE.md` 記錄 Phase A/Phase B 指令、時間及 Exit Code，但明言原始 stdout 是 JSON，公開處只提供格式化 gate summary，沒有完整的實際 public-safe JSON stdout；完整性與對應關係無法單憑現有摘要復核。須將新的完整公開安全命令/stdout/stderr/exit code 保存，若重跑需標記 `EVIDENCE_RERUN`，不可冒充舊執行。
- **RESEARCH_DECISION:** `FAIL / REMEDIATION_REQUIRED`（可在原 `WO-M2-RESEARCH-001` 授權檔案範圍內修正，非 MAIN 最終驗收）。待 Worker 修復、重新檢驗 Phase A → Phase B Gate、重跑測試、記錄三份 CSV 原始來源 SHA-256 before/after、Commit+Push，再由 Research Brain 從 GitHub 獨立審查；若新 Gate 未 PASS，Phase B 必須 NOT_STARTED 並回報 BLOCKED。
- **CURRENT_GATE:** M2=NOT_ACCEPTED；Data Contract `main_acceptance=PENDING`；M3/Web=BLOCKED。不得移交 STUDENT-WEB Brain。

## WO-M2-RESEARCH-001 — REMEDIATION WORKER RECORD (2026-11-24)

- **TYPE:** `WORKER_TO_RESEARCH_BRAIN_RETURN` preparation; successful delivery status is `READY_FOR_REVIEW`, not final M2 PASS.
- **BASELINE:** GitHub `main` review commit `35a929d0bf68d34c88b4cffc250de6939b31cefa`; local `main` was clean and fast-forward synchronized before remediation.
- **FIX_1_SOURCE_PATH:** Complete. All public `source_file` values are project-relative POSIX paths (`FD001/...`) for default, relative, and absolute in-project inputs. Inputs resolving outside the authorized project root raise `ValidationError`. Automated tests cover Train, Test, RUL, raw references, and sensor series.
- **FIX_2_RUL_REREAD:** Complete. Each RUL reference freshly reopens the source file, verifies current SHA-256, rereads recorded physical line/column 1, reparses the token, and compares raw and numeric values. Hash/line/value mismatch raises `ValidationError`. Tests cover valid reread, unavailable physical line, and mismatched value.
- **FIX_3_EXECUTION_EVIDENCE:** Complete. `reports/M2_EXECUTION_EVIDENCE.md` is explicitly `EVIDENCE_RERUN` and records complete actual bounded compact-JSON stdout, empty stderr, commands, environment, timestamps, exit codes, complete unittest verbose output, and before/after hashes. A separate comparison confirmed both saved JSON lines exactly equal fresh live CLI output.
- **PHASE_GATE:** Phase A=`PASS` with 11/11 gate checks; only then Phase B=`PASS`. Data Contract `FD001_DATA_CONTRACT` version `1.0.1` validates successfully; `main_acceptance=PENDING` remains unchanged.
- **TESTS:** `python -m unittest -v tests/test_m2_fd001.py`; 20/20 passed, exit code 0, runtime 28.960s.
- **SOURCE_INTEGRITY:** Before/after hashes remained identical: Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`; Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`; RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`.
- **SCOPE/SAFETY:** Only existing M2-authorized files were modified. `.gitignore`, raw FD001 inputs, M0/M1 artifacts, and unrelated files were not modified. No raw dataset, private absolute path, M3, or Web work is included.
- **DELIVERY:** Commit ID, commit-object SHA-256, push result, GitHub URL, remote equality, and final changed-file list are provided in the Worker return after commit, avoiding self-reference.

## WO-M2-RESEARCH-001 — RESEARCH INDEPENDENT REVIEW 002 (2026-11-24)

- **TYPE:** RESEARCH_BRAIN_INDEPENDENT_GITHUB_REVIEW
- **RESEARCH_DECISION:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW` (不等於 MAIN 最終 PASS)
- **PRIOR_REVIEW:** `35a929d0bf68d34c88b4cffc250de6939b31cefa` (`REMEDIATION_REQUIRED`；歷史紀錄保留)
- **WORKER_REMEDIATION_COMMIT:** `5d3dd036d2c247a1c134d728d8ce3cde4a305f95`；GitHub `main` HEAD 經獨立讀取與該提交相同，GitHub compare 為 ahead 1 / behind 0，變更九個授權檔案；原始 FD001 資料、.gitignore、M0/M1 程式均未變動。
- **GOVERNANCE:** Research Brain 已獨立讀取 GitHub `main/AGENTS.md` 與 `main/WORK_ITEM.md`、提交、Git Tree、兩支研究程式、測試、三份報告、兩份 Data Contract。M0/M1 已記錄 PASS，M2 工作單授權有效；M3/Web 不在授權範圍內。
- **FIX_1 — SOURCE_PATH:** `resolve_input_dir()` 禁止解析至專案根目錄以外；`source_relative_path()` 將預設與明確指定之專案內來源正規化為 `FD001/...` 相對路徑；Train/Test/RUL profiles、Raw References 與 sensor series 使用此規則，增補相應測試。結果：ACCEPTED。
- **FIX_2 — RUL_FRESH_REREAD:** `get_rul_raw_reference()` 重新計算 RUL 檔案 SHA-256、透過 `_fresh_reread_token()` 重新開啟本地原始檔，使用實際 physical line/column 重新讀取並比較字串與數值；缺行、值不一致、hash 變更會拒絕；新增實際及負面測試。RUL label 仍為 Test Unit 最後觀測 Cycle 的原始真值標籤，未當作預測值。結果：ACCEPTED。
- **FIX_3 — EVIDENCE_RERUN:** `reports/M2_EXECUTION_EVIDENCE.md` 以 `EVIDENCE_RERUN` 標示；記載日期 2026-11-24（UTC+08:00）、PowerShell 7.6.9、Python 3.12.7、可重現命令、每條的起迄時間/Exit Code/公開安全 stdout/stderr。Research Brain 直接從該報告抽取兩份 Phase A/B 完整單行 compact JSON 並獨立解析成功：Phase A 的 11/11 checks 全為 true；Phase B、Data Contract checks 均 PASS；unittest 報告 20 run / 20 passed / 0 failed / 0 errors（Exit Code 0）。結果：ACCEPTED。
- **DATA_MEASUREMENTS_FROM_WORKER_EVIDENCE:** Train `20631 × 26 / 100 Units`、Test `13096 × 26 / 100 Units`、RUL `100 × 1`；missing、duplicate keys 與 parse errors 均為零。Train/Test 各 100 Unit 的 Cycle-count 報告已由 Research Brain 加總核對為 20631 / 13096。Data Contract `FD001_DATA_CONTRACT v1.0.1`，`validation_status=PASS`，`main_acceptance=PENDING`。
- **SOURCE_SHA256_BEFORE_AFTER (Worker evidence):** Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`；Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`；RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`。三檔各自 before/after 相同，原始檔未納入遠端提交。
- **DISCLOSURE CHECK:** 本次 Worker Commit 新增/修改的內容未新增 Windows 使用者絕對路徑；GitHub tree 未含原始 FD001 資料。但 `WORK_ITEM.md` 內仍可見先前 M1/M2 治理紀錄留下的 Windows 絕對路徑文字（**非此次 Worker 新增**）。因此不能宣稱整個公開儲存庫「完全不含私人絕對路徑」；請 MAIN 另依治理權限審視既有文件公開邊界與 Git 歷史（禁止擅自 force push/改寫歷史）。
- **VERIFICATION_LIMITATION:** Research Brain 無法直接開啟學生本地 FD001 檔重算 SHA-256 或在學生環境獨立執行測試；實際本地成功/雜湊來自 Worker 記錄；Worker 報告的 commit-object SHA-256 未由 Research Brain 獨立重算。GitHub 原始程式/契約及報告內 JSON 則已由 Research Brain 直接審查。
- **FINAL_GATE:** `PHASE_A_RESEARCH_REVIEW=ACCEPTED`、`PHASE_B_RESEARCH_REVIEW=ACCEPTED`、`M2_FINAL_PASS=PENDING_MAIN`、`DATA_CONTRACT_MAIN_ACCEPTANCE=PENDING`、`M3/WEB=BLOCKED`。

## WO-M2-RESEARCH-001 — MAIN FINAL ACCEPTANCE (2026-11-24)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** WO-M2-RESEARCH-001
- **REVIEWER:** STUDENT-MAIN Brain
- **RESEARCH_RETURN:** RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW
- **MAIN_FINAL_DECISION:** PASS（Phase A、Phase B 及 Data Contract 1.0.1，M2 結案；不構成 M3 執行授權）。
- **REVIEW_BASELINE:** GitHub `main` Commit `b739d3ea96306e2136f0f2e6faa9815aa7be01b1`；Worker 修復 Commit `5d3dd036d2c247a1c134d728d8ce3cde4a305f95`。
- **INDEPENDENT_GITHUB_REVIEW:** MAIN 已讀取 GitHub 最新 `AGENTS.md`、`WORK_ITEM.md`、`ROADMAP.md`、兩個 M2 Python 模組、20 項 Unittest 定義、三份 M2 報告、`contracts/FD001_DATA_CONTRACT.md` 與 `.json`、`.gitignore`、遠端遞迴 Git tree、Worker 修復 Commit 與 Research Brain Review Commit。驗證修復 Commit 的九個變更檔案均在允許範圍內，Research Review 僅修改 WORK_ITEM.md；遠端 tree 不包含 FD001 三份來源檔、合成 CSV 或完整原始數列。M0/M1 程式 Blob 未變動。
- **PHASE_A_ACCEPTANCE:** 已獨立解析 `reports/M2_EXECUTION_EVIDENCE.md` 的公開安全 compact JSON：`phase_a_status=PASS`，11/11 gate checks 為 true，26 欄 mapping 正確，Train 20,631×26 / 100 Units，Test 13,096×26 / 100 Units，RUL 100×1；無 missing、重複 Unit/Cycle keys、解析錯誤或 Cycle gaps。由 GitHub 驗證報告獨立解析各 100 Unit 的 Cycle 計數並加總，Train=20,631、Test=13,096，與 Phase A JSON 一致。Train/Test/RUL 語意及 RUL 依 Test Unit 首次出現與升冪順序、數量一致後的標籤映射均已記錄。修復程式以 project-relative source path 輸出並拒絕 project root 外路徑；RUL reference 每次重新開啟檔案、核對來源 SHA-256、行號、原始 Token、數值；相關正反測試均存在。
- **PHASE_B_ACCEPTANCE:** 已獨立解析公開安全 compact JSON：`phase_b_status=PASS`，契約六項驗證檢查為 true；Train/Test 各 3 settings + 21 sensors 共 24 個統計欄位、min/max/mean/population std 與 constant/near-constant 規則；Train Unit 1 sensor_2 192 點、Cycle 1–192，公開七個來源抽查點均連結 `FD001/train_FD001.txt` 正確 Source Column 7、Physical Line、Unit、Cycle，`reread_matches=true`，無插值平滑。Unittest 補證記錄 20/20 PASS、Exit Code=0。
- **SOURCE_INTEGRITY_WORKER_EVIDENCE:** Train SHA-256 `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`；Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`；RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`。三個原始檔案 before/after 一致（依 Worker EVIDENCE_RERUN）；來源型態 TRUSTED_LOCAL_FILES 且 READ_ONLY；無外部下載/來源核對。
- **DATA_CONTRACT_DECISION:** MAIN_ACCEPTED：`FD001_DATA_CONTRACT` v1.0.1，Markdown/JSON 兩份內容與六個介面定義均經 GitHub 審查，作為 M3/Web 後續資料接口的已批准研究基準。**注意版本快照：**兩份 Research 契約在 MAIN 審查時原有的 `main_acceptance=PENDING` 尚未被更改；本段 WORK_ITEM.md 的 MAIN 正式決議是權威驗收紀錄。於對 Web Brain 正式交接之前，須安排受控的合約狀態元資料同步與相容測試，避免直接修改契約狀態導致現有 `validate_contract()`（目前要求 PENDING）的測試／Gate 失敗；不能無測試直接將其改成 ACCEPTED。
- **EVIDENCE_LIMITATION:** MAIN 未直接存取學生本地 Windows FD001 原始檔，無法獨立重新計算原始檔案 SHA-256 或實際本地測試 Exit Code；已核查的是 GitHub 內的完整 Worker 執行紀錄、程式、契約與 JSON 一致性。Worker 所報 commit-object SHA-256 未獨立重算；驗收未宣稱超出此證據等級。
- **PRIVACY_NOTICE:** 歷史 `WORK_ITEM.md` 曾含學生 Windows 絕對路徑文字；此為已存在的公開治理資訊，不是 M2 Worker 新增。MAIN 不擅自改寫 Git 歷史、不 force push；可在 STUDENT 明確授權後另外進行目前文件的去識別化與歷史風險治理。此項獨立列為公開資訊治理議題，不構成 M2 來源資料上傳。
- **NEXT_GATE:** M2 PASS；`M3_NOT_AUTHORIZED`。在 STUDENT 批准 M3 前，不得由 MAIN、Research Brain、Web Brain 或任何 Own Worker 開始網站工作；Data Contract 實際 Web 交接要先確認元資料版本同步與受控 handoff；每次派工前重讀 GitHub 最新 AGENTS.md。
- **RETURN_TO:** STUDENT


## WO-M2-RESEARCH-002 — FD001 Evidence Classification Supplement

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M2-RESEARCH-002 |
| MILESTONE | M2_POST_ACCEPTANCE_RESEARCH_SUPPLEMENT (existing M2 PASS remains intact) |
| TASK | Research evidence: Unit/Cycle/Sensor trends; OBSERVATION / INFERENCE / UNKNOWN; labels and RUL limitations |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-RESEARCH Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT (2026-11-24: 進行未完成的部分) |
| STATUS | PASS（2026-11-24；STUDENT-MAIN Brain 已獨立審查 GitHub 實際成果並接受 OBSERVATION / INFERENCE / UNKNOWN、衍生 RUL 溯源、標籤區分與 EVIDENCE_RERUN；原 WO-M2-RESEARCH-001 PASS 不變；本工單未授權 M3/M4/Web） |
| PREREQUISITES | M2 MAIN PASS at ee27d43d4f72ff11d75d84125ca66326ae036069; accepted FD001_DATA_CONTRACT v1.0.1 per WORK_ITEM.md; no other active worker work item on GitHub main |
| INPUT | Trusted local FD001/train_FD001.txt, FD001/test_FD001.txt, FD001/RUL_FD001.txt; existing M2 validated Python data interfaces; no external download or source lookup |
| AUTHORITY | MAIN dispatches only to STUDENT-RESEARCH Brain. Research Brain must reread latest GitHub main AGENTS.md and WORK_ITEM.md and instruct only its own Research Own Worker. Worker must separately reread latest AGENTS.md before executing. MAIN never directly dispatches Own Worker. |
| SCOPE | Complete only the not-yet-delivered formal epistemic classification, reusing M2-approved source and API; deliver auditable selected real trends, label/RUL semantics, clear limits on diagnostic conclusions. No training or model prediction, fault detection, arbitrary baseline thresholds, Web/API/UI, M3 or M4. |
| ALLOWED_FILES | research/m2_evidence_classification.py; tests/test_m2_evidence_classification.py; reports/M2_EVIDENCE_CLASSIFICATION.md; reports/M2_EVIDENCE_EXECUTION.md; reports/M2_EVIDENCE_SAMPLES.json (small safe samples only); minimal .gitignore changes to permit exactly these while protecting raw data; WORK_ITEM.md status/evidence records. If different files are needed, ask MAIN approval before use. |
| READ_ONLY | ALL raw FD001 files and synthetic CSV, prior M0/M1/M2 source, tests, reports and contract v1.0.1, other student files. No source overwrite, rewriting source files, contract state edits or Git upload of raw/full sensor series. |
| OUTPUT | Reproducible parameterized evidence extractor/classifier, public-safe small sample JSON, human-readable evidence report and Train/Test/RUL label matrix, full real local execution evidence, tests, Research Brain GitHub independent review. |
| DELIVERY_STATUS | Worker 成果及 EVIDENCE_RERUN 已交付；Research Brain `RESEARCH_ACCEPTED`（GitHub commit 5be17f37c1f95428570f9dc6423eb80e28de3689）；MAIN FINAL `PASS`（2026-11-24，見本工作單後附 MAIN FINAL ACCEPTANCE）；原 M2 PASS 不變；未執行 M3/M4/Web。 |

### INPUT and source provenance

1. Only read validated local FD001 sources through approved M2 interfaces such as FD001Repository.get_sensor_series and get_raw_reference, get_test_rul_label. Verify SHA-256 before and after. Do not invent or substitute source data.
2. Support train/test split, unit_id, actual cycle start/end and sensor_1..sensor_21 (an integer selector is acceptable only when documented and mapped exactly). Select at least one Train and one Test case and multiple actual cycles; strictly isolate split and unit. Complete series may remain only in local workspace; GitHub contains only small checked samples.
3. For each published OBSERVATION record include split, unit_id, cycle, sensor_name, raw value and original token, project-relative source_file, source_sha256, 1-based physical_line_number, 0-based data_row_index, 1-based source_column_index, and reread_matches. Do not infer physical sensor units or actual wall-clock timestamps from unspecified FD001 fields. If no source record exists, report absence with explicit uncertainty rather than inventing a value.
4. Explicitly distinguish original observed sensor data versus derived descriptive calculations versus labels. Where raw-reference code is cache-backed, describe it accurately rather than claiming a fresh disk reopening without proof.

### REQUIRED OBSERVATION / INFERENCE / UNKNOWN report

Use a documented schema for each record: category, statement, source_references, calculation_or_null, evidence_scope, limitations.

OBSERVATION: Directly source-verifiable numbers, selected Engine Unit/Cycle/Sensor raw values, and verified actual RUL ground-truth label at Test last observed Cycle. Provide raw row and column evidence.

INFERENCE: Only transparent bounded numerical descriptions such as end minus start, a selected-window min/max, and directional trend. Show exact formula, input cycles/values and source references. A rising/falling sensor value by itself CANNOT establish degradation, abnormality, failure, fault type, health score, failure timing or RUL prediction. Clearly label inferential status rather than observational fact.

UNKNOWN: Without independently verified evidence, mark fault type, fault timing, severity, healthy-vs-failed status at an arbitrary observation, causal explanation, accepted diagnostic baseline, physical fault thresholds, model-derived RUL prediction, and any unvalidated sensor unit as unknown. Explain precisely why, instead of inventing a value or presenting false certainty. UNKNOWN is epistemic and distinct from missing/null values in the original data.

No invented healthy/abnormal baseline, no prognostic thresholds, no anomaly classification. Existing M2 constant/near-constant quality rule is NOT a fault-diagnosis baseline.

### LABELS / RUL requirements

Train: Sequence represents run-to-failure convention; original 26 data columns contain no direct fault type class, fault-time field, or measured per-cycle RUL label. If discussing train-cycle RUL via final_observed_train_cycle minus current_cycle, explicitly label as DERIVED under run-to-failure assumption, not an observed original column.

Test: Partial sequence. Last observed Test Cycle is not the failure point; Test raw rows have no original per-cycle RUL column.

RUL_FD001.txt: Exactly one ground truth RUL label per mapped Test Unit at last observed Test Cycle. Re-verify original file/physical row/label with M2 approved fresh reread. Ground-truth label is NOT a predictive model output and cannot be passed off as a raw per-cycle sensor value. No extrapolated per-cycle Test RUL without an explicitly authorized separate derivation.

Fault-mode labels, physical normal/abnormal thresholds or official failure classification columns are NOT established by FD001 raw 26-column structure; mark UNKNOWN where not verifiable.

### ACCEPTANCE

- Confirm latest GitHub main AGENTS.md and prior M2 PASS; real original source SHA-256 before/after identical.
- Parameterized unit, cycle window and sensor selection functional and verified for both splits; deterministic small real examples.
- Each OBSERVATION sampled point backed by actual source row/column/token and safe project-relative provenance.
- At least one INFERENCE with exact, reproducible arithmetic and source points; do not diagnose faults.
- UNKNOWN covers fault-mode labels, physical baseline, thresholds, health/fault state, cause, predicted RUL; distinguish unknown from missing data.
- Train/Test/RUL semantic matrix accurate; RUL source line/value reread tested; no observed/derived/predicted conflation.
- Document that sensor trends are not evidence of fault on their own. Do not create baselines or model outputs.
- Actual commands, timestamps, execution environment, stdout, stderr, Exit Codes, repeatable tests, source SHA-256 before/after documented without fabrication.
- Only approved code, tests, safe summary JSON/Markdown and minimal allowlist tracked; no source dataset / full trace / full RUL mapping / private absolute paths uploaded.
- Research Own Worker Commit + Push to single main; Research Brain independently read GitHub source, tests, reports, staged scope and latest main and return RESEARCH_ACCEPTED/FAIL/BLOCKED. MAIN final PASS only after own independent GitHub review.
- Existing M2 acceptance remains PASS; M3/M4 remains NOT_STARTED under this work order.

### STOP_IF

Raw file absent/unreadable/hash mismatch; RUL order/source invalid; source row mismatch; unable to verify actual samples or calculations; mistaken fault conclusion or fabricated baseline/threshold/label; unsafe disclosure; evidence cannot be produced; GitHub push/verification unavailable; AGENTS.md conflict; collision with other work item; unauthorized changes to M2 or Web files. Stop and report BLOCKED with exact cause/evidence; never change existing accepted source data or expand scope.

### RESEARCH OWN WORKER REPORT (2026-11-24)

- **STATUS:** `READY_FOR_REVIEW` only; no Research Brain or MAIN acceptance is claimed.
- **BASELINE:** synchronized GitHub `main` commit `d4c4537dd92785d35561561d5a0e0c6fadcac09a`; latest governance, this work order, accepted Data Contract v1.0.1, and prior M2 MAIN PASS were checked before execution.
- **DELIVERED:** parameterized `research/m2_evidence_classification.py`; actual-data tests; classification report; bounded safe sample JSON; complete controlled execution record; minimal `.gitignore` allowlist. Existing accepted M2 files/contracts and all raw inputs were not modified.
- **ACTUAL CASES:** Train Unit 1 / `sensor_2` / actual Cycles 1–5; Test Unit 1 / `sensor_2` / actual Cycles 27–31. Each source observation carries project-relative file, SHA-256, physical line, zero-based data row, one-based column, original token/value, and reread status.
- **CLASSIFICATION:** Train/Test endpoint arithmetic is `INFERENCE`, never diagnosis or a monotonicity claim. Train RUL example `192 - cycle` is explicitly `DERIVED` under the run-to-failure convention. Test Unit 1 RUL `112.0` is a freshly reread `GROUND_TRUTH_LABEL` mapped at last observed Cycle 31, not a model prediction or per-cycle sensor value. Eleven required topics are classified `UNKNOWN`, distinct from missing/null data.
- **SOURCE INTEGRITY:** SHA-256 before/after identical: Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`; Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`; RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`.
- **EXECUTION:** Python 3.12.7; `python research/m2_evidence_classification.py --verification-summary` Exit 0; `python -m unittest -v tests/test_m2_evidence_classification.py` 11/11 PASS, Exit 0; complete timestamps/stdout/stderr are in `reports/M2_EVIDENCE_EXECUTION.md`.
- **SAFETY/SCOPE:** only small checked samples are published; no full trace/mapping, raw dataset, private absolute path, credential, baseline, diagnostic threshold, anomaly class, model output, physical unit, or causal/fault conclusion is included. No M3/M4/Web action occurred.
- **GIT NOTE:** commit/push identifiers and GitHub links are supplied in the Worker return after the commit exists, avoiding a self-referential commit record. Research Brain must independently read GitHub `main`; its review remains pending.

### RETURN_TO STUDENT-MAIN Brain

TYPE: BRAIN_TO_BRAIN_RETURN
WORK_ITEM_ID: WO-M2-RESEARCH-002
FROM: STUDENT-RESEARCH Brain
RETURN_TO: STUDENT-MAIN Brain
STATUS: READY_FOR_MAIN_REVIEW / FAIL / BLOCKED
RESEARCH_BRAIN_REVIEW: RESEARCH_ACCEPTED / FAIL / BLOCKED

Must include: used local file relative paths, before/after SHA-256, selected split/unit/sensor/cycle ranges, OBSERVATION/INFERENCE/UNKNOWN sample and links, label/RUL semantic matrix, raw row crosschecks, commands/timestamps/stdout/stderr/Exit Codes/tests, repository commit SHA and URL, actual changed paths, data safety, independent GitHub review, acceptance results and blockers.

## WO-M2-RESEARCH-002 — RESEARCH INDEPENDENT REVIEW 001 (2026-11-24)

- **TYPE:** RESEARCH_BRAIN_INDEPENDENT_GITHUB_REVIEW
- **RESEARCH_DECISION:** `FAIL / REMEDIATION_REQUIRED`（限本工作單可補證項目，非 MAIN 最終結果；原 `WO-M2-RESEARCH-001=PASS` 保持不變）
- **GITHUB_REVIEWED:** `main` HEAD `cdea6a0386a03779fb388d5efd90a41b6794acec`，前一已授權工作單提交 `d4c4537dd92785d35561561d5a0e0c6fadcac09a`；compare ahead=1/behind=0，僅修改 .gitignore、WORK_ITEM.md 及五項允許交付。Research Brain 獨立讀取最新 AGENTS.md、WORK_ITEM.md、FD001_DATA_CONTRACT v1.0.1、研究分類器、11 個 unittest 原始碼、三份報告及完整 Git tree。原始 Train/Test/RUL 未上傳，已驗收 M2 Data Contract / M2 研究程式未修改。
- **STATICALLY_VERIFIED:** Train Unit 1 sensor_2 Cycle 1–5 與 Test Unit 1 sensor_2 Cycle 27–31 的原始來源參考/欄位位置、OBSERVATION 分類、端點差值 +0.55/+0.50、5 點區間 min/max 均由 Research Brain 直接解析公開樣本重算一致；ground-truth RUL 112.0 正確標示非模型預測；11 項 epistemic UNKNOWN、Train DERIVED RUL 而非原始欄位、無故障診斷/虛構 baseline；程式測試 11 項定義存在，Worker 本地證據記錄 11/11 PASS 且 Exit 0。公開相對路徑符合契約，Git tree 不含 FD001 原始資料。
- **FINDING A — DERIVED_RUL_PUBLIC_PROVENANCE_INCOMPLETE:** `reports/M2_EVIDENCE_SAMPLES.json` 中 Train Unit 1 的 DERIVED RUL `192-cycle` 紀錄有公式及衍生數列 191..187，但該筆 INFERENCE 的 `source_references=[]`；無公開對應 `final_observed_train_cycle=192` 的可回查原始 Cycle 來源列/欄。原分類器 `_train_derived_rul()` 已包含選定 Cycle 的來源參考，但未將最終觀測 Cycle 來源獨立連結，公開樣本亦未保留所需追溯。違反本工作單 INFERENCE 須有來源參考及公式/來源數值的要求。請補充少量真實 Train raw reference（可用 Cycle 欄位的已核准 `get_raw_reference()`），並由自動測試驗證 published JSON 與程式抽取結果一致，禁止公開完整數列。
- **FINDING B — SOURCE_HASH_EXECUTION_EVIDENCE_INCOMPLETE:** `reports/M2_EVIDENCE_EXECUTION.md` 存在三檔 SHA-256 Before/After 摘要，但沒有實際取得摘要的完整命令、分別的開始/結束時間、Exit Code、stderr 記錄，且缺明確 PowerShell 版本；整體 `Evidence start/end` 不能代替每次必要步驟的命令層級證據。分類器與 unittest 的完整 bounded stdout/stderr/Exit Code 已具備，不需重做功能。若原雜湊原始終端紀錄不完整，須使用同一份已授權唯讀 FD001 以 `EVIDENCE_RERUN` 明確標記補跑，不得捏造舊紀錄。
- **EVIDENCE_LIMIT:** Research Brain 無法直接存取學生本地 FD001 原始資料或在其環境重跑測試；來源雜湊與測試實際 Exit Code 依 GitHub Worker 執行報告，並不冒稱已在學生電腦獨立重新計算。
- **REMEDIATION_SCOPE:** 僅可改動本工作單五份新交付文件/程式及 WORK_ITEM.md 必要狀態；禁止改原始 FD001、先前 M2 程式/契約或 Web/M3/M4。Worker 補正後必須真正執行測試、完整記錄必要命令、三來源雜湊 before/after、Commit+Push main，再由 Research Brain 重新從 GitHub 獨立審查。
- **NEXT_GATE:** `WO-M2-RESEARCH-002=NOT_ACCEPTED`，`RESEARCH_REMEDIATION_PENDING`，原 `WO-M2-RESEARCH-001=PASS`，M3/M4/Web 未經本工作單授權且不得啟動。

## WO-M2-RESEARCH-002 — RESEARCH OWN WORKER REMEDIATION REPORT (2026-11-24)

- **TYPE:** WORKER_REMEDIATION_EVIDENCE_RECORD
- **EXECUTION_STATUS:** `READY_FOR_REVIEW` only; Research Brain rereview and MAIN review remain pending.
- **REMEDIATION_BASELINE:** GitHub `main` commit `3b2d13644b55a058f2708c4e9f1707b01f14f249`; latest `AGENTS.md`, this work item, and Research Independent Review 001 were reread before remediation.
- **FIX_A_DERIVED_RUL_PROVENANCE:** the classifier now obtains Unit 1's actual final Train Cycle through `FD001Repository.get_cycles`, then calls approved `get_raw_reference("train", 1, final_cycle, "cycle")`. The DERIVED record contains Cycle-column references for selected Cycles 1–5 and final Cycle 192; the final input resolves to physical line 192, zero-based data row 191, one-based source column 2, original token/value `192`, and `reread_matches=true`. Train references are explicitly linecache-backed, not fresh disk rereads.
- **PUBLIC_JSON_CROSSCHECK:** `reports/M2_EVIDENCE_SAMPLES.json` contains the six bounded DERIVED source references and the test suite compares the published reference list exactly with the executable extraction result. No full Train series is published.
- **FIX_B_EXECUTION_EVIDENCE:** `reports/M2_EVIDENCE_EXECUTION.md` records `EVIDENCE_TYPE: EVIDENCE_RERUN`, de-identified working directory, PowerShell 7.6.9, Python 3.12.7, per-source before/after hash commands, start/end timestamps, complete stdout/stderr, explicit child-process Exit Codes, and comparisons against accepted contract hashes. Hash commands use `ErrorActionPreference=Stop`, explicit output validation and `try/catch` exit; they do not use `$LASTEXITCODE`.
- **RERUN_RESULTS:** `python research/m2_evidence_classification.py --verification-summary` Exit 0; `python -m unittest -v tests/test_m2_evidence_classification.py` 11/11 tests OK, Exit 0. Train/Test observations, endpoint delta/min/max, DERIVED RUL provenance, Test RUL fresh reread, 11 UNKNOWN topics, semantic separation, public safety and no-diagnosis limitations were revalidated.
- **SOURCE_INTEGRITY:** Train before/after/contract `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`; Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`; RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`; all unchanged and matched.
- **SCOPE/SAFETY:** only the five authorized evidence-classification files and this `WORK_ITEM.md` evidence/status record were modified. `.gitignore`, accepted M2 code/tests/contracts, raw sources, M3/M4/Web and all other files were not modified. Commit/push identifiers are supplied after commit in the Worker return to avoid self-reference.

## WO-M2-RESEARCH-002 — RESEARCH INDEPENDENT REVIEW 002 (2026-11-24)

- **TYPE:** RESEARCH_BRAIN_INDEPENDENT_GITHUB_REREVIEW
- **RESEARCH_DECISION:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW`。此為 Research Brain 驗收層級，不代表 MAIN 最終 PASS；原 `WO-M2-RESEARCH-001=PASS` 維持不變。
- **REVIEWED_WORKER_COMMIT:** `ea66ff6e0e4b9279e6edc3563e0371ee21ec3da5`。Research Brain 從 GitHub `main` 獨立讀取最新 `AGENTS.md`、`WORK_ITEM.md`、`contracts/FD001_DATA_CONTRACT.json` v1.0.1、Worker Commit/Compare、完整 Git tree、分類器、11 項測試、分類報告、補證報告和公開安全樣本 JSON。提交相較前次 Research 審查 Commit `3b2d13644b55a058f2708c4e9f1707b01f14f249` 為 ahead=1 / behind=0，僅修改 `WORK_ITEM.md`、`research/m2_evidence_classification.py`、`tests/test_m2_evidence_classification.py` 及三份 `reports/M2_EVIDENCE_*.{md,json}` 授權檔案；既有 Data Contract、FD001 原始檔、.gitignore、M2 已驗收程式及 Web/M3/M4 均未修改。
- **FIX A — DERIVED_RUL_PROVENANCE: ACCEPTED.** 分類器使用 `FD001Repository.get_cycles("train", 1)` 取得實際最後 Cycle，再使用已驗證的 `get_raw_reference("train", 1, final_cycle, "cycle")` 取得 Source Reference。Research Brain 獨立解析 `reports/M2_EVIDENCE_SAMPLES.json` 的 DERIVED RUL: 六筆 Cycle-column references，Train Unit 1 的選定 Cycle 1–5 各有來源，最終 Cycle 192 參考為 `FD001/train_FD001.txt`、physical line 192、0-based data row 191、source column 2、token/value `192`，`reread_matches=true`，明確標示 linecache-backed；六筆來源欄位、相對路徑、SHA-256、行列索引與公式 `192 - cycle` 產生的 `191..187` 一致。測試存在公開 JSON 與實際抽取來源列表逐項一致的檢查。
- **FIX B — SOURCE_HASH_EXECUTION_EVIDENCE: ACCEPTED.** `reports/M2_EVIDENCE_EXECUTION.md` 明確標記 `EVIDENCE_RERUN`，保存 2026-11-24 16:37:46.5733353–16:37:55.6050322 +08:00 的完整受限公開證據；PowerShell 7.6.9、Python 3.12.7，六次（Train/Test/RUL Before/After）雜湊檢查都有完整實際 PowerShell 命令、開始/結束時間、stdout、stderr=empty 及 Exit Code 0；分類器與 unittest 命令、完整 public-safe stdout/stderr、Exit Code 亦已記錄。雜湊命令使用 `try/catch` 並顯式 `exit`，不以 PowerShell cmdlet 的舊 `$LASTEXITCODE` 充當本次結果。Research Brain 直接解析執行報告中的 JSON 摘要，驗證 DERIVED RUL 最終參考和六個來源參考數量、11 項 UNKNOWN、Test Unit 1 RUL ground-truth 112.0（fresh reread）及無診斷結論。Unittest 顯示 `Ran 11 tests`、`OK`，Exit Code 0。
- **OBSERVATION / INFERENCE / UNKNOWN:** GitHub 公開樣本涵蓋 Train Unit 1 sensor_2 Cycle 1–5、Test Unit 1 sensor_2 Cycle 27–31；端點差值分別 +0.55/+0.50，window min/max 與原始五點數值重算一致。Train derived RUL 僅在 run-to-failure convention 下為 DERIVED，Test Unit 1 RUL 112.0 是最後觀測 Cycle 31 的 ground-truth label，不是模型預測。11 項 epistemic UNKNOWN、資料品質常數規則不等於診斷閾值、沒有 fault/health/baseline/physical-unit 推斷，均已核對。
- **SOURCE_INTEGRITY (Worker rerun report):** Train SHA-256 before/after/contract `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`；Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`；RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`。Research Brain 獨立核對報告文字/契約/JSON 三方相符；未直接存取學生 Windows FD001 原始檔重算雜湊或獨立重跑本地測試。
- **PUBLIC_DISCLOSURE:** GitHub tree 不含三份 FD001 原始檔或完整 Sensor trace/RUL mapping；補正報告不含新的私人 Windows 絕對路徑，來源資料維持 READ_ONLY。既有治理文件歷史路徑去識別化議題不在本工作單授權。
- **NEXT_GATE:** Research Brain 完成補正驗收，`STATUS=READY_FOR_MAIN_REVIEW`；`MAIN_FINAL_PASS=PENDING`；原 `WO-M2-RESEARCH-001=PASS`，M3/M4/Web 仍 NOT_STARTED、不得由本工作單啟動。

## WO-M2-RESEARCH-002 — MAIN FINAL ACCEPTANCE (2026-11-24)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** WO-M2-RESEARCH-002
- **REVIEWER:** STUDENT-MAIN Brain
- **FINAL_DECISION:** PASS — supplemental Research evidence classification accepted; original WO-M2-RESEARCH-001 M2 PASS remains unaffected.
- **REVIEW_BASELINE:** GitHub `main` commit `5be17f37c1f95428570f9dc6423eb80e28de3689`; Worker remediation commit `ea66ff6e0e4b9279e6edc3563e0371ee21ec3da5`; Research Brain independent review commit `5be17f37c1f95428570f9dc6423eb80e28de3689`.
- **FILES_VERIFIED_FROM_GITHUB:** AGENTS.md, WORK_ITEM.md, FD001_DATA_CONTRACT v1.0.1 (unchanged), research/m2_evidence_classification.py, tests/test_m2_evidence_classification.py, reports/M2_EVIDENCE_CLASSIFICATION.md, reports/M2_EVIDENCE_EXECUTION.md, reports/M2_EVIDENCE_SAMPLES.json, Worker/Research commits and complete remote recursive tree. Worker changed exactly six permitted paths; Research Brain review only WORK_ITEM.md. Original FD001 datasets, M2 Research code and contracts not modified or published.
- **OBSERVATIONS_VERIFIED_AGAINST_PUBLIC_SAFE_EVIDENCE:** Train split Unit 1 sensor_2 Cycles 1–5: 641.82, 642.15, 642.35, 642.35, 642.37; Test split Unit 1 sensor_2 Cycles 27–31: 642.08, 641.93, 641.95, 642.79, 642.58. Reports and published bounded JSON agree. Published observations carry project-relative file, accepted SHA-256, physical line, 0-based data row, source column 7, original token/value and `reread_matches=true`. Research code describes Train/Test lookup correctly as linecache-backed.
- **INFERENCE_CHECK:** Recomputed from published values Train 642.37−641.82=+0.55 and Test 642.58−642.08=+0.50; window min/max match report. Endpoint direction is not represented as monotonicity, degradation, anomaly or failure diagnosis.
- **DERIVED_RUL_PROVENANCE_FIX:** GitHub source/public JSON/test verified six Train Cycle-column source references: Cycles 1–5 source line 1–5, index 0–4, source column 2 and actual final Train Unit 1 Cycle 192 source physical line 192, data row index 191, source column 2, token/value `192`, reread_matches=true. Formula `derived_train_RUL = final_observed_train_cycle - current_cycle` yields 191,190,189,188,187; marked DERIVED under run-to-failure convention, not a measured raw RUL label or prediction.
- **TEST_RUL_LABEL:** Test Unit 1 at final observed Cycle 31 maps to RUL_FD001.txt physical line 1, original token `112` / numeric ground truth 112.0, source column 1. Approved M2 RUL reference freshly reopens file, validates hash, physical line, token and value. Distinct from per-cycle Test sensor data and model-predicted RUL.
- **UNKNOWN_AND_BASELINE:** All eleven required epistemic UNKNOWN topics appear, separated from missing/null data; no fabricated healthy/abnormal baseline, fault or alarm threshold, severity, diagnosis, health score, physical sensor unit, failure probability, causal claim or model-predicted RUL. M2 near-constant threshold is explicitly described as a data-quality rule only.
- **EVIDENCE_RERUN_VERIFIED:** GitHub execution report includes explicit 2026-11-24 local window 16:37:46.5733353–16:37:55.6050322 UTC+08:00, PowerShell 7.6.9, Python 3.12.7, complete bounded verification stdout, complete unittest verbose stderr (11 tests, 0 failures, 0 errors), execution commands, each subprocess start/end/Exit Code=0, and six concrete `Get-FileHash` commands with before/after SHA-256. Published samples include all six derived RUL input references; test source verifies published versus dynamically extracted derived source references.
- **SOURCE_HASHES_WORKER_EVIDENCE:** Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`; Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`; RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`. Before/after each match and match accepted M2 Contract.
- **VERIFICATION_LIMITATION:** MAIN re-read GitHub source, tests, published safe JSON, evidence, commits, and tree, recomputed bounded arithmetic and reference counts, but could not access or re-run the student's local Windows FD001 originals; local hashes and exit codes derive from Worker execution evidence; commit-object SHA256 was not independently recalculated. Never claim third-party local reproduction.
- **PRIVACY:** GitHub tree excludes raw FD001 and synthetic CSV; historical WORK_ITEM.md contains pre-existing Windows private absolute paths, not introduced by this supplement. No history rewrite/force push authorized.
- **NEXT_GATE:** Supplement PASS, original M2 PASS remains. This acceptance does NOT start Web/M3 or M4; any next milestone or data-contract metadata synchronization requires a separately authorized task and latest AGENTS.md review.
- **RETURN_TO:** STUDENT


## WO-M3-WEB-001 — M3-A FD001 Local Read-only API

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M3-WEB-001 |
| MILESTONE | M3-A, API-first stage of Interactive Analysis Website; NOT entire M3 completion |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-WEB Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT (2026-11-24: explicitly requested MAIN -> Web Brain M3 readonly API work order after M2 acceptance) |
| STATUS | PASS / MAIN_ACCEPTED（2026-11-25，STUDENT-MAIN Brain 完成 GitHub 獨立審查，正式接受 M3-A 本地唯讀 FD001 API；WEB_BRAIN_REVIEW=WEB_ACCEPTED；M3-B Frontend／M4／M5 尚未授權） |
| PRECONDITIONS | M0=PASS, M1=PASS, M2 original WO-M2-RESEARCH-001=MAIN_PASS, evidence supplement WO-M2-RESEARCH-002=MAIN_PASS; this user request grants only M3-A Web API work, not M4 nor entire M3 approval. |
| GOVERNANCE | GitHub main AGENTS.md read at dispatch, baseline 9607b18f513d20ef7b4b34918cf7834d9bb2155f; Web Brain must independently reread latest AGENTS.md and WORK_ITEM.md before dispatching Web Own Worker; Web Own Worker must reread before work. Only Web Brain directs Web Own Worker; MAIN does not bypass hierarchy. |
| INPUT | Student's existing local workspace FD001/train_FD001.txt, FD001/test_FD001.txt, FD001/RUL_FD001.txt; read-only verified FD001 parser, Data Contract v1.0.1, M2 source hashes and provenance. Do not redownload, change or Git upload raw datasets. |
| CONTRACT_HANDOFF_GATE | Research Data Contract version 1.0.1 is MAIN_ACCEPTED per authoritative M2 MAIN FINAL ACCEPTANCE in WORK_ITEM.md, but contract JSON and Markdown still say main_acceptance=PENDING. Web Brain MUST identify this discrepancy before instructing Worker, request governed Research/MAIN synchronization with corresponding M2 compatibility tests, and independently verify final version and approval state. No Web Own Worker execution until reconciled; Web Brain must not itself modify Research contract or validator. If not resolved, return BLOCKED/HANDOFF_CONTRACT_STATE. |
| SCOPE | Implement and locally execute secure readonly HTTP API covering /api/health, /api/catalog, /api/units and /api/history. Define and test stable success/error JSON, provenance on individual history records, null-vs-unknown semantics and actual raw-source-row API crosschecks. No frontend/UI, Evidence Prompt generation, RUL prediction, fault classification, model training or M4 work. |
| ALLOWED_NEW_FILES | web/api.py, web/requirements.txt (only if needed and version-pinned), web/README.md, tests/test_m3_api.py, contracts/M3_API_CONTRACT.md, reports/M3_API_EXECUTION_EVIDENCE.md, reports/M3_API_SOURCE_CROSSCHECK.md; equivalently named minimal Web-owned files require MAIN approval before change. |
| ALLOWED_EXISTING_CHANGES | Minimal .gitignore allowlisting Web code/tests/reports/API contract while excluding raw data, plus M3 entries only in WORK_ITEM.md. Research M2 code/tests/contracts/reports are READ_ONLY; existing M0/M1/M2 accomplishments unchanged. No other file edits without MAIN authorization. |
| READ_ONLY | FD001 raw data, synthetic_sensor.csv, all M2 Research artifacts and Data Contract, historic M0/M1 files and any student private files. No persisting raw data exports, rewriting datasets, publishing complete sensor histories or leak of local absolute paths. |
| SOURCE_OF_TRUTH | FD001_DATA_CONTRACT v1.0.1, original input hashes and M2 API interfaces; dataset split-local Unit and Cycle IDs; RUL label is ground-truth only at final observed Test Cycle, not a predicted or per-cycle Test label. |
| ACCEPTANCE_AUTHORITY | Web Own Worker may return READY_FOR_REVIEW only; Web Brain independently reads GitHub main and returns BRAIN_TO_BRAIN_RETURN to MAIN; MAIN alone records PASS/FAIL/BLOCKED after independent GitHub verification. |

### Phase 0 — Contract Handoff / Safety Gate

1. Web Brain reads GitHub latest AGENTS.md, WORK_ITEM.md, ROADMAP.md, accepted M2 Data Contract JSON/Markdown and relevant approved M2 source interfaces before dispatching. Notice version 1.0.1 is accepted in WORK_ITEM, but contract-file main_acceptance=PENDING is a stale review snapshot.
2. STOP_IF HANDOFF_CONTRACT_STATE until an authorized, controlled Research/MAIN action synchronizes that metadata and reruns compatible M2 contract/data tests, or MAIN explicitly records a tested, versioned alternative handoff resolution. Do not silently coerce PENDING to ACCEPTED; do not have Web Own Worker edit M2 contract; do not start Web Own Worker before preflight is satisfied.
3. Check one active work item at a time, no forced Git history rewrites, no local private paths published, no raw datasets or all records pushed to public GitHub. API must bind loopback (127.0.0.1) by default and be read-only to the filesystem.

### HTTP API minimum contract (GET only)

Use one stable success wrapper (example shape): {"status":"ok","data":{...},"meta":{"schema_version":"1.0","source":"FD001_DATA_CONTRACT v1.0.1"}}. Use a stable error wrapper: {"status":"error","error":{"code":"ERROR_CODE","message":"safe public message","details":{...}}}; never include traceback, absolute path or raw source file in error.

- GET /api/health: HTTP 200 only when verified local sources can be read and integrity and accepted contract gate pass, with service/status/contract_version, source_type=TRUSTED_LOCAL_FILES and per-file hash_verified=true/false metadata without disclosing raw data or private absolute paths. For missing files, contract mismatch, unreadable file, invalid source hashes or unsafe path, fail closed: HTTP 503 with code DATA_NOT_READY / SOURCE_INTEGRITY_ERROR / CONTRACT_NOT_ACCEPTED as appropriate. Health is a real readiness check, not an unverified static OK.
- GET /api/catalog: HTTP 200; publish splits train,test; 21 sensors sensor_1..sensor_21, integer sensor selectors 1..21, operational settings 1..3, column-index mapping, contract version and safe dataset metadata (unit counts, cycle ranges if validated). No fabricated physical sensor units, fault labels, thresholds, healthy statuses or prediction fields. Do not disclose full raw records or complete RUL mapping.
- GET /api/units?split=train (also split=test): HTTP 200; list only actual unit IDs from the selected split, sorted ascending, with data source/provenance summary; unit_id values scoped to split. Require and validate split; do not mix Train/Test units.
- GET /api/history?split=train&unit=1&sensor=7&start=1&end=20: HTTP 200; interpret sensor=7 EXACTLY as sensor_7 (source column 12, as source columns 6..26 represent sensors 1..21). Query uses required split=train|test; positive integer unit, sensor in 1..21, inclusive positive integer cycle start/end, start<=end. Validate source Unit exists in selected split; return only actual observed cycles in requested inclusive window, numeric ascending; each point carries cycle, value (number or JSON null only if genuinely source-missing and allowed by policy), and provenance reference including dataset_split, source_file project-relative, source_sha256, physical_line_number (1-based), data_row_index (0-based), source_column_index (1-based), original_value or original token, reread_matches. Include selected unit/sensor/start/end and record count. No filling, resampling, interpolation or synthetic points.
- Health/catalog/units/history must be GET/read-only. Reject mutating HTTP methods (405 or documented equivalent) and unrecognized endpoints (404). Use explicit bounded query windows; reject unbounded/oversized windows or unsupported values without loading/exporting the entire raw dataset.

### Success, error, null and semantic rules

1. Document and test the chosen JSON envelopes and content types; unknown query parameter, malformed integer, missing required parameter, invalid split/sensor, start>end -> HTTP 400 or 422 with specific stable error codes. Unknown split-local Unit or missing endpoint -> HTTP 404 with safe code. Empty but valid in-range observation window -> 200 and [] with count=0, NEVER fake points or null measurements.
2. JSON null represents only an observed missing datum when the approved validated source allows it; current approved FD001 has zero missing and structural missing values are validation errors, so do not synthesize nulls on not found, invalid requests, unknown diagnosis, or absent cycles. If a future nullable field is introduced, explicitly distinguish it from UNKNOWN and document its provenance.
3. Network access: local 127.0.0.1 only, no external hosting, no raw dataset path parameter accepting arbitrary filesystem locations, no write methods or file modifications. If safe startup cannot be achieved, STOP_IF.
4. If the contract layer already exposes get_units, get_cycles, get_sensor_series, get_raw_reference, reuse them instead of independently parsing FD001. Sensor index to name and source column mapping must be tested exactly; no new threshold/health model. RUL is not part of requested /api/history values.

### Actual-source-row verification (mandatory)

1. In the student local workspace with exact verified FD001 sources, run the required history query and independently open the selected Train text file READ_ONLY. For at least 3 distinct returned points, calculate the original source physical line and token column from the actual file, compare token-to-number, Unit ID, Cycle, sensor 7 -> source column 12, data_row_index, source SHA-256 and entire provenance payload. Do not infer physical_line_number=cycle for arbitrary Units. Test a unit other than Unit 1 and at least one Test split query as independent crosschecks. Do not rely solely on the API's provenance assertion; actual text lines must be reread in the local test.
2. Record exact request/response (public-safe bounded samples only), HTTP status/JSON shape, crosscheck results, command, real Exit Code, timestamp, tests, before/after hashes and no data mutation. Verify output is taken from actual source; if FD001 does not match accepted hashes, STOP_IF, no fake JSON and no readiness success.
3. Test valid train/test/edge cycles and negative cases: invalid sensor=0, 22, invalid unit, reversed range, malformed/missing params, missing files, hash mismatch, empty window, incorrect paths, unsafe methods, data not ready. Confirm /api/health reflects readiness. No need to fabricate missing values to test null behavior; synthetic fixtures must be explicitly separated and marked synthetic.

### Deliverables, evidence and governance

- Allowed code, pinned dependencies if necessary, local run instructions, API response/error contract and OpenAPI-like request/response examples explicitly labeled illustrative unless captured from actual local API.
- reports/M3_API_SOURCE_CROSSCHECK.md contains original-line/column verified small bounded examples; reports/M3_API_EXECUTION_EVIDENCE.md contains actual commands, local timestamps/time zone, versions, complete public-safe stdout/stderr, Exit Code, HTTP requests and status codes, unit tests, accepted original SHA-256 before/after, local service only. No absolute private paths, credentials, complete raw source rows, full per-Unit trends, or raw dataset uploads to GitHub.
- Worker on one main branch only, Git staged scope verified, Commit + Push, report concrete Commit ID and URL. Web Brain separately fetches and reviews actual GitHub main code, tests, outputs and tree, returns RESEARCH-FREE WEB BRAIN REVIEW to MAIN. MAIN independently reviews GitHub and decides M3-A PASS/FAIL/BLOCKED.
- Passing M3-A API does NOT imply whole M3 Website PASS. Separate follow-on authorized work order is needed for interactive selectors/trend UI and later M4 Evidence Prompt.

### STOP_IF

Prior M2 PASS absent; contract metadata handoff unresolved; unavailable or changed local trusted FD001 file; source SHA-256 mismatch; failure to verify raw source line; incorrect sensor mapping, cycle/unit/split mismatch, unsupported null coercion, invented values or baseline; endpoint returns data while not ready; path traversal, unsafe file reads, mutation, raw dataset disclosure, complete series uploads, secrets or private absolute paths in GitHub; lack of real execution evidence; Git conflict, other active item, latest AGENTS.md conflict, unavailable GitHub review. Return BLOCKED with precise cause, never bypass handoff gate or force push.

### RETURN_TO STUDENT-MAIN

TYPE: BRAIN_TO_BRAIN_RETURN
WORK_ITEM_ID: WO-M3-WEB-001
FROM: STUDENT-WEB Brain
RETURN_TO: STUDENT-MAIN Brain
STATUS: READY_FOR_MAIN_REVIEW / FAIL / BLOCKED
WEB_BRAIN_REVIEW: WEB_ACCEPTED / FAIL / BLOCKED
Include: contract handoff resolution reference and tested schema version; endpoints and request/response codes; local raw-line comparisons including sensor 7->column 12 and non-first Unit/Test; null/error handling; source SHA256 before/after; actual launch commands and API requests; complete safe stdout/stderr/Exit Codes; tests; Git commit/URL, changed files, remote tree/GitHub verification and blockers.


### WO-M3-WEB-001 — WEB BRAIN PRE-DISPATCH BLOCKER (2026-11-24)

- TYPE: BRAIN_TO_BRAIN_BLOCKER_REVIEW
- FROM: STUDENT-WEB Brain
- RETURN_TO: STUDENT-MAIN Brain
- WEB_DECISION: BLOCKED / HANDOFF_CONTRACT_STATE; WEB_OWN_WORKER=NOT_STARTED.
- MAIN_VERIFICATION: MAIN reread GitHub main latest AGENTS.md, WORK_ITEM.md, FD001_DATA_CONTRACT.json and .md, research/m2_fd001_analysis.py and tests/test_m2_fd001.py. M2 MAIN acceptance is recorded in WORK_ITEM.md but both contract files still say main_acceptance=PENDING, and validate_contract checks acceptance against PENDING. Simply editing contract to ACCEPTED would fail the existing Phase B gate, so the Web Brain was correct to stop.
- MAIN_DECISION: ACCEPTED_BLOCKER. The previously STUDENT-authorized M3-A included a mandatory Research/MAIN contract handoff; open only the narrowly scoped dependent correction WO-M3-HANDOFF-001. During this correction M3-A is BLOCKED and Web Own Worker is NOT_STARTED. Preserve original M2 PASS, do not start Web implementation until the gate is independently accepted by MAIN.
- PRIOR_STATE_PRESERVED: Original M3-A work order remains valid but paused. All public GitHub historical evidence shall be retained; do not rewrite history.

### WO-M3-WEB-001 — WEB OWN WORKER EXECUTION RETURN (2026-11-25)

- **TYPE:** `WORKER_TO_BRAIN_RETURN` · **FROM:** Web Own Worker · **RETURN_TO:** STUDENT-WEB Brain · **STATUS:** `READY_FOR_REVIEW`.
- **BASELINE:** GitHub `main` `0bbf4e7aa1b82cd71e6ca08bdcd8a8c9fbbd2395`。已核對最新治理、MAIN Handoff PASS 與 Web Brain 恢復派工。Data Contract JSON／Markdown 均為 v1.0.1 `ACCEPTED`。
- **API:** 四個唯讀 GET 端點與 100-Cycle 查詢上限。實際程序在 `127.0.0.1:8765` 啟停，正常 HTTP 200，錯誤 HTTP 400／404／405。整合測試驗證各端點在缺檔、SHA-256 不符、契約無效或載入失敗時回傳 503。
- **VERIFICATION:** 59/59 自動測試通過，含 19 項 M3 API 測試。六筆實際原始觀測交叉核對通過，含 Train Unit 1 的 Cycles 1、10、20、192、Train Unit 2 和 Test Unit 2 的 Cycle 1。三份 FD001 前後 SHA-256 均符合契約。
- **DELIVERABLES:** [本地啟動與測試](web/README.md)、[HTTP 契約](contracts/M3_API_CONTRACT.md)、[實際執行證據](reports/M3_API_EXECUTION_EVIDENCE.md)、[原始來源核對](reports/M3_API_SOURCE_CROSSCHECK.md)。GitHub 提交與遠端驗證證據隨 Worker 回報提供。
- **REVIEW:** Web Brain 獨立審查待辦，M3-A 最終驗收由 MAIN 記錄。


## WO-M3-HANDOFF-001 — Research-owned FD001 Data Contract State Synchronization

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_DEPENDENCY_REMEDIATION_WORK_ORDER |
| WORK_ITEM_ID | WO-M3-HANDOFF-001 |
| PARENT | WO-M3-WEB-001 (M3-A paused due to HANDOFF_CONTRACT_STATE) |
| MILESTONE | M3-A Phase 0 pre-dispatch contract handoff only (NOT M3 Web implementation) |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-RESEARCH Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_SCOPE | This dependency is specifically authorized as the controlled Research/MAIN handoff prerequisite in the STUDENT-approved M3-A order (D-M3-001); request for resolution was relayed by STUDENT from Web Brain. It is NOT approval of another project milestone or overlapping worker development. |
| STATUS | PASS / MAIN_ACCEPTED（2026-11-25 MAIN 獨立 GitHub 驗收完成；FD001_DATA_CONTRACT v1.0.1 接受狀態已同步且相容測試通過；研究交接補正正式結案） |
| PREREQUISITE | M2 original MAIN PASS and M2 evidence supplement MAIN PASS; WO-M3-WEB-001 BLOCKED with WEB_OWN_WORKER NOT_STARTED; latest AGENTS.md governs. |
| SINGLE_ACTIVE_WORK | While this Research dependency is executing, parent M3-A remains paused: Web Brain must not dispatch Web Own Worker. Once this dependency is accepted by MAIN, Research work stops, then Web Brain rechecks the handoff before resuming its already authorized API work. |
| INPUT | FD001_DATA_CONTRACT v1.0.1 (JSON + Markdown), research/m2_fd001_analysis.py validate_contract and run_phase_b, tests/test_m2_fd001.py, read-only trusted-local FD001 originals, WORK_ITEM.md original M2 MAIN acceptance. |
| GOAL | Synchronize stale contract lifecycle metadata PENDING with the authoritative MAIN_ACCEPTED record without changing the semantic schema, six interface definitions, source hashes, dataset facts or source files; preserve reproducible Phase A/B tests. |
| ALLOWED_EXISTING_CHANGES | contracts/FD001_DATA_CONTRACT.json; contracts/FD001_DATA_CONTRACT.md; research/m2_fd001_analysis.py (ONLY contract-validation logic and essential compatibility notes); tests/test_m2_fd001.py (ONLY contract compatibility/negative state tests); WORK_ITEM.md handoff execution/review; minimal .gitignore additions if necessary to allow reports only. |
| ALLOWED_NEW_FILES | reports/M3_CONTRACT_HANDOFF.md; reports/M3_CONTRACT_HANDOFF_EVIDENCE.md (public-safe execution records, no raw records). |
| READ_ONLY | train_FD001.txt/test_FD001.txt/RUL_FD001.txt, all M2 parsing/source-traceability semantics, Research v1.0.1 interface names/required fields, accepted dataset hashes, all unrelated source and tests, historical reports, any Web code, other student private files. |
| OUT_OF_SCOPE | No Web API, HTTP endpoints, UI, M4, model training, prediction, baseline/fault threshold, raw dataset edit or publication, history rewrite or force push. |

### REQUIRED CHANGE — state, compatibility and fail-closed behavior

1. Contract state transition: Set main_acceptance=ACCEPTED in both FD001_DATA_CONTRACT.json and .md, with an accurate note that the authoritative approval occurred in original WO-M2-RESEARCH-001 MAIN FINAL ACCEPTANCE. Keep contract_name=FD001_DATA_CONTRACT, schema_version=1.0.1 (metadata-only lifecycle transition), validation_status=PASS, full source_files sha256, required_fields, all six interfaces, data types/semantics, RUL mapping and disclosure boundary unchanged. Record a distinct handoff work-item ID in WORK_ITEM.md rather than inventing a new data schema.
2. Contract validator: Modify only the acceptance-state check in research/m2_fd001_analysis.py to validate EXACTLY ACCEPTED for the current published approved contract. Do not accept PENDING, malformed or unsupported states as Web-ready. Choose clear check naming such as main_acceptance_accepted (do not silently reinterpret a check named main_acceptance_pending). Preserve validation for name/version/required interfaces/required fields/validation_status. run_phase_b must remain PASS with actual trusted FD001 after transition and BLOCKED for unaccepted contract.
3. Tests: Update current compatibility tests to require ACCEPTED in both JSON and Markdown. Add or adapt negative tests for temporary contract fixtures with PENDING, garbage state, wrong name/version/interface/field and ensure validate_contract().valid=false. Do not change dataset quality or numerical semantics; preserve existing M2 test coverage and Research Evidence classification tests. Avoid tests relying on original PENDING forever.
4. Data integrity: Re-validate all three local trusted-original SHA-256 against the prior accepted M2 hashes before/after, with explicit path and SHA-256 checks; no source edits. Phase A and Phase B execute and pass (20/20 or actual count as tests evolve) plus M2 evidence classification tests (11/11 or actual count as tests evolve). Only the declared approved metadata/validator/tests/reports may change. RUL remains ground truth, not prediction.
5. Execution evidence: Record real commands, working directory with private portions redacted, Python/PowerShell versions, local timestamps and timezone, complete public-safe stdout/stderr, Exit Codes for validation, Phase A, Phase B, two test suites and six hash commands; compare contract canonical content before/after (excluding only approved lifecycle metadata) and explain any differences. If output too large, use a bounded real diagnostic command with no invented summaries, but all actual executed commands must be faithfully logged. No raw data dump.
6. Git safety: Single main sequential development only. Worker rereads latest AGENTS.md before work, checks git staged scope and secret/raw files, commits and pushes approved files to main, returns exact Commit SHA + URL. Research Brain independently fetches GitHub source, both contract files, tests, evidence, commits and tree, then returns research review. MAIN independently reviews and decides handoff PASS/FAIL/BLOCKED before Web resumes.

### ACCEPTANCE CHECKLIST

- M2 prior MAIN acceptance authority confirmed and preserved; parent M3-A still BLOCKED during execution.
- Contract JSON and Markdown agree on schema 1.0.1, main_acceptance=ACCEPTED; validation_status PASS, original hashes/interface/semantics unchanged.
- validate_contract passes only approved ACCEPTED contract and rejects PENDING or invalid state; Phase B now PASS on accepted contract. No actual data behavior or numerical changes.
- Both M2 test suites are reexecuted with real input and pass; original dataset hashes stable before/after.
- Complete authentic command, stdout/stderr/exit-code/timestamp evidence; no fake results or unapproved dataset publication.
- Only authorized scope committed and pushed, Research Brain independently inspects GitHub main, MAIN independently accepts.
- Once MAIN grants handoff PASS, send actual GitHub Commit SHA, accepted version, tests and clear permission to Web Brain to re-check latest AGENTS and proceed with its existing M3-A work. Do NOT declare full M3 PASS.

### STOP_IF

Unapproved scope/contract schema change, file missing, invalid M2 source hashes, incompatible Phase A/B, altered RUL semantics, inability to reject PENDING/invalid states, missing evidence, external downloads, any raw data Git upload or private path disclosure, simultaneous Web Own Worker execution, GitHub Push/GitHub review failure, governance conflict. Return BLOCKED, preserve work and notify MAIN.

### RETURN_TO MAIN

TYPE=BRAIN_TO_BRAIN_RETURN; WORK_ITEM_ID=WO-M3-HANDOFF-001; FROM=STUDENT-RESEARCH Brain; RETURN_TO=STUDENT-MAIN Brain; STATUS=READY_FOR_MAIN_REVIEW/FAIL/BLOCKED; RESEARCH_BRAIN_REVIEW=RESEARCH_ACCEPTED/FAIL/BLOCKED.
Include: original M2 approval reference, source hashes before/after, contract version and exact metadata change, positive/negative validator checks and Phase A/B, all executed test suites, full public-safe stdout/stderr/Exit Codes/timestamps, changed files, Worker Commit+GitHub URL, Research Brain independent remote inspection, acceptance checklist and blockers. Main final approval PENDING until GitHub independent review.

### WO-M3-HANDOFF-001 — RESEARCH OWN WORKER EXECUTION RETURN (2026-11-24)

- TYPE: WORKER_TO_RESEARCH_BRAIN_RETURN; EXECUTION_STATUS: READY_FOR_REVIEW only. Research Brain and MAIN acceptance remain pending.
- GOVERNANCE_BASELINE: Began from GitHub `main` commit `243b06c6aeed9a022618384a0bbe2c3bda1c7c04` after rereading the governed files and confirming one active dependency item. Original `WO-M2-RESEARCH-001` MAIN acceptance remains the lifecycle authority; no M2 result was reopened.
- CONTRACT_STATE: `FD001_DATA_CONTRACT` remains schema `1.0.1`; JSON and Markdown lifecycle metadata changed only from `PENDING` to `ACCEPTED`. A structured comparison reports all other JSON fields equal, including the six interfaces, required fields, source hashes and semantics.
- VALIDATOR_COMPATIBILITY: `validate_contract()` now requires exact `ACCEPTED`. Positive coverage passes the published contract; negative temporary fixtures reject PENDING, REJECTED, UNKNOWN, lowercase accepted, empty, null, missing acceptance, wrong name/version, altered interface/field sets and non-PASS validation.
- EXECUTION_RESULTS: Phase A PASS; Phase B PASS with `main_acceptance_accepted=true` and contract `valid=true`; `tests/test_m2_fd001.py` 22/22 OK; `tests/test_m2_evidence_classification.py` 11/11 OK. Real commands, UTC+08:00 timestamps, complete public-safe stdout/stderr and Exit Codes are recorded in `reports/M3_CONTRACT_HANDOFF_EVIDENCE.md`.
- SOURCE_INTEGRITY: Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`; Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`; RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`. Before and After match each other and the accepted contract.
- AUTHORIZED_FILES: `.gitignore`; `WORK_ITEM.md`; `contracts/FD001_DATA_CONTRACT.json`; `contracts/FD001_DATA_CONTRACT.md`; `research/m2_fd001_analysis.py`; `tests/test_m2_fd001.py`; `reports/M3_CONTRACT_HANDOFF.md`; `reports/M3_CONTRACT_HANDOFF_EVIDENCE.md`.
- DATA_SAFETY: No raw input, complete sensor history, full RUL mapping, private absolute path, credential, Web implementation, M4 work, prediction, threshold or fault classification is included. Raw FD001 files remain read-only and untracked.
- REMAINING_GATE: Commit, Push and remote GitHub tree verification are reported out-of-band in the Worker return because the Commit ID cannot be embedded in its own commit. Parent `WO-M3-WEB-001` remains BLOCKED until Research Brain and MAIN independently review and accept this handoff.
- BLOCKERS: none at Worker execution stage.

### WO-M3-HANDOFF-001 — RESEARCH INDEPENDENT REVIEW 001 (2026-11-25)

- **TYPE:** RESEARCH_BRAIN_INDEPENDENT_GITHUB_REVIEW
- **RESEARCH_DECISION:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW`。僅屬 Research 層級核對；本工作單最終 PASS 需 MAIN 獨立審查。父項 `WO-M3-WEB-001=BLOCKED`；Web Own Worker 仍 `NOT_STARTED`，不得開始任何 Web/M4。
- **REVIEWED_WORKER_COMMIT:** `3770f87d033097bc9e0c033de37c98900aed4caa`；GitHub `main` HEAD、提交及 compare（相對 `243b06c6aeed9a022618384a0bbe2c3bda1c7c04`，ahead=1 / behind=0）已由 Research Brain 核實。實際 Commit Tree `f44ff12258e5807461931ab5e29d006a39baedaf` 含 26 個檔案 Blob，不含 NASA FD001 原始三檔或 synthetic_sensor.csv；本次只有 8 個授權檔案變更：`.gitignore`、`WORK_ITEM.md`、兩份 FD001 Data Contract、`research/m2_fd001_analysis.py`、`tests/test_m2_fd001.py`、兩份 M3 handoff 報告。
- **INDEPENDENT_SOURCE_REVIEW:** Research Brain 重新讀取 GitHub 最新 `AGENTS.md`、`WORK_ITEM.md`、兩份契約、Validator Python、測試、兩份報告、Commit/Compare 及 Git Tree。原 M2 及 Evidence Classification 已 MAIN PASS，權威驗收紀錄維持不變。經獨立結構化比對兩版 JSON，唯一改變之 Top-level 欄位為 `main_acceptance`，`PENDING→ACCEPTED`；`schema_version=1.0.1`、`validation_status=PASS`、六項 Interface、Required Fields、Source Hashes、Semantics 及 Disclosure Boundary 均未改變；Markdown 生命週期欄位及正式接受依據敘述同步。對 `research/m2_fd001_analysis.py` 確認唯一程式改動是將 `main_acceptance_pending` / `==PENDING` 替換為 `main_acceptance_accepted` / `==ACCEPTED`，Phase A gate 與 Phase B 分析未變。
- **POSITIVE_AND_NEGATIVE_TEST_REVIEW:** `tests/test_m2_fd001.py` 新增/調整之三項契約測試涵蓋 Published ACCEPTED 正例，及 `PENDING`、`REJECTED`、未知/小寫/空/null/缺少 acceptance、錯誤名稱/版本、缺少或多餘 Interface / Required Field、非 PASS validation_status 等負例。Worker 實際測試證據：Focused 3/3 OK；M2 Regression 22/22 OK；Evidence Classification Regression 11/11 OK，所有 Exit Code 0。
- **PHASE_GATE_REVIEW:** `reports/M3_CONTRACT_HANDOFF_EVIDENCE.md` 提供實際 Phase A 與 Phase B 命令、起迄時間、完整公開安全 stdout/stderr 與 Exit Code 0；Research Brain 從報告直接解析兩份 JSON，確認 Phase A `PASS`（11 項 gate_checks 均 true）、Phase B `PASS`，`contract_validation.valid=true` 及六項 contract checks 皆 true，包含 `main_acceptance_accepted`。原資料量及基本結構於 Worker 記錄仍為 Train 20631 × 26 / 100 units、Test 13096 × 26 / 100 units、RUL 100 × 1；未修改 Unit/Cycle/Sensor/RUL 語意與來源讀取程式。
- **SOURCE_INTEGRITY (WORKER LOCAL EXECUTION EVIDENCE):** Train before/after/contract `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`；Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`；RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`。證據含 PowerShell 7.6.9、Python 3.12.7、UTC+08:00 時間、雜湊與測試的輸出及 Exit Codes。After hash 三個步驟以「命令同 Before」直接引用前文完整命令，而各自有時間、完整輸出、空 stderr 與 Exit Code 0；若 MAIN 需六條逐字重複命令，可要求紀錄呈現改善。初次 Phase B 大量 stdout 在執行工具顯示層截斷，Worker 已明確紀錄並以相同命令實際獨立重跑取得可解析的完整 public-safe JSON stdout（補證 17:42:03–17:42:16 +08:00），另有 bounded diagnostic。Research Brain 無法直接存取學生本地 FD001，故不宣稱自行重新計算來源 SHA-256 或親自執行測試；Commit content SHA-256 亦未重算。
- **SCOPE_SAFETY:** GitHub Tree 未包含 FD001 原始資料／synthetic CSV；.gitignore 僅增加兩個 handoff 報告 allowlist；沒有 Web API 或 M4 檔案變更，沒有新增來源數據副本、完整 Sensor trace / RUL mapping；保留既有 Git 歷史。公開資訊安全檢查限本次變更與可見 Git Tree，不宣稱掃除所有歷史治理文件的私人路徑。
- **NEXT_GATE:** `WO-M3-HANDOFF-001=READY_FOR_MAIN_REVIEW`、`RESEARCH_BRAIN_REVIEW=RESEARCH_ACCEPTED`、`MAIN_FINAL_PASS=PENDING`；`WO-M3-WEB-001=BLOCKED`、`WEB_OWN_WORKER=NOT_STARTED`；待 MAIN 獨立驗收 Handoff，Research Brain 不自行恢復 Web 交接。

## WO-M3-HANDOFF-001 — MAIN FINAL ACCEPTANCE (2026-11-25)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** `WO-M3-HANDOFF-001`
- **PARENT_WORK_ITEM:** `WO-M3-WEB-001`
- **RESEARCH_RETURN:** `RESEARCH_ACCEPTED / READY_FOR_MAIN_REVIEW`
- **MAIN_FINAL_DECISION:** `PASS`（Handoff contract-state blocker resolved and reviewed; NOT an M3-A API PASS）。
- **REVIEWED_REMOTE_BASELINE:** GitHub main `f36b2efc57a117a26a27b5e21d6d9c26ba0419c1`，Research Own Worker delivery `3770f87d033097bc9e0c033de37c98900aed4caa`，Research Brain independent review `f36b2efc57a117a26a27b5e21d6d9c26ba0419c1`。
- **INDEPENDENT_GITHUB_REVIEW:** MAIN 實際讀取最新 AGENTS.md、WORK_ITEM.md、ROADMAP.md、FD001_DATA_CONTRACT.json／.md、research/m2_fd001_analysis.py、tests/test_m2_fd001.py、兩份 M3 handoff 報告、Worker/Research GitHub commits、遠端非截斷遞迴 Git tree，並比較修正前後 JSON。
- **CONTRACT_STATE:** Data Contract `schema_version=1.0.1`，`validation_status=PASS`，JSON/Markdown 同步為 `main_acceptance=ACCEPTED`。MAIN 依 GitHub 先前基準 Commit `243b06c6aeed9a022618384a0bbe2c3bda1c7c04` 及目前 main 完成 JSON 結構化比較，唯一變更之 top-level field 是 `main_acceptance: PENDING→ACCEPTED`；六個介面、欄位、語意、來源相對路徑及 SHA-256 均相同。
- **VALIDATOR:** `validate_contract()` 的唯一邏輯變動為 `main_acceptance_accepted: contract.get('main_acceptance') == 'ACCEPTED'`，保持其他 name/version/required fields/interfaces/validation-status 條件不變。原 M2 Phase A 與 Phase B 計算未更改。GitHub 已有獨立正反測試，包含拒絕 PENDING、REJECTED、UNKNOWN、小寫 accepted、空字串、null、缺失 acceptance、錯誤名稱/版本/fields/interfaces/status。
- **RUNTIME_RECORDS:** MAIN 解析 reports/M3_CONTRACT_HANDOFF_EVIDENCE.md 的 Phase A / Phase B 實際 JSON，確認 `Phase A PASS`、`gate_checks 11/11 true`；`Phase B PASS`、`contract_validation.valid=true`、六項契約檢查 true（包含 main_acceptance_accepted）；固定來源統計 Train 20631x26/100 Units，Test 13096x26/100 Units，RUL 100x1。執行證據標記真實起訖時間、Python 3.12.7、PowerShell 7.6.9、命令、stdout/stderr、Exit Code=0；初次 Phase B 過大輸出截斷已明示並以同命令重新執行取得完整可解析 JSON。
- **REGRESSION:** Focused Contract Tests 3/3 OK，M2 Regression 22/22 OK，M2 Evidence Classification Regression 11/11 OK，均取自 Worker 真實執行紀錄；GitHub 測試原始碼與結果互相一致。未宣稱 MAIN 於本地重新執行。
- **SOURCE_INTEGRITY_FROM_WORKER_EVIDENCE:** Train `963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8`、Test `3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851`、RUL `a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca`；before/after/Contract 一致。After hash 三項以明示『同 Before command』指向先前完整命令，保留各自不同的時間、完整 stdout、空 stderr 與 Exit Code=0；視為可查核的命令引用而非獨立重算證據。MAIN 無法直接存取學生 Windows 原始檔，不能獨立重算 local hashes。
- **COMMIT_SCOPE_AND_DATA_SAFETY:** Worker commit 僅八個授權檔案 `.gitignore`、WORK_ITEM.md、兩份 Contract、Validator、M2 tests、兩份 handoff reports；Research Brain review commit 僅 WORK_ITEM.md。GitHub 非截斷 tree 未包含 FD001 原始檔、synthetic CSV、完整 sensor histories 或 Web/M4 產物；既有 M2 PASS 治理紀錄維持不變。
- **DECISION_FOR_PARENT_M3_A:** 解除先前 `HANDOFF_CONTRACT_STATE`，原 STUDENT 已授權之 `WO-M3-WEB-001` 可恢復 Web Brain 派工階段；**Web Own Worker 尚未開始**。STUDENT 須將本 MAIN PASS 決議及 GitHub HEAD 轉交 STUDENT-WEB Brain；Web Brain 在派工前必須自行重讀 GitHub main 最新 AGENTS.md、WORK_ITEM.md、兩份 ACCEPTED Contract、Validator/tests 和本紀錄，確認無新 blocker 及單一 active work order 規則後，才可自行下達 Own Worker 工單。MAIN 不直接指揮 Web Own Worker。
- **BOUNDARY:** `M3-A API=NOT_PASS`、`M3 overall=NOT_PASS`、`M4/M5=NOT_AUTHORIZED`。此 PASS 只代表 Research-owned Contract Handoff 完成，未建立或實測 HTTP API。
- **RETURN_TO:** STUDENT (for relay to STUDENT-WEB Brain).


## WO-M3-WEB-001 — MAIN FINAL ACCEPTANCE (2026-11-25)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** WO-M3-WEB-001
- **STAGE:** M3-A (local read-only FD001 HTTP API only).
- **WEB_BRAIN_RETURN:** WEB_ACCEPTED / READY_FOR_MAIN_REVIEW.
- **MAIN_FINAL_DECISION:** PASS — M3-A API accepted; this does not establish Frontend M3-B or whole M3 website PASS.
- **REVIEWED_GITHUB_MAIN_HEAD:** 892b3c434d0b9fdccbeaa82de553f823f9042fb2.
- **WEB_WORKER_DELIVERY_COMMIT:** 892b3c434d0b9fdccbeaa82de553f823f9042fb2; GitHub compare from authorized baseline 0bbf4e7aa1b82cd71e6ca08bdcd8a8c9fbbd2395 is ahead 1 / behind 0, exactly eight authorized paths: .gitignore, WORK_ITEM.md, web/api.py, web/README.md, tests/test_m3_api.py, contracts/M3_API_CONTRACT.md, reports/M3_API_EXECUTION_EVIDENCE.md, reports/M3_API_SOURCE_CROSSCHECK.md.
- **PREREQUISITE_HANDOFF:** WO-M3-HANDOFF-001 was MAIN PASS and Data Contract v1.0.1 JSON/Markdown main_acceptance=ACCEPTED. The Web code verifies exact contract state, schema version, approved split/manifest and SHA-256 before serving.
- **INDEPENDENT_REVIEW_SCOPE:** MAIN fetched GitHub main latest AGENTS.md, WORK_ITEM.md, ROADMAP.md, web/api.py, tests/test_m3_api.py, web/README.md, contracts/M3_API_CONTRACT.md, reports/M3_API_EXECUTION_EVIDENCE.md and reports/M3_API_SOURCE_CROSSCHECK.md, Worker commit metadata/diff, GitHub compare, recursive Git tree. Code and test definitions reviewed; no raw FD001 files, synthetic CSV, complete sensor histories, or M4 artifacts appear in the tracked remote tree.
- **HTTP API:** GET /api/health, /api/catalog, /api/units?split=train|test and /api/history?split=train&unit=1&sensor=7&start=1&end=20 are implemented; standalone service binds only to 127.0.0.1 by default. The required history request returns exactly 20 observed points with Cycle 1–20 and sensor_7 at 1-based original source column 12. API is read-only and reuses the verified M2 FD001Repository.
- **SUCCESS_AND_ERRORS:** Consistent success/error envelopes, JSON content-type, no-store, malformed/missing/duplicate/unknown parameter checks, split-local Unit 404, invalid Sensor/Range 400, unsupported method 405, unavailable data/source hash mismatch/contract state 503. Window bounded to 100 inclusive Cycles; no smoothing, interpolation or invented data. Actual approved FD001 has zero missing; API returns no invented nulls for absent Cycles, missing/empty windows produce count=0 and points=[], and structural source validation errors fail closed. Null/UNKNOWN semantics remain distinct.
- **ACTUAL_SOURCE_ROW_CROSSCHECK:** MAIN read GitHub report and independent raw TXT comparison test code. Worker executed read-only TXT source-row re-open checks against live API response: Train Unit 1 sensor_7 cycles 1=554.36 (physical line 1, data row 0), 10=553.59 (line 10,row 9), 20=554.81 (line 20,row 19), 192=551.25 (line 192,row 191); Train Unit 2 cycle 1=554.53 (line 193,row 192); Test Unit 2 cycle 1=553.14 (line 32,row 31). Six checks included original Token, split/Unit/Cycle, actual physical line, zero-based row index, original source column 12, source SHA-256 and complete raw_reference (reread_matches=true). The automated test also compares all 20 required-history points against the independently read raw TXT, and tests isolated other-Unit/Test responses and valid empty window.
- **EXECUTION_EVIDENCE:** GitHub Worker report preserves PowerShell 7.6.9 / Python 3.12.7, before/after hash command and outputs with UTC+08:00 timestamps, full public-safe HTTP command and 13 live requests, standalone child startup/shutdown Exit Code 0, confirmed loopback port closed, final full test command, 59/59 PASS and exit=0. Test distribution: M3 API 19/19; M2 Core 22/22; M2 Research Evidence 11/11; M1 synthetic 7/7. Earlier Windows loopback WinError 10013 in one sandbox run disclosed; authorized subsequent run passed.
- **DATA_INTEGRITY_FROM_WORKER_LOCAL_EVIDENCE:** Train SHA-256 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8; Test 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851; RUL a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca; before=after=accepted contract for all three. FD001 originals remain READ_ONLY and uncommitted.
- **VERIFICATION_LIMITATIONS:** MAIN independently checked GitHub code, reports, bounded actual-file evidence and Git history but cannot access student Windows local FD001 data, redo hashes or independently start the standalone HTTP service. Local execution/hashes and independent raw-TXT HTTP comparison are supported by authentic Worker-reported local transcripts and regression test source; they were not independently rerun by MAIN. No actual frontend browser UAT is included in M3-A.
- **NONBLOCKING_FOLLOW-UP:** Future frontend work should preserve localhost-only policy, explicit GET error/null semantics, source provenance and bounded history queries; local-development HTTP handling can be revisited under an appropriately authorized follow-on work order, without claiming public deployment safety.
- **NEXT_GATE:** WO-M3-WEB-001 M3-A = PASS; M3-B frontend/UI and full M3 website NOT_COMPLETED / NOT_AUTHORIZED; M4 and M5 NOT_AUTHORIZED. Requires separate STUDENT approval and new authorized work item before any frontend or Evidence Prompt work.
- **RETURN_TO:** STUDENT.


## WO-M4-WEB-001 — Interactive FD001 Browser UI, Live UAT and Source Crosscheck (2026-11-25)

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M4-WEB-001 |
| MILESTONE | M4 — Interactive Browser UI, aligned to current STUDENT direct authorization (replaces previously planned M4 Evidence Prompt scope for this work only; no prompt generation authorized) |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-WEB Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT (2026-11-25; explicit instruction: MAIN opens M4 to Web Brain for interactive Engine Unit / Cycle / Sensor browser with source-data verification and real browser/manual UAT) |
| STATUS | PASS / MAIN_ACCEPTED（2026-11-25 STUDENT-MAIN Brain 獨立查核 GitHub 程式、真實 Chrome UAT、8 筆 UI/API/原始 TXT 對照、64 項回歸測試與 12 個授權檔案；M5 未授權） |
| PREREQUISITES | M0=PASS; M1=PASS; M2 original+Evidence Supplement=PASS; WO-M3-HANDOFF-001=PASS; WO-M3-WEB-001 readonly FD001 API=MAIN_PASS (acceptance GitHub commit f605b0d479c76b9ca0c073f1d7b42cfd844f435d, Roadmap GitHub commit b4725db9027cb17f6519d161da19db40c98c7301). |
| AUTHORITY | MAIN dispatches only to STUDENT-WEB Brain. Before dispatch Web Brain must reread latest GitHub main AGENTS.md, WORK_ITEM.md and this scope, check no active other worker; only Web Brain directs Web Own Worker. Web Own Worker rereads AGENTS.md and checks Git status before working. |
| SOURCE_OF_TRUTH | Existing accepted FD001_DATA_CONTRACT v1.0.1 main_acceptance=ACCEPTED, previously accepted M3 API GET /api/health, /api/catalog, /api/units and /api/history, and trusted local read-only FD001/train_FD001.txt, FD001/test_FD001.txt, FD001/RUL_FD001.txt (source hash unchanged). Original FD001 is whitespace-separated .txt, NOT a source CSV; user's "API/CSV" crosscheck means UI↔API↔actual original TXT, never fabricate a CSV source. |
| CORE_SCOPE | Browser-operable local readonly page with Dataset Split train/test, Engine Unit selector, inclusive Cycle start/end range, Sensor 1..21 selector, actual trend plot (x=Cycle, y=observed sensor value) and visible original-source provenance table/row, all driven by live accepted FD001 API. Deliver executable local launch, real reachable URL, real browser or reproducible human-operation UAT and screenshot/video/trace evidence plus independently verified UI↔API↔actual original TXT row checks. Not static screenshot-only. |
| AUTHORIZED_NEW_FILES | web/index.html; web/ui.js; web/style.css; tests/test_m4_ui.py; reports/M4_BROWSER_UAT.md; reports/M4_UI_API_SOURCE_CROSSCHECK.md; reports/M4_UI_EXECUTION_EVIDENCE.md; reports/M4_BROWSER_SCREENSHOT.png (only if securely captured of actual running page; optional additional bounded screenshot filenames require WEB Brain declaration in work record and MAIN approval); minimal frontend assets or test scripts strictly necessary only with MAIN prior approval. |
| AUTHORIZED_EXISTING_EDITS | web/api.py ONLY for minimal localhost same-origin static asset routes and hardcoded safe path allowlist, while preserving all four M3 API semantics/behavior; web/README.md for launch/browser instructions; tests/test_m3_api.py ONLY for backward-compat regression tests if needed; .gitignore minimal allowlisting M4 artifact filenames, ensuring raw FD001 remains excluded; WORK_ITEM.md M4 execution/review records. Other changes or external dependencies require prior MAIN authorization. |
| READ_ONLY | FD001 raw data, synthetic CSV, all accepted Research M2 contracts/parsers, M2 tests/reports, M3 Data Contract v1.0.1, M3 API contract, M1/M2 evidence, unrelated student files; no raw file copies or complete telemetry exports to GitHub. |
| OUT_OF_SCOPE | Evidence Prompt Generator; AI diagnosis, fault classification, RUL prediction, fabricated baseline threshold, M5 integration, public deployment, external web hosting, unrestricted source downloads, external CDN, modifying raw source or contract. Previous Roadmap described M4 as Evidence Prompt; scope is amended by new explicit STUDENT instruction without rewriting past decisions. |
| COMMIT_REVIEW | Single main only. Worker Commit+Push, inspect staged paths/content and origin/main, Web Brain independently checks actual GitHub code/tests/reports/images/commit/tree, returns WEB_ACCEPTED/FAIL/BLOCKED, MAIN independently verifies GitHub and decides M4 PASS/FAIL/BLOCKED. |

### M4-A Required actual browser UI

1. Serve a real interactive page over a documented local loopback URL, e.g. http://127.0.0.1:8765/ (only if implemented and verified). Same-origin static serving through existing accepted web.api is preferred so GET /api routes remain unchanged, no CORS workarounds, file:// and static mock UIs are NOT accepted. Existing M3 API may receive only narrow safe local static-GET handler; prohibit arbitrary file serving, path traversal, remote origins or enabling mutating HTTP methods. Python standard library + local HTML/CSS/JS preferred; any dependencies must be explicit and pinned/approved.
2. Controls must include split train/test, Engine Unit (actual split-local /api/units list), Sensor 1..21 (actual /api/catalog mapping) and inclusive positive Cycle range; label actual selected split/Unit/sensor/range and provenance. Populate options dynamically from GET /api/catalog and /api/units, never hardcode unit IDs or invent sensor physical units. Switching split must not reuse a stale previous split Unit or data; keep selection-to-API mapping exact.
3. Fetch /api/history using exact selected state and accepted API constraints (max 100 inclusive Cycles per request). Honor up to-100 window by validation, or if supporting longer UI range implement safe bounded pagination with explicit requests and verified Cycle merges; no unbounded single call, no silent truncation, no fabricated interpolation, smoothing, random data or decimated/misleading plot. Preserve x=actual numeric Cycle/y=raw sensor reading. Chart must render live data after user action; mouse/keyboard inspectable point/value (table acceptable for full exact provenance). Clean, legible UI with accessible label/focus and error/empty/loading states; actual observed values visibly tied to selected state.
4. Display source evidence on the page for selected point(s) and ideally each point via table/detail: dataset_split, unit_id, cycle, sensor_name, displayed numeric value, original token, project-relative source_file, source_sha256, 1-based physical_line_number, 0-based data_row_index, 1-based source_column_index and reread_matches. Never show raw machine absolute paths, arbitrary file content or stack traces. Keep numeric value and visual/chart row exactly matching accepted API; not fake healthy/fault status or predicted RUL.
5. HTTP 400/404/405/503 must surface truthful, understandable status without fabricating plots. For missing legitimate cycles show no point / clear empty window, not a sensor value=null. If null appears in future API fields, treat only as true missing datum per contract; UNKNOWN diagnosis is separate. Handle stale fetch responses/race conditions on quick selector switching; prevent selection and visualization mismatch.
6. No automatic public exposure: bind 127.0.0.1 by default, prevent external/network resource fetch (no CDN), keep original FD001 READ_ONLY and uncommitted. Browser-facing rendering must not introduce XSS from any API/source token; use safe DOM text insertion, not unsanitized innerHTML. Explicitly report if browser policies block scripting or local requests.

### M4-B UAT evidence — static screenshots alone do not satisfy

1. In student's real local workspace actually start the API+page from a clean checkout (with FD001 local originals in place) using documented exact command and record actual URL, response headers, console/server launch timestamp, versions, stdout/stderr and Exit Code; confirm API /api/health and real UI page load in an actual browser (Chrome/Edge or equivalent). If authentic automation via browser tool available, perform Playwright/Selenium or browser automation with evidence; otherwise perform verified human UAT with step-by-step explicit clicks/inputs/actual observed results, browser name/version, time and genuine trace (e.g., DevTools Network HAR sanitized or inspected request URL/status/selected response, console errors). A script that directly sends HTTP requests or static screenshot by itself is NOT a substitute for real UI interaction.
2. UAT scenarios: initial loaded state; split train→test→train with Unit options changing provenance; select Engine Unit 1 and then 2; Sensor 7 and another sensor (verify numeric selector ↔ original source columns); Cycle 1–20, change to bounded different range, near-final Cycle and empty valid window; test invalid range (start>end) and >100 span, 503 missing/hash/source error (can use temporary synthetic fixture, never modify originals); observe chart/table refresh and human-readable error state; reload page and check consistency. Must record exact UI state and matching actual API requests/responses; no browser UAT = BLOCKED/NOT_VERIFIED.
3. Capture real screenshots of running browser UI that show controls, rendered graph and selected row/source provenance; screens are supplemental to UAT log, not acceptance evidence alone. Screenshots/reports must contain no private path, personal identity, complete dataset or sensitive browser profile. If user-visible files need larger output, save bounded screenshots only and use Git LFS only if specifically authorized; no binary data dumps without permission.
4. Verification chain: for at least six distinct actual displayed points across Train Unit 1, a non-first Train Unit and Test Unit, including required /api/history?split=train&unit=1&sensor=7&start=1&end=20, compare (i) currently rendered UI text/chart plotted coordinates or exposed point data, (ii) live API response exactly at current selection, and (iii) an independent READ_ONLY reopening and parsing of FD001 source physical rows/columns in student's workspace. For Sensor 7 source column must be 12; for other Sensor N source column=5+N. Verify token → numeric, split/Unit/Cycle, SHA-256, 1-based physical line, 0-based data row, source column, original/reread and value. Must not assume physical line equals Cycle across arbitrary Units; don't use UI/API reference itself as the only source of 'independent' raw check. No per-Cycle RUL shown as original source.
5. Ensure screenshots correspond to actual tested version/Commit; record browser interaction sequence, request URL+HTTP status for selected UI state, observed chart point/value, original TXT row/source evidence; evidence may include small safe captured samples, not complete data. Negative and accessibility/keyboard-focused tests should demonstrate dynamic behavior; no fake transcripts. If browser automation is unavailable, honestly perform and record real manual interaction with observable proof; never label synthetic HTTP script as Browser UAT.
6. Re-run all M1/M2/M3 previously accepted tests plus new M4 UI checks; ensure M3 contract/HTTP/API still works unchanged. Source SHA256 before/after matches accepted M2 hashes. Verify clean server shutdown / port closed and no local source mutation. Secure Git staging; submit new UI source, tests, small screenshot/trace and execution/UAT reports.

### Acceptance Checklist

- [ ] Latest AGENTS.md and WORK_ITEM.md read before Web Brain / Own Worker dispatch; previous M3 API MAIN PASS confirmed.
- [ ] Real loopback UI URL loads, actual GET API endpoint response drives controls and live trend, not static mock.
- [ ] Train/Test, actual Unit, Sensor and inclusive Cycle range selectors work and dynamically update trend and matching provenance.
- [ ] Chart point labels, raw value table, x/y coordinates and original source row/column agree; no smoothing/interpolation/fake baseline/diagnosis.
- [ ] 100-cycle API request bound and invalid/empty/error/loading states correctly represented.
- [ ] At least six real UI ↔ live API ↔ independent raw TXT source checks across different Units and both splits; Sensor 7 maps original column 12; another sensor tested.
- [ ] Actual browser UAT evidenced with click/change sequence and response/console/network observations, not screenshot alone or HTTP-only tests.
- [ ] Actual browser screenshot(s) of running page with controlled bounded content, tied to Commit/version and sanitized for privacy.
- [ ] New UI tests plus full M1/M2/M3 regression pass; data SHA-256 before/after same; real commands, environment, timestamps, stdout/stderr, Exit Codes included.
- [ ] Loopback only, no raw files publicly exposed, source data READ_ONLY, no unsupported RUL claims, no unsafe path access/XSS.
- [ ] Only authorized files committed/pushed to main, GitHub independently reviewed by Web Brain and then MAIN.
- [ ] Worker returns READY_FOR_REVIEW, Web Brain returns BRAIN_TO_BRAIN_RETURN; only MAIN records final M4 PASS.

### STOP_IF

M3 API not MAIN_PASS; accepted FD001 contract mismatch or source SHA changes; unavailable sources; wrong split/Unit/Cycle/Sensor or source column; graph from synthetic/static values; no independent TXT source verification; no genuine browser/manual UAT; cannot prove dynamic selections and API correspondence; unsafe static file handler, external bind, API regression, unapproved dependency, data disclosure, personal path/secrets in screenshot or report; GitHub conflicts or unverified push; latest AGENTS.md governance conflict; worker attempts prompt generation/other milestone. Return BLOCKED with exact scope and evidence. Never fabricate UAT or enlarge scope.

### RETURN_TO STUDENT-MAIN Brain

TYPE=BRAIN_TO_BRAIN_RETURN
WORK_ITEM_ID=WO-M4-WEB-001
FROM=STUDENT-WEB Brain
RETURN_TO=STUDENT-MAIN Brain
STATUS=READY_FOR_MAIN_REVIEW / FAIL / BLOCKED
WEB_BRAIN_REVIEW=WEB_ACCEPTED / FAIL / BLOCKED
REPORT= actual local URL & launch, browser/version, interaction steps/screenshots/network evidence, selected API requests/responses & original TXT row/column crosscheck, UI controls/plot/source provenance, failure/empty cases, testing commands/stdout/stderr/Exit Codes, FD001 SHA256 before/after, git file scope/commit/tree, governance review and blockers.
M4 final MAIN acceptance pending; M5 not authorized.

### WO-M4-WEB-001 — WEB OWN WORKER EXECUTION RETURN (2026-11-25)

- **TYPE:** `WORKER_TO_BRAIN_RETURN` · **FROM:** Web Own Worker · **RETURN_TO:** STUDENT-WEB Brain · **STATUS:** `READY_FOR_REVIEW`.
- **BASELINE:** GitHub `main` `26fcdb66d4cea2f1c826024dbd0729ed50f5510f`。已核對 M3 MAIN PASS、學生授權與 FD001 v1.0.1 `ACCEPTED`。
- **DELIVERY:** `python -B -m web.api --port 8765` 提供本地互動 UI。僅新增三個固定的靜態 GET 路由。既有 M3 API 回歸通過。
- **BROWSER:** Chrome 158.0.8127.37 實際操作、DevTools Network / Console 記錄及顯示選取列的 PNG。已驗證切換、邊界、空範圍、輸入驗證、過期請求取消及獨立注入的 HTTP 503。
- **VERIFICATION:** 64/64 自動測試通過，含 5 項 M4 整合測試；八筆 UI ↔ HTTP API ↔ 原始 TXT 三方核對通過。三份原始檔前後 SHA-256 均符合契約。獨立子程序的啟停驗證結束碼為 0，確認 8765 關閉。
- **EVIDENCE:** [Browser UAT](reports/M4_BROWSER_UAT.md)、[來源核對](reports/M4_UI_API_SOURCE_CROSSCHECK.md)、[執行證據](reports/M4_UI_EXECUTION_EVIDENCE.md)、[真實截圖](reports/M4_BROWSER_SCREENSHOT.png)。提交與遠端核對隨 Worker 回報交付。

## WO-M4-WEB-001 — MAIN FINAL ACCEPTANCE (2026-11-25)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** WO-M4-WEB-001
- **WEB_BRAIN_REVIEW:** WEB_ACCEPTED / READY_FOR_MAIN_REVIEW (formal student-relayed return).
- **MAIN_FINAL_DECISION:** PASS; M4 interactive browser UI and actual UAT accepted under D-M4-001. M5 and Evidence Prompt not authorized.
- **BASELINE:** GitHub main 26fcdb66d4cea2f1c826024dbd0729ed50f5510f; Worker commit and reviewed main HEAD 2f6e29350b08e80ee88192f81b07066f1e7bca21. GitHub compare ahead=1 behind=0; only 12 authorized files: .gitignore, WORK_ITEM.md, web/api.py, web/README.md, web/index.html, web/style.css, web/ui.js, tests/test_m4_ui.py, reports/M4_BROWSER_UAT.md, reports/M4_UI_API_SOURCE_CROSSCHECK.md, reports/M4_UI_EXECUTION_EVIDENCE.md, reports/M4_BROWSER_SCREENSHOT.png.
- **INDEPENDENT GITHUB REVIEW:** MAIN fetched latest AGENTS.md, WORK_ITEM.md, ROADMAP.md, code, test definitions, three execution/UAT/source reports, GitHub commit, compare and complete nontruncated tree; downloaded the real GitHub PNG as base64 and visually inspected actual pixels. Did not rely solely on the Web Brain or Worker summary.
- **LIVE UI:** Start python -B -m web.api --port 8765; actual local URL http://127.0.0.1:8765/ on loopback 127.0.0.1. Fixed same-origin allowlist serves only /, /style.css, /ui.js as frontend static assets; M3 API GET endpoints unchanged. UI dynamically uses catalog and units APIs, split-local Unit, Sensor 1–21, inclusive maximum-100 Cycle selector, real /api/history points, SVG trend, observation table and selected full source provenance. No interpolation, synthetic data, RUL prediction or fault-diagnosis baseline. Safe DOM textContent used for source text, not unsafe innerHTML; stale selection requests are aborted.
- **TRUE BROWSER UAT:** Worker reports Chrome 158.0.8127.37 DevTools Protocol 1.3, Node v24.22.3, actual native key/mouse event calls and live Network.getResponseBody, Runtime.evaluate and Page.captureScreenshot, not HTTP-only tests. MAIN parsed the published live-browser transcript: 16 scenario JSON records, 8 source records all match=true, pointer screenshot, race cancellation net::ERR_ABORTED, final result OK, Chrome exit code 0, zero uncaught JavaScript exceptions. Scenarios covered initial page/reload; train-test-train; Engine Unit 1→2; Sensor 7→5; Cycles 1–20→5–12; final Cycle 192; empty 193–194 window; reversed / oversized windows rejected without API calls; exactly 100 points; stale Sensor 8 request canceled when choosing 9; a clearly labeled SYNTHETIC injected HTTP 503 and subsequent real HTTP 200 recovery. Initial Chrome driver key-event error corrected and disclosed.
- **TRUE SCREENSHOT:** MAIN visually read GitHub reports/M4_BROWSER_SCREENSHOT.png (1440×1020). It shows Train Unit 1, sensor_7, Cycle 1–20, 20 SVG points, selected Cycle 4 value 554.45, raw column 12, physical line 4, data row 3, original source token, SHA-256 and reread_matches=true. Screenshot supplements dynamic UAT, not substituted for it.
- **UI↔API↔ORIGINAL TXT EVIDENCE:** Eight public-safe sample comparisons from actual Chrome DOM/SVG and live HTTP response were independently re-read by Worker from original FD001 whitespace-separated TXT physical lines and column tokens; MAIN independently crosschecked logged samples, report and prior accepted FD001 semantics. Train Unit 1 sensor_7 Cycles 1=554.36 (line1,row0), 10=553.59 (line10,row9), 20=554.81 (line20,row19); Test Unit 1 sensor_7 Cycle1=553.90 (line1,row0); Train Unit2 sensor_7 Cycle1=554.53 (line193,row192); Train Unit2 sensor_5 Cycle5=14.62 (line197,row196) and Cycle12=14.62 (line204,row203); Train Unit1 sensor_5 Cycle192=14.62 (line192,row191). Sensor 7 source column 12, Sensor 5 column 10; all eight machine-parseable source events mark match=true. Original FD001 source is TXT, not invented CSV.
- **REGRESSION/EVIDENCE:** Worker saved local PowerShell 7.6.9, Python 3.12.7, Chrome/Node, actual commands, timestamps +08:00, stdout/stderr and Exit Codes. Full python -B -m unittest discover -s tests -v: 64/64 OK in 25.433s, exit 0 (M1 7, M2 core 22, M2 evidence 11, M3 API 19, M4 UI 5). node --check web/ui.js exit 0. Final controlled server startup/shutdown child Exit Code 0 and loopback port closed. Initial preview/lifecycle Exit Code 1 were disclosed with later successful recovery, not omitted.
- **SOURCE INTEGRITY:** Worker before/after local SHA-256 match accepted contract: Train 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8; Test 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851; RUL a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca. Nontruncated remote GitHub tree contains no original FD001 files, synthetic CSV, full sensor export, secrets, M4 Evidence Prompt or M5 artifact. Original FD001 remains READ_ONLY.
- **LIMITATION:** MAIN did not access student local Windows FD001 originals or personally rerun Chrome/HTTP; MAIN verified GitHub code, screenshot, transcript, tests and consistency. Local SHA-256, browser operations and exits are grounded in Worker-preserved execution evidence, not claimed as MAIN-local reproduction.
- **NEXT_GATE:** M4 PASS / CLOSED. M5 and Evidence Prompt work require a fresh explicit STUDENT authorization; no automatic dispatch.
- **RETURN_TO:** STUDENT.


## WO-EP-WEB-001 — Source-grounded Evidence Prompt Generator (2026-11-25)

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-EP-WEB-001 |
| MILESTONE | POST-M4-EVIDENCE-PROMPT-SUPPLEMENT; standalone approved feature; does NOT reopen M4 or authorize M5 Final Integration |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-WEB Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT on 2026-11-25: add Evidence Prompt Generator to existing FD001 website based on selected Engine/Cycle/Sensor with copy, source indexes, quality and known/inferred/unknown limitations |
| STATUS | PASS / MAIN_ACCEPTED（2026-11-25；STUDENT-MAIN Brain 獨立審閱 GitHub 實際程式、19 個 Chrome Browser UAT 情境、Native Clipboard、9 筆四方來源核對及 75 項測試；WEB_BRAIN_REVIEW=WEB_ACCEPTED；原 M4 PASS 保留，M5 未授權） |
| PREREQUISITES | M0, M1, M2, M3 API and M4 interactive UI all MAIN PASS; M2 Evidence Supplement accepted; Data Contract v1.0.1 main_acceptance=ACCEPTED. Last accepted M4 Roadmap HEAD 52a3eaa6df372d56c37dec21632e6dca33444712. |
| AUTHORITY | Only STUDENT-WEB Brain may instruct Web Own Worker; MAIN must not bypass hierarchy. Brain and Worker each reread current GitHub main AGENTS.md and WORK_ITEM.md before dispatch/execution. Single main and one active work order; separate Worker Commit+Push, Web Brain independent review, MAIN final acceptance. |
| INPUT | Accepted local read-only FD001 DATA CONTRACT v1.0.1; live M3 GET /api/health, /api/catalog, /api/units, /api/history; accepted M4 browser state and selected point; approved M2 FD001 Evidence Classification and M2 quality statistics. Original FD001 are whitespace-separated TXT (not CSV). |
| GOAL | Add a visible, dynamically generated, copyable plain-text Evidence Prompt tied EXACTLY to current Split (Train/Test), Engine Unit, inclusive Cycle range and Sensor, optionally distinguishing selected clicked observation from whole window. No external AI/API requests; the user alone decides whether to paste copied text into another service. |
| ALLOWED_EXISTING_CHANGES | web/index.html, web/ui.js, web/style.css, web/README.md, WORK_ITEM.md and minimal .gitignore; tests/test_m4_ui.py only if needed for backward-compatible UI contract tests. Preserve all previous accepted behavior. |
| ALLOWED_NEW_FILES | web/evidence_prompt.js (optional but preferred deterministic formatter), tests/test_evidence_prompt.py OR tests/test_evidence_prompt.mjs, reports/EP_BROWSER_UAT.md, reports/EP_SOURCE_CROSSCHECK.md, reports/EP_EXECUTION_EVIDENCE.md, reports/EP_BROWSER_SCREENSHOT.png (only genuine local browser screenshot and safe small content). Different paths/dependencies require MAIN advance approval. |
| READ_ONLY | web/api.py, Research/M2 parser and quality/classification code, all FD001 and synthetic originals, M2 Data Contract, M3 API Contract and all accepted past reports/tests outside explicitly allowed paths. No new API endpoint needed; do not modify original raw data or add exports. |
| OUT_OF_SCOPE | M5 final integration and acceptance, actual LLM integrations/auto-submission, RUL prediction, fault detection/diagnosis, health score, artificial threshold/baseline, external CDN/hosting, raw source uploads, complete FD001 series publication. |
| ACCEPTANCE_AUTHORITY | Web Own Worker can report only READY_FOR_REVIEW; Web Brain independently reviews actual GitHub source, test, source evidence and UAT; MAIN independently decides PASS, FAIL or BLOCKED. |

### Feature requirements

1. Present a clearly labelled Evidence Prompt Generator with readable/selectable preview and Copy button within the accepted FD001 Sensor Explorer. Must generate from LIVE confirmed M4 selected split/unit/sensor/start/end and the matching current GET /api/history response, not hard-coded samples, stale requests, only the selected chart dot or an unrelated unit. If one point was clicked, identify it as a separate focused observation without replacing the entire selected window.
2. Every prompt includes NASA C-MAPSS FD001, the accepted contract version 1.0.1, source split train/test, unit, sensor, inclusive requested Cycle window, actual observed cycle range and count, correct project-relative source_file and exact SHA-256. Explain original whitespace-delimited TXT layout: column 1 Unit ID, 2 Cycle, 3-5 operational settings 1-3, 6-26 Sensors 1-21; sensor N maps to 1-based source column 5+N; original physical_line_number is 1-based and data_row_index 0-based, neither generally equals Cycle across all Units. Never describe source as an invented CSV.
3. Include ALL actual returned observations for the selected API bounded window of maximum 100 inclusive cycles (no silent truncation or resampling). Each record must show actual Cycle, numeric sensor value, verbatim original token, physical source line, zero-based row, 1-based sensor source column and reread_matches; file/hash may be in a shared header only when identical and unambiguously tied to every record. An absent cycle is not a null measurement. If request has no observations, do not produce a valid analysis prompt.
4. Data Quality must be fact-based: cite actual /api/catalog split-scoped missing count and verified contract/hash state; clearly distinguish split-global reported row count/missing count from selected-window observed count and descriptive range. If computing window min/max, population mean or endpoint difference, use only live selected observations with explicit formulas and scoped labels; a quality constant/near-constant heuristic in the M2 report is a statistical data-quality rule, NEVER a physical healthy/fault baseline. Do not invent sensor units, wall-clock timestamps or missing-value imputations.
5. Use explicitly titled KNOWN / OBSERVATION, INFERENCE / DESCRIPTIVE ONLY, and UNKNOWN / NOT EVIDENCED sections. Known contains raw facts and source refs. Inference contains transparent bounded descriptive arithmetic (e.g. last-point minus first-point with actual two Cycles and values, window min/max) without asserting monotonicity, degradation or failure; for a single actual point do not label a zero delta as meaningful trend. Unknown must cover fault occurrence/type/severity/time, health status, root cause, normal/abnormal threshold or diagnostic baseline, failure probability, physical unit if not documented, model-predicted RUL.
6. Train/Test/RUL semantics: Train follows run-to-failure convention but 26 raw Train columns include no fault-class or original per-Cycle RUL. Test is a partial record and its last observed Cycle is NOT the failure point. The RUL_FD001 file contains Test ground-truth labels at each Test Unit last observed Cycle, but /api/history does not supply these and they are not model predictions; DO NOT create Test RUL, Train derived RUL, any predicted RUL or label as part of the prompt unless a separate, formally authorized source-supported extension is granted.
7. Explicitly instruct external AI in the prompt: answer ONLY using the supplied observations, separate known/derived/unknown, retain exact indexing and provenance, never invent faults, health conditions, causal conclusions, thresholds or RUL/time-to-failure, and state UNKNOWN / INSUFFICIENT EVIDENCE when not supported. The feature generates prompt TEXT ONLY, not a prediction and not an outbound AI request.
8. Preview and copy behavior: plain text, safe textContent/value rendering (not unescaped HTML), Clipboard API with honest permissions/error handling and a documented tested fallback or explicit failure. Show Copied only after verified successful write. Copy text must EXACTLY match currently displayed preview in a real browser readback test. No automatic clipboard writes, localStorage storage, generated file export, unrequested network calls or server logs of copied content.
9. Never allow a stale prompt. On any selection change, new request/loading, invalid range, empty window, aborted response, raw-reference mismatch, API error/503 or server unready, immediately clear or disable preview/copy; only enable after returned split/unit/sensor/start/end and every source record match current controls and verified API response. Handle rapid Train/Test/Sensor switches and 503 recovery.
10. Preserve prior localhost 127.0.0.1/static allowlist/M3 API/FD001 raw READ_ONLY requirements. Limit public test evidence to small source-audited samples and do not commit a full prompt covering a real 100-Cycle window or complete raw history.

### Mandatory tests, browser UAT and evidence

- Actual local run with python -B -m web.api --port 8765 and verified http://127.0.0.1:8765/ URL. Perform genuine Chrome/Edge user gesture/DevTools UAT, not screenshot-only or Python HTTP-only tests. Record browser version, launch commands, current selection, Network GET status and response, visible prompt and clipboard copy readback. Demonstrate Clipboard write success and denial/failure with no fake success.
- At least six independent Prompt ↔ current UI ↔ live API ↔ original TXT physical-source-line/column/token/sha256 checks, covering Train Unit1 sensor7 Cycles1-20, another Train Unit sensor5 window, and a Test Unit sensor7 window. Reopen original TXT locally read-only; do not reuse API raw_reference as the sole independent check. For Sensor 7 original source column=12, Sensor 5=10. Include focused observation and whole-window differentiation.
- Test new split, Unit, sensor, range and selected point; zero-point valid window; one-point range; reversed/over-100 window; synthetic HTTP 503 then recovery; stale/out-of-order responses; reload; no remote LLM/network submission. Confirm prompt content updates exactly with current selection and only copied when valid.
- Run new prompt unit/negative tests and entire existing M1-M4 regression; document counts, commands, exact timestamps, full safe stdout/stderr, Exit Codes, real browser steps and evidence, before/after Train/Test/RUL approved SHA-256 and clean server shutdown/closed port.
- Verify git status/diff/stage names strictly allowed, no raw TXT/synthetic CSV/full trace/private machine paths/API keys/complete prompt leaked; Commit+Push to main and verify remote HEAD, Git Tree and Commit. Web Brain reviews actual code, tests, JSON/screenshot/UAT evidence from GitHub before returning.
- Report expected user-facing prompt wording and a small provenance-tested excerpt only; never claim that the external AI has performed a diagnosis or RUL estimate.

### ACCEPTANCE CHECKLIST

[ ] Exactly current selected state, live confirmed API points, all bounded observations and raw token/physical line/data index/column/source hash are present.
[ ] FD001 identification and 26-column meanings correct; Train/Test, partial Test and RUL ground-truth/model prediction distinct.
[ ] Split-scoped quality versus window statistics scoped accurately; no invented physical units or diagnostic baseline.
[ ] KNOWN / INFERENCE / UNKNOWN precise, arithmetic reproducible and anti-fabrication instruction clear.
[ ] Preview and copy work with actual browser clipboard readback; failure truthful; no remote AI calls.
[ ] Stale/invalid/empty/503 never expose a copyable prior prompt; 100-Cycle bound respected.
[ ] At least six source-audited samples across Train/Test, two Sensors and two Units.
[ ] Genuine browser UAT and screenshots plus source/API/DOM/clipboard evidence, not only static image.
[ ] M1-M4 full regression plus new tests pass; source hashes unchanged; localhost-only API maintained.
[ ] Worker commits only approved paths, no raw data or secrets; Web Brain independent GitHub review then MAIN final acceptance.

### STOP_IF

Accepted M4 or contract invalid; original hashes mismatch; source column/raw reference mismatch; stale or fabricated prompt values, diagnostic thresholds or RUL; copying invalid/stale content; unsupported clipboard behavior falsely reported; no real browser source and clipboard UAT; API regressions; source disclosure, credential or absolute private path; Git conflicts or nonconforming AGENTS; unauthorized M5 or LLM integration. Return BLOCKED with exact evidence, never guess results or extend scope.

### RETURN_TO STUDENT-MAIN

TYPE=BRAIN_TO_BRAIN_RETURN
WORK_ITEM_ID=WO-EP-WEB-001
FROM=STUDENT-WEB Brain
RETURN_TO=STUDENT-MAIN Brain
STATUS=READY_FOR_MAIN_REVIEW / FAIL / BLOCKED
WEB_BRAIN_REVIEW=WEB_ACCEPTED / FAIL / BLOCKED
Must include latest baseline/commit, changed paths, local start/URL, browser scenario/clipboard readback and source crosschecks, full tests/execution/SHA-256 before-after, precise prompt example/safety checks, independent GitHub review and blockers. MAIN_FINAL_ACCEPTANCE=PENDING. M5 remains NOT_AUTHORIZED.

### WO-EP-WEB-001 — WEB OWN WORKER EXECUTION RETURN (2026-11-25)

- **TYPE:** `WORKER_TO_BRAIN_RETURN` · **FROM:** Web Own Worker · **RETURN_TO:** STUDENT-WEB Brain · **STATUS:** `READY_FOR_REVIEW`.
- **BASELINE:** GitHub `main` `3ee7d1dd3dcb3687eec61b2f2c8c7a3d157cc4fb`。已核對 M4、M3、M2 Evidence 的接受紀錄及 FD001 v1.0.1 `ACCEPTED`。
- **DELIVERY:** 同一頁面新增完整視窗的 Evidence Prompt、可選定觀測點及本地手動 Copy。Prompt 明列來源、欄位、索引、品質作用範圍、KNOWN／INFERENCE／UNKNOWN 與 Train／Test／RUL 限制。
- **UAT:** Chrome 158.0.8127.37 以原生點擊驗證剪貼簿寫入及 4,849 字元逐字讀回。隔離 `NotAllowedError` 顯示失敗，既有剪貼簿內容一致。測得 19 個請求／狀態情境、9 筆 Prompt ↔ UI ↔ API ↔ 原始 TXT 核對，以及 100 筆完整視窗。頁面外部 HTTP 請求為零，localStorage 與 sessionStorage 無項目。
- **VERIFICATION:** 11 項 EP 測試與 64 項 M1–M4 回歸通過。三份原始 TXT 前後 SHA-256 符合契約。真實服務程序正常退出，驗證 8765 關閉。
- **EVIDENCE:** [Browser UAT](reports/EP_BROWSER_UAT.md)、[逐筆來源核對](reports/EP_SOURCE_CROSSCHECK.md)、[執行證據](reports/EP_EXECUTION_EVIDENCE.md)、[實際截圖](reports/EP_BROWSER_SCREENSHOT.png)。提交與遠端檔案樹核對隨 Worker 回報提供。

## WO-EP-WEB-001 — MAIN FINAL ACCEPTANCE (2026-11-25)

- **TYPE:** MAIN_INDEPENDENT_GITHUB_ACCEPTANCE
- **WORK_ITEM_ID:** WO-EP-WEB-001
- **WEB_BRAIN_RETURN:** WEB_ACCEPTED / READY_FOR_MAIN_REVIEW (student-relayed formal return).
- **MAIN_FINAL_DECISION:** PASS — verified post-M4 Evidence Prompt Generator accepted. This does NOT reopen the already accepted M4, authorize M5 Final Integration or approve any external AI diagnosis service.
- **BASELINE_AND_DELIVERY:** prior main 3ee7d1dd3dcb3687eec61b2f2c8c7a3d157cc4fb; Web Worker commit and independently reviewed GitHub main 448f919ef039cb20b324c14e5d60ec7c0072f7e7. Compare ahead=1, behind=0. Exactly eleven work-order-authorized paths: .gitignore, WORK_ITEM.md, web/index.html, web/ui.js, web/style.css, web/README.md, tests/test_evidence_prompt.mjs, reports/EP_BROWSER_UAT.md, reports/EP_SOURCE_CROSSCHECK.md, reports/EP_EXECUTION_EVIDENCE.md, reports/EP_BROWSER_SCREENSHOT.png. web/api.py, M2 Research and both accepted contracts unchanged; complete recursive Git tree not truncated and excludes original FD001, synthetic_sensor.csv and complete sensor histories.
- **INDEPENDENT REVIEW:** MAIN actually fetched latest AGENTS.md, WORK_ITEM.md, ROADMAP.md, worker commit/compare/tree, web/ui.js, web/index.html, web/README.md, new Node test, EP_BROWSER_UAT.md, EP_SOURCE_CROSSCHECK.md, EP_EXECUTION_EVIDENCE.md, and real PNG in base64 (visually inspected actual pixels). Structured machine-parseable browser transcript was independently parsed by MAIN: browser=1, scenario=19, source=9 all match=true, clipboard=2, pointer=1, screenshot=1, race=1, safety=1, console=1, result=OK and browser_exit.code=0.
- **PROMPT SEMANTICS:** Prompt produced from the current validated Train/Test, Unit, sensor, inclusive Cycle window and accepted /api/health, /api/catalog, /api/units, /api/history data. Source is NASA C-MAPSS FD001; v1.0.1 accepted contract; original whitespace-delimited TXT; raw columns 1=Unit, 2=Cycle, 3–5=settings, 6–26=sensors, sensor_N 1-based source column N+5. Preview includes source relative file/hash, all original actual observation rows for <=100 Cycle window, original numeric value and token, 1-based physical line, 0-based nonblank data row, 1-based sensor column and reread_matches. A focused clicked Cycle is explicitly separate from the complete selected window; no artificial or interpolated values.
- **KNOWLEDGE LIMITS:** Prompt separates split-scoped /api/catalog missing/row/unit quality from window-only count, min/max, mean and endpoint difference with derivation. Dedicated KNOWN/OBSERVATION, INFERENCE/DESCRIPTIVE ONLY and UNKNOWN/NOT EVIDENCED sections. It explicitly rules out unsupported fault occurrence/type/severity/time, health status, normal baseline, threshold, causal explanation, sensor physical unit and predicted RUL; no train derived RUL nor Test ground truth label is fabricated from /api/history. It instructs external AI to abstain/mark insufficient evidence. Does NOT invoke any external model or upload the prompt.
- **NATIVE CLIPBOARD UAT:** On Chrome 158.0.8127.37, real mouse click and navigator.clipboard.readText confirmed exactly 4849 characters, including 79 CRLF line breaks, matching DOM preview; both SHA-256 eb9c7b34b9d57a23b4186262f82949ec0ba4feae9969a92dc20f43c3c4fd0254. First LF/CRLF diagnostic mismatch explicitly disclosed; correction recorded and retested. Isolated SYNTHETIC NotAllowedError produced truthful Copy failed and left prior clipboard content unchanged. Copy produced zero HTTP requests; no auto copy. Screenshot visually inspected: 1338×418, current Train Unit1 sensor7 Cycles1–20, focus Cycle4, prompt header/provenance and Copied to clipboard indication. Screenshot corroborates dynamic UAT rather than substituting for it.
- **REAL BROWSER SELECTION/ERROR COVERAGE:** 19 Chrome CDP scenarios: initial load, split Train↔Test, Units 1↔2, Sensors 7↔5, multiple Cycle windows, focused Cycle, singleton, valid empty window, reversed/oversized window rejected without API, full exactly-100-row prompt, reload, rapid Sensor8→9 cancellation with previous net::ERR_ABORTED, isolated SYNTHETIC HTTP 503 fail-closed then real recovery. UI clears preview and disables Copy on invalid/empty/error/stale state; copy state only succeeds on actual clipboard write. Console showed zero uncaught JS exceptions; the recorded 503 network error was deliberately injected and documented.
- **PROMPT_UI_API_ORIGINAL_SOURCE_CROSSCHECK:** MAIN independently inspected nine source JSON events and GitHub source crosscheck report; all match=true with live HTTP 200 response, selected DOM/SVG prompt row and Worker read-only physical TXT reopening. Train Unit1 sensor7 cycles1=554.36(line1,row0),10=553.59(line10,row9),20=554.81(line20,row19); Test Unit1 sensor7 cycles6=554.22(line6,row5),8=553.59(line8,row7); Train Unit2 sensor7 cycle1=554.53(line193,row192); Train Unit2 sensor5 cycles5=14.62(line197,row196),12=14.62(line204,row203); Train Unit1 sensor5 cycle192=14.62(line192,row191). Sensor7 maps to source column12; Sensor5 to column10. Source file path, tokens and source_sha256 agree within captured real source checks. The source file is TXT, not CSV.
- **TESTS_AND_RUNTIME:** Worker-reported actual local Windows PowerShell 7.6.9, Python 3.12.7, Node 24.22.3, Chrome 158.0.8127.37, UTC+08:00 timestamps, commands and safe stdout/stderr/Exit Codes. node --check web/ui.js and node --test tests/test_evidence_prompt.mjs: 11/11 pass, exit 0. python -B -m unittest discover -s tests -v: 64/64 pass in 24.642s, exit 0. Total 75/75. Supervised loopback server startup via python -B -m web.api --port 8765, Chrome browser run, clean Python child exit=0, port_closed 10061. Initial clipboard newline mismatch disclosed; final test completed.
- **SOURCE_SHA256_WORKER_EVIDENCE:** Before / After / accepted Contract agree: Train 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8; Test 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851; RUL a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca. Actual browser safety JSON: zero external page requests, GET only, zero HTTP requests from Copy, empty local/session storage; raw files READ_ONLY and uncommitted, accepted localhost-only API unchanged.
- **MAIN_LIMITATION:** MAIN fetched and inspected GitHub code, evidence, screenshot and structured browser transcript and independently checked their consistency. MAIN cannot access student's Windows FD001 originals or independently re-run local Chrome, clipboard, source hash and HTTP operations; those facts rely on Worker-preserved authentic execution records and are not claimed as MAIN-local reproduction.
- **FINAL_GATE:** WO-EP-WEB-001 = PASS/CLOSED; previous WO-M4-WEB-001 PASS preserved, M5 Final Integration and any external AI implementation remain NOT_AUTHORIZED pending a fresh explicit STUDENT decision. Do not auto-start any later work.
- **RETURN_TO:** STUDENT.


## WO-M5-WEB-001 — FD001 Final Integration Browser UAT and Two-tier Acceptance (2026-11-25)

| FIELD | VALUE |
| --- | --- |
| TYPE | BRAIN_TO_BRAIN_WORK_ORDER |
| WORK_ITEM_ID | WO-M5-WEB-001 |
| MILESTONE | M5 — Final Integration Browser User Acceptance Test, scope specifically granted by STUDENT. This is M5 Browser UAT execution and evidence; MAIN may grant final acceptance only after Web Domain Acceptance and independent main review. |
| FROM | STUDENT-MAIN Brain |
| TO | STUDENT-WEB Brain |
| RETURN_TO | STUDENT-MAIN Brain |
| AUTHORIZED_BY | STUDENT 2026-11-25: requests Web Brain to task its Own Worker with M5 Browser UAT of Unit/Sensor/Cycle, original FD001 rows, invalid input, null, API interruption, Evidence Prompt; retain actual commands, Exit Codes, screenshots and real results, Web Domain Acceptance first, MAIN final acceptance second. |
| STATUS | COMMAND_DISPATCHED / RELAY_STATUS=PENDING_STUDENT_RELAY / WEB_OWN_WORKER=NOT_STARTED / WEB_DOMAIN_ACCEPTANCE=PENDING / MAIN_FINAL_ACCEPTANCE=PENDING |
| PREREQUISITES | M0–M3, M4 UI and Post-M4 Evidence Prompt work item WO-EP-WEB-001 all MAIN PASS; FD001_DATA_CONTRACT v1.0.1 ACCEPTED; current GitHub main baseline 7c20760e2d09f35da19c0db1e75744620db3ccea. No other active work order. |
| COMMAND_AUTHORITY | STUDENT-MAIN dispatches only to STUDENT-WEB Brain, which independently preflights current GitHub main governance and directs Web Own Worker. Worker separately rechecks latest AGENTS.md and work order before execution. No MAIN direct-to-Worker bypass. |
| OBJECTIVE | Demonstrate the complete real local Unit -> Cycle -> Sensor -> live Trend -> Source Evidence -> copyable Evidence Prompt flow in a real browser and with independently reopened original FD001 rows, positive and failure states and actual reproducible evidence. Primarily verification, NOT new feature development. |
| SOURCES | Trusted local READ_ONLY FD001/train_FD001.txt, FD001/test_FD001.txt, FD001/RUL_FD001.txt; already-accepted FD001 API GET /api/health, /api/catalog, /api/units, /api/history and validated browser UI and Evidence Prompt. Original files are whitespace-separated TXT; do not rename them CSV. |
| ALLOWED_NEW_FILES | tests/test_m5_browser_uat.mjs and/or tests/test_m5_browser_uat.py (genuine browser driver / standalone controlled tests), reports/M5_BROWSER_UAT.md, reports/M5_SOURCE_CROSSCHECK.md, reports/M5_EXECUTION_EVIDENCE.md, reports/M5_BROWSER_SCREENSHOT.png (actual browser image, bounded public-safe), reports/M5_FINAL_INTEGRATION_CHECKLIST.md. Any extra path/large binary artifact needs MAIN advance approval. |
| ALLOWED_EXISTING_CHANGES | WORK_ITEM.md for Worker/Web Domain review and MAIN final decision; web/README.md limited to tested startup/UAT/cleanup instructions; .gitignore minimal new evidence allowlisting. No implementation edits by default. If a failure requires modifications to web/api.py, web/ui.js, research, prior tests or contracts, STOP_IF and request MAIN narrowly scoped remediation authorization before editing; do not silently patch accepted M3/M4/EP. |
| READ_ONLY | All original FD001 files and synthetic_sensor.csv; all previous acceptance artifacts and Research M2 analysis, M3 API contract, validated UI/API and Evidence Prompt source, except explicitly allowed README and governance records; secrets and student private data. |
| OUT_OF_SCOPE | New model/LLM API, RUL prediction, fault classification, baselines/thresholds, changes to accepted data contract, public service, remote hosting, any raw data export, modifying source rows or force pushing Git history. |
| GATES | Gate 1 Worker READY_FOR_REVIEW with real browser/local/source evidence and GitHub commit+push. Gate 2 Web Brain directly checks GitHub code/test/evidence and remote tree then records WEB_DOMAIN_ACCEPTANCE=PASS or FAIL/BLOCKED in WORK_ITEM.md and sends formal BRAIN_TO_BRAIN_RETURN. Gate 3 MAIN independently reads GitHub latest work, tests and real UAT evidence and records MAIN_FINAL_ACCEPTANCE=PASS/FAIL/BLOCKED. A Worker self-PASS or Web Brain domain PASS cannot substitute for MAIN final PASS. |

### Required positive end-to-end browser UAT

1. From student's actual local workspace with verified FD001 originals, start python -B -m web.api --port 8765. Verify readiness with direct GET /api/health and that http://127.0.0.1:8765/ loads in real Chrome or Edge, record exact OS, Python, Node and browser versions, timezone, UTC offset, startup command, process/PID identification where safe, real URL and HTTP status. The browser must actually operate page controls; a static screenshot, synthetic-only test or HTTP-only script is insufficient.
2. In live browser, test Train and Test split selection, actual Unit1 and Unit2, Sensor7 and a second sensor such as Sensor5, inclusive Cycle1–20, 5–12, first and final observed boundaries, exact 100-cycle window, singleton and valid no-observation window. Capture user actions (native mouse/keyboard or reliably automated browser events), current DOM controls, actual Network request URL/status/body, graph coordinates/data-cycle and observation table/provenance. Verify changing split resets Unit source correctly and no stale response or ghost points.
3. For at least eight selected displayed observations across Train Unit1, another Train Unit and Test Unit, including Sensor7 and a different Sensor, compare (a) UI selection, value/chart/table/source details, (b) actual GET /api/history HTTP body, (c) Evidence Prompt row and (d) independently reopened original FD001 TXT bytes/physical line/token. Verify source SHA-256, split, Unit, Cycle, numeric value versus verbatim token, 1-based physical_line_number, 0-based data_row_index, source_column_index = sensor index + 5 (sensor7 -> column12; sensor5 -> column10), reread_matches. NEVER equate physical line with cycle across Units. Do not copy whole raw dataset into GitHub.
4. Evidence Prompt: verify current confirmed split/Unit/Sensor/Cycle window, source file/hash, 26-column layout, observed count/scope and all returned observations for 100-Cycle selection, split vs window data quality, KNOWN / INFERENCE / UNKNOWN, Train/Test/RUL distinctions, and external-AI abstention from unsupported failure, health and RUL claims. Native user-gesture Copy and subsequent real browser Clipboard readText must match preview exactly including Windows CRLF; test isolated denied permission and no false Copy success, no auto-network submission and prompt invalidation on split/Unit/Sensor/range change.
5. Initial load, reload and multiple independent control changes should produce deterministic visible results, not cached screenshots. Capture at least two genuine screenshots of relevant states if privacy-safe within one approved composite screenshot or ask MAIN for additional screenshot path approval; screenshots supplement real UAT transcript and cannot replace it.

### Failure modes and null/missing semantics (mandatory)

1. Invalid input: reversed range, 0/negative/malformed Cycle, >100 inclusive Cycle span, Sensor outside 1..21, wrong/absent split, unknown Unit, malformed/duplicate/unknown API parameters, unsupported methods. Exercise UI error handling and direct API error contract as appropriate. Capture actual HTTP 400/404/405 and safe error codes where supported; where frontend prevents the request record the absence of a network call and disabled/cleared chart and Prompt. Do not invent status codes.
2. Real FD001 M2 quality acceptance states zero missing values for Train/Test and API currently returns no JSON null. Verify valid empty Cycle range returns HTTP 200, points=[], count=0 and no phantom chart point/prompt; absent Cycle is NOT null. For actual null handling, use a clearly labelled separate SYNTHETIC fixture or isolated mocked response and assert the accepted missing/null rule and UI fail-closed behavior. Do not modify trusted FD001 or insert null into live response while claiming it is NASA data. If the contract prohibits null in verified source, treat a null sensor value as invalid/503 or documented test failure, not normal observed data.
3. API interruption: perform actual controlled local server stop/unreachable or equivalent genuine network failure during a browser visit, observe Network failure, meaningful UI error, cleared data/Prompt and disabled Copy. Restore the real local server, repeat request and verify recovery and correct selected data. ALSO test the accepted API 503 unready/integrity failure safely using an isolated synthetic fixture/injected response if necessary; label 503 injection SYNTHETIC and separate it from the genuinely stopped-server outage. Do not mutate or tamper with trusted originals to induce a failure.
4. Race/stale state: rapidly change Sensor/Unit/split during an in-flight request, and deliberately verify that a late response cannot overwrite new controls, chart, source reference or copyable Prompt. Test clipboard denied/pending completion and ensure any stale or failed window is never copyable.
5. Fail-closed data integrity: genuine /api/health confirms accepted source hashes. Missing/altered synthetic fixtures must produce documented fail-closed errors; do not test source alteration on originals. Distinguish UNKNOWN fault status from missing measured value and from absent Cycle.

### Evidence deliverables and execution contract

- reports/M5_BROWSER_UAT.md: browser name/version, real local URL, time, scenario-by-scenario actual click/key sequence, before/after controls, DOM/chart/table/prompt/copy, Network URL/body/status, expected versus actual and PASS/FAIL, screenshots references, actual server stop/restart behavior and exact failure labels.
- reports/M5_SOURCE_CROSSCHECK.md: at least 8 small real rows with four-way UI/API/Prompt/independently reopened TXT checks; source relative paths/hashes/physical-line, row/column and token. No private local paths, complete 100-row text, or full raw series.
- reports/M5_EXECUTION_EVIDENCE.md: exact commands, environment versions, actual start/end local timestamps/timezone, stdout and stderr with Exit Codes from every command (even first unsuccessful attempts), automated browser driver script and invocation if used, status/response excerpts, verified screenshot origin, server stop/restart and port-closed checks, before and after three FD001 SHA256 vs contract, git status/staged safety and remote HEAD.
- reports/M5_FINAL_INTEGRATION_CHECKLIST.md: one row per required functional/error/source/prompt/governance item with linked evidence, Web Domain Acceptance recommendation and separate MAIN final field PENDING at Worker stage.
- Run all previously accepted M1/M2/M3/M4 Python tests (baseline 64) plus Evidence Prompt Node tests (baseline 11), new M5 tests and syntax checks; record actual counts, stdout/stderr, exits; no regression allowed. The 64/11 baseline counts are reference only, not predeclared successful outcomes for this run.
- Before/after SHA-256 of READ_ONLY three local originals must match accepted contract. Confirm no unexpected browser outgoing requests or storage; no auto data transfer to an LLM. Real browser screenshots and evidence must be sanitized, bounded, and generated from running page and linked to the tested commit or exact source revision.
- Web Own Worker checks staged changed file names, raw data exclusion and remote branch main, Commit+Push only allowed files; report exact commit URL, SHA, full changed paths and verified remote Git tree. Web Brain independently reviews code/test and real evidence after push; reports domain decision with supporting GitHub links and any unresolved limitation. MAIN conducts separate final GitHub acceptance and documents precise scope.

### STOP_IF and final decision

STOP_IF: no true browser UAT, only screenshots/HTTP calls; inability to verify independent original source rows; null mistaken for absent Cycle or generated source data; unhandled real API outage; stale copyable Prompt; fabricated fault/RUL; original source hash change; private data/complete dataset published; unsupported Web modifications; dependency/console failure not transparently recorded; git conflict, no push, different branch, AGENTS mismatch or prior acceptance missing.

If a criterion fails, return FAILED or BLOCKED with exact reason and actual evidence. Do not self-report PASS or proceed to MAIN final without Web Domain independent acceptance.

### RETURN_TO STUDENT-MAIN Brain

TYPE=BRAIN_TO_BRAIN_RETURN
WORK_ITEM_ID=WO-M5-WEB-001
FROM=STUDENT-WEB Brain
RETURN_TO=STUDENT-MAIN Brain
STATUS=READY_FOR_MAIN_REVIEW / FAIL / BLOCKED
WEB_DOMAIN_ACCEPTANCE=PASS / FAIL / BLOCKED
MAIN_FINAL_ACCEPTANCE=PENDING
Include exact Worker commit and Web Brain review commit, current main HEAD, actual local start URL/command, real browser operations and screenshots, actual GET statuses/errors and genuine outage/recovery, null-vs-no-data fixture, at least 8 source checks, full prompt copy, regression counts, source SHA256 before/after, GitHub tree and work scope, known limitations. MAIN must independently inspect GitHub before its final decision.
