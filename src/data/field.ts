import type { Answer, AssayPuzzle, PanelPuzzle, Puzzle } from './types.ts';

type RouteChoice = { label: string; answer: Answer; consequence?: string };
export type FieldTask =
  | { mode: 'route'; action: string; choices: RouteChoice[] }
  | { mode: 'samples'; action: string }
  | { mode: 'battery'; action: string }
  | { mode: 'controls'; action: string; presets: Record<string, number[]> }
  | { mode: 'survey'; action: string; readings: { label: string; result: string; clue: string }[] };

const numeric = (value: number): Answer => ({ kind: 'numeric', values: [String(value)] });
const decision = (id: string): Answer => ({ kind: 'decision', selected: [id] });
const walkToChoice = '走到你選的標籤或按鈕旁，按 E 試試看。';
const adjustDevice = '走到一台機器旁按 E 調設定。面板都達標後，到驗收台按 E。';

export const fieldTasks: Partial<Record<string, FieldTask>> = {
  'packet-time': {
    mode: 'route',
    action: walkToChoice,
    choices: [
      { label: '3 × 10²', answer: numeric(2), consequence: '10² 是 100。3 × 100 = 300，備份盒有 3,000 筆。' },
      { label: '3 × 10³', answer: numeric(3) },
      { label: '3 × 10⁴', answer: numeric(4), consequence: '10⁴ 是 10,000。3 × 10,000 = 30,000，這張太大了。' },
    ],
  },
  'archive-block': {
    mode: 'route',
    action: walkToChoice,
    choices: [
      { label: '每疊 3 張', answer: numeric(3), consequence: '兩箱都分得完，不過還能把每疊變大。' },
      { label: '每疊 4 張', answer: numeric(4), consequence: '12 張剛好分完，18 張會剩下 2 張。試試其他疊法。' },
      { label: '每疊 6 張', answer: numeric(6) },
    ],
  },
  'solve-flow': {
    mode: 'route',
    action: '走到你算出的水量旁按 E，替 A 泵貼上標籤。',
    choices: [
      { label: 'A 泵 3 L/min', answer: numeric(3), consequence: '再多 3 公升的話，每分鐘會變成 11（8 + 3）。機器量到 13。' },
      { label: 'A 泵 5 L/min', answer: numeric(5) },
      { label: 'A 泵 6 L/min', answer: numeric(6), consequence: '再多 6 公升的話，每分鐘會變成 14（8 + 6）。機器量到 13。' },
    ],
  },
  'heat-witness': {
    mode: 'route',
    action: '看水變冷還是變暖，再走到你選的熱流按鈕旁按 E。',
    choices: [
      { label: '反應槽放熱', answer: decision('a-release') },
      { label: '反應槽吸熱', answer: decision('a-absorb'), consequence: '吸熱時，槽會向水要熱，水應該變冷。這次水變暖了。' },
    ],
  },
  'probe-samples': {
    mode: 'samples',
    action: '把四瓶都量一次。在每瓶旁按 E。帶著讀值回水樣分析台。',
  },
  'wire-cell': {
    mode: 'battery',
    action: '靠近零件按 E 拿取，再到插槽按 E 裝上。最後去看電表。',
  },
  'light-water-carbon': {
    mode: 'controls', action: adjustDevice,
    presets: { light: [1, 2, 3], water: [2, 4, 6] },
  },
  'carbon-budget': {
    mode: 'controls', action: adjustDevice,
    presets: { cut: [0, 1, 2, 3, 4], restore: [0, 1, 2, 3] },
  },
  'selection-evidence': {
    mode: 'survey',
    action: '去乾燥箱、潮濕箱和家系檔案旁按 E，讀完三份紀錄再回族群紀錄台。',
    readings: [
      { label: '乾燥培養箱', result: '乾燥時，厚殼組留下 6 隻幼蟲，薄殼組留下 2 隻。', clue: '兩組一開始的親代一樣多。比留下的幼蟲，比較容易看出誰在這裡繁殖得多。' },
      { label: '潮濕培養箱', result: '潮濕時，厚殼組留下 4 隻幼蟲，薄殼組留下 5 隻。', clue: '這一頁差點被漏掉。換了環境，乾季的結果就不一定會重演。' },
      { label: '家系檔案', result: '親代的厚殼可以傳給後代。', clue: '把這頁和幼蟲數放在一起，就能解釋為什麼過幾代後，厚殼有可能變常見。' },
    ],
  },
  'final-dispatch': {
    mode: 'controls', action: adjustDevice,
    presets: { dose: [0, 1, 2, 3], pump: [0, 1, 2, 3], light: [0, 1, 2, 3] },
  },
};

export type Part = 'Zn' | 'Cu' | 'bridge';
export type Socket = 'left' | 'right' | 'bridge';
export const parts: Record<Part, string> = { Zn: '鋅片 Zn', Cu: '銅片 Cu', bridge: '鹽橋' };
export const slots: Record<Socket, string> = { left: '左邊黑端', bridge: '中間鹽橋座', right: '右邊紅端' };
export const partClues: Record<Part, string> = {
  Zn: '鋅會把電子交出去，是這顆電池的負端。帶去左邊的黑色插槽。',
  Cu: '這片銅是正端，溶液裡的銅離子會在這裡接到電子。帶去右邊的紅色插槽。',
  bridge: '鹽橋讓水裡帶電的離子在兩杯之間移動。帶去中間的插座，電池才可以持續供電。',
};

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
    controls: puzzle.kind === 'panel' ? Object.fromEntries(puzzle.controls.map(control => [control.id, control.initial])) : {},
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
  const settings = task.mode === 'controls' ? task.presets : {};
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
