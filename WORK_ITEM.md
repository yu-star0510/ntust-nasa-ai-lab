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
| `STATUS` | `READY_FOR_REVIEW`（由 `COMMAND_DISPATCHED` 更新） |
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
| `BRAIN_REVIEW` | 待 STUDENT-MAIN Brain 從 GitHub 獨立讀取四份文件、確認提交與公開範圍，並逐項審查。 |
| `STUDENT_APPROVAL` | 已批准 `WO-M0-001`。後續里程碑須分別取得正式批准。 |
