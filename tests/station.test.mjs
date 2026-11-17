import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chapters } from '../src/data/chapters.ts';
import { finale } from '../src/data/finale.ts';
import { roomData } from '../src/data/station.ts';
import { batteryAnswer, changeSocket, cycleValue, fieldTasks, freshField, readField } from '../src/data/field.ts';
import { evaluate } from '../src/engine/evaluate.ts';
import { collectCore, decodeExpedition, freshExpedition, openSectionIds, restoreSector } from '../src/engine/expedition.ts';
import { doorApproach, findPath, local, makeWalkable, sectors, segmentClear, spawn } from '../src/engine/map.ts';
import { readCell } from '../src/engine/models.ts';
import { freshProgress, recordAttempt } from '../src/engine/progress.ts';
import { solutions } from './solutions.mjs';

const sections = [...chapters, finale];
const puzzles = Object.fromEntries(sections.flatMap(section => section.puzzles).map(puzzle => [puzzle.id, puzzle]));

test('the corridor reaches each door and traversal respects room locks and walls', () => {
  const allIds = sections.map(section => section.id);
  assert.deepEqual(sectors.map(sector => sector.id), allIds);
  for (const [i, sector] of sectors.entries()) {
    const interior = local(sector, 184, 154);
    const locked = makeWalkable(allIds.slice(0, i));
    const open = makeWalkable(allIds.slice(0, i + 1));
    assert.ok(findPath(spawn, doorApproach(sector), locked), sector.id);
    assert.equal(findPath(spawn, interior, locked), null, sector.id);
    const route = findPath(spawn, interior, open);
    assert.ok(route, sector.id);
    assert.deepEqual(route.at(-1), interior);
    assert.ok(route.every((point, index) => segmentClear(route[index - 1] ?? spawn, point, open)));
  }
  const gateway = sectors[0];
  assert.equal(makeWalkable(['gateway'])(local(gateway, 48, 53)), false, 'large equipment should block movement');
  assert.equal(segmentClear({ x: 170, y: 414 }, { x: 170, y: 302 }, makeWalkable(['gateway'])), false, 'a wall cannot be cut through outside its door');
});

test('a core requires completed science checks, and the next room requires installation', () => {
  const gateway = chapters[0];
  let progress = freshProgress();
  const initial = freshExpedition();
  assert.equal(collectCore(initial, progress, gateway), initial);
  assert.equal(restoreSector(initial, gateway.id), initial);
  for (const puzzle of gateway.puzzles) progress = recordAttempt(progress, puzzle, true);
  const carrying = collectCore(initial, progress, gateway);
  assert.equal(carrying.core, gateway.id);
  assert.deepEqual(openSectionIds(sections, carrying.powered, []), ['gateway']);
  const powered = restoreSector(carrying, gateway.id);
  assert.equal(powered.core, null);
  assert.deepEqual(openSectionIds(sections, powered.powered, []), ['gateway', 'control']);
  assert.deepEqual(openSectionIds(sections, powered.powered, ['control']), ['gateway']);
  assert.deepEqual(decodeExpedition(JSON.stringify({ ...progress, expedition: carrying }), progress, sections), carrying);
});

test('existing course saves retain completed modules and partial progress without earning an unfinished core', () => {
  let progress = freshProgress();
  for (const step of chapters[0].puzzles) progress = recordAttempt(progress, step, true);
  progress = recordAttempt(progress, chapters[1].puzzles[0], true);
  const migrated = decodeExpedition(JSON.stringify(progress), progress, sections);
  assert.deepEqual(migrated.powered, ['gateway']);
  assert.deepEqual(migrated.briefed, ['gateway', 'control']);
  assert.equal(migrated.core, null);
});

