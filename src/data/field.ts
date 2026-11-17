import type { Answer, AssayPuzzle, PanelPuzzle, Puzzle } from './types.ts';

type RouteChoice = { label: string; answer: Answer; consequence?: string };
export type FieldTask =
  | { mode: 'route'; summary: string; choices: RouteChoice[] }
  | { mode: 'heat'; summary: string }
  | { mode: 'timing'; summary: string }
  | { mode: 'samples'; summary: string }
  | { mode: 'battery'; summary: string }
  | { mode: 'controls'; summary: string; presets: Record<string, number[]> }
  | { mode: 'survey'; summary: string; readings: { label: string; result: string }[] };

const numeric = (...values: number[]): Answer => ({ kind: 'numeric', values: values.map(String) });

export const timingDials = [
  { id: 'coefficient', label: '係數 a', values: [1, 7.2, 0.72, 72] },
  { id: 'exponent', label: '指數 n', values: [-4, -5, -6] },
  { id: 'micros', label: '微秒計', values: [7.2, 72, 720] },
];

export const fieldTasks: Partial<Record<string, FieldTask>> = {
  'packet-time': {
    mode: 'timing',
    summary: '掃描器讀到 0.000072 秒。走到三個旋鈕按 E，把資料以 a × 10ⁿ 秒和微秒兩種方式送回。科學記號要求 1 ≤ a < 10。1 秒＝1,000,000 μs。',
  },
  'archive-block': {
    mode: 'route',
    summary: 'A 檔 72 筆，B 檔 180 筆。走到可讓兩份檔案都沒有餘數、而且區塊最長的分流口，按 E 讓封包通過。',
    choices: [
      { label: '18 筆／塊', answer: numeric(2, 2, 1, 18), consequence: '封包都對齊了，但 18 還能再放大。用質因數分解比較兩份檔案共同的區塊。' },
      { label: '24 筆／塊', answer: numeric(2, 2, 1, 24), consequence: 'A 檔能分成 3 塊。B 檔切成 7 塊後還剩 12 筆，分流口自動關回。' },
      { label: '36 筆／塊', answer: numeric(2, 2, 1, 36) },
    ],
  },
  'solve-flow': {
    mode: 'route',
    summary: '原始 A＋B = 18 L/min。讓 A 倍增後，2A＋B = 30 L/min。走到同時符合兩次測試的管線組合，按 E 啟動。',
    choices: [
      { label: 'A 6・B 12', answer: numeric(6, 12), consequence: '原始總量是 18，但 A 倍增後只有 24 L/min。水壓到不了目標。' },
      { label: 'A 12・B 6', answer: numeric(12, 6) },
      { label: 'A 15・B 3', answer: numeric(15, 3), consequence: '原始總量是 18，但 A 倍增後達 33 L/min，超過測到的 30。' },
    ],
  },
  'heat-witness': {
    mode: 'heat',
    summary: '外側的水從 22 °C 變為 A 槽 29 °C、B 槽 18 °C，空白槽維持 22 °C。走到兩槽切換放熱／吸熱，再到熱流驗收台測試。',
  },
  'probe-samples': {
    mode: 'samples',
    summary: '帶著探針走到 A、B、C、D 四瓶，按 E 量 pH 和導電度。收齊讀值後，前往水樣分析台回報。',
  },
  'wire-cell': {
    mode: 'battery',
    summary: '到備料櫃拿鋅片、銅片與鹽橋，再裝到對應插槽。電表紅端在右、黑端在左，目標為接通鹽橋且讀值為正。',
  },
  'light-water-carbon': {
    mode: 'controls',
    summary: '走到燈、水、CO₂ 站按 E 切換設定，讓三個因子的支持速率都足夠。扣掉呼吸後需淨吸碳 ≥7 mmol CO₂/h，照明 ≤10 W，給水 ≤11 段。',
    presets: { light: [2, 4, 5, 6], water: [5, 8, 10, 11, 12], carbon: [2, 3, 4] },
  },
  'carbon-budget': {
    mode: 'controls',
    summary: '大氣起始 60 kg C。本輪排放 26、既有植被吸收 11 kg C。走到兩台機器切換減排與復育。期末碳庫 ≤60 kg C，用水至少剩 3 m³。',
    presets: { cut: [0, 8, 11, 12, 13], restore: [0, 2, 3, 4, 5] },
  },
  'selection-evidence': {
    mode: 'survey',
    summary: '走訪乾燥培養箱、潮濕培養箱與家系檔案。把不同環境和跨世代的證據帶回族群紀錄台。',
    readings: [
      { label: '乾燥培養箱', result: '同樣從 20 隻親代起始，厚殼組有 36 隻成活後代，薄殼組有 12 隻。' },
      { label: '潮濕培養箱', result: '厚殼組有 21 隻成活後代，薄殼組有 23 隻。乾燥時的優勢沒有出現在這裡。' },
      { label: '家系檔案', result: '家系紀錄與共同環境觀察共同確認厚殼性狀有遺傳成分。' },
    ],
  },
  'final-dispatch': {
    mode: 'controls',
    summary: '走到處理、抽水、照明設備，分配 30 Wh。必須同時讓剩餘酸量為零、庫水 ≥6 m³、淨吸碳 ≥8 mmol CO₂/h。',
    presets: { dose: [2, 3, 4, 5], pump: [2, 3, 4, 5], light: [3, 4, 5, 6] },
  },
};

