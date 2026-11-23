# NASA C-MAPSS FD001 Health Analysis Website Roadmap

專案最終交付為本地端網站，支援選擇 Engine Unit、Cycle 和 Sensor，顯示真實數值與 Sensor Trend，可查閱 Source Evidence，並依據來源數據產生 Evidence Prompt。

依 M0 至 M5 循序執行。每個里程碑均須先驗收，再由 STUDENT 正式批准下一階段。截至 2026-11-23：M0、M1 已由 STUDENT-MAIN Brain 正式驗收 PASS；STUDENT 已批准 M2 並由 MAIN 向 STUDENT-RESEARCH Brain 建立正式工單 `WO-M2-RESEARCH-001`（等待 STUDENT 轉交），M2 尚無執行成果、未通過驗收；M3–M5 均未授權。M2 的實際工作範圍與驗收依 `WORK_ITEM.md` 最新工單及 `AGENTS.md` 為準。

## M0 — Governance Initialization

- **GOAL**：建立 AI Team 治理文件及 GitHub 版本管理。
- **INPUT**：STUDENT 批准的治理需求與 `WO-M0-001`。
- **DELIVERABLES**：`AGENTS.md`、`ROADMAP.md`、`WORK_ITEM.md`、`DECISIONS.md`、保護本地資料的 `.gitignore`，以及公開的 `ntust-nasa-ai-lab` 儲存庫與 `main` 提交。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責審查，MAIN Own Worker (Codex) 負責執行。
- **ACCEPTANCE_CRITERIA**：GitHub `main` 可讀取四份治理文件，內容符合 `WO-M0-001`。本地與遠端提交一致，公開內容限於獲准檔案。
- **STOP_IF**：治理文件缺失、GitHub 同步失敗、無法排除敏感資料外洩風險，或遠端成果驗證失敗。
- **NEXT_ROLE**：STUDENT-MAIN Brain 審查，STUDENT 決定是否批准 M1。

## M1 — Synthetic CSV Workflow

- **GOAL**：使用本地 `synthetic_sensor.csv` 的六筆合成資料驗證派工、資料讀取、顯示和測試流程。
- **INPUT**：六筆合成 CSV 資料及已驗收的 M0 治理規範。
- **DELIVERABLES**：CSV Loader、資料驗證、簡易數值顯示、Sensor Trend 和測試報告。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責派工與審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：正確讀取六筆資料，顯示值及趨勢取值與原檔一致，來源標示為 `SYNTHETIC`。
- **STOP_IF**：資料缺失、格式錯誤、數值不一致或原始 CSV 遭修改。
- **NEXT_ROLE**：STUDENT-MAIN Brain 審查，STUDENT 決定是否批准 M2。

## M2 — Real FD001 Data Integration

- **GOAL**：建立 NASA FD001 真實資料載入及來源追溯。
- **INPUT**：本地 FD001 資料及已驗收的 M1 成果。
- **DELIVERABLES**：FD001 Parser、資料欄位映射、Source Traceability 及驗證報告。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責派工與審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：正確解析 Engine Unit、Cycle、3 個 Operational Settings 及 21 個 Sensors。Train／Test 正確區分，數值可回查原始檔案的對應紀錄和欄位。
- **STOP_IF**：解析錯誤、Train／Test 或資料來源混淆、原始來源不可驗證。
- **NEXT_ROLE**：STUDENT-MAIN Brain 審查，STUDENT 決定是否批准 M3。

## M3 — Interactive Analysis Website

- **GOAL**：完成本地端互動式健康分析網站。
- **INPUT**：M2 已驗證的資料層。
- **DELIVERABLES**：Engine Unit／Cycle／Sensor 選擇器、Sensor Trend 及來源資訊顯示。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責派工與審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：選擇器狀態、真實數值、趨勢圖和資料來源均對應同一份已驗證資料。
- **STOP_IF**：Engine Unit、Cycle 或 Sensor 對應錯誤，或畫面顯示未經證實的分析結果。
- **NEXT_ROLE**：STUDENT-MAIN Brain 審查，STUDENT 決定是否批准 M4。

## M4 — Evidence Prompt Generator

- **GOAL**：依可追溯的真實數據產生 Evidence Prompt。
- **INPUT**：M3 選擇狀態及來源數據。
- **DELIVERABLES**：Evidence Prompt Generator、Prompt 預覽與複製功能。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責派工與審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：Prompt 的每筆數值皆可回查來源，並清楚區分觀測事實與推論。
- **STOP_IF**：出現虛構數值、錯誤來源、跨 Unit 混用資料，或宣稱有未實作的 RUL 預測。
- **NEXT_ROLE**：STUDENT-MAIN Brain 審查，STUDENT 決定是否批准 M5。

## M5 — Final Integration and Acceptance

- **GOAL**：完成整合測試並交付本地端網站。
- **INPUT**：M0 至 M4 全部已驗收成果。
- **DELIVERABLES**：完整網站、啟動說明、整合測試報告及最終驗收文件。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：網站可在本地啟動並完整執行 Unit → Cycle → Sensor → Trend → Source → Evidence Prompt。顯示資料與原始 FD001 一致。
- **STOP_IF**：網站無法啟動、核心功能失敗或來源驗證失敗。
- **NEXT_ROLE**：STUDENT 進行最終核准。
