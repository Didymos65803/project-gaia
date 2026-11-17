import type { CellAnswer, PanelModel, Species } from '../data/types.ts';

export function atomCounts(species: Species[], coefficients: number[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const [index, item] of species.entries()) {
    for (const [element, count] of Object.entries(item.atoms)) {
      totals[element] = (totals[element] ?? 0) + count * (coefficients[index] ?? 0);
    }
  }
  return totals;
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function checkBalance(reactants: Species[], products: Species[], values: number[]) {
  const left = atomCounts(reactants, values.slice(0, reactants.length));
  const right = atomCounts(products, values.slice(reactants.length));
  const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])];
  const valid = values.length === reactants.length + products.length &&
    values.every(value => Number.isInteger(value) && value >= 1 && value <= 12);
  return {
    valid,
    balanced: valid && elements.every(element => (left[element] ?? 0) === (right[element] ?? 0)),
    reduced: valid && values.reduce(gcd) === 1,
    atoms: elements.map(element => ({ element, left: left[element] ?? 0, right: right[element] ?? 0 })),
  };
}

export function readCell({ left, right, bridge }: CellAnswer, voltage: number): number | null {
  if (!bridge || (left !== 'Zn' && left !== 'Cu') || (right !== 'Zn' && right !== 'Cu')) {
    return null;
  }
  if (left === right) return 0;
  return left === 'Zn' ? voltage : -voltage;
}

export function panelReadings(model: PanelModel, settings: Record<string, number>): Record<string, number> {
  switch (model.kind) {
    case 'neutralize':
      return { acidLeft: model.acid - settings.dose * model.basePerDose };
    case 'greenhouse': {
      const gross = Math.min(
        settings.light * model.lightFactor,
        settings.water * model.waterFactor,
        settings.carbon * model.carbonFactor,
      );
      return { gross, net: gross - model.respiration, power: settings.light * model.lampCost, water: settings.water };
    }
    case 'carbon':
      return {
        carbon: model.initial + model.emissions - settings.cut - model.existingUptake - settings.restore,
        waterLeft: model.waterSupply - settings.restore * model.waterPerUptake,
      };
    case 'restart': {
      const waterUsed = settings.pump * model.waterPerBatch;
      const gross = Math.min(settings.light * model.lampFactor, settings.pump * model.waterFactor);
      return {
        acidLeft: model.acid - settings.dose * model.basePerBatch,
        waterLeft: model.waterStock - waterUsed,
        net: gross - model.respiration,
        energy: settings.dose * model.energyPerDose + settings.pump * model.energyPerPump + settings.light * model.energyPerLamp,
      };
    }
  }
}
