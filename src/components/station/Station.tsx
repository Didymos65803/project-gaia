import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { batteryAnswer, changeSocket, controlSpec, cycleValue, fieldTasks, freshField, partClues, parts } from '../../data/field';
import type { FieldState } from '../../data/field';
import { roomData } from '../../data/station';
import type { Answer, Chapter, Feedback, Puzzle } from '../../data/types';
import { evaluate, meetsTarget } from '../../engine/evaluate';
import { collectCore, restoreSector } from '../../engine/expedition';
import type { Expedition } from '../../engine/expedition';
import { distance, door, doorApproach, makeWalkable, sectorAt, sectors, spawn } from '../../engine/map';
import type { Point } from '../../engine/map';
import { panelReadings } from '../../engine/models';
import { countSolved, currentPuzzle, puzzleLog } from '../../engine/progress';
import type { Progress } from '../../engine/progress';
import { WindowDialog } from '../Dialogs';
import { Icon } from '../Icon';
import { LabBench } from '../LabBench';
import { ExpeditionPanel, Minimap } from './ExpeditionPanel';
import type { FieldMessage } from './ExpeditionPanel';
import { DeviceArt, StationArt, Suit } from './StationArt';
import { storyIntroduction, StoryDialog } from './StoryDialog';
import type { StoryScene } from './StoryDialog';
import { createTargets } from './targets';
import type { Target } from './targets';
import { useWalker } from './useWalker';

type Popup = { kind: 'story'; scene: StoryScene } | { kind: 'bench'; puzzle: Puzzle; device: string; scanned?: string[] };
type StationProps = {
  sections: Chapter[];
  progress: Progress;
  expedition: Expedition;
  open: string[];
  locks: readonly string[];
  externalPause: boolean;
  onAttempt: (puzzle: Puzzle, correct: boolean) => void;
  onHint: (puzzle: Puzzle) => void;
  onExpedition: (update: (previous: Expedition) => Expedition) => void;
  onReport: () => void;
};

const interactionRange = 49;
const positionStyle = ({ x, y }: Point) => ({ '--x': `${x}px`, '--y': `${y}px` }) as CSSProperties;

