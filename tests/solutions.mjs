const numeric = value => ({ kind: 'numeric', values: [String(value)] });
const graph = x => ({ kind: 'graph', x, values: [] });
const decision = id => ({ kind: 'decision', selected: [id] });
const panel = values => ({ kind: 'panel', values });

export const solutions = {
  'packet-time': numeric(Math.log10(3000 / 3)),
  'archive-fanout': numeric(2 ** 3),
  'archive-block': numeric(6),
  'calibration-line': graph((12 - 4) / 2),
  'noise-decay': graph(2),
  'solve-flow': numeric(13 - 8),
  'balance-methane': { kind: 'balance', coefficients: [2, 1, 2] },
  'sealed-mass': numeric(20 - 12),
  'heat-witness': decision('a-release'),
  'probe-samples': { kind: 'assay', inspected: ['a', 'b', 'c', 'd'], selections: ['b', 'a'] },
  'ph-exponent': numeric(10 ** (4 - 3)),
  'neutralize-tank': panel({ dose: 6 / 2 }),
  'wire-cell': { kind: 'circuit', cell: { left: 'Zn', right: 'Cu', bridge: true } },
  'redox-trace': decision('zn'),
  'meter-load': numeric(6 / 3),
  'light-water-carbon': panel({ light: 2, water: 4 }),
  'glucose-ledger': numeric(12 / 6),
  'night-control': decision('respiration'),
  'carbon-budget': panel({ cut: 3, restore: 2 }),
  'water-budget': numeric(10 + 4 - 2),
  'radiation-balance': graph(2),
  'trait-frequency': graph(2),
  'selection-evidence': decision('adapted'),
  'lineage-file': decision('marsh'),
  'final-calibration': numeric((14 - 4) / 2),
  'final-dispatch': panel({ dose: 2, pump: 2, light: 2 }),
  'final-cause': decision('first-link'),
  'final-release': decision('verify'),
};
