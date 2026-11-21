import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chapters } from '../src/data/chapters.ts';
import { finale } from '../src/data/finale.ts';
import { teacherConfig } from '../src/data/settings.ts';
import { evaluate, parseNumber } from '../src/engine/evaluate.ts';
import { checkBalance, forestBudget, panelReadings, readCell } from '../src/engine/models.ts';
import { chapterStatus, countSolved, currentPuzzle, decodeProgress, freshProgress, puzzleIsOpen, puzzleLog, recordAttempt, recordHint } from '../src/engine/progress.ts';
import { solutions } from './solutions.mjs';

const sections = [...chapters, finale];
const ids = chapters.map(chapter => chapter.id);
const puzzles = sections.flatMap(chapter => chapter.puzzles);
const byId = Object.fromEntries(puzzles.map(puzzle => [puzzle.id, puzzle]));

test('eight distinct rooms and the four-part finale contain maintained curriculum objectives', () => {
  assert.equal(chapters.length, 8);
  assert.ok(chapters.every(chapter => chapter.puzzles.length === 3));
  assert.equal(finale.puzzles.length, 4);
  assert.equal(new Set(ids).size, 8);
  assert.equal(new Set(puzzles.map(puzzle => puzzle.id)).size, 28);
  assert.deepEqual(Object.keys(solutions).sort(), Object.keys(byId).sort());
  assert.ok(teacherConfig.lockedChapters.every(id => ids.includes(id)));
  for (const puzzle of puzzles) {
    assert.ok(puzzle.objective.trim(), puzzle.id);
    assert.ok(puzzle.hints.length >= 2, puzzle.id);
    assert.ok(puzzle.evidence.title && puzzle.evidence.detail && puzzle.success && puzzle.retry, puzzle.id);
    if (puzzle.kind === 'decision') assert.equal(puzzle.options.filter(option => option.correct).length, puzzle.select);
    if (puzzle.kind === 'graph') {
      assert.ok(puzzle.graph.points.some(point => point.x === puzzle.graph.answerX));
      assert.ok(puzzle.graph.points.every(({ x, y }) => puzzle.graph.xTicks.includes(x) &&
        y >= puzzle.graph.yTicks[0] && y <= puzzle.graph.yTicks.at(-1)));
    }
  }
});

for (const puzzle of puzzles) {
  test(`scientifically derived solution passes ${puzzle.id}`, () => {
    assert.deepEqual(evaluate(puzzle, solutions[puzzle.id]), { correct: true, message: puzzle.success, details: [] });
  });
}

test('numeric input handles decimal and full-width signs and rejects invalid notation and units', () => {
  assert.equal(parseNumber(' ７．２ｅ−５ '), 7.2e-5);
  assert.equal(parseNumber('−5'), -5);
  assert.equal(parseNumber('.01'), 0.01);
  for (const invalid of ['', '2V', '0x10', '1,000', 'NaN', 'Infinity', '1e309', '1 2']) {
    assert.equal(parseNumber(invalid), null, invalid);
  }
  const puzzle = byId['packet-time'];
  assert.equal(evaluate(puzzle, { kind: 'numeric', values: ['３'] }).correct, true);
  assert.equal(evaluate(puzzle, { kind: 'numeric', values: ['3.1'] }).correct, false);
  const withTolerance = { ...puzzle, fields: [{ ...puzzle.fields[0], tolerance: 0.1 }] };
  assert.equal(evaluate(withTolerance, { kind: 'numeric', values: ['3.1'] }).correct, true);
  assert.equal(evaluate(withTolerance, { kind: 'numeric', values: ['3.11'] }).correct, false);
});

test('each of the six charts requires the correct point and all numeric answers', () => {
  const graphs = puzzles.filter(puzzle => puzzle.kind === 'graph');
  assert.equal(graphs.length, 6);
  for (const puzzle of graphs) {
    const solved = solutions[puzzle.id];
    const wrongPoint = puzzle.graph.points.find(point => point.x !== solved.x);
    assert.equal(evaluate(puzzle, { ...solved, x: null }).correct, false, puzzle.id);
    assert.equal(evaluate(puzzle, { ...solved, x: wrongPoint.x }).correct, false, puzzle.id);
    assert.ok(puzzle.fields.length > 0, puzzle.id);
    assert.equal(evaluate(puzzle, { ...solved, values: solved.values.slice(0, -1) }).correct, false, puzzle.id);
    const wronglyCalculated = [...solved.values.slice(0, -1), '99'];
    assert.equal(evaluate(puzzle, { ...solved, values: wronglyCalculated }).correct, false, puzzle.id);
    assert.equal(evaluate(puzzle, solved).correct, true, puzzle.id);
  }
});