export function Station({ sections, progress, expedition, open, locks, externalPause, onAttempt, onHint, onExpedition, onReport }: StationProps) {
  const walkable = useMemo(() => makeWalkable(open), [open]);
  const [start] = useState(() => {
    if (expedition.position && walkable(expedition.position)) return expedition.position;
    if (!expedition.position && expedition.powered.length) {
      const checkpoint = sectors.find(sector => open.includes(sector.id) && !expedition.powered.includes(sector.id));
      if (checkpoint) return doorApproach(checkpoint);
    }
    return spawn;
  });
  const [popup, setPopup] = useState<Popup | null>(null);
  const [message, setMessage] = useState<FieldMessage | null>(null);
  const draft = expedition.field;
  function setDraft(next: FieldState) {
    onExpedition(previous => ({ ...previous, field: next }));
  }

  const active = sections.find(chapter => open.includes(chapter.id) && !expedition.powered.includes(chapter.id));
  const activePuzzle = active && countSolved(progress, active) < active.puzzles.length ? currentPuzzle(progress, active) : undefined;
  const task = activePuzzle ? fieldTasks[activePuzzle.id] : undefined;
  const field = activePuzzle && task ? (draft?.puzzleId === activePuzzle.id ? draft : freshField(activePuzzle)) : undefined;
  const isBriefed = Boolean(active && expedition.briefed.includes(active.id));
  const arriving = active && !expedition.introduced.includes(active.id);
  const availableField = isBriefed && !arriving && task && field;
  const targetGroups = sectors.map((sector, index) => createTargets(sector, sections[index], progress, expedition, open.includes(sector.id),
    sector.id === active?.id ? task : undefined, sector.id === active?.id ? field : undefined));
  const targets = targetGroups.flatMap(group => group.targets);
  const preferredId = targetGroups[active ? sections.indexOf(active) : sections.length - 1]?.preferred;
  const entrance = arriving ? sectors.find(sector => sector.id === active.id) : undefined;
  const gate = entrance ? door(entrance) : undefined;
  const guide = entrance && gate
    ? { label: roomData[entrance.id].name, approach: { x: gate.x, y: gate.y + (entrance.northDoor ? 27 : -27) } }
    : targets.find(target => target.id === preferredId);
  const paused = externalPause || Boolean(popup);

  function near(point: Point) {
    let found: Target | undefined;
    let nearest = interactionRange;
    for (const target of targets) {
      const gap = distance(target.point, point);
      if (gap <= nearest && (target.interaction.type !== 'blocked' || gap <= 32)) {
        found = target;
        nearest = gap;
      }
    }
    return found;
  }

  function show(title: string, detail: string, tone: FieldMessage['tone'] = 'info') {
    setMessage({ title, detail, tone });
  }

  function tell(scene: StoryScene) {
    setMessage(null);
    setPopup({ kind: 'story', scene });
  }

  function finishWorldPuzzle(puzzle: Puzzle, result: Feedback, consequence?: string) {
    onAttempt(puzzle, result.correct);
    show(result.correct ? '設備驗收通過！' : '現場測試有異常', consequence ?? [result.message, ...result.details].join(' '), result.correct ? 'pass' : 'retry');
  }

  function evaluateWorld(puzzle: Puzzle, answer: Answer, consequence?: string) {
    const result = evaluate(puzzle, answer);
    finishWorldPuzzle(puzzle, result, result.correct ? undefined : consequence);
  }

  function interact(target: Target) {
    if (paused) return;
    const chapter = sections.find(section => section.id === target.areaId);
    if (!chapter) return;
    const action = target.interaction;
    switch (action.type) {
      case 'blocked':
        show(locks.includes(chapter.id) ? '課程鎖定' : '艙門未通電',
          locks.includes(chapter.id) ? '這一區會在課程開放後才能進入。' : '先修好前一區並裝回電源核心，走廊會打開這扇門。', 'retry');
        return;
      case 'brief':
        tell({
          chapter, title: `與 ${chapter.character.name} 交談`, icon: 'radio',
          lines: [...roomData[chapter.id].conversation, { speaker: 'npc', text: chapter.briefing }],
          finishLabel: '開始調查', after: 'brief',
        });
        return;
      case 'read': {
        const record = roomData[chapter.id].record;
        onExpedition(previous => previous.archives.includes(chapter.id) ? previous : { ...previous, archives: [...previous.archives, chapter.id] });
        tell({
          chapter, title: `找到${record.name}`, icon: 'notebook',
          lines: [{ speaker: 'record', text: record.text }, { speaker: 'npc', text: record.clue }],
          finishLabel: '收進科學筆記',
        });
        return;
      }
      case 'collect':
        onExpedition(previous => collectCore(previous, progress, chapter));
        tell({
          chapter, title: '拾起電源核心', icon: 'bolt',
          lines: [
            { speaker: 'player', text: '這顆核心還亮著！把它裝上之後，整座站都會有電嗎？' },
            { speaker: 'npc', text: `它先讓${roomData[chapter.id].name}的設備自己供電。往右下方找發亮的電源插座，靠近按 E。` },
          ],
          finishLabel: '帶核心去插座',
        });
        return;
      case 'restore': {
        onExpedition(previous => restoreSector(previous, chapter.id));
        const next = roomData[chapter.id].departure;
        tell({
          chapter, title: '區域通電！', icon: 'bolt',
          lines: [{ speaker: 'npc', text: chapter.resolution }, ...(next ? [{ speaker: 'narrator' as const, text: next }] : [])],
          finishLabel: chapter.id === 'finale' ? '查看結案報告' : '返回研究站',
          after: chapter.id === 'finale' ? 'report' : undefined,
        });
        return;
      }
      case 'report':
        onReport();
        return;
      case 'bench': {
        const working = activePuzzle?.id === action.puzzle.id;
        if (working && task?.mode === 'samples' && action.puzzle.kind === 'assay' && field?.scanned.length !== action.puzzle.samples.length) {
          show('還缺水樣', '先拿探針量完四瓶，再來做分類。', 'retry');
          return;
        }
        if (working && task?.mode === 'survey' && field?.scanned.length !== task.readings.length) {
          show('還缺對照證據', '找到乾燥、潮濕與家系三份紀錄，再回來提交。', 'retry');
          return;
        }
        setMessage(null);
        setPopup({ kind: 'bench', device: target.label, puzzle: action.puzzle, scanned: working && task?.mode === 'samples' ? field?.scanned : undefined });
        return;
      }
    }

    if (!availableField || !field || !task || !activePuzzle || chapter !== active) return;
    switch (action.type) {
      case 'route': {
        if (task.mode !== 'route') return;
        const choice = task.choices[action.option];
        evaluateWorld(activePuzzle, choice.answer, choice.consequence);
        return;
      }
      case 'observe':
        if (task.mode === 'samples' && activePuzzle.kind === 'assay') {
          const sample = activePuzzle.samples[action.option];
          if (!field.scanned.includes(sample.id)) setDraft({ ...field, scanned: [...field.scanned, sample.id] });
          const reading = sample.ph < 7 ? '這個數字比 7 小，這瓶偏酸。' : sample.ph > 7 ? '這個數字比 7 大，這瓶偏鹼。' : 'pH 7 是中性。它會不會導電，要再看另一個讀值。';
          show(`${sample.label} 探針讀值`, `pH ${sample.ph.toFixed(1)}。${reading} 導電度是 ${sample.conductivity} mS/cm，已記在面板。`);
        }
        if (task.mode === 'survey') {
          const id = String(action.option);
          const reading = task.readings[action.option];
          if (!field.scanned.includes(id)) setDraft({ ...field, scanned: [...field.scanned, id] });
          tell({
            chapter, title: reading.label, icon: 'notebook',
            lines: [{ speaker: 'record', text: reading.result }, { speaker: 'npc', text: reading.clue }],
            finishLabel: '記下這份資料',
          });
        }
        return;
      case 'control': {
        const key = action.key;
        const operated = [...new Set([...field.operated, key])];
        if (task.mode === 'controls' && activePuzzle.kind === 'panel') {
          const control = controlSpec(activePuzzle, key);
          if (!control) return;
          const value = cycleValue(task.presets[key], field.controls[key]);
          setDraft({ ...field, operated, controls: { ...field.controls, [key]: value } });
          show(control.label, `已調到 ${value} ${control.unit}。看現場面板的即時讀值。`);
        }
        return;
      }
      case 'part':
        if (field.carried && field.carried !== action.part) {
          show('手上已有零件', '裝到插槽，或走回對應備料櫃放下。', 'retry');
          return;
        }
        setDraft({ ...field, carried: field.carried ? null : action.part });
        show(field.carried ? '已放回零件' : `拿起${parts[action.part]}`,
          field.carried ? '可以再到另一個備料櫃拿取。' : partClues[action.part]);
        return;
      case 'socket': {
        const update = changeSocket(field, action.socket);
        setDraft(update.field);
        show(target.label, update.message, update.field === field ? 'retry' : 'info');
        return;
      }
      case 'submit':
        if (task.mode === 'controls') evaluateWorld(activePuzzle, { kind: 'panel', values: field.controls });
        if (task.mode === 'battery') evaluateWorld(activePuzzle, batteryAnswer(field));
        return;
    }
  }

  function useNearby(point: Point) {
    const target = near(point);
    if (target) interact(target);
    else show('這裡沒有可互動物件', '走近設備、研究員或發光的物件，再按 E。');
  }

  const walker = useWalker({
    start, walkable, paused,
    onSettle: position => onExpedition(previous => ({ ...previous, position })),
    onInteract: useNearby,
  });
  const closeTarget = near(walker.location);
  const here = sectorAt(walker.location);
  const localChapter = here ? sections.find(chapter => chapter.id === here.id) : undefined;

  useEffect(() => {
    if (paused || !localChapter || !open.includes(localChapter.id) || expedition.introduced.includes(localChapter.id)) return;
    onExpedition(previous => previous.introduced.includes(localChapter.id) ? previous : {
      ...previous, introduced: [...previous.introduced, localChapter.id],
    });
    setMessage(null);
    setPopup({ kind: 'story', scene: storyIntroduction(localChapter) });
  }, [paused, localChapter, open, expedition.introduced, onExpedition]);

  const locationName = here ? roomData[here.id].name : '中央走廊';
  const areaToList = here && open.includes(here.id) ? here.id : active?.id;
  const listedTargets = targets.filter(target => target.areaId === areaToList && target.interaction.type !== 'blocked');
  const fromRoom = active ? `走向 ${roomData[active.id].name}` : '探索研究站';
  const objective = active
    ? arriving
      ? `走進${roomData[active.id].name}`
      : !isBriefed
        ? `找到 ${active.character.name}`
        : activePuzzle?.title ?? (expedition.core === active.id ? '裝回電源核心' : '拾取區域電源核心')
    : open.includes('finale') ? '查看事故結案報告' : '等待課程開放';
  const done = sections.slice(0, -1).filter(chapter => expedition.powered.includes(chapter.id)).length;
  const readings = active?.id === 'greenhouse' && activePuzzle?.kind === 'panel' && field
    ? panelReadings(activePuzzle.model, field.controls) : null;
  const greenhouse = readings && activePuzzle?.kind === 'panel' &&
    activePuzzle.metrics.every(metric => meetsTarget(metric, readings[metric.id]));
  const navigationTip = !here ? fromRoom : guide ? '跟著黃色驚嘆號找下一個目標。'
    : task?.mode === 'route' ? '走到對應的分流口就能測試。' : '可回到已通電的設備重新演練。';

  function walkTo(target: Pick<Target, 'label' | 'approach'>) {
    if (paused) return;
    walker.viewport.current?.focus({ preventScroll: true });
    if (!walker.travel(target.approach)) show('找不到路徑', '走到走廊或最近一扇門後再試。', 'retry');
  }

  function pickTarget(event: MouseEvent, target: Target) {
    event.stopPropagation();
    if (distance(walker.point.current, target.point) <= interactionRange) interact(target);
    else walkTo(target);
  }

  function tapFloor(event: MouseEvent<HTMLDivElement>) {
    if (paused) return;
    walker.viewport.current?.focus({ preventScroll: true });
    const rect = walker.world.current?.getBoundingClientRect();
    if (rect) walker.travel({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  function acceptBrief(chapter: Chapter) {
    onExpedition(previous => previous.briefed.includes(chapter.id) ? previous : { ...previous, briefed: [...previous.briefed, chapter.id] });
    show(chapter.character.name, `已取得 ${roomData[chapter.id].name} 的行動指令。`, 'pass');
  }

  return (
    <div className="expedition">
      <header className="expedition-header">
        <div><h1 id="page-heading" tabIndex={-1}>地球系統危機</h1><p>接住求救訊號，找出是誰關掉了整座研究站。</p></div>
        <div className="station-score">
          <span title="已接通的研究區"><Icon name="bolt" size={19}/><strong>{done}<small>/8</small></strong> <span>通電</span></span>
          <span title="已尋獲的線索"><Icon name="radio" size={19}/><strong>{expedition.archives.length}<small>/9</small></strong> <span>線索</span></span>
        </div>
      </header>
      <div className="expedition-layout">
        <section className="game-column" aria-label="2D 探索地圖">
          <div className="stage-wrap">
            <div className="station-viewport" ref={walker.viewport} tabIndex={0}
              aria-label="研究站地圖。用 WASD 或方向鍵移動，按 E 互動。也可點選地面走過去。" onClick={tapFloor}>
              <div className="station-world" ref={walker.world}>
                <StationArt open={open} powered={expedition.powered} locks={locks} current={active?.id} ready={Boolean(greenhouse)}/>
                {walker.waypoint && <span aria-hidden="true" className="station-waypoint" style={positionStyle(walker.waypoint)}/>}
                {targets.map(target => (
                  <button key={target.id} type="button" tabIndex={-1}
                    className={`world-target target-${target.icon} ${target.id === preferredId ? 'objective-target' : ''} ${target.id === closeTarget?.id ? 'within-reach' : ''}`}
                    style={positionStyle(target.point)}
                    aria-label={`${target.action}：${target.label}`}
                    data-target-id={target.id}
                    onClick={event => pickTarget(event, target)}>
                    {target.id === preferredId && <span className="target-flag" aria-hidden="true">!</span>}
                    <span className="object-graphic">
                      {target.icon === 'crew' || target.icon === 'robot' ? <Suit variant={target.icon}/> : <DeviceArt icon={target.icon}/>}
                    </span>
                    <span className="target-name">{target.label}</span>
                  </button>
                ))}
                <div className="player-token" ref={walker.avatar} aria-hidden="true" data-testid="researcher" style={positionStyle(start)}>
                  <div className="player-body">
                    <span className="player-name">{expedition.core ? '◆　你' : '你'}</span><Suit variant="player"/>
                  </div>
                </div>
              </div>
            </div>
            <div className="stage-hud"><i/>{locationName}</div>
            {expedition.core
              ? <div className="stage-core"><Icon name="bolt" size={16}/>已攜帶電源核心</div>
              : (!isBriefed || arriving) && active && <div className="stage-core stage-objective">!　{objective}</div>}
            {message && <div className={`stage-message ${message.tone}`} aria-hidden="true"><strong>{message.title}</strong><span>{message.detail}</span></div>}
            <div className="touch-pad" aria-label="觸控方向鍵">
              {(['up', 'left', 'down', 'right'] as const).map(direction => (
                <button key={direction} type="button" className={`pad-${direction}`} aria-label={{ up: '向上移動', left: '向左移動', down: '向下移動', right: '向右移動' }[direction]}
                  onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); walker.pad(direction, true); }}
                  onPointerUp={() => walker.pad(direction, false)} onPointerCancel={() => walker.pad(direction, false)}
                  onLostPointerCapture={() => walker.pad(direction, false)}
                  onClick={event => { if (event.detail === 0) walker.nudge(direction); }}>
                  {{ up: '↑', left: '←', down: '↓', right: '→' }[direction]}
                </button>
              ))}
            </div>
          </div>
          <div className="game-controls">
            <div><span><kbd>WASD</kbd> <kbd>↑↓←→</kbd> 移動</span><span>點地面也能走</span></div>
            <button className="button use-target" type="button" disabled={!closeTarget} onClick={() => useNearby(walker.point.current)}
              aria-label={closeTarget ? `互動：${closeTarget.label}` : '靠近物件後互動'}>
              <kbd>E</kbd> <span>{closeTarget ? `${closeTarget.action} · ${closeTarget.label}` : '靠近物件後互動'}</span>
            </button>
          </div>
        </section>
        <aside className="expedition-side">
          <ExpeditionPanel active={active} objective={objective} guide={guide} task={isBriefed && !arriving ? task : undefined} puzzle={activePuzzle}
            field={field} hints={activePuzzle ? puzzleLog(progress, activePuzzle.id).hints : 0}
            devices={listedTargets} message={message} onWalk={walkTo} onHint={onHint}
            onAreaStory={localChapter && open.includes(localChapter.id) ? () => tell(storyIntroduction(localChapter)) : undefined}
            onDismiss={() => setMessage(null)}/>
          <Minimap open={open} expedition={expedition} activeId={active?.id} location={walker.location}/>
          <p className="station-tip">{navigationTip}</p>
        </aside>
      </div>
      {popup?.kind === 'bench' && <WindowDialog title={popup.device} icon="settings" onClose={() => setPopup(null)}>
        {close => <LabBench key={popup.puzzle.id} puzzle={popup.puzzle}
          inspected={popup.scanned} solved={puzzleLog(progress, popup.puzzle.id).solved}
          hints={puzzleLog(progress, popup.puzzle.id).hints} onAttempt={onAttempt} onHint={onHint} onReturn={close}/>}
      </WindowDialog>}
      {popup?.kind === 'story' && <StoryDialog key={popup.scene.title} scene={popup.scene}
        onClose={() => setPopup(null)} onFinish={() => {
          if (popup.scene.after === 'brief') acceptBrief(popup.scene.chapter);
          if (popup.scene.after === 'report') onReport();
        }}/>}
    </div>
  );
}