export type Part = 'Zn' | 'Cu' | 'bridge';
export type Socket = 'left' | 'right' | 'bridge';
export const parts: Record<Part, string> = { Zn: '鋅片 Zn', Cu: '銅片 Cu', bridge: '鹽橋' };
export const slots: Record<Socket, string> = { left: '黑端插槽', right: '紅端插槽', bridge: '鹽橋插座' };

export type FieldState = {
  puzzleId: string;
  scanned: string[];
  operated: string[];
  controls: Record<string, number>;
  carried: Part | null;
  mounted: Partial<Record<Socket, Part>>;
};

export function freshField(puzzle: Puzzle): FieldState {
  return {
    puzzleId: puzzle.id,
    scanned: [],
    operated: [],
    controls: fieldTasks[puzzle.id]?.mode === 'timing'
      ? Object.fromEntries(timingDials.map(dial => [dial.id, dial.values[0]]))
      : puzzle.kind === 'panel' ? Object.fromEntries(puzzle.controls.map(control => [control.id, control.initial])) : {},
    carried: null,
    mounted: {},
  };
}

export function cycleValue(set: readonly number[], value: number | undefined): number {
  return set[(set.indexOf(value ?? NaN) + 1) % set.length];
}

export function batteryAnswer(state: FieldState): Extract<Answer, { kind: 'circuit' }> {
  return { kind: 'circuit', cell: {
    left: state.mounted.left ?? '',
    right: state.mounted.right ?? '',
    bridge: state.mounted.bridge === 'bridge',
  } };
}

export function changeSocket(field: FieldState, socket: Socket): { field: FieldState; message: string } {
  const installed = field.mounted[socket];
  const part = field.carried;
  if (part && (part === 'bridge') !== (socket === 'bridge')) return { field, message: '這個零件裝不進插槽。金屬片要接到電表，鹽橋放在兩半電池中間。' };
  if (!part && !installed) return { field, message: '插槽是空的。先到備料櫃取一個零件。' };
  const mounted = { ...field.mounted };
  if (part) mounted[socket] = part;
  else delete mounted[socket];
  return {
    field: { ...field, mounted, carried: installed ?? null },
    message: part ? `已裝上 ${parts[part]}${installed ? `，手上換成${parts[installed]}` : ''}。` : `已取回 ${parts[installed!]}。`,
  };
}

export function sampleReadings(puzzle: AssayPuzzle, scanned: string[]) {
  return puzzle.samples.filter(sample => scanned.includes(sample.id))
    .map(sample => `${sample.label} · pH ${sample.ph.toFixed(1)} / ${sample.conductivity} mS/cm`);
}

export function controlSpec(puzzle: PanelPuzzle, id: string) {
  return puzzle.controls.find(control => control.id === id);
}

export function readField(raw: unknown, puzzle: Puzzle): FieldState | null {
  const task = fieldTasks[puzzle.id];
  if (!task || !raw || typeof raw !== 'object') return null;
  const data = raw as Partial<FieldState>;
  if (data.puzzleId !== puzzle.id) return null;
  const next = freshField(puzzle);
  const scanned = task.mode === 'samples' && puzzle.kind === 'assay' ? puzzle.samples.map(sample => sample.id)
    : task.mode === 'survey' ? task.readings.map((_, index) => String(index)) : [];
  next.scanned = scanned.filter(id => Array.isArray(data.scanned) && data.scanned.includes(id));
  const settings = task.mode === 'controls' ? task.presets
    : task.mode === 'timing' ? Object.fromEntries(timingDials.map(dial => [dial.id, dial.values]))
      : task.mode === 'heat' ? { A: [1, -1], B: [1, -1] } : {};
  for (const [key, values] of Object.entries(settings)) {
    const saved = data.controls?.[key];
    if (typeof saved === 'number' && values.includes(saved)) next.controls[key] = saved;
  }
  next.operated = Object.keys(settings).filter(key => Array.isArray(data.operated) && data.operated.includes(key));
  if (task.mode === 'battery') {
    const used: Part[] = [];
    for (const socket of ['left', 'right', 'bridge'] as const) {
      const part = data.mounted?.[socket];
      if (!part || used.includes(part)) continue;
      if (socket === 'bridge' ? part !== 'bridge' : part !== 'Zn' && part !== 'Cu') continue;
      next.mounted[socket] = part;
      used.push(part);
    }
    if ((data.carried === 'Zn' || data.carried === 'Cu' || data.carried === 'bridge') && !used.includes(data.carried)) {
      next.carried = data.carried;
    }
  }
  return next;
}