test('chemical balance checks all three atoms and rejects a doubled formula', () => {
  const puzzle = byId['balance-methane'];
  const keyed = [...puzzle.reactants, ...puzzle.products].map(item => item.coefficient);
  const { atoms } = checkBalance(puzzle.reactants, puzzle.products, keyed, puzzle.maximumCoefficient);
  assert.deepEqual(atoms, [
    { element: 'C', left: 3, right: 3 },
    { element: 'H', left: 8, right: 8 },
    { element: 'O', left: 10, right: 10 },
  ]);
  for (const coefficients of [[1, 4, 3, 4], [0, 0, 0, 0], [1, 5, 3, 1.9], [1, 11, 3, 4], [1, 5, 3]]) {
    const feedback = evaluate(puzzle, { kind: 'balance', coefficients });
    assert.equal(feedback.correct, false);
    assert.ok(feedback.details.length > 0);
  }
  const scaled = evaluate(puzzle, { kind: 'balance', coefficients: [2, 10, 6, 8] });
  assert.equal(scaled.correct, false);
  assert.match(scaled.details[0], /最大公因數/);
});

test('assay requires independently collecting four readings before classifying', () => {
  const puzzle = byId['probe-samples'];
  const response = solutions[puzzle.id];
  assert.equal(evaluate(puzzle, { ...response, inspected: ['a', 'b'] }).correct, false);
  assert.equal(evaluate(puzzle, { ...response, selections: ['b', 'c'] }).correct, false);
});

test('decision feedback names the rejected scientific inference', () => {
  const puzzle = byId['selection-evidence'];
  const wrong = evaluate(puzzle, { kind: 'decision', selected: ['thin'] });
  assert.equal(wrong.correct, false);
  assert.match(wrong.details[0], /潮濕/);
  assert.match(evaluate(puzzle, { kind: 'decision', selected: ['adapted', 'thin'] }).details[0], /1 項/);
});

test('galvanic meter models orientation, removal of salt bridge and identical electrodes', () => {
  const puzzle = byId['wire-cell'];
  const cell = solutions[puzzle.id].cell;
  const flipped = { ...cell, left: 'Cu', right: 'Zn' };
  assert.equal(readCell(cell, puzzle.voltage), 1.1);
  assert.equal(readCell(flipped, puzzle.voltage), -1.1);
  assert.equal(readCell({ ...cell, bridge: false }, puzzle.voltage), null);
  assert.equal(readCell({ ...cell, right: 'Zn' }, puzzle.voltage), 0);
  assert.match(evaluate(puzzle, { kind: 'circuit', cell: flipped }).details[0], /負值/);
});

test('simulation accounts for resources independently and honors lower or upper limits', () => {
  const neutralize = byId['neutralize-tank'];
  assert.deepEqual(panelReadings(neutralize.model, { dose: 2 }), { acidLeft: 2 });
  assert.deepEqual(panelReadings(neutralize.model, { dose: 4 }), { acidLeft: -2 });
  const greenhouse = byId['light-water-carbon'];
  assert.deepEqual(panelReadings(greenhouse.model, { light: 2, water: 2 }), { gross: 2, net: 1, power: 4, water: 2 });
  assert.equal(evaluate(greenhouse, { kind: 'panel', values: { light: 2, water: 4 } }).correct, true);
  assert.equal(evaluate(greenhouse, { kind: 'panel', values: { light: 3, water: 6 } }).correct, false);
  const carbon = byId['carbon-budget'];
  assert.deepEqual(panelReadings(carbon.model, { cut: 4, restore: 3 }), { carbon: 18, waterLeft: 0 });
  assert.equal(evaluate(carbon, { kind: 'panel', values: { cut: 4, restore: 3 } }).correct, false);
  assert.equal(evaluate(carbon, { kind: 'panel', values: { cut: 4, restore: 1 } }).correct, true);
  assert.equal(evaluate(carbon, { kind: 'panel', values: { cut: 5, restore: 0 } }).correct, false);
});

test('final dispatch has one feasible configuration across the full control space', () => {
  const puzzle = byId['final-dispatch'];
  const passing = [];
  for (let dose = 0; dose <= 3; dose++) {
    for (let pump = 0; pump <= 3; pump++) {
      for (let light = 0; light <= 3; light++) {
        const values = { dose, pump, light };
        if (evaluate(puzzle, { kind: 'panel', values }).correct) passing.push(values);
      }
    }
  }
  assert.deepEqual(passing, [{ dose: 2, pump: 2, light: 2 }]);
  assert.deepEqual(panelReadings(puzzle.model, passing[0]), { acidLeft: 0, waterLeft: 4, net: 3, energy: 6 });
});

