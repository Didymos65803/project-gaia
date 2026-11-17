const numeric = value => ({ kind: 'numeric', values: [String(value)] });
const graph = (x, ...values) => ({ kind: 'graph', x, values: values.map(String) });
const decision = id => ({ kind: 'decision', selected: [id] });
const panel = values => ({ kind: 'panel', values });

export const solutions = {
  'packet-time': numeric(Math.log10(3000 / 3)),
  'archive-fanout': numeric(2 ** 3),
  'archive-block': numeric(6),
  'calibration-line': graph(4, (12 - 4) / 2),
  'noise-decay': graph(2, 32 - 8),
  'solve-flow': numeric(13 - 8),
  'balance-methane': { kind: 'balance', coefficients: [1, 5, 3, 4] },
  'sealed-mass': numeric(20 - 12),
  'heat-witness': decision('a-release'),
  'probe-samples': { kind: 'assay', inspected: ['a', 'b', 'c', 'd'], selections: ['b', 'a'] },
  'ph-exponent': numeric(10 ** (4 - 3)),
  'neutralize-tank': panel({ dose: 6 / 2 }),
  'wire-cell': { kind: 'circuit', cell: { left: 'Zn', right: 'Cu', bridge: true } },
  'redox-trace': decision('zn'),
  'meter-load': graph(6, 6 / 3, 12 / 3),
  'light-water-carbon': panel({ light: 2, water: 4 }),
  'glucose-ledger': numeric(12 / 6),
  'night-control': decision('respiration'),
  'carbon-budget': panel({ cut: 3, restore: 2 }),
  'water-budget': graph(1, 14 - 12, 10 + 4 - 2),
  'radiation-balance': graph(2, 8 - 6),
  'trait-frequency': graph(2, 6 / 10 * 100),
  'selection-evidence': decision('adapted'),
  'lineage-file': decision('marsh'),
  'final-calibration': numeric((14 - 4) / 2),
  'final-dispatch': panel({ dose: 2, pump: 2, light: 2 }),
  'final-cause': decision('first-link'),
  'final-release': decision('verify'),
};
