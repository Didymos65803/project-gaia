import { readField } from '../data/field.ts';
import type { FieldState } from '../data/field.ts';
import type { Chapter } from '../data/types.ts';
import type { Point } from './map.ts';
import { countSolved } from './progress.ts';
import type { Progress } from './progress.ts';

export type Expedition = {
  introduced: string[];
  briefed: string[];
  powered: string[];
  archives: string[];
  core: string | null;
  field: FieldState | null;
  position: Point | null;
};

export function freshExpedition(): Expedition {
  return { introduced: [], briefed: [], powered: [], archives: [], core: null, field: null, position: null };
}

export function decodeExpedition(raw: string | null, progress: Progress, sections: Chapter[]): Expedition {
  let saved: Partial<Expedition> | undefined;
  try {
    saved = raw ? JSON.parse(raw)?.expedition : undefined;
  } catch {
    return freshExpedition();
  }
  const validated = freshExpedition();
  const complete = sections.filter(section => countSolved(progress, section) === section.puzzles.length).map(section => section.id);
  if (!saved || !Array.isArray(saved.powered)) {
    // Earlier releases counted solved lab work as a restored room.
    validated.powered = complete;
    validated.briefed = sections.filter(section => countSolved(progress, section) > 0).map(section => section.id);
    return validated;
  }
  const ids = sections.map(section => section.id);
  validated.introduced = ids.filter(id => Array.isArray(saved.introduced) && saved.introduced.includes(id));
  validated.briefed = ids.filter(id => Array.isArray(saved.briefed) && saved.briefed.includes(id));
  validated.powered = complete.filter(id => saved.powered?.includes(id));
  validated.archives = ids.filter(id => Array.isArray(saved.archives) && saved.archives.includes(id));
  validated.core = typeof saved.core === 'string' && complete.includes(saved.core) && !validated.powered.includes(saved.core) ? saved.core : null;
  const activePuzzle = sections.flatMap(section => section.puzzles).find(puzzle => saved.field?.puzzleId === puzzle.id && !progress.puzzles[puzzle.id]?.solved);
  if (activePuzzle) validated.field = readField(saved.field, activePuzzle);
  const position = saved.position;
  if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) validated.position = position;
  return validated;
}

export function openSectionIds(sections: Chapter[], powered: readonly string[], locks: readonly string[]) {
  const open: string[] = [];
  for (const section of sections) {
    if (locks.includes(section.id)) break;
    open.push(section.id);
    if (!powered.includes(section.id)) break;
  }
  return open;
}

export function collectCore(world: Expedition, progress: Progress, chapter: Chapter): Expedition {
  if (world.core || world.powered.includes(chapter.id) || countSolved(progress, chapter) !== chapter.puzzles.length) return world;
  return { ...world, core: chapter.id };
}

export function restoreSector(world: Expedition, chapterId: string): Expedition {
  if (world.core !== chapterId || world.powered.includes(chapterId)) return world;
  return { ...world, core: null, powered: [...world.powered, chapterId] };
}
