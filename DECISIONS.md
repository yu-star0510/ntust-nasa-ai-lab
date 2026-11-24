# Project Decision Log

本紀錄保留原始決策及其後續修訂。每筆新決策使用唯一 ID，註明日期、決策者、情境、內容、理由、影響及關聯工作單。修訂另增一筆決策、引用原決策 ID、說明變動與生效範圍，保留原紀錄。禁止無紀錄刪除或覆寫。

下列紀錄依 STUDENT 批准的 `WO-M0-001` 登錄，`DATE` 為 M0 本地登錄日期。

| DECISION_ID | DATE | DECISION_MAKER | CONTEXT | DECISION | RATIONALE | IMPACT | RELATED_WORK_ITEM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-M0-001 | 2026-11-23 | STUDENT | 專案啟動，需要角色、工作單與驗收制度。 | 批准 M0 治理規劃。 | 先確立權限和驗收依據，再開始實作。 | 可執行 M0 並建立治理與版本管理。 | `WO-M0-001` |
| D-M0-002 | 2026-11-23 | STUDENT | Brain 需要在 GitHub 審查實際提交。 | 授權建立公開儲存庫 `ntust-nasa-ai-lab`。 | 提供可持續查驗的共同版本來源。 | 僅工作單明確獲准的內容可提交及公開。 | `WO-M0-001` |
| D-M0-003 | 2026-11-23 | STUDENT | 里程碑有依賴關係，須循序派工。 | 採單一 `main` 分支及循序開發。 | 維持單一審查基準並避免工作範圍重疊。 | 同時只可執行一張已批准的工作單。 | `WO-M0-001` |
| D-M0-004 | 2026-11-23 | STUDENT | 驗收需要可在遠端核對的證據。 | Worker 必須 Commit 並 Push。Brain 必須從 GitHub 讀取實際成果才能驗收。 | 確保審查內容與公開提交一致。 | Worker 提供提交證據，Brain 獨立判定驗收結果。 | `WO-M0-001` |
| D-M0-005 | 2026-11-23 | STUDENT | 本地含 NASA 原始資料與合成 CSV。 | 原始 NASA 資料及合成 CSV 預設唯讀，禁止未經授權公開。 | 保護原始來源，維持後續比較與追溯的一致性。 | 未獲授權時，資料留存本地，任何合成數據顯示均須標明來源。 | `WO-M0-001` |
| D-M0-006 | 2026-11-23 | STUDENT | 現行工作單只有 M0 授權。 | M1–M5 尚未獲得執行授權，須逐階段驗收及批准。 | 讓每個里程碑使用上一階段已驗證且獲准的成果。 | Brain 完成前一項審查後，仍須等待 STUDENT 批准下一項工作。 | `WO-M0-001` |
| D-M2-001 | 2026-11-23 | STUDENT | WO-M1-RESEARCH-001 經 MAIN 正式驗收 PASS 後，STUDENT 指示「進行M2」。 | 正式批准啟動 M2，授權 STUDENT-MAIN Brain 向 STUDENT-RESEARCH Brain 下發 FD001 本地資料驗證、品質趨勢與 Data Contract 工單；由 Research Brain 才能管理 Research Own Worker。 | 確保里程碑依序進行且先驗證三份已信任本地檔案，再建立資料契約。 | 授權限 M2；原始 FD001 檔只可本地 READ_ONLY；不需再次上網確認來源；不批准 M3–M5 或資料公開；M2 只有 MAIN GitHub 驗收後才能 PASS。 | WO-M2-RESEARCH-001 |
| D-M2-002 | 2026-11-24 | STUDENT | M2 已由 MAIN 正式驗收 PASS，但缺少獨立 Observation / Inference / Unknown 三類來源證據與標籤/RUL 診斷限制報告；STUDENT 指示「進行未完成的部分」。 | 批准由 MAIN 向 STUDENT-RESEARCH Brain 派發單獨的 WO-M2-RESEARCH-002，補足驗證資料的證據分類；Research Brain 管理 Own Worker，MAIN 不越級派工。 | 使研究趨勢與可證觀測、有限推論及未知事項有明確界線，不把趨勢當故障、不捏造 baseline 門檻。 | M2 原 PASS 不撤銷；工作限 READ_ONLY 研究證據、測試與安全報告，Web/M3/M4 不隨本工作單執行；單一 main、依序 Commit+Push、Brain GitHub 審查。 | WO-M2-RESEARCH-002 |
| D-M3-001 | 2026-11-24 | STUDENT | M2 原工作與研究證據分類補充均經 MAIN 正式驗收 PASS；STUDENT 明確指示 MAIN 向 Web Brain 建立 M3 工單，要求在學生 workspace 以 FD001 建立唯讀 API 與真實來源列對照。 | 批准 M3-A（API-first）Brain-to-Brain 工作單 WO-M3-WEB-001，授權 MAIN 派給 STUDENT-WEB Brain；僅 Web Brain 可管理自己的 Web Own Worker。必須先解決 Research Data Contract v1.0.1 檔內 main_acceptance=PENDING 與 MAIN 已接受紀錄的交接差異，完成受控同步及相容測試，通過 Gate 後才能開始 Web Own Worker。 | 確保 API 沿用已驗證 FD001 來源與研究契約，正確區分唯讀觀測、缺值 null、來源 provenance、HTTP 正反回應與真實原始列交叉驗證。 | 只批准 /api/health、/api/catalog、/api/units、/api/history 的本地唯讀 API 階段；不包含全站 M3 PASS、M4 Prompt、模型訓練、原始資料上傳、未經治理的 Research Data Contract 修改。單一 main、循序派工、Worker Commit+Push、Web Brain 及 MAIN 分層驗收。 | WO-M3-WEB-001 |
| D-M3-002 | 2026-11-24 | STUDENT-MAIN Brain（承接 STUDENT 已批准 M3-A 前置交接及 STUDENT 轉交的 Web Brain 阻礙回報） | WO-M3-WEB-001 在 Web Brain 派工前發現 Research 契約 JSON/Markdown main_acceptance=PENDING，但 M2 MAIN 已接受；現行 validate_contract() 硬編碼 PENDING 才 valid，直接改元資料會使 Phase B 失敗。 | 接受 HANDOFF_CONTRACT_STATE 阻礙，M3-A/Web Own Worker 暫停。依已獲 STUDENT 批准的 M3-A 必要前置交接範圍建立 WO-M3-HANDOFF-001，由 Research Brain 先行管理 Research Own Worker 受控同步接受狀態、修正驗證及相容測試，再由兩級 Brain 驗收。 | 解除 Web API 開發前的矛盾狀態，要求驗證程式 fail-closed、不能改動來源資料語意或將 PENDING 當作接受。 | 單一 main、同時僅 Research 依附補正工作執行，Web 工作仍 BLOCKED；M2 原 PASS 保留，Web Own Worker 不可開始；不得自行修改 Research 原始檔案、上傳資料或啟動 M4。 | WO-M3-HANDOFF-001；WO-M3-WEB-001 |
