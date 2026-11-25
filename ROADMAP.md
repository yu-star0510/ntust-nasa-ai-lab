# NASA C-MAPSS FD001 Health Analysis Website Roadmap

專案最終交付為本地端網站，支援選擇 Engine Unit、Cycle 和 Sensor，顯示真實數值與 Sensor Trend，可查閱 Source Evidence，並依據來源數據產生 Evidence Prompt。

依 M0 至 M5 循序執行，每項工作須由 STUDENT 正式授權並在完成後由 MAIN 獨立驗收。截至 2026-11-25，M0、M1、M2（含研究證據補充）、Data Contract Handoff、M3 FD001 唯讀 API、M4 互動式網頁均經 MAIN 正式驗收 PASS。STUDENT 於 2026-11-25 另外授權 Post-M4 的 Evidence Prompt Generator（D-EP-001 / WO-EP-WEB-001），Web Brain 管理 Web Own Worker；MAIN 已獨立核對 GitHub 的真實 Chrome Clipboard UAT 19 情境、9 筆 Prompt／UI／API／原始 FD001 TXT 來源核對，以及 11 項新測試與 64 項既有回歸測試，並正式驗收 PASS。此專項完成並不代表整個 M5 Final Integration 已授權或完成；M5 仍等待 STUDENT 另行正式批准，不得自行啟動。原始 FD001 READ_ONLY、單一 main 與分層驗收治理不變。

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

## M3 — Verified FD001 Read-only API (PASS)

- **GOAL**：依 STUDENT 提供之教師 M3 指令，使用 M2 已驗證 FD001 建立本地唯讀 API。
- **INPUT**：M2 已驗證資料層與 `FD001_DATA_CONTRACT v1.0.1`。
- **DELIVERABLES**：`/api/health`、`/api/catalog`、`/api/units`、`/api/history`、HTTP 正反回應、缺值 null 政策及每筆來源 provenance；實際原始 FD001 TXT 行列對照。
- **RESPONSIBLE_BRAIN**：STUDENT-WEB Brain 管理 Web Own Worker；STUDENT-MAIN Brain 負責 GitHub 最終驗收。
- **ACCEPTANCE**：`WO-M3-WEB-001` API 已由 MAIN 於 2026-11-25 正式 PASS（歷史工單名稱 M3-A 保留，不另強制 M3-B）。
- **NEXT_ROLE**：STUDENT 授權後 MAIN 向 STUDENT-WEB Brain 派 M4 互動網頁工作單。

## M4 — Interactive FD001 Browser UI (MAIN PASS; 2026-11-25)

- **GOAL**：根據已驗收 FD001 唯讀 API，在學生本地 Workspace 建立可在真實瀏覽器操作的 Engine Unit、Cycle 範圍與 Sensor 選擇器、即時趨勢圖及來源資料列展示。
- **INPUT**：M3 已 PASS 的 FD001 API、M2 已驗證來源與 Data Contract v1.0.1；來源 FD001 為空白分隔 TXT，非 CSV。
- **DELIVERABLES**：可啟動本地網頁、實際 URL、互動控制與圖表、來源 provenance、實際 Browser／人工 UAT、真實操作截圖和 UI↔Live API↔原始 TXT 實體行對照；不可僅交靜態截圖。
- **RESPONSIBLE_BRAIN**：STUDENT-WEB Brain 管理 Web Own Worker；STUDENT-MAIN Brain 獨立驗收。
- **ACCEPTANCE_CRITERIA**：真實操作改變 Engine Unit／split／Sensor／Cycle 後，圖表與來源列表同步正確更新，Sensor-to-Column 映射及每筆原始數值可追溯；完整 Browser UAT、命令／URL／實際執行證據、前後 SHA-256、GitHub Commit+Push 及雙層 Brain 審查。
- **STOP_IF**：頁面只是靜態截圖、無法在真實瀏覽器互動、選項與 API/來源 TXT 不一致、圖表用虛構數值或錯誤欄位、FD001 原始資料受修改、外網暴露、違反治理或無法驗證。
- **SCOPE_NOTICE**：原預排 M4 Evidence Prompt Generator 被 STUDENT 這次 M4 互動網頁正式授權取代；不授權製作 Prompt、模型或健康故障判斷。
- **NEXT_ROLE**：M4 MAIN PASS 後仍須 STUDENT 獨立授權 M5 或其他新範圍。

## Post-M4 — Evidence Prompt Generator (WO-EP-WEB-001; MAIN PASS, 2026-11-25)

- **AUTHORIZATION**：2026-11-25 STUDENT 新指令、D-EP-001；此為已 PASS 的 M4 UI 之後獨立增補功能，不重開 M4、不批准 M5。
- **GOAL**：根據目前 Train/Test、Engine Unit、Sensor、Cycle 範圍及即時已驗證 /api/history，產生含完整 raw provenance、欄位意義、來源、樣本、品質、KNOWN/INFERENCE/UNKNOWN 的可預覽與複製文字，要求外部 AI 不憑單一趨勢推測故障或 RUL。
- **DELIVERABLES**：網站 Evidence Prompt Generator、真實 Clipboard 複製與錯誤處理、動態選擇一致性/失效保護、Chrome/Edge Browser UAT、Prompt/Live API/原始 TXT 的至少六筆交叉核對、相容測試與 GitHub 執行證據。
- **RESPONSIBLE_BRAIN**：STUDENT-WEB Brain 管理 Web Own Worker；STUDENT-MAIN Brain 進行獨立 GitHub 最終驗收。
- **ACCEPTANCE**：不得向外部 AI 自動送資料，不得捏造官方正常/故障門檻、健康分數、RUL 真值/預測或物理單位；全套 M1–M4 測試及原始資料 SHA-256 前後一致。具體規範依 WORK_ITEM.md 的 WO-EP-WEB-001。
- **ACCEPTANCE_RESULT**：2026-11-25 MAIN_FINAL PASS；19 個真實 Chrome UAT 情境、9/9 Prompt/UI/API/TXT 來源核對、11/11 Evidence Prompt tests、64/64 M1–M4 regression、原始 SHA-256 前後一致、無自動對外 AI 傳送；決議及驗證限制詳見 WORK_ITEM.md 的 WO-EP-WEB-001 MAIN FINAL ACCEPTANCE。
- **NEXT_GATE**：本專項 PASS/CLOSED，M5 Final Integration 仍須 STUDENT 另行正式授權。

## M5 — Final Integration and Acceptance (NOT AUTHORIZED)

- **GOAL**：完成整合測試並交付本地端網站。
- **INPUT**：M0 至 M4 全部已驗收成果。
- **DELIVERABLES**：完整網站、啟動說明、整合測試報告及最終驗收文件。
- **RESPONSIBLE_BRAIN**：STUDENT-MAIN Brain 負責審查，獲授權的 Worker 負責執行。
- **ACCEPTANCE_CRITERIA**：網站可在本地啟動並完整執行 Unit → Cycle → Sensor → Trend → Source → Evidence Prompt。顯示資料與原始 FD001 一致。
- **STOP_IF**：網站無法啟動、核心功能失敗或來源驗證失敗。
- **NEXT_ROLE**：STUDENT 進行最終核准。
