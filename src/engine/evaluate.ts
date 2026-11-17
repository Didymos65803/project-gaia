import type { Answer, Feedback, Metric, NumberField, Puzzle } from '../data/types.ts';
import { checkBalance, panelReadings, readCell } from './models.ts';

export function parseNumber(input: string): number | null {
  const normalized = input.normalize('NFKC').replace(/[−–]/g, '-').trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function checkFields(fields: NumberField[], values: string[]): string[] {
  return fields.flatMap((field, index) => {
    const value = parseNumber(values[index] ?? '');
    if (value === null) return [`${field.label}：請輸入數字，單位已列在欄位旁。`];
    const difference = Math.abs(value - field.answer);
    const allowance = (field.tolerance ?? 0) + Number.EPSILON * Math.max(1, Math.abs(field.answer)) * 8;
    if (difference <= allowance) return [];
    return [`${field.label}：${field.retry ?? '請重新檢查這項讀值。'}`];
  });
}

export function meetsTarget(metric: Metric, reading: number) {
  return Number.isFinite(reading) &&
    (metric.min === undefined || reading >= metric.min) &&
    (metric.max === undefined || reading <= metric.max);
}

export function evaluate(puzzle: Puzzle, answer: Answer): Feedback {
  const fail = (details: string[]): Feedback => ({ correct: false, message: puzzle.retry, details });
  const finish = (details: string[]): Feedback => details.length
    ? fail(details)
    : { correct: true, message: puzzle.success, details: [] };

  switch (puzzle.kind) {
    case 'numeric':
      if (answer.kind === 'numeric') return finish(checkFields(puzzle.fields, answer.values));
      break;
    case 'graph':
      if (answer.kind === 'graph') {
        const details = checkFields(puzzle.fields, answer.values);
        if (answer.x !== puzzle.graph.answerX) {
          if (answer.x === null) details.unshift('先點圖上的一個圓點，或在資料表選一列。');
          return fail(details);
        }
        return finish(details);
      }
      break;
    case 'balance':
      if (answer.kind === 'balance') {
        const balance = checkBalance(puzzle.reactants, puzzle.products, answer.coefficients, puzzle.maximumCoefficient);
        if (!balance.valid) return fail([`每個數字要從 1 到 ${puzzle.maximumCoefficient ?? 12} 選。`]);
        if (!balance.balanced) return fail(balance.atoms
          .filter(atom => atom.left !== atom.right)
          .map(atom => `${atom.element}：左側有 ${atom.left} 個，右側有 ${atom.right} 個。`));
        return finish(balance.reduced ? [] : ['原子數已平衡。將所有係數同時除以它們的最大公因數。']);
      }
      break;
    case 'decision':
      if (answer.kind === 'decision') {
        const selected = new Set(answer.selected);
        const choices = puzzle.options.filter(option => selected.has(option.id));
        if (selected.size !== puzzle.select || choices.length !== puzzle.select) {
          return fail([`請選擇 ${puzzle.select} 項後再送出。`]);
        }
        return finish(choices.filter(option => !option.correct).map(option => option.consequence));
      }
      break;
    case 'assay':
      if (answer.kind === 'assay') {
        if (!puzzle.samples.every(sample => answer.inspected.includes(sample.id))) {
          return fail(['請先把所有樣本送入探針，收集完整的量測紀錄。']);
        }
        return finish(puzzle.targets.flatMap((target, index) => target.sample === answer.selections[index]
          ? []
          : [`${target.label}：重新核對該瓶的 pH 和導電度。`]));
      }
      break;
    case 'circuit':
      if (answer.kind === 'circuit') {
        const { left, right, bridge } = answer.cell;
        const details: string[] = [];
        if (!left || !right) details.push('左右兩側都要裝入電極。');
        else if (left === right) details.push('同種金屬半電池在題設的相同條件下沒有電位差。');
        else if (left !== puzzle.leftElectrode || right !== puzzle.rightElectrode ||
          (bridge && readCell(answer.cell, puzzle.voltage) !== puzzle.voltage)) {
          details.push('紅端接到鋅時電表會讀負值。固定引線的位置，重新安排電極。');
        }
        if (!bridge) details.push('鹽橋未接通。負載下需要離子移動來維持電荷平衡。');
        return finish(details);
      }
      break;
    case 'panel':
      if (answer.kind === 'panel') {
        for (const { id, label, min, max, step } of puzzle.controls) {
          const value = answer.values[id];
          if (!Number.isFinite(value) || value < min || value > max ||
            Math.abs((value - min) / step - Math.round((value - min) / step)) > 1e-8) {
            return fail([`${label}的設定超過儀器可用的範圍。`]);
          }
        }
        const readings = panelReadings(puzzle.model, answer.values);
        return finish(puzzle.metrics.filter(metric => !meetsTarget(metric, readings[metric.id])).map(metric => metric.retry));
      }
      break;
  }
  return fail(['這份資料和儀器類型不符，請重新操作。']);
}
