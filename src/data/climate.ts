import type { Chapter } from './types.ts';

export const climateActivities: NonNullable<Chapter['optionalPuzzles']> = [
  {
    device: '太陽輻射模擬台',
    puzzle: {
      id: 'solar-simulator',
      kind: 'panel',
      title: '地球每秒留下多少能量？',
      objective: '操作反射短波與出射紅外，從淨輻射通量求能量累積',
      prompt: [
        '從太空看，地球平均每平方公尺收到 340 W 的太陽短波。部分陽光會反射回太空，地球也會向太空放出紅外線。',
        '先看初始的平衡情境。接著維持反射為 100 W/m²，把出射紅外調到 237 W/m²。若這組通量維持 100 秒，每平方公尺會多留下多少焦耳？',
      ],
      model: { kind: 'radiation', incoming: 340 },
      controls: [
        { id: 'reflected', label: '反射短波', unit: 'W/m²', min: 70, max: 130, step: 1, initial: 100 },
        { id: 'infrared', label: '出射紅外', unit: 'W/m²', min: 210, max: 270, step: 1, initial: 240 },
      ],
      metrics: [
        { id: 'absorbed', label: '地球吸收的短波', unit: 'W/m²', min: 240, max: 240, retry: '把反射短波調回 100 W/m²。地球收到 340，反射 100，吸收 240。' },
        { id: 'net', label: '每秒淨留下', unit: 'W/m²', min: 3, max: 3, retry: '把出射紅外調到 237 W/m²，再看淨留下的能量。' },
      ],
      fields: [{ label: '100 秒累積的能量', unit: 'J/m²', answer: 300, retry: '每平方公尺每秒淨留下 3 焦耳，乘上經過的秒數。' }],
      hints: ['淨輻射通量＝入射短波 − 反射短波 − 出射紅外。', '1 W 等於每秒 1 J。用每秒留下的能量乘 100 秒。'],
      success: '每平方公尺每秒多留下 340 − 100 − 237 = 3 焦耳。維持 100 秒就累積 300 J/m²。',
      retry: '檢查兩個設定，再把淨通量換算成 100 秒的能量。',
      evidence: { title: '地球能量收支', detail: '340 − 100 − 240 = 0 W/m²。出射紅外降到 237 W/m² 時，淨通量是 +3 W/m²。若維持 100 秒，累積 300 J/m²。' },
    },
  },
  {
    device: '森林碳水討論台',
    puzzle: {
      id: 'forest-cycles',
      kind: 'decision',
      title: '暖乾月，森林的碳和水去了哪裡？',
      objective: '比較一般月與暖乾月，連結水儲量、碳源／碳匯與氣孔',
      prompt: [
        '何研究員帶來同一片森林在兩個月的觀測。切換「一般月」和「暖乾月」，沿箭頭看水和碳進出林地的路徑。',
        '用數據選出兩張能解釋暖乾月變化的說法。',
      ],
      forestMonths: [
        { id: 'normal', label: '一般月', rain: 110, evapotranspiration: 80, runoff: 25, uptake: 3, release: 2.4 },
        { id: 'dry', label: '暖乾月', rain: 38, evapotranspiration: 55, runoff: 10, uptake: 1.6, release: 2 },
      ],
      select: 2,
      options: [
        { id: 'stored-water', label: '暖乾月動用了原有蓄水', detail: '蒸散和河道流出合計 65 mm，超過當月降雨的 38 mm。', correct: true, consequence: '暖乾月水儲量減少 27 mm。' },
        { id: 'stomata', label: '這片森林在暖乾月成了碳源', detail: '供水少時氣孔可能縮小，CO₂ 較難進入葉片。本月吸收的碳比釋出的少。', correct: true, consequence: '暖乾月林地淨釋出 0.4 t C/ha。' },
        { id: 'less-evaporation', label: '蒸散變少，林地就一定存下更多水', detail: '比較蒸散就能判斷有沒有蓄水。', consequence: '暖乾月蒸散雖然減少，雨也少很多。要把降雨、蒸散與河道流出一起算。' },
        { id: 'less-respiration', label: '呼吸釋碳變少，森林就一定是碳匯', detail: '只要釋出的量比上個月少，就會存下碳。', consequence: '暖乾月釋出的碳雖然變少，光合吸收的降幅更大。本月仍然釋出得比吸收多。' },
      ],
      hints: ['林地的水儲量變化＝降雨 − 蒸散 − 河道流出。', '同一個月內，林地吸收比釋出的多是碳匯，釋出比吸收多是碳源。'],
      success: '一般月多存 5 mm 的水，林地淨吸碳 0.6 t C/ha。暖乾月少存 27 mm 的水，林地轉為淨釋碳 0.4 t C/ha。討論一下，如果兩個月午後收到的淨輻射相近，蒸散變少可能如何影響近地空氣？',
      retry: '水和碳各挑一個能用暖乾月數據支持的說法。',
      evidence: { title: '暖乾月的森林收支', detail: '一般月水儲量 +5 mm、碳儲量 +0.6 t C/ha。暖乾月水儲量 −27 mm、碳儲量 −0.4 t C/ha。缺水時氣孔可能縮小，使蒸騰和 CO₂ 進入葉片都減少。' },
    },
  },
];
