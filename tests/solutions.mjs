const numeric = (...values) => ({ kind: 'numeric', values: values.map(String) });
const graph = (x, ...values) => ({ kind: 'graph', x, values: values.map(String) });
const decision = (...selected) => ({ kind: 'decision', selected });
const panel = values => ({ kind: 'panel', values });

export const solutions = {
  'packet-time': numeric(7.2, -5, 72),
  'archive-fanout': numeric(2 ** 3 * 3 ** 2, 6),
  'archive-block': numeric(2, 2, 1, 36),
  'calibration-line': graph(6, 4, 2, (18 - 4) / 2),
  'noise-decay': graph(4, 100 * 0.5 ** 4, 96 * 0.5 ** 6),
  'solve-flow': numeric(30 - 18, 18 - (30 - 18)),
  'balance-methane': { kind: 'balance', coefficients: [1, 2, 1, 2] },
  'sealed-mass': numeric(12 + 32, 40 - 32, 12 + 40),
  'heat-witness': decision('a-release', 'b-absorb'),
  'probe-samples': { kind: 'assay', inspected: ['a', 'b', 'c', 'd'], selections: ['b', 'd', 'a', 'c'] },
  'ph-exponent': numeric(1e-3 * 1000, 1e-5 * 1000, 1e-3 / 1e-5),
  'neutralize-tank': panel({ dose: 18 / 3 }),
  'wire-cell': { kind: 'circuit', cell: { left: 'Zn', right: 'Cu', bridge: true } },
  'redox-trace': decision('zn', 'cu'),
  'meter-load': numeric(1.1 * 2, 2.2 / 110 * 1000, 2.2 * 20),
  'light-water-carbon': panel({ light: 5, water: 10, carbon: 4 }),
  'glucose-ledger': numeric(15 - 3, 15 / 6, (15 - 3) / 6),
  'night-control': decision('respiration', 'dark-control'),
  'carbon-budget': panel({ cut: 12, restore: 3 }),
  'water-budget': numeric(120 + 36 - 14 - 18, 36 - 14 - 18, 14 / 2),
  'radiation-balance': graph(3, 340 - 100 - 228, 340 - 228),
  'trait-frequency': graph(3, 60 - 10, 60 / 10),
  'selection-evidence': decision('heritability', 'adapted'),
  'lineage-file': decision('marsh'),
  'final-calibration': numeric((28 - 4) / 2, 15 - (28 - 4) / 2, 2 * 15 + 4),
  'final-dispatch': panel({ dose: 4, pump: 4, light: 5 }),
  'final-cause': decision('first-link', 'last-link'),
  'final-release': decision('verify'),
};
