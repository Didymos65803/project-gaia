import type { Chapter, Puzzle } from '../../data/types';
import type { FieldState, FieldTask, Part, Socket } from '../../data/field';
import { parts, slots, timingDials } from '../../data/field';
import { roomData } from '../../data/station';
import type { Expedition } from '../../engine/expedition';
import { doorApproach, local } from '../../engine/map';
import type { Point, Sector } from '../../engine/map';
import { countSolved, currentPuzzle } from '../../engine/progress';
import type { Progress } from '../../engine/progress';

type Interaction =
  | { type: 'brief' | 'read' | 'collect' | 'restore' | 'blocked' | 'report' }
  | { type: 'bench'; puzzle: Puzzle }
  | { type: 'route' | 'observe'; option: number }
  | { type: 'control'; key: string }
  | { type: 'part'; part: Part }
  | { type: 'socket'; socket: Socket }
  | { type: 'submit' };

export type Target = {
  id: string;
  areaId: string;
  label: string;
  action: string;
  point: Point;
  approach: Point;
  icon: 'crew' | 'robot' | 'terminal' | 'record' | 'core' | 'relay' | 'lock' | 'valve' | 'sample' | 'part' | 'socket' | 'report';
  interaction: Interaction;
};

export function createTargets(
  sector: Sector,
  chapter: Chapter,
  progress: Progress,
  expedition: Expedition,
  open: boolean,
  task: FieldTask | undefined,
  field: FieldState | undefined,
): { targets: Target[]; preferred?: string } {
  const info = roomData[chapter.id];
  const targets: Target[] = [];
  const id = (key: string) => `${chapter.id}-${key}`;
  function add(key: string, label: string, action: string, point: Point, icon: Target['icon'], interaction: Interaction, near?: Point) {
    targets.push({ id: id(key), areaId: chapter.id, label, action, point, icon, interaction, approach: near ?? { x: point.x, y: point.y + 23 } });
  }
  const place = (x: number, y: number) => local(sector, x, y);
  if (!open) {
    const point = doorApproach(sector);
    add('door', info.name, '查看門禁', point, 'lock', { type: 'blocked' }, point);
    return { targets };
  }
  const solved = countSolved(progress, chapter);
  const briefed = expedition.briefed.includes(chapter.id);
  add('brief', chapter.character.name, '交談', place(67, 192), chapter.character.initials === 'G' ? 'robot' : 'crew', { type: 'brief' });
  if (!expedition.archives.includes(chapter.id)) add('archive', '失聯錄音', '拾取紀錄', place(40, 98), 'record', { type: 'read' });

  if (expedition.powered.includes(chapter.id)) {
    for (const [index, puzzle] of chapter.puzzles.entries()) {
      add(puzzle.id, info.devices[index], '回顧設備', place(115 + index * 65, 113), 'terminal', { type: 'bench', puzzle });
    }
    if (chapter.id === 'finale') {
      add('report', '中央事件檔案', '查看結案報告', place(258, 200), 'report', { type: 'report' });
      return { targets, preferred: id('report') };
    }
    return { targets };
  }
  if (!briefed) return { targets, preferred: id('brief') };
  if (solved === chapter.puzzles.length) {
    if (expedition.core === chapter.id) {
      add('relay', '區域電源插座', '裝上電源核心', place(287, 207), 'relay', { type: 'restore' });
      return { targets, preferred: id('relay') };
    }
    add('core', '電源核心', '拾取核心', place(156, 111), 'core', { type: 'collect' });
    return { targets, preferred: id('core') };
  }

  const puzzle = currentPuzzle(progress, chapter);
  const index = chapter.puzzles.indexOf(puzzle);
  const device = info.devices[index];
  const bench: Interaction = { type: 'bench', puzzle };
  if (!task || !field) {
    const spots = [[139, 105], [241, 99], [263, 160], [161, 173]];
    const [x, y] = spots[index];
    add('bench', device, '操作設備', place(x, y), 'terminal', bench);
    return { targets, preferred: id('bench') };
  }

  if (task.mode === 'route') {
    task.choices.forEach((choice, i) => add(`route-${i}`, choice.label, '啟動分流', place(96 + 99 * i, 130), 'valve', { type: 'route', option: i }));
  }
  if (task.mode === 'timing') {
    timingDials.forEach((dial, i) => add(dial.id, `${dial.label} · ${field.controls[dial.id]}${dial.id === 'micros' ? ' μs' : ''}`, '切換讀值',
      place(98 + 96 * i, 122), 'valve', { type: 'control', key: dial.id }));
  }
  if (task.mode === 'heat') {
    ['A', 'B'].forEach((tank, i) => {
      const setting = field.controls[tank];
      add(tank, `${tank} 槽 · ${setting === 1 ? '放熱' : setting === -1 ? '吸熱' : '未判讀'}`, '切換熱流', place(119 + 129 * i, 122), 'valve', { type: 'control', key: tank });
    });
  }
  if (task.mode === 'samples' && puzzle.kind === 'assay') {
    puzzle.samples.forEach((sample, i) => add(`sample-${i}`, sample.label, field.scanned.includes(sample.id) ? '重讀樣本' : '量測樣本',
      place(83 + 71 * i, 126), 'sample', { type: 'observe', option: i }));
  }
  if (task.mode === 'survey') {
    task.readings.forEach((study, i) => add(`sample-${i}`, study.label, '查閱證據', place(97 + 98 * i, 119), 'sample', { type: 'observe', option: i }));
  }
  if (task.mode === 'controls' && puzzle.kind === 'panel') {
    puzzle.controls.forEach((control, i) => add(control.id, `${control.label} · ${field.controls[control.id]} ${control.unit}`, '調整一段',
      place(98 + 96 * i, 122), 'valve', { type: 'control', key: control.id }));
  }
  if (task.mode === 'battery') {
    (Object.keys(parts) as Part[]).forEach((part, i) => {
      const present = field.carried !== part && !Object.values(field.mounted).includes(part);
      if (present || field.carried === part) add(`part-${part}`, parts[part], present ? '拿取零件' : '放回零件',
        place(111 + 84 * i, 89), 'part', { type: 'part', part });
    });
    (Object.keys(slots) as Socket[]).forEach((socket, i) => {
      const part = field.mounted[socket];
      add(`socket-${socket}`, part ? `${slots[socket]} · ${parts[part]}` : slots[socket], '裝卸零件',
        place(111 + 84 * i, 148), 'socket', { type: 'socket', socket });
    });
  }

  if (task.mode !== 'route') {
    const inWorld = task.mode !== 'samples' && task.mode !== 'survey';
    add('bench', device, inWorld ? '驗收設定' : '回報證據', place(259, 207), 'terminal', inWorld ? { type: 'submit' } : bench);
  }
  const collectionCount = task.mode === 'survey' ? task.readings.length : task.mode === 'samples' && puzzle.kind === 'assay' ? puzzle.samples.length : 0;
  const firstUnread = collectionCount > 0 ? targets.find(target => target.interaction.type === 'observe' &&
    !field.scanned.includes(puzzle.kind === 'assay' ? puzzle.samples[target.interaction.option].id : String(target.interaction.option))) : undefined;
  const untried = targets.find(target => target.interaction.type === 'control' && !field.operated.includes(target.interaction.key));
  const loosePart = task.mode === 'battery' && !field.carried
    ? targets.find(target => target.interaction.type === 'part') : undefined;
  return { targets, preferred: firstUnread?.id ?? untried?.id ?? loosePart?.id ?? (task.mode === 'route' ? undefined : id('bench')) };
}
