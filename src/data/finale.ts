import type { Chapter } from './types.ts';

export const finale: Chapter = {
  id: 'finale',
  title: '全站重啟',
  area: '中央指揮台',
  subject: '科學證據整合',
  accent: 'mint',
  icon: 'shield',
  minutes: '12–20',
  character: { name: 'GAIA', role: '研究站備援系統', initials: 'G' },
  briefing: '八區的證物都已送回，但警報仍在循環。請用新測量重算感測器、在有限電力下安排重啟，再對全站下達決策。',
  resolution: '全站先以獨立樣本和正確單位通過驗證，再分區解除隔離。事件單會保留完整的證據和決策過程。',
  labQuestion: '選一項你在重啟中最想保留的防呆規則，說明它會攔下哪一筆失效的資料。',
  puzzles: [
    {
      id: 'final-calibration', kind: 'numeric', title: '複核觸發隔離的讀值', objective: '把校正、電路安全門檻與事件時間整合成查核',
      prompt: [
        '事故門檻是電流超過 15 mA。05:41 的緊急封包僅帶出原始讀值「28 格」，控制器卻把 28 直接當成 mA。獨立測試重現了 28 格。',
        '沿用數學控制中心的校正式 y = 2I + 4。求實際電流、距門檻還差多少 mA，以及真正達到 15 mA 時應顯示多少格。',
      ],
      fields: [
        { label: '實際電流', unit: 'mA', answer: 12, retry: '原始讀值有 4 格固定偏移。扣掉偏移後才除以斜率。' },
        { label: '距門檻的電流餘裕', unit: 'mA', answer: 3 },
        { label: '達到 15 mA 時的讀值', unit: '格', answer: 34, retry: '這次已知物理量 I，直接代入 y = 2I + 4。' },
      ],
      hints: ['回看筆記的感測器轉換式。原始螢幕格數和毫安不同。', '先用 (28 − 4) ÷ 2 求 I，再與 15 比較。最後把 15 代入正向公式。'],
      success: '28 格對應 12 mA，低於門檻 3 mA。15 mA 對應 34 格。這筆封包被錯用單位，觸發了隔離。',
      retry: '隔離門檻查核未通過。分清楚輸入的格數與實際的毫安。',
      evidence: { title: '隔離警報的單位錯置', detail: '事故原始讀值 28 格，校正後是 12 mA。門檻 15 mA 等於 34 格。' },
    },
    {
      id: 'final-dispatch', kind: 'panel', title: '配置跨區重啟預算', objective: '同時滿足中和、水庫、光合限制與備援用電',
      prompt: [
        '這是新的模擬重啟批次。回流槽有 16 mmol 酸當量，每批處理可除去 4 mmol。水庫有 18 m³，抽水每段用 3 m³；每段水和每段燈分別支援 3 和 2 mmol CO₂/h 的吸收，CO₂ 充分。',
        '淨吸碳＝光、水支援速率中較小者減掉呼吸的 2 mmol CO₂/h。處理、抽水、照明分別耗 3、2、2 Wh／段。讓酸當量恰好為 0，水庫至少留 6 m³，淨吸碳至少 8，總用電至多 30 Wh。',
      ],
      model: { kind: 'restart', acid: 16, basePerBatch: 4, waterStock: 18, waterPerBatch: 3, waterFactor: 3, lampFactor: 2, respiration: 2, energyPerDose: 3, energyPerPump: 2, energyPerLamp: 2 },
      controls: [
        { id: 'dose', label: '水質處理', unit: '批', min: 0, max: 6, step: 1, initial: 2 },
        { id: 'pump', label: '溫室供水', unit: '段', min: 0, max: 6, step: 1, initial: 2 },
        { id: 'light', label: '溫室照明', unit: '段', min: 0, max: 8, step: 1, initial: 3 },
      ],
      metrics: [
        { id: 'acidLeft', label: '剩餘酸當量', unit: 'mmol', min: 0, max: 0, retry: '以 16 除以每批處理 4 mmol 的處理量，避免處理太少或太多。' },
        { id: 'waterLeft', label: '期末庫水', unit: 'm³', min: 6, retry: '抽水每段用掉 3 m³。水庫必須保留至少 6 m³。' },
        { id: 'net', label: '淨吸碳', unit: 'mmol CO₂/h', min: 8, retry: '淨吸碳 8 需要光、水都能支援至少 10 mmol CO₂/h 的光合作用。' },
        { id: 'energy', label: '本輪用電量', unit: 'Wh', max: 30, retry: '把三項實際選擇的批次或段數乘上各自的耗電量後相加。' },
      ],
      hints: ['先獨立求出中和量。接著從淨吸碳目標推出最低光照與抽水，再檢查水庫。', '吸碳毛量至少要 10。最低燈光 5 段，最低抽水 4 段。把這些值和處理量帶入電力預算。'],
      success: '4 批處理、4 段抽水、5 段照明。剩餘酸當量 0，庫水 6 m³，淨吸碳 8 mmol CO₂/h，用電 12 + 8 + 10 = 30 Wh。',
      retry: '指揮台沒有執行設定。四項門檻需同時通過，新增資源時要考慮連帶成本。',
      evidence: { title: '跨區重啟設定', detail: '處理 4 批、抽水 4 段、照明 5 段。四項條件一起通過才允許重啟。' },
    },
    {
      id: 'final-cause', kind: 'decision', title: '重建事故因果鏈', objective: '以時間線和獨立測量區別觸發原因、下游效應與過度推論',
      prompt: [
        '比對你找齊的兩套事件紀錄。請選出兩項能解釋告警傳播的證據，提交給指揮台。活動中的酸性採樣是局部實測；舊資料的問題是它被誤當成全站即時狀況。',
      ],
      table: { title: '已核對的事故時間線', columns: ['時間', '證據', '來源'],
        rows: [['05:40', '同步中斷，遺失資料時間與校正標籤', '入口備援檔'], ['05:41', '讀值 28 格被當作 28 mA', '控制中心封包'], ['05:42', '自動隔離供電', '能源艙紀錄'], ['05:46', '補光停止，溫室淨碳通量反向', '獨立量測']] },
      select: 2,
      options: [
        { id: 'first-link', label: '校正標籤遺失造成誤判過電流', detail: '獨立讀值換算為 12 mA。這能解釋為什麼在 05:42 進入隔離。', correct: true, consequence: '封包故障先於隔離，校正後的物理量與跳脫條件不符。' },
        { id: 'last-link', label: '補光停止後，光合減弱使淨碳通量反向', detail: '呼吸可持續釋出 CO₂，解釋後來的部分碳庫變化。', correct: true, consequence: '能源紀錄與隔離測試支持這條下游因果鏈。' },
        { id: 'root-biology', label: '05:46 的溫室釋碳造成 05:40 的同步中斷', detail: '從碳感測器的告警反查即可。', consequence: '溫室反向的量測晚於同步中斷及停電，時間順序不支持這個方向。' },
        { id: 'no-chemistry', label: '所有酸鹼警報都可忽略', detail: '既然電流曾被誤判，獨立水樣也一定有誤。', consequence: '電流封包的錯置不否定獨立探針。局部採樣實測為酸性，仍須依酸量處理。' },
      ],
      hints: ['逐筆看發生時間。原因應在它造成的效應之前。', '比較模擬、封包和獨立實測。不同來源的資料須分開核對。'],
      success: '事故起於同步與單位標籤失效，誤觸電力隔離。溫室與碳循環的後續反應有科學依據，局部酸樣仍需獨立處理。',
      retry: '有一條推論和事件順序或獨立證據衝突。核對每條因果關係。',
      evidence: { title: '已重建的事故順序', detail: '同步中斷 → 校正標籤遺失與過電流誤判 → 供電隔離 → 光合吸碳降低。局部酸樣須獨立盤點。' },
    },
    {
      id: 'final-release', kind: 'decision', title: '決定全站復電條件', objective: '將校正、對照、收支守恆與不同環境下的生物證據寫成驗收流程',
      prompt: [
        '供電與中和都通過了，現在需選一套可安全解除隔離、也能防止誤判再次傳遍全站的驗收流程。',
        '避開兩項已知錯誤：站內曾把過時或未換算的資料當作即時量測，也曾只採用乾旱族群樣本，將結果套到其他環境。',
      ],
      select: 1,
      options: [
        { id: 'all-now', label: '直接恢復所有自動控制', detail: '第一個感測器正常，就令其餘區域沿用相同判定。', consequence: '一項讀值正常不能證明別區的量測、單位或資源收支都正常。' },
        { id: 'verify', label: '分區重啟，讓即時證據逐關驗收', detail: '先校正並核對時間，再驗證水質、電路與跨區收支。族群依乾濕環境分開比較，保留兩組樣本。', correct: true, consequence: '可驗證彼此獨立的證據，並限制來源問題影響的範圍。' },
        { id: 'max-input', label: '把各區輸入全部開到最大', detail: '多補電、多供水、多加鹼，以最快速度處理所有告警。', consequence: '過量鹼、抽水與用電都會越過驗收門檻，且提高單項輸入未必解除限制因子。' },
        { id: 'single-trait', label: '只保留乾燥環境表現最好的族群', detail: '覆寫雨後樣本與舊的分類，等待硬體恢復。', consequence: '乾濕條件下後代數不同。刪除樣本會讓驗收無法分辨不同環境的效應。' },
      ],
      hints: ['回想哪個操作會防止過期封包讓另一區跟著跳脫。', '讓不同來源彼此查核，並保留比較條件。選能把已通過的證據寫進流程的方案。'],
      success: '分區驗收完成。你用獨立量測、守恆與對照解除了警報，讓各區控制器在取得新且可核對的證據後才重新接管。',
      retry: 'GAIA 要求補上可核對的證據與驗收順序，才能解除隔離。',
      evidence: { title: '全站驗收流程', detail: '依序核對取樣時間、量測單位、反應與資源收支。不同環境的族群資料各自保留並比較。' },
    },
  ],
};
