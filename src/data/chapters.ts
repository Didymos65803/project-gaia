import type { Chapter } from './types.ts';

const gaia = { name: 'GAIA', role: '研究站備援系統', initials: 'G' };
const engineer = { name: '林工程師', role: '研究站系統工程師', initials: '林' };
const chemist = { name: '周博士', role: '環境化學研究員', initials: '周' };
const biologist = { name: '何研究員', role: '生態與氣候研究員', initials: '何' };

export const chapters: Chapter[] = [
  {
    id: 'gateway', title: '密碼失控', area: '入口管制室', subject: '科學記號與因數', accent: 'mint', icon: 'lock', minutes: '6–10',
    character: gaia,
    briefing: '研究站接連失聯，入口只剩備援終端。請讀出計時封包、找回遺失的資料區塊。我需要原始紀錄，才能告訴你是哪個系統先出事。',
    resolution: '入口開了。第一筆異常出現在 05:40 的同步紀錄，早於各區警報。沿著封包的校正版號前往控制中心。',
    labQuestion: '為什麼同時整除兩份紀錄的最大區塊長度，可以用質因數分解找出來？',
    puzzles: [
      {
        id: 'packet-time', kind: 'numeric', title: '讀取時間封包', objective: '在十進位小數、科學記號與微秒之間換算',
        prompt: [
          '終端記錄的取樣間隔是 0.000072 秒。備援掃描器接受 a × 10ⁿ 秒，其中 1 ≤ a < 10，n 為整數。',
          '輸入 a、n，再換算成微秒交由第二個計時器核對。1 秒 = 1,000,000 微秒。',
        ],
        fields: [
          { label: '有效數字 a', unit: '', answer: 7.2, tolerance: 0.0001, retry: '把小數點移到第一個非零數字後方，再檢查 a 是否落在 1 到 10 之間。' },
          { label: '十的指數 n', unit: '', answer: -5, retry: '原本的秒數比 1 小，十的指數應為負。數出小數點移動的位數。' },
          { label: '取樣間隔', unit: 'μs', answer: 72, retry: '從秒換成較小的單位，數值會變大。用秒數乘上 10⁶。' },
        ],
        hints: ['先寫下 0.000072 的第一個非零數字，再決定小數點要放在哪裡。', '1 μs = 10⁻⁶ s。可把科學記號的係數和 10 的次方分開換算。'],
        success: '取樣間隔是 7.2 × 10⁻⁵ s，也就是 72 μs。兩個計時器讀到相同的時間。',
        retry: '兩個計時器的設定未通過核對。檢查表示法與單位後重新送出。',
        evidence: { title: '備援取樣間隔', detail: '0.000072 s = 7.2 × 10⁻⁵ s = 72 μs。時間單位統一後，才能比對事件先後。' },
      },
      {
        id: 'archive-fanout', kind: 'numeric', title: '找回備份分頁', objective: '用整數次方描述重複相乘，並檢查分組容量',
        prompt: [
          '從 1 個索引開始，每層讓上一層的每個節點再分支。前 3 層各分成 2 個，接著 2 層各分成 3 個。只有最末一層的節點各保存 1 筆紀錄。',
          '備援閱讀器每頁最多存 12 筆。計算總紀錄筆數和讀完整批資料需要的最少頁數。',
        ],
        fields: [
          { label: '最末層紀錄數', unit: '筆', answer: 72, retry: '同一層的每個節點都分支，將每一層的分支數相乘。' },
          { label: '最少分頁', unit: '頁', answer: 6, retry: '用你算出的筆數除以每頁容量，並檢查最後一頁的剩餘空間。' },
        ],
        hints: ['前三層是 2 × 2 × 2。最後兩層對所有既有節點做同樣的分支。', '最末層有 2³ × 3² 個節點，每頁容量固定。'],
        success: '2³ × 3² = 72 筆。每頁 12 筆，總共 6 頁。最後一頁藏著需要同步的原始紀錄。',
        retry: '資料讀取器發現頁數與紀錄筆數對不上。先算最末層，再分頁。',
        evidence: { title: '封包分支規則', detail: '每層對所有節點分支，總數以相乘計算。備援 A 檔共有 72 筆。' },
      },
      {
        id: 'archive-block', kind: 'numeric', title: '對齊雙份事件紀錄', objective: '用質因數分解求兩個數的最大公因數',
        prompt: [
          'A 檔有 72 筆，B 檔有 180 筆。同步程式要求兩份檔案都切成相同長度的區塊，每份都沒有餘數，且每塊要盡可能長。',
          '先將 180 寫成 2ᵃ × 3ᵇ × 5ᶜ，再回報每塊可裝的最多筆數。',
        ],
        fields: [
          { label: '2 的指數 a', unit: '', answer: 2 },
          { label: '3 的指數 b', unit: '', answer: 2 },
          { label: '5 的指數 c', unit: '', answer: 1 },
          { label: '最長區塊', unit: '筆／塊', answer: 36, retry: '分別列出 72 和 180 的所有質因數。共同區塊能採用的指數取兩邊較小的。' },
        ],
        hints: ['把 180 先拆成 18 × 10，再分到每個因數都是質數。', '72 = 2³ × 3²。5 無法整除 A 檔的筆數，所以共同區塊只由 2 和 3 組成。'],
        success: '180 = 2² × 3² × 5。最大公因數為 2² × 3² = 36。比對後看到 05:40 同步中斷。',
        retry: '檔案的區塊無法同時對齊。確認質因數和每份檔案允許的區塊長度。',
        evidence: { title: '05:40 同步中斷', detail: '用最大公因數 36 對齊兩份紀錄後，發現同步先中斷，化學與能源系統之後才告警。' },
      },
    ],
  },
  {
    id: 'control', title: '數學控制中心', area: '感測器校正台', subject: '函數與聯立方程', accent: 'cyan', icon: 'chart', minutes: '7–12',
    character: engineer,
    briefing: '畫面有數字，卻顯示錯誤的單位。我需要你找出感測器的對應關係，估算雜訊，確認管線還能不能用。',
    resolution: '管線讀值正常。問題出在同步中斷後，控制器把還沒校正的「格」直接當成物理量。化學實驗室可以幫忙查核其他警報。',
    labQuestion: '感測器有固定偏移時，為什麼不能只把讀值除以斜率？',
    puzzles: [
      {
        id: 'calibration-line', kind: 'graph', title: '校正電流感測器', objective: '從線性圖找截距、斜率並反推實際輸入',
        prompt: [
          '把已知電流 I 接到感測器，記下畫面讀值 y。兩者關係可寫成 y = mI + b。',
          '在圖上標記第一筆讀值高於 14 格的測試點，再求零點讀值、每 1 mA 造成的讀值變化，以及 18 格對應的實際電流。',
        ],
        graph: {
          title: '校正測試紀錄', xLabel: '輸入電流 (mA)', yLabel: '畫面讀值 (格)',
          xTicks: [0, 2, 4, 6, 8], yTicks: [0, 4, 8, 12, 16, 20],
          points: [{ x: 0, y: 4 }, { x: 2, y: 8 }, { x: 4, y: 12 }, { x: 6, y: 16 }, { x: 8, y: 20 }],
          pickLabel: '第一筆高於 14 格的測試點', answerX: 6,
        },
        fields: [
          { label: '零電流時的讀值 b', unit: '格', answer: 4 },
          { label: '斜率 m', unit: '格／mA', answer: 2, retry: '挑兩點，用讀值的變化除以電流的變化。' },
          { label: '讀值 18 格對應的電流', unit: 'mA', answer: 7, retry: '先從 18 格扣除零點偏移，再除以斜率。' },
        ],
        hints: ['沿著橫軸從左往右找實際測過的點。零點讀值在 I = 0 的位置。', '用 (8 − 4) ÷ (2 − 0) 求斜率。反推電流時先扣掉截距。'],
        success: '6 mA 的測試首先超過 14 格。y = 2I + 4，因此 y = 18 格時 I = 7 mA。控制器必須先做這層換算。',
        retry: '控制器拒絕校正。比對所選測試點、截距、斜率與反算值。',
        evidence: { title: '感測器轉換式', detail: 'y = 2I + 4。y 是螢幕格數，I 的單位是 mA。I = (y − 4) ÷ 2。' },
      },
      {
        id: 'noise-decay', kind: 'graph', title: '隔離回路雜訊', objective: '比較指數衰減、比例和門檻',
        prompt: [
          '測試台每分鐘固定把雜訊指數乘上同一個比例。站內規則要求雜訊低於 10 才能重新採樣。',
          '選擇第一次符合條件的測量點。求第 4 分鐘還剩原值的百分之幾，再依同一模型推估第 6 分鐘。',
        ],
        graph: {
          title: '備援濾波器測試', xLabel: '時間 (min)', yLabel: '雜訊指數',
          xTicks: [0, 1, 2, 3, 4, 5], yTicks: [0, 24, 48, 72, 96],
          points: [{ x: 0, y: 96 }, { x: 1, y: 48 }, { x: 2, y: 24 }, { x: 3, y: 12 }, { x: 4, y: 6 }, { x: 5, y: 3 }],
          pickLabel: '第一筆低於 10 的測試點', answerX: 4,
        },
        fields: [
          { label: '第 4 分鐘的剩餘比例', unit: '%', answer: 6.25, tolerance: 0.01, retry: '百分比以第 0 分鐘為分母，將分數乘以 100。' },
          { label: '第 6 分鐘的雜訊', unit: '指數', answer: 1.5, tolerance: 0.01, retry: '再對第 5 分鐘的數值套用一次相同的倍率。' },
        ],
        hints: ['比較第 0、1、2 分鐘的值。每次變化具有相同的比例。', '第 4 分鐘做了四次減半。第 6 分鐘接在 3 的下一次減半。'],
        success: '每分鐘減半，N(t) = 96 × (½)ᵗ。第 4 分鐘為 6，佔原值 6.25%；第 6 分鐘預估為 1.5。',
        retry: '目前的採樣時間或預估值對不上固定比例。重新核對圖上的相鄰讀值。',
        evidence: { title: '重新採樣門檻', detail: '備援濾波每分鐘將雜訊減半。測到第 4 分鐘雜訊才低於 10，可重新擷取新資料。' },
      },
      {
        id: 'solve-flow', kind: 'numeric', title: '找出兩條管線流量', objective: '以加減消去法解二元一次聯立方程',
        prompt: [
          'A、B 管同時供水，總流量為 18 L/min。測試時把 A 的流量加倍，B 維持原值，總流量變為 30 L/min。',
          '求出測試前各管的真實流量，以排除「B 管完全堵塞」的警報。',
        ],
        fields: [{ label: 'A 管原流量', unit: 'L/min', answer: 12 }, { label: 'B 管原流量', unit: 'L/min', answer: 6 }],
        hints: ['設原流量為 A = x、B = y，寫出調整前後兩條方程。', '從 2x + y = 30 減去 x + y = 18，兩個 y 會抵銷。'],
        success: '兩次測試相減得 x = 12，再代入得到 y = 6。B 管有流量，堵塞警報與測試矛盾。',
        retry: '兩個流量必須同時符合 18 和 30 的測試條件。把你的數字代回兩式檢查。',
        evidence: { title: '水路正常', detail: 'A = 12 L/min，B = 6 L/min。獨立流量測試排除了 B 管堵塞。' },
      },
    ],
  },
  {
    id: 'chemistry', title: '化學反應實驗室', area: '反應觀測艙', subject: '守恆與反應能量', accent: 'amber', icon: 'flask', minutes: '7–12',
    character: chemist,
    briefing: '儀器宣稱反應產生了多餘原子，還把熱流方向搞反。我們可以在虛擬反應艙裡逐項查證。',
    resolution: '反應和質量都對得上。總管卻仍顯示酸鹼異常。這次請用獨立採樣器從局部找答案。',
    labQuestion: '如果只秤生成的二氧化碳，會漏掉反應艙內的哪些質量？',
    puzzles: [
      {
        id: 'balance-methane', kind: 'balance', title: '重建反應式', objective: '用最簡正整數係數平衡原子數',
        prompt: [
          '虛擬反應艙的紀錄顯示甲烷 CH₄ 和氧氣 O₂ 完全反應，產生二氧化碳 CO₂ 和水 H₂O。',
          '把係數拖入對應位置，或直接用下拉選單設定。每種元素在箭頭兩側的原子總數要相同，使用最簡的正整數係數。',
        ],
        reactants: [{ formula: 'CH₄', atoms: { C: 1, H: 4 }, coefficient: 1 }, { formula: 'O₂', atoms: { O: 2 }, coefficient: 2 }],
        products: [{ formula: 'CO₂', atoms: { C: 1, O: 2 }, coefficient: 1 }, { formula: 'H₂O', atoms: { H: 2, O: 1 }, coefficient: 2 }],
        hints: ['碳僅在左邊的 CH₄ 與右邊的 CO₂ 出現。先比對碳，再比對氫。', '1 個 CH₄ 含 4 個氫原子，要用 2 個 H₂O 接住它們。最後統計右邊的氧。'],
        success: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O。兩側各有 C 1、H 4、O 4。係數改變分子數，化學式本身維持原樣。',
        retry: '反應艙需要兩側原子守恆，並使用最簡整數比。',
        evidence: { title: '原子盤點法', detail: '係數 × 下標得某元素的原子數，再加總同側的各物質。甲烷完全反應的係數依序為 1、2、1、2。' },
      },
      {
        id: 'sealed-mass', kind: 'numeric', title: '找回未被秤到的質量', objective: '用反應式比例與限量反應物解釋密閉系統守恆',
        prompt: [
          '另一次模擬在密閉艙內放入 12 g 的碳和 40 g 的氧氣。碳全部依 C + O₂ → CO₂ 反應。提供相對原子質量 C = 12、O = 16。',
          '計算 CO₂ 生成量、剩餘氧氣，以及反應後艙內這些物質的總質量。忽略裝置本身質量。',
        ],
        fields: [
          { label: '生成 CO₂', unit: 'g', answer: 44 },
          { label: '剩餘 O₂', unit: 'g', answer: 8, retry: '每份 12 g 的碳只用到一份 32 g 的 O₂。扣掉實際用掉的氧氣。' },
          { label: '反應後總質量', unit: 'g', answer: 52 },
        ],
        hints: ['O₂ 有兩個氧，CO₂ 有一個碳和兩個氧。列出相同分子數下的質量比。', 'C : O₂ : CO₂ 的質量比是 12 : 32 : 44。別漏掉沒反應的物質。'],
        success: '12 g 碳用掉 32 g 氧氣，共生成 44 g CO₂。剩下 8 g O₂，反應後仍有 52 g，等於反應前。',
        retry: '秤重程式沒有通過質量核對。檢查反應掉的氧氣，以及是否把剩餘氧氣算進總量。',
        evidence: { title: '質量差來自秤重範圍', detail: '44 g 只計生成的 CO₂。加入未反應的 8 g O₂，整艙總質量為 52 g，與起始相同。' },
      },
      {
        id: 'heat-witness', kind: 'decision', title: '判讀熱流方向', objective: '根據對照實驗區分放熱、吸熱與測點',
        prompt: [
          '三個保溫反應艙外各有一杯等質量的水，起始溫度一致。溫度計只量外側水溫，無電加熱。與空白艙比較，選出兩個有證據支持的判讀。',
        ],
        table: { title: '反應艙外側水溫', columns: ['艙室', '開始', '結束'], rows: [['A（反應進行）', '22 °C', '29 °C'], ['B（反應進行）', '22 °C', '18 °C'], ['空白（無反應）', '22 °C', '22 °C']] },
        select: 2,
        options: [
          { id: 'a-release', label: 'A 艙反應放熱', detail: '熱從反應區傳給外側的水。', correct: true, consequence: '外側水吸收熱，溫度上升。' },
          { id: 'b-release', label: 'B 艙反應放熱', detail: '外側水降溫是放熱的訊號。', consequence: '外側水降溫表示它失去熱，熱流方向是從水到反應區。' },
          { id: 'b-absorb', label: 'B 艙反應吸熱', detail: '反應區從外側的水取得熱。', correct: true, consequence: '外側水失去熱，反應區吸熱。' },
          { id: 'air', label: '僅憑室溫變化就能解釋兩杯水', detail: '無須考慮空白艙的紀錄。', consequence: '空白艙水溫維持 22 °C，而且 A、B 的水溫往相反方向變動。室溫變化無法解釋這些證據。' },
        ],
        hints: ['先圈出量測的地方。溫度計讀的是反應區的周圍。', '周圍升溫，代表它吸收到熱。周圍降溫時，能量流往哪裡？'],
        success: 'A 讓周圍的水升溫，反應放熱；B 讓周圍的水降溫，反應吸熱。空白艙支持變化與反應有關。',
        retry: '有一項熱流判讀與水溫紀錄不符。比較各反應艙與空白艙。',
        evidence: { title: '熱流方向的獨立證據', detail: '本測試量測周圍水溫。周圍升溫指向反應放熱，周圍降溫指向反應吸熱。' },
      },
    ],
  },
  {
    id: 'water-lab', title: '酸鹼污染事件', area: '水質分析站', subject: 'pH、鹽與電解質', accent: 'cyan', icon: 'drop', minutes: '7–12',
    character: chemist,
    briefing: '回流槽收到酸性警報。四瓶採樣液的標籤被同步程式清空了。請操作雙探針，把真正的酸性樣本找出來。',
    resolution: '模擬回流槽的已知酸量已中和，但供電仍在隔離。保留當量紀錄，去能源艙確認電池和外電路。',
    labQuestion: '哪一對樣本 pH 相同、導電能力卻差很多？這對辨認鹽類有什麼限制？',
    puzzles: [
      {
        id: 'probe-samples', kind: 'assay', title: '操作 pH 與導電度探針', objective: '用兩種量測辨別酸、鹼、中性電解質與近乎不導電的樣本',
        prompt: [
          '選取四瓶樣本逐一檢測。儀器在約 25 °C 量測，本題以 1.0 mS/cm 以上辨認明顯導電的樣本。',
          '完成分類回報。中性樣本可能含有可移動的離子。從這兩項量測只能分組，無法判定是哪一種鹽。',
        ],
        samples: [{ id: 'a', label: '樣本 A', ph: 7, conductivity: 5.2 }, { id: 'b', label: '樣本 B', ph: 3, conductivity: 4.5 }, { id: 'c', label: '樣本 C', ph: 7, conductivity: 0.02 }, { id: 'd', label: '樣本 D', ph: 11, conductivity: 4.1 }],
        targets: [
          { label: '酸性樣本', sample: 'b' }, { label: '鹼性樣本', sample: 'd' },
          { label: '中性且明顯導電', sample: 'a' }, { label: '中性且近乎不導電', sample: 'c' },
        ],
        hints: ['約 25 °C 時，pH 低於 7 偏酸，高於 7 偏鹼。', '先用 pH 篩出兩瓶中性樣本，再逐一比較它們的導電度與題目的判定門檻。'],
        success: 'B 呈酸性，D 呈鹼性。A、C 都是 pH 7，但 A 的導電度遠高於 C，符合水中有可移動離子的情況。',
        retry: '分類紀錄與探針讀值不符。先檢查 pH，再比較中性樣本的導電度。',
        evidence: { title: '酸鹼與導電是兩種量測', detail: 'A、C 都是 pH 7，但 A 明顯導電、C 近乎不導電。中性鹽溶液可以有可移動離子。' },
      },
      {
        id: 'ph-exponent', kind: 'numeric', title: '追蹤酸度尺度', objective: '將 pH 的 10 倍關係轉為濃度和比值',
        prompt: [
          '漏液 B 為 pH 3，對照液為 pH 5。用本題的稀溶液近似 [H⁺] ≈ 10⁻ᵖᴴ mol/L，且 1 mol = 1,000 mmol。',
          '分別換算兩杯液體的氫離子濃度，再算 B 的氫離子濃度是對照液的幾倍。',
        ],
        fields: [
          { label: 'pH 3 的氫離子濃度', unit: 'mmol/L', answer: 1, tolerance: 0.0001 },
          { label: 'pH 5 的氫離子濃度', unit: 'mmol/L', answer: 0.01, tolerance: 0.00001 },
          { label: 'B 相對對照液的倍率', unit: '倍', answer: 100, retry: '先把兩杯放在同一單位，再用 B 的濃度除以對照液的濃度。' },
        ],
        hints: ['pH 每下降 1，氫離子濃度增加 10 倍。', '將 10⁻³ 與 10⁻⁵ mol/L 各乘 1,000，才是面板要的單位。'],
        success: 'pH 3 約為 1 mmol/L，pH 5 約為 0.01 mmol/L。兩個 pH 單位的差距對應濃度相差 100 倍。',
        retry: '探針沒有通過稀釋校驗。檢查負指數與 mol 到 mmol 的換算。',
        evidence: { title: 'pH 是對數尺度', detail: '在稀溶液模型中，pH 差兩個單位等於氫離子濃度相差 100 倍。中和需求還要知道溶液體積與成分。' },
      },
      {
        id: 'neutralize-tank', kind: 'panel', title: '設定回流槽中和量', objective: '利用 H⁺ 和 OH⁻ 的一比一反應量，避開過量加鹼',
        prompt: [
          '隔離槽模擬器已測得 18 mmol 的可中和酸量。每一劑提供 3 mmol 的 OH⁻ 當量。本模型以 H⁺ + OH⁻ → H₂O 做一比一盤點。',
          '調整劑數，使剩餘酸當量為 0。讀值為正代表有酸剩下，為負則代表鹼過量。此處不用 pH 值估劑量。',
        ],
        model: { kind: 'neutralize', acid: 18, basePerDose: 3 },
        controls: [{ id: 'dose', label: '投放劑數', unit: '劑', min: 0, max: 10, step: 1, initial: 0 }],
        metrics: [{ id: 'acidLeft', label: '剩餘酸當量', unit: 'mmol', min: 0, max: 0, retry: '以 18 mmol 扣掉「劑數 × 每劑 3 mmol」。過量會讓剩餘酸當量變成負值。' }],
        hints: ['每劑抵銷 3 mmol 的酸。加水只改變濃度，沒有消耗酸當量。', '把起始酸量除以一劑可消耗的酸量。'],
        success: '6 劑消耗 18 mmol 的酸當量，沒有剩餘酸或過量鹼。回流槽通過模擬查核。',
        retry: '回流閥保持關閉。檢查儀器顯示的是殘酸還是鹼過量。',
        evidence: { title: '回流槽處理規則', detail: 'H⁺ 與 OH⁻ 依 1 : 1 中和。模擬槽由酸當量與每劑鹼當量決定投放量。' },
      },
    ],
  },
  {
    id: 'power', title: '能源系統修復', area: '電力備援艙', subject: '氧化還原與電路', accent: 'amber', icon: 'bolt', minutes: '7–12',
    character: engineer,
    briefing: '主電網還在等待安全檢查。先用鋅銅電池救回一組低功率監測端，再算清楚測試電路會拉走多少電。',
    resolution: '獨立監測端恢復。舊紀錄顯示 05:42 控制器先隔離供電，之後溫室的照明才掉線。',
    labQuestion: '如果移除鹽橋，外部導線還接著。為什麼電流無法持續？',
    puzzles: [
      {
        id: 'wire-cell', kind: 'circuit', title: '接通鋅銅監測電池', objective: '辨認鋅與銅半電池的角色、電壓表極性和鹽橋功能',
        prompt: [
          '設定左、右半電池電極。每個半電池的溶液含自身金屬的離子。電壓表黑端固定在左側、紅端固定在右側。',
          '原型要求正向讀值，並能在接負載時維持反應。選好電極，安裝需要的離子通道後送交檢查。',
        ],
        voltage: 1.1, leftElectrode: 'Zn', rightElectrode: 'Cu',
        hints: ['鋅在這組電池失去電子。它會是負極，外電路的電子從這裡出發。', '鹽橋補償兩邊電荷的變化，使兩半電池的反應能在接上負載後持續。'],
        success: '左側鋅極失去電子，右側銅極的 Cu²⁺ 接受電子。鹽橋讓離子移動，正向讀值約 +1.10 V（題設參考條件）。',
        retry: '監測電池還無法正向持續工作。檢查電極組合、電表紅黑端與鹽橋。',
        evidence: { title: '鋅銅電池的極性', detail: 'Zn 為氧化的負極、Cu 電極為還原的正極。外電路由電子傳遞電荷，鹽橋由離子傳遞電荷。' },
      },
      {
        id: 'redox-trace', kind: 'decision', title: '追蹤兩種載流者', objective: '以電子守恆解釋電極變化與鹽橋功能',
        prompt: [
          '同一組電池接上負載後，鋅極變輕，銅極表面變厚。挑出兩個能同時解釋觀測與電路維持的過程。',
        ],
        select: 2,
        options: [
          { id: 'zn', label: 'Zn(s) → Zn²⁺(aq) + 2e⁻', detail: '鋅進入溶液，失去的電子由外電路移動。', correct: true, consequence: '鋅極質量下降，符合鋅被氧化。' },
          { id: 'bridge', label: '電子從鹽橋直接游向銅', detail: '移除外電路也可維持對外供電。', consequence: '鹽橋的載流者是離子。切斷外電路後，電子無法沿導線由鋅極到銅極。' },
          { id: 'cu', label: 'Cu²⁺(aq) + 2e⁻ → Cu(s)', detail: '銅離子得到電子，銅析出在電極表面。', correct: true, consequence: '銅極質量增加，符合銅離子被還原。' },
          { id: 'reverse', label: 'Cu(s) 失去電子進入溶液', detail: '銅極表面因氧化而變厚。', consequence: '金屬銅進入溶液應消耗電極材料，與銅極變厚不符。' },
        ],
        hints: ['電極變輕通常代表有固體轉入溶液。找出哪個半反應的金屬在左邊。', '失去電子是氧化，得到電子是還原。兩側生成和消耗的電子數必須相同。'],
        success: '鋅被氧化，銅離子被還原。兩個半反應各涉及 2 個電子，整體為 Zn + Cu²⁺ → Zn²⁺ + Cu。',
        retry: '這份反應報告無法同時解釋鋅變輕與銅變厚。',
        evidence: { title: '電極質量變化', detail: '鋅轉為 Zn²⁺ 使電極變輕。Cu²⁺ 變為固態銅使電極變重。' },
      },
      {
        id: 'meter-load', kind: 'numeric', title: '檢查監測負載', objective: '運用 V = IR、P = VI 與電流換算檢查用電',
        prompt: [
          '把兩顆相同的鋅銅電池串聯，模型以每顆 1.10 V 的理想電壓源表示，忽略內電阻。外接 110 Ω 的監測電阻。',
          '求總電壓、電流（用 mA 回報）、與監測電阻的功率（用 mW 回報）。保護器上限為 25 mA。',
        ],
        fields: [
          { label: '串聯總電壓', unit: 'V', answer: 2.2, tolerance: 0.01 },
          { label: '電阻上的電流', unit: 'mA', answer: 20, tolerance: 0.05, retry: 'V ÷ Ω 的結果是安培。換成毫安前先乘以 1,000。' },
          { label: '電阻上消耗的功率', unit: 'mW', answer: 44, tolerance: 0.1, retry: '用總電壓乘電流。電流用 mA 時，結果可直接寫成 mW。' },
        ],
        hints: ['正確串接時，兩個相同電壓源的電壓相加。', '先算 I = V ÷ R，再算 P = VI。1 A = 1,000 mA。'],
        success: '串聯共有 2.20 V，2.20 ÷ 110 = 0.020 A = 20 mA，功率為 44 mW。監測電流低於上限。',
        retry: '負載讀值沒通過核對。串聯的是兩顆電池，電流與功率各有自己的單位。',
        evidence: { title: '監測備援電路通過', detail: '理想串聯源 2.20 V，通過 110 Ω 為 20 mA、44 mW。監測端可安全運行，主電網隔離有其他原因。' },
      },
    ],
  },
  {
    id: 'greenhouse', title: '生物實驗溫室', area: '植體氣體交換艙', subject: '光合作用、呼吸與 ATP', accent: 'mint', icon: 'leaf', minutes: '7–12',
    character: biologist,
    briefing: '溫室的葉片還活著，照明失效後卻持續釋出 CO₂。幫我重新找出能作淨吸碳、又符合供電上限的設定。',
    resolution: '溫室已恢復淨吸碳。警報裡的部分 CO₂ 變化有生物原因，但還得核對氣候模型的其他來源與去處。',
    labQuestion: '把燈調亮後，淨吸碳量何時不會繼續增加？用儀器的某一筆設定解釋。',
    puzzles: [
      {
        id: 'light-water-carbon', kind: 'panel', title: '找出光合作用限制因子', objective: '用限制因子與呼吸量推算淨碳吸收，並守住功率預算',
        prompt: [
          '分別改變光照、給水和 CO₂ 供應，觀察哪個會限制光合作用。簡化模型取三個支持速率的最小值：光照每段可支持 2、給水每段可支持 1、供碳每段可支持 3（皆以 mmol CO₂/h 計）。',
          '呼吸固定放出 3 mmol CO₂/h，每段照明耗 2 W。讓淨吸碳至少 7 mmol CO₂/h，照明功率至多 10 W，給水至多 11 段。',
        ],
        model: { kind: 'greenhouse', respiration: 3, lightFactor: 2, waterFactor: 1, carbonFactor: 3, lampCost: 2 },
        controls: [
          { id: 'light', label: '照明', unit: '段', min: 0, max: 8, step: 1, initial: 2 },
          { id: 'water', label: '給水', unit: '段', min: 0, max: 14, step: 1, initial: 5 },
          { id: 'carbon', label: 'CO₂ 供應', unit: '段', min: 0, max: 4, step: 1, initial: 2 },
        ],
        metrics: [
          { id: 'gross', label: '光合作用吸碳', unit: 'mmol CO₂/h', retry: '' },
          { id: 'net', label: '淨吸碳', unit: 'mmol CO₂/h', min: 7, retry: '光合作用速率取三個支持速率中的最低值，還要扣掉呼吸。找出目前卡住的因子。' },
          { id: 'power', label: '照明功率', unit: 'W', max: 10, retry: '每調高一段照明，功率會增加 2 W。備援上限是 10 W。' },
          { id: 'water', label: '給水', unit: '段', max: 11, retry: '給水至多 11 段。達到光照和碳供應的支持速率後，再加水也無法提高速率。' },
        ],
        hints: ['淨吸碳 7 需要光合作用至少吸收 7 + 3。三個支持速率都要達到這個值。', '電力上限可容許 5 段照明。接著找給水和 CO₂ 的最低可行段數。'],
        success: '三個因子都必須至少支援 10 mmol CO₂/h。5 段照明、10 或 11 段水、4 段 CO₂ 可達淨吸 7，且照明耗 10 W。',
        retry: '環控程式拒絕套用。檢查淨吸碳和兩個資源上限，找出哪一項限制生長。',
        evidence: { title: '溫室恢復的條件', detail: '簡化模型中，光合速率取光、水、CO₂ 支持速率的最小值。淨吸碳還要扣掉呼吸釋碳。' },
      },
      {
        id: 'glucose-ledger', kind: 'numeric', title: '盤點氧氣與葡萄糖', objective: '依光合作用與有氧呼吸總反應式計算總量和淨量',
        prompt: [
          '模型使用 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ 表示光合作用，光提供能量。有氧呼吸模型則每消耗 1 份葡萄糖需要 6 份 O₂。',
          '葉片一小時光合作用放出 15 mmol 的 O₂，呼吸消耗 3 mmol 的 O₂。求 O₂ 淨產量、葡萄糖總合成量和扣掉呼吸後的淨累積量。忽略其他代謝用途。',
        ],
        fields: [
          { label: 'O₂ 淨產量', unit: 'mmol', answer: 12 },
          { label: '葡萄糖總合成量', unit: 'mmol', answer: 2.5, tolerance: 0.01 },
          { label: '葡萄糖淨累積量', unit: 'mmol', answer: 2, tolerance: 0.01, retry: '由呼吸用掉的氧氣算出葡萄糖消耗，再從總合成量扣除。' },
        ],
        hints: ['淨量要算進同時發生的兩個過程。先分別列出 O₂ 的增加與減少。', '每合成 1 份葡萄糖對應產生 6 份 O₂；呼吸每消耗 1 份葡萄糖也使用 6 份 O₂。'],
        success: '氧氣淨增 15 − 3 = 12 mmol。合成葡萄糖 15 ÷ 6 = 2.5 mmol，呼吸耗掉 3 ÷ 6 = 0.5 mmol，淨累積 2 mmol。',
        retry: '氣體帳與糖量帳沒有對齊。檢查氧氣和葡萄糖的比率，以及總量、淨量的差別。',
        evidence: { title: '光能進入生物系統', detail: '光合作用將光能轉為有機物的化學能。有氧呼吸消耗一部分葡萄糖和 O₂，將能量轉移給 ATP，並釋放熱。' },
      },
      {
        id: 'night-control', kind: 'decision', title: '分辨暗處的氣體交換', objective: '辨認植物的有氧呼吸、ATP 與控制變因',
        prompt: [
          '同一批葉片在亮處量到 CO₂ 淨流入。熄燈後，在有氧且溫度維持不變的觀測艙裡改為 CO₂ 淨流出。選出合理的生理解釋和可協助驗證的做法。',
        ],
        select: 2,
        options: [
          { id: 'respiration', label: '熄燈後仍可進行有氧呼吸', detail: '葉片利用有機物獲得 ATP，並釋出 CO₂。', correct: true, consequence: '失去光照時，呼吸可繼續進行，光合作用不再維持。' },
          { id: 'dark-control', label: '維持相同溫度和起始 CO₂，只改變是否照光', detail: '比較有葉片的測試，另設無葉片空白艙檢查儀器。', correct: true, consequence: '控制其他條件可減少混淆，空白艙可檢查儀器背景。' },
          { id: 'stop-life', label: '熄燈會使呼吸與 ATP 生成一起停止', detail: '暗處的 CO₂ 一定由非生物過程產生。', consequence: '光照減弱主要直接限制光合作用。有氧呼吸可繼續使用細胞原有的有機物。' },
          { id: 'extra-heat', label: '熄燈時同時升高溫度', detail: '如果讀值改變，就能把變化歸因於照明。', consequence: '溫度也會影響代謝速率。兩項一起調整會混淆原因。' },
        ],
        hints: ['植物白天與夜間都需要 ATP。思考熄燈之後，細胞還有哪些能量來源。', '若要驗證光照的效果，只改變光照，並用空白艙量儀器背景。'],
        success: '照明和溫度等變因分開控制後，暗處的淨釋碳符合呼吸仍在進行的解釋。',
        retry: '這個判讀混淆了光合作用、呼吸或控制變因。檢查每個選項所假設的過程。',
        evidence: { title: '停電後的 CO₂ 紀錄', detail: '供電中斷會停止補光，減少光合吸碳。有氧呼吸可繼續放出 CO₂，因此淨碳通量可能反向。' },
      },
    ],
  },
  {
    id: 'climate', title: '地球氣候控制室', area: '地球系統模擬台', subject: '碳、水與能量收支', accent: 'cyan', icon: 'cloud', minutes: '8–13',
    character: biologist,
    briefing: '溫室停電只解釋了一部分變化。氣候模型還有碳庫、水庫和對外輻射三筆帳。先釐清收支，再看警報是否仍成立。',
    resolution: '收支重新對齊，模式可以穩定運作。控制器曾把單一乾旱情境的結果當成所有族群的趨勢。去研究區核對原始族群紀錄。',
    labQuestion: '若把「離開大氣的碳」和「輸出地球的能量」混在同一筆帳，會有哪些錯誤？',
    puzzles: [
      {
        id: 'carbon-budget', kind: 'panel', title: '讓大氣碳庫停止上升', objective: '用碳通量加減與用水約束比較兩種減碳手段',
        prompt: [
          '大氣碳庫起始 60 kg C。本輪排放 26 kg C，原有植被移除 11 kg C。減排可避免一部分碳進入大氣；復育則可額外取走大氣中的碳並存入生物碳庫。',
          '選擇本輪減排與復育量。每多取走 1 kg C，需用 3 m³ 水。可用水 15 m³，期末至少留 3 m³，並讓大氣碳庫回到 60 kg C 或更低。',
        ],
        model: { kind: 'carbon', initial: 60, emissions: 26, existingUptake: 11, waterSupply: 15, waterPerUptake: 3 },
        controls: [
          { id: 'cut', label: '源頭減排', unit: 'kg C', min: 0, max: 13, step: 1, initial: 0 },
          { id: 'restore', label: '復育額外吸碳', unit: 'kg C', min: 0, max: 5, step: 1, initial: 0 },
        ],
        metrics: [
          { id: 'carbon', label: '期末大氣碳庫', unit: 'kg C', max: 60, retry: '原本本輪淨加 26 − 11 kg C。減排與額外吸碳加總要抵銷這個差值。' },
          { id: 'waterLeft', label: '期末用水餘額', unit: 'm³', min: 3, retry: '每吸收額外 1 kg C 會用掉 3 m³ 水。別把水全部投進復育。' },
        ],
        hints: ['先算完全不介入時的期末碳庫，再看要扣掉多少。', '水庫允許動用 12 m³，最多支援 4 kg C 的復育吸碳。'],
        success: '你同時穩住大氣碳庫和用水。符合條件的組合須減排加復育至少 15 kg C，且額外吸碳至多 4 kg C。',
        retry: '模型偵測到碳仍累積或供水不足。兩項門檻必須同時通過。',
        evidence: { title: '大氣碳庫帳', detail: '大氣碳庫變化 = 碳排放 − 各項吸收。植被吸碳把碳移入生物碳庫，本輪的復育同時會耗水。' },
      },
      {
        id: 'water-budget', kind: 'numeric', title: '辨認水流的去向', objective: '以控制範圍和時間區間建立水量守恆',
        prompt: [
          '地面水庫今天初始有 120 m³。降雨流入 36 m³，庫面蒸發 14 m³，下游放水 18 m³。其餘通量忽略。',
          '今天收班時必須保有 120 m³。回報收班前的水量、可再供出的水量，以及模型預估明天會以降雨回到庫中的水量。後者是今天蒸發量的一半。',
        ],
        fields: [
          { label: '今天期末庫水', unit: 'm³', answer: 124 },
          { label: '今天可加放的水量', unit: 'm³', answer: 4 },
          { label: '明天回到庫中的追蹤水量', unit: 'm³', answer: 7, retry: '只計入今天由庫面蒸發、隔天回到同一水庫的那部分。' },
        ],
        hints: ['先圈住控制範圍：只記水庫內的水。下游和大氣中的水已離開庫。', '降雨回收發生在隔天。今天的期末水量要獨立計算。'],
        success: '120 + 36 − 14 − 18 = 124 m³。今天可多放 4 m³。庫面蒸發後移入大氣，明天的追蹤回流量是 14 ÷ 2 = 7 m³。',
        retry: '收支表混入了邊界外或隔天的水。分開處理今天和明天的通量。',
        evidence: { title: '水循環的時間差', detail: '蒸發將庫水移入大氣。水蒸氣凝結成雲滴，部分再降水回庫。這批回流必須記在發生的那天。' },
      },
      {
        id: 'radiation-balance', kind: 'graph', title: '定位輻射失衡情境', objective: '從圖上讀長波通量，計算短波、長波與淨能量收支',
        prompt: [
          '比較四個固定地表溫度的 CO₂ 情境。地球頂端收到短波 340 W/m²，反射其中 100 W/m²。圖上顯示不同情境下逸出太空的長波。',
          '找出按圖順序第一個使淨吸收大於 8 W/m² 的情境。回報該情境的淨吸收；假設長波固定，再算短波總反射需達多少才能讓淨吸收為零。',
        ],
        graph: {
          title: '不同 CO₂ 情境的長波輸出', xLabel: '情境編號', yLabel: '長波 (W/m²)',
          xTicks: [0, 1, 2, 3], yTicks: [224, 228, 232, 236, 240, 244],
          points: [{ x: 0, y: 240 }, { x: 1, y: 236 }, { x: 2, y: 232 }, { x: 3, y: 228 }],
          pickLabel: '淨吸收首次大於 8 W/m² 的情境', answerX: 3,
        },
        fields: [
          { label: '該情境的淨吸收', unit: 'W/m²', answer: 12 },
          { label: '平衡所需的短波總反射', unit: 'W/m²', answer: 112, retry: '問的是反射的總量。在長波維持 228 時，340 − 反射 − 228 必須等於 0。' },
        ],
        hints: ['淨吸收 = 入射短波 − 反射短波 − 出射長波。留意題目說「大於」。', '情境 2 的淨吸收剛好為 8 W/m²。平衡題可把反射量當未知數解。'],
        success: '情境 3 的淨吸收為 340 − 100 − 228 = 12 W/m²。假設長波固定，總反射 112 W/m² 才會平衡。實際氣候會隨溫度和其他條件調整。',
        retry: '輻射平衡檢查未通過。長波只是向太空輸出的一部分，還要扣除反射的短波。',
        evidence: { title: '頂端輻射收支', detail: '固定溫度的比較中，較強的溫室效應可減少逸出太空的長波，帶來正淨吸收。地球系統因而累積能量。' },
      },
    ],
  },
  {
    id: 'evolution', title: '生態演化研究區', area: '族群與標本資料庫', subject: '自然選擇與分類', accent: 'lilac', icon: 'dna', minutes: '8–13',
    character: biologist,
    briefing: '資料庫建議永久移除原有族群，理由是乾旱實驗中某個性狀變多。這需要很強的證據。調出不同世代和共同環境的紀錄，再決定能推論到哪一步。',
    resolution: '演化報告已恢復。適存性會隨環境而變，分類要看共同祖先證據。備援檔案也證實：模型只抓了乾旱批次，丟掉雨後樣本。',
    labQuestion: '乾旱下增加的性狀，為什麼在雨季不一定還有優勢？需要哪些新證據？',
    puzzles: [
      {
        id: 'trait-frequency', kind: 'graph', title: '讀出族群性狀頻率', objective: '用世代資料分辨比例、百分點與相對倍數',
        prompt: [
          '各世代都用同樣方法抽樣 100 隻虛構濱岸小甲蟲，記錄可遺傳的厚殼性狀。第 1 至 3 世代為乾旱期，採集第 4 世代時已恢復潮濕，這是第一批雨後樣本。',
          '在圖上標出首次有至少一半樣本帶厚殼的位置。比較該世代和第 0 世代，填寫厚殼比例增加的百分點和相對於起始的倍數。',
        ],
        graph: {
          title: '各世代的厚殼性狀比例', xLabel: '世代', yLabel: '厚殼比例 (%)',
          xTicks: [0, 1, 2, 3, 4], yTicks: [0, 20, 40, 60, 80, 100],
          points: [{ x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 45 }, { x: 3, y: 60 }, { x: 4, y: 55 }],
          pickLabel: '厚殼比例首次至少 50% 的世代', answerX: 3,
        },
        fields: [
          { label: '比例增加', unit: '百分點', answer: 50 },
          { label: '相對起始比例', unit: '倍', answer: 6, retry: '倍數用終點比例除以起始比例，百分點則是兩個比例的差。' },
        ],
        hints: ['在橫軸依世代先後尋找。每個點代表一批新抽樣的族群資料。', '用終點比例減起始比例算百分點。兩者相除算相對倍數。'],
        success: '第 3 世代首次超過一半，從 10% 到 60%，增加 50 個百分點，成為原比例的 6 倍。雨後第 4 代回到 55%。',
        retry: '別把百分點的差與比例倍數寫成同一種量。',
        evidence: { title: '乾旱與雨後的族群樣本', detail: '厚殼個體比例從 10% 升到 60%，第一批雨後回到 55%。這是族群樣本的比例變化。' },
      },
      {
        id: 'selection-evidence', kind: 'decision', title: '找出自然選擇的證據', objective: '將性狀遺傳與分環境的繁殖差異連起來',
        prompt: [
          '何研究員對照家系與後代紀錄，確認厚殼性狀有遺傳成分。再把兩種性狀各 20 隻分到同等起始條件的乾、濕環境，追蹤每組總共留下的成活後代。',
          '選出兩項有證據支持、可放進報告的判讀。',
        ],
        table: { title: '成活後代數', columns: ['環境', '厚殼親代組', '薄殼親代組'], rows: [['乾燥', '36', '12'], ['潮濕', '21', '23']] },
        select: 2,
        options: [
          { id: 'heritability', label: '家系資料支持性狀可遺傳', detail: '親代特徵可部分傳給後代，讓比例跨世代改變。', correct: true, consequence: '這是將繁殖差異連結到長期族群變化的條件。' },
          { id: 'adapted', label: '此乾燥測試中，厚殼組留下較多後代', detail: '若這項差異持續，可使厚殼性狀的頻率上升。', correct: true, consequence: '在相同初始數下，36 對 12 支持乾燥條件中的繁殖差異。' },
          { id: 'need', label: '甲蟲因為需要保水，在一生中改成厚殼並傳下去', detail: '乾燥樣本的比例即可證明這個機制。', consequence: '比例的變動發生在跨世代的族群。資料沒有追到同一隻甲蟲變出可遺傳的新性狀。' },
          { id: 'superior', label: '厚殼在所有環境都能留下更多後代', detail: '可立即將所有薄殼族群替換掉。', consequence: '潮濕資料沒有呈現乾燥測試的優勢。適存性要對照特定環境。' },
        ],
        hints: ['自然選擇的解釋要有性狀遺傳和繁殖成效差異。找出分別支持它們的資料。', '比較乾燥與潮濕兩列。把觀察到的差異限制在相符的環境內。'],
        success: '家系支持遺傳，乾燥環境中的繁殖差異能提高厚殼頻率。潮濕對照沒有呈現同樣優勢，仍需要更多重複試驗。',
        retry: '報告的推論超出實驗能支持的範圍。比對環境、家系與世代層級。',
        evidence: { title: '自然選擇的證據鏈', detail: '已有可遺傳的性狀差異。乾燥測試中厚殼組有更多成活後代；潮濕測試未呈現相同優勢。' },
      },
      {
        id: 'lineage-file', kind: 'decision', title: '比對標本的親緣關係', objective: '結合形態、化石與 DNA 證據推估共同祖先',
        prompt: [
          '三份虛構甲蟲標本和一個外群如下。化石序列中的早期祖型沒有雙節構造，較晚才出現。相同的深色外觀可由飼養照度誘發。DNA 比對使用相同的一段序列。',
          '復原最有證據支持的親緣配對，才能把雨後樣本放回正確的研究紀錄。',
        ],
        table: { title: '標本與 DNA 比對', columns: ['標本', '腹部雙節', '體色', '與岸紋甲的 DNA 差異'], rows: [['岸紋甲', '有', '深', '自身比對'], ['沼紋甲', '有', '淺', '2 處'], ['溪青甲', '無', '深', '8 處'], ['外群', '無', '淺', '14 處']] },
        select: 1,
        options: [
          { id: 'marsh', label: '岸紋甲與沼紋甲較近', detail: '共同的衍生構造和較少的 DNA 差異給出相同結果。', correct: true, consequence: '晚出現的共同雙節構造，與同段 DNA 的比對都支持這一配對。' },
          { id: 'stream', label: '岸紋甲與溪青甲較近', detail: '兩者都是深色，直接以體色分類。', consequence: '照度可改變觀察到的體色。雙節構造與 DNA 都給出更有力的配對資訊。' },
          { id: 'outgroup', label: '岸紋甲與外群較近', detail: '相差越多 DNA 位點，親緣越近。', consequence: '相同片段的比對中，14 處差異最多，且外群沒有共同的雙節構造。' },
        ],
        hints: ['先區分可能受環境影響的體色，與可追蹤共同來源的構造。', '找出同時具有後來出現的雙節構造、與岸紋甲 DNA 差異最少的標本。'],
        success: '岸紋甲與沼紋甲的共同衍生構造與 DNA 資料一致，支持較近的共同祖先。雨後樣本可歸回原本的研究紀錄。',
        retry: '資料庫需要能同時解釋形態和 DNA 比對的配對。',
        evidence: { title: '恢復雨後樣本索引', detail: '共同衍生構造、化石前後次序與 DNA 同段比對共同支持親緣配對。舊報告錯過了雨後對照。' },
      },
    ],
  },
];