test('the physical forks and dials use the same verified answers as the science bank', () => {
  for (const [id, task] of Object.entries(fieldTasks)) {
    const puzzle = puzzles[id];
    assert.ok(puzzle);
    if (task.mode === 'route') {
      assert.equal(task.choices.filter(choice => evaluate(puzzle, choice.answer).correct).length, 1);
      assert.ok(task.choices.filter(choice => !evaluate(puzzle, choice.answer).correct).every(choice => choice.consequence));
    }
    if (task.mode === 'controls') {
      for (const control of puzzle.controls) {
        assert.ok(task.presets[control.id].includes(control.initial));
        assert.ok(task.presets[control.id].includes(solutions[id].values[control.id]));
        assert.ok(task.presets[control.id].every(value => value >= control.min && value <= control.max));
      }
    }
  }
  assert.equal(cycleValue([1, 2, 3], 1), 2);
  assert.equal(cycleValue([1, 2, 3], 3), 1);
});

test('physical battery assembly supports reverse polarity and safe swaps without duplicating parts', () => {
  const puzzle = puzzles['wire-cell'];
  let field = { ...freshField(puzzle), carried: 'Cu' };
  const incompatible = changeSocket(field, 'bridge');
  assert.equal(incompatible.field, field);
  field = changeSocket(field, 'left').field;
  field = changeSocket({ ...field, carried: 'Zn' }, 'right').field;
  field = changeSocket({ ...field, carried: 'bridge' }, 'bridge').field;
  assert.equal(readCell(batteryAnswer(field).cell, puzzle.voltage), -1.1);
  field = changeSocket(field, 'left').field;
  field = changeSocket(field, 'right').field;
  field = changeSocket(field, 'left').field;
  assert.equal(evaluate(puzzle, batteryAnswer(field)).correct, true);
  const restored = readField({ ...field, carried: 'Cu' }, puzzle);
  assert.equal(restored.carried, null);
  assert.deepEqual(restored.mounted, field.mounted);
});

test('scans and valid dial positions reload, unknown object IDs and invalid settings are discarded', () => {
  const assay = puzzles['probe-samples'];
  const expedition = {
    ...freshExpedition(),
    field: { ...freshField(assay), scanned: ['b', 'x', 'd', 'd'] },
    position: { x: 42, y: 44 },
  };
  const progress = freshProgress();
  const loaded = decodeExpedition(JSON.stringify({ ...progress, expedition }), progress, sections);
  assert.deepEqual(loaded.field.scanned, ['b', 'd']);
  assert.deepEqual(loaded.position, expedition.position);
  const panel = puzzles['final-dispatch'];
  const restored = readField({ ...freshField(panel), operated: ['dose', 'different'], controls: { dose: 2, pump: 20, drift: 2 } }, panel);
  assert.deepEqual(restored.controls, { dose: 2, pump: 1, light: 1 });
  assert.deepEqual(restored.operated, ['dose']);
});

test('every room has arrival scenes, player dialogue and an explained pickup clue', () => {
  for (const chapter of sections) {
    const room = roomData[chapter.id];
    assert.ok(room.arrival.length >= 2, chapter.id);
    assert.ok(room.conversation.some(line => line.speaker === 'player'));
    assert.ok(room.record.name && room.record.text && room.record.clue);
    assert.equal(room.devices.length, chapter.puzzles.length);
  }
});

test('first entry scenes are tracked separately from previous saves and room progress', () => {
  const progress = freshProgress();
  const old = { ...progress, expedition: { ...freshExpedition(), briefed: ['gateway'] } };
  delete old.expedition.introduced;
  const loaded = decodeExpedition(JSON.stringify(old), progress, sections);
  assert.deepEqual(loaded.briefed, ['gateway']);
  assert.deepEqual(loaded.introduced, []);
  const returned = decodeExpedition(JSON.stringify({
    ...progress, expedition: { ...loaded, introduced: ['gateway', 'unknown', 'gateway'] },
  }), progress, sections);
  assert.deepEqual(returned.introduced, ['gateway']);
});