test('progress advances in order, isolates wrong attempts and preserves completed proofs after replay', () => {
  let progress = freshProgress();
  for (const [index, chapter] of chapters.entries()) {
    assert.equal(chapterStatus(progress, chapters, chapter.id, []), 'available');
    if (index + 1 < chapters.length) assert.equal(chapterStatus(progress, chapters, chapters[index + 1].id, []), 'unavailable');
    for (const [step, puzzle] of chapter.puzzles.entries()) {
      assert.equal(currentPuzzle(progress, chapter).id, puzzle.id);
      assert.equal(puzzleIsOpen(progress, chapter, puzzle.id), true);
      if (step + 1 < chapter.puzzles.length) assert.equal(puzzleIsOpen(progress, chapter, chapter.puzzles[step + 1].id), false);
      progress = recordHint(recordHint(recordHint(progress, puzzle), puzzle), puzzle);
      assert.equal(puzzleLog(progress, puzzle.id).hints, 2);
      progress = recordAttempt(progress, puzzle, false);
      assert.equal(countSolved(progress, chapter), step);
      progress = recordAttempt(progress, puzzle, evaluate(puzzle, solutions[puzzle.id]).correct);
      assert.equal(recordAttempt(progress, puzzle, false), progress);
      assert.equal(puzzleLog(progress, puzzle.id).attempts, 2);
    }
    assert.equal(chapterStatus(progress, chapters, chapter.id, []), 'restored');
    progress = decodeProgress(JSON.stringify(progress), sections, ids);
  }
  assert.equal(chapterStatus(progress, chapters, 'evolution', ['evolution']), 'course');
  assert.equal(chapterStatus(progress, chapters, 'climate', ['gateway']), 'unavailable');
  assert.ok(chapters.every(chapter => chapterStatus(progress, chapters, chapter.id, []) === 'restored'));
  for (const puzzle of finale.puzzles) progress = recordAttempt(progress, puzzle, evaluate(puzzle, solutions[puzzle.id]).correct);
  assert.equal(countSolved(progress, finale), 4);
});

test('save restore tolerates tampering, retains valid notes and locks and leaves preferences on reset', () => {
  assert.deepEqual(decodeProgress('{broken', sections, ids), freshProgress());
  assert.deepEqual(decodeProgress('{"version":0}', sections, ids), freshProgress());
  const clean = decodeProgress(JSON.stringify({
    version: 1,
    puzzles: { 'packet-time': { solved: true, attempts: 100, hints: 88 }, 'fake': { solved: true } },
    notes: { 'gateway': '觀察', 'fake': 'ignore' },
    localLocks: ['evolution', 'fake', 'evolution'],
  }), sections, ids);
  assert.deepEqual(clean.puzzles, { 'packet-time': { solved: true, attempts: 100, hints: 2 } });
  assert.deepEqual(clean.notes, { gateway: '觀察' });
  assert.equal(chapterStatus(clean, chapters, 'evolution', []), 'course');
  assert.deepEqual(freshProgress(clean.localLocks), { version: 1, puzzles: {}, notes: {}, localLocks: ['evolution'] });
});

test('radiation extension balances fluxes and checks accumulated energy separately', () => {
  const climate = chapters.find(chapter => chapter.id === 'climate');
  const [solar, forest] = climate.optionalPuzzles.map(activity => activity.puzzle);
  assert.deepEqual(panelReadings(solar.model, { reflected: 100, infrared: 240 }), { absorbed: 240, net: 0 });
  assert.deepEqual(panelReadings(solar.model, { reflected: 100, infrared: 237 }), { absorbed: 240, net: 3 });
  assert.equal(panelReadings(solar.model, { reflected: 110, infrared: 240 }).net, -10);
  const correct = { kind: 'panel', values: { reflected: 100, infrared: 237 }, entries: ['300'] };
  assert.equal(evaluate(solar, correct).correct, true);
  assert.equal(evaluate(solar, { ...correct, entries: ['3'] }).correct, false);
  assert.equal(evaluate(solar, { ...correct, values: { reflected: 97, infrared: 240 } }).correct, false);
  assert.equal(evaluate(forest, { kind: 'decision', selected: ['stored-water', 'stomata'], observedMonths: ['normal'] }).correct, false);
});

test('forest extension compares water and carbon over the same month and saves completed evidence', () => {
  const climate = chapters.find(chapter => chapter.id === 'climate');
  const forest = climate.optionalPuzzles[1].puzzle;
  assert.deepEqual(forest.forestMonths.map(forestBudget), [{ water: 5, carbon: 0.6 }, { water: -27, carbon: -0.4 }]);
  const answer = { kind: 'decision', selected: ['stored-water', 'stomata'], observedMonths: ['normal', 'dry'] };
  assert.equal(evaluate(forest, answer).correct, true);
  assert.equal(evaluate(forest, { ...answer, selected: ['stored-water', 'less-respiration'] }).correct, false);
  const progress = recordAttempt(freshProgress(), forest, true);
  const loaded = decodeProgress(JSON.stringify(progress), sections, ids);
  assert.equal(puzzleLog(loaded, forest.id).solved, true);
  assert.equal(countSolved(loaded, climate), 0);
});
