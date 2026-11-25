# NASA C-MAPSS FD001 Health Analysis Website Roadmap

專案最終交付為本地端網站，支援選擇 Engine Unit、Cycle 和 Sensor，顯示真實數值與 Sensor Trend，可查閱 Source Evidence，並依據來源數據產生 Evidence Prompt。

依 M0 至 M5 循序執行，每項工作須由 STUDENT 正式授權並在完成後由 MAIN 獨立驗收。截至 2026-11-25，M0–M4、Post-M4 Evidence Prompt 與 M3 Data Contract Handoff 已 MAIN PASS；STUDENT 已批准 M5 Browser UAT（D-M5-001），由 STUDENT-WEB Brain 管理 Web Own Worker。M5 UAT 中發現隔離 SYNTHETIC null 回應被前端視為零值觀測之缺陷，Web Brain 依 STOP_IF 回報 BLOCKED / M5-NULL-UI-FAIL-CLOSED。MAIN 獨立審閱 GitHub web/ui.js 並於 D-M5-002 在原 WO-M5-WEB-001 中僅授權修改 web/ui.js 以加入繪圖前的 History fail-closed 驗證；Web Brain 得依此限縮範圍指派補正，不得擴增 API/Research 或修改 FD001 原始檔。原失敗 Exit Code 1 與待完成的真實 Browser UAT 均須保存/補足。M5 目前仍 BLOCKED / REMEDIATION_AUTHORIZED、Web Domain Acceptance 與 MAIN Final Acceptance 都尚未通過；完成全套測試後必須先 Web Domain PASS，再由 MAIN 獨立 GitHub 最終驗收，才可能宣布 M5 PASS。

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

## M5 — Final Integration Browser UAT and Acceptance (AUTHORIZED; PENDING)

- **GOAL**：驗證本地端 FD001 網站可在真實瀏覽器完整完成 Unit → Cycle → Sensor → Trend → Source → Evidence Prompt，並正確處理錯誤與 API 中斷。
- **INPUT**：全部 MAIN PASS 的 M0–M4、Data Contract v1.0.1、Post-M4 Evidence Prompt；本地唯讀 FD001 Train/Test/RUL 來源。
- **RESPONSIBLE_BRAIN**：STUDENT-WEB Brain 管理 Web Own Worker 執行與 Web Domain Acceptance；STUDENT-MAIN Brain 最後獨立 GitHub FINAL Acceptance。
- **DELIVERABLES**：實際 Chrome／Edge Browser UAT、啟動命令及真實 localhost URL、選取與錯誤輸入/空範圍/隔離合成 null 規則測試、真實 API stop/restart（和合成 503 分開）、Evidence Prompt Copy、至少八筆 UI/API/Prompt/原始 FD001 TXT 來源核對、測試命令及 Exit Codes、真實截圖、回歸測試、前後原始檔 SHA-256、GitHub 安全提交與二級審查。
- **NULL RULE**：已驗證真實 FD001 無缺值，API 目前不應生成 null；無 Cycle 是空點陣列而非 null。要測 null 行為只用明示 SYNTHETIC 的獨立 fixture，不可篡改真實 NASA 原始資料。
- **ACCEPTANCE_GATE_1**：Worker READY_FOR_REVIEW → Web Brain 獨立從 GitHub 審查實際程式、瀏覽器與資料證據，記錄 WEB_DOMAIN_ACCEPTANCE=PASS/FAIL/BLOCKED。
- **ACCEPTANCE_GATE_2**：只有 Web Domain PASS 才交 MAIN；MAIN 獨立從 GitHub 查驗後記錄 MAIN_FINAL_ACCEPTANCE=PASS/FAIL/BLOCKED。未取得 MAIN 結論之前 M5 不是 PASS。
- **SCOPE_LIMIT**：本次主要是驗證，不是重新開發 API/UI/Prompt；若需修改已驗收程式，必須 STOP_IF 並取得 MAIN 針對缺陷的補正授權。不授權外部 AI 連線、故障/RUL 模型、原始檔案修改、資料公開或外網部署。
- **WORK_ITEM**：WO-M5-WEB-001。2026-11-25 Web Brain 的 M5-NULL-UI-FAIL-CLOSED 阻礙由 MAIN 接受；依 D-M5-002，除原允許之 M5 測試／證據檔之外，僅追加 web/ui.js 的 History 預渲染嚴格 fail-closed 修正許可。原始失敗證據必須保留、null vs. 合法 0 vs. 空 [] 必須明確區分，且仍須完成真正 API 停止/恢復、來源核對、Prompt Clipboard、完整回歸與雙層驗收。具體授權與 STOP_IF 依 WORK_ITEM.md 的 CONTROLLED REMEDIATION AUTHORIZATION 段落為準。
- **NEXT_ROLE**：Web Brain 完成 Domain Acceptance 後向 MAIN 正式回報；MAIN FINAL 結果再交 STUDENT。
