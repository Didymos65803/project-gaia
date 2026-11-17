export type IconName =
  | 'globe' | 'lock' | 'chart' | 'flask' | 'drop' | 'bolt' | 'leaf' | 'cloud' | 'dna'
  | 'check' | 'arrow' | 'back' | 'notebook' | 'settings' | 'hint' | 'close' | 'radio'
  | 'clock' | 'users' | 'grid' | 'shield';

export type Character = { name: string; role: string; initials: string };
export type Evidence = { title: string; detail: string };

export type ReferenceTable = {
  title: string;
  columns: string[];
  rows: string[][];
};

type Brief = {
  id: string;
  title: string;
  objective: string;
  prompt: string[];
  table?: ReferenceTable;
  hints: string[];
  success: string;
  retry: string;
  evidence: Evidence;
};

export type NumberField = {
  label: string;
  unit: string;
  answer: number;
  tolerance?: number;
  retry?: string;
};

export type NumericPuzzle = Brief & {
  kind: 'numeric';
  fields: NumberField[];
};

type GraphPoint = { x: number; y: number };

export type GraphPuzzle = Brief & {
  kind: 'graph';
  graph: {
    title: string;
    xLabel: string;
    yLabel: string;
    xTicks: number[];
    yTicks: number[];
    points: GraphPoint[];
    pickLabel: string;
    answerX: number;
  };
  fields: NumberField[];
};

export type Species = {
  formula: string;
  atoms: Record<string, number>;
  coefficient: number;
};

export type BalancePuzzle = Brief & {
  kind: 'balance';
  maximumCoefficient?: number;
  reactants: Species[];
  products: Species[];
};

type DecisionOption = {
  id: string;
  label: string;
  detail: string;
  correct?: true;
  consequence: string;
};

export type DecisionPuzzle = Brief & {
  kind: 'decision';
  select: number;
  options: DecisionOption[];
};

export type AssayPuzzle = Brief & {
  kind: 'assay';
  samples: { id: string; label: string; ph: number; conductivity: number }[];
  targets: { label: string; sample: string }[];
};

export type CircuitPuzzle = Brief & {
  kind: 'circuit';
  voltage: number;
  leftElectrode: 'Zn';
  rightElectrode: 'Cu';
};

export type Control = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
};

export type PanelModel =
  | { kind: 'neutralize'; acid: number; basePerDose: number }
  | { kind: 'greenhouse'; respiration: number; lightFactor: number; waterFactor: number; carbonSupport: number; lampCost: number }
  | { kind: 'carbon'; initial: number; emissions: number; existingUptake: number; waterSupply: number; waterPerUptake: number }
  | {
      kind: 'restart';
      acid: number;
      basePerBatch: number;
      waterStock: number;
      waterPerBatch: number;
      waterFactor: number;
      lampFactor: number;
      respiration: number;
      energyPerDose: number;
      energyPerPump: number;
      energyPerLamp: number;
    };

export type Metric = { id: string; label: string; unit: string; min?: number; max?: number; retry: string };

export type PanelPuzzle = Brief & {
  kind: 'panel';
  model: PanelModel;
  controls: Control[];
  metrics: Metric[];
};

export type Puzzle = NumericPuzzle | GraphPuzzle | BalancePuzzle | DecisionPuzzle | AssayPuzzle | CircuitPuzzle | PanelPuzzle;

export type Chapter = {
  id: string;
  title: string;
  area: string;
  subject: string;
  accent: string;
  icon: IconName;
  minutes: string;
  character: Character;
  briefing: string;
  resolution: string;
  labQuestion: string;
  puzzles: Puzzle[];
};

export type CellAnswer = { left: string; right: string; bridge: boolean };

export type Answer =
  | { kind: 'numeric'; values: string[] }
  | { kind: 'graph'; values: string[]; x: number | null }
  | { kind: 'balance'; coefficients: number[] }
  | { kind: 'decision'; selected: string[] }
  | { kind: 'assay'; inspected: string[]; selections: string[] }
  | { kind: 'circuit'; cell: CellAnswer }
  | { kind: 'panel'; values: Record<string, number> };

export type Feedback = { correct: boolean; message: string; details: string[] };
