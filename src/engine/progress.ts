import type { Chapter, Puzzle } from '../data/types.ts';

export const storageKey = 'project-gaia.progress.v1';
const version = 1;

export type PuzzleLog = { solved: boolean; attempts: number; hints: number };
export type Progress = {
  version: number;
  puzzles: Record<string, PuzzleLog>;
  notes: Record<string, string>;
  localLocks: string[];
};

export function freshProgress(localLocks: string[] = []): Progress {
  return { version, puzzles: {}, notes: {}, localLocks };
}

export function puzzleLog(progress: Progress, id: string): PuzzleLog {
  return progress.puzzles[id] ?? { solved: false, attempts: 0, hints: 0 };
}

export function countSolved(progress: Progress, chapter: Chapter) {
  return chapter.puzzles.filter(puzzle => puzzleLog(progress, puzzle.id).solved).length;
}

export function recordAttempt(progress: Progress, puzzle: Puzzle, correct: boolean): Progress {
  const previous = puzzleLog(progress, puzzle.id);
  if (previous.solved) return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [puzzle.id]: { ...previous, attempts: previous.attempts + 1, solved: correct } } };
}

export function recordHint(progress: Progress, puzzle: Puzzle): Progress {
  const previous = puzzleLog(progress, puzzle.id);
  if (previous.hints >= puzzle.hints.length) return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [puzzle.id]: { ...previous, hints: previous.hints + 1 } } };
}

export function chapterStatus(progress: Progress, chapters: Chapter[], id: string, teacherLocks: readonly string[]) {
  const index = chapters.findIndex(chapter => chapter.id === id);
  if (index < 0) return 'unavailable';
  const locks = new Set([...teacherLocks, ...progress.localLocks]);
  if (locks.has(id)) return 'course';
  const isComplete = (chapter: Chapter) => countSolved(progress, chapter) === chapter.puzzles.length;
  if (chapters.slice(0, index).some(chapter => locks.has(chapter.id) || !isComplete(chapter))) return 'unavailable';
  if (isComplete(chapters[index])) return 'restored';
  return 'available';
}

export function currentPuzzle(progress: Progress, chapter: Chapter) {
  return chapter.puzzles.find(puzzle => !puzzleLog(progress, puzzle.id).solved) ?? chapter.puzzles.at(-1)!;
}

export function puzzleIsOpen(progress: Progress, chapter: Chapter, puzzleId: string) {
  const index = chapter.puzzles.findIndex(puzzle => puzzle.id === puzzleId);
  return index >= 0 && chapter.puzzles.slice(0, index).every(puzzle => puzzleLog(progress, puzzle.id).solved);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeCount(value: unknown, max: number) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? Math.min(value, max) : 0;
}

export function decodeProgress(raw: string | null, sections: Chapter[], validLocks: string[]): Progress {
  const clean = freshProgress();
  if (!raw) return clean;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return clean;
  }
  if (!isRecord(data) || data.version !== version) return clean;

  if (Array.isArray(data.localLocks)) clean.localLocks = validLocks.filter(id => (data.localLocks as unknown[]).includes(id));
  for (const section of sections) {
    const note = isRecord(data.notes) ? data.notes[section.id] : undefined;
    if (typeof note === 'string') clean.notes[section.id] = note.slice(0, 1200);
    for (const puzzle of section.puzzles) {
      const log = isRecord(data.puzzles) ? data.puzzles[puzzle.id] : undefined;
      if (!isRecord(log)) continue;
      clean.puzzles[puzzle.id] = {
        solved: log.solved === true,
        attempts: safeCount(log.attempts, 1_000_000),
        hints: safeCount(log.hints, puzzle.hints.length),
      };
    }
  }
  return clean;
}
