# AI Team Governance and Operating Rules

本規則適用於 NASA C-MAPSS FD001 Health Analysis Website 專案。適用版本為 GitHub `main` 最新提交中的 `AGENTS.md`。

## 角色與權限

| 角色 | 職責與權限 |
| --- | --- |
| STUDENT | 專案最高決策者，正式批准工作單與里程碑轉換，並可隨時要求停止工作。 |
| STUDENT-MAIN Brain | 擔任總經理與專案治理者，制定 Roadmap、派工及訂定驗收標準。獨立讀取 GitHub `main` 的成果，逐項審查並記錄 `PASS`、`FAIL` 或 `BLOCKED`。必須取得 STUDENT 授權才能啟動下一項工作。Worker 的回報僅供核對，審查以 GitHub 實際成果為準。 |
| MAIN Own Worker (Codex) | 依正式批准的工作單執行，只修改獲准檔案，執行必要測試並提供可驗證證據。完成後須 Commit 並 Push 至 GitHub `main`，回報實際 GitHub 連結、提交資訊和測試結果。無權自行派工、批准工作或進入下一階段。 |
| 其他 Worker | 預設無執行權限。須由 STUDENT 授權並經 STUDENT-MAIN Brain 正式派工後，才能依工作單執行。 |

## 唯讀與資料公開

- `synthetic_sensor.csv`、NASA C-MAPSS FD001 原始資料（含 `train_FD001.txt`、`test_FD001.txt`、`RUL_FD001.txt`）、其他未明確授權修改的本地資料及學生原始研究成果均預設為 `READ_ONLY`。
- Worker 禁止修改、刪除或覆寫上述資料。合成數據一律標示為 `SYNTHETIC`，不得宣稱源自 NASA 真實資料。
- 本地資料集的上傳需要 STUDENT 明確批准。API Key、Token、密碼、認證憑證與個人資訊禁止公開。
- M0 僅授權新增或更新 `AGENTS.md`、`ROADMAP.md`、`WORK_ITEM.md`、`DECISIONS.md`，以及用於保護資料與機密的 `.gitignore`。M0 不得讀取或分析 NASA 原始資料，不得擴大工作範圍。

## 強制 Git 治理

1. 每次派工前，Brain 必須從 GitHub `main` 實際讀取最新 `AGENTS.md`，以該版本訂定工作單。每張工作單須要求 Own Worker 遵守該規則，Worker 開工前也要核對。若工作單與既有規則衝突，停止並回報 `BLOCKED`。
2. 當指定儲存庫及既有治理均未建立時，STUDENT 批准的 `WO-M0-001` 可先建立 `AGENTS.md` 再做首次提交。此例外僅供 M0 初始化使用一次。
3. 專案只使用 `main`，所有工作循序進行，同一時間只允許一張已獲准執行的工作單。前項工作須先經 Brain 驗收通過，再由 STUDENT 批准下一項工作。
4. Worker 須檢查實際暫存檔案及內容，確認只有獲准公開的檔案和資訊，再 Commit 並 Push 至 GitHub `main`。禁止 force push、刪除歷史或其他未授權的破壞性操作。
5. Worker 須確認遠端 `main` 及提交內容，再提供儲存庫與提交連結、Git Commit ID、驗證摘要及各項檢查結果。
6. Brain 必須從 GitHub `main` 讀取成果，確認提交身分，逐項比對工作單驗收條件並記錄審查結果。GitHub 無法存取或無法驗證成果時，須回報 `BLOCKED`。

## 停止與驗收

觸發工作單中的任何 `STOP_IF` 時，Worker 必須立即停止，記錄已執行的步驟、證據及阻礙。工作單註冊、狀態更新與驗收記錄使用 [WORK_ITEM.md](WORK_ITEM.md)。

| 結果 | 條件 |
| --- | --- |
| `PASS` | 工作單的驗收條件全部符合，GitHub `main` 存在可驗證成果，且 Brain 已獨立讀取及審查。 |
| `FAIL` | Brain 審查發現可驗證成果有未達驗收條件的項目。 |
| `BLOCKED` | 缺少必要權限、資料、工具或驗證能力，或觸發工作單停止條件。 |

工作交付成功時，Worker 只能回報 `READY_FOR_REVIEW`。遇到執行失敗或阻礙時，Worker 須如實回報 `FAILED` 或 `BLOCKED`。最終驗收一律由 Brain 記錄，下一項工作的正式批准一律由 STUDENT 提供。
