import { useMemo, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { batteryAnswer, changeSocket, controlSpec, cycleValue, fieldTasks, freshField, parts, timingDials } from '../../data/field';
import type { FieldState } from '../../data/field';
import { roomData } from '../../data/station';
import type { Answer, Chapter, Feedback, Puzzle } from '../../data/types';
import { evaluate, meetsTarget } from '../../engine/evaluate';
import { collectCore, restoreSector } from '../../engine/expedition';
import type { Expedition } from '../../engine/expedition';
import { distance, doorApproach, makeWalkable, sectorAt, sectors, spawn } from '../../engine/map';
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
import { createTargets } from './targets';
import type { Target } from './targets';
import { useWalker } from './useWalker';

type Popup = { kind: 'brief' | 'restored'; chapter: Chapter } | { kind: 'bench'; puzzle: Puzzle; device: string; scanned?: string[] };
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
  const availableField = isBriefed && task && field;
  const targetGroups = sectors.map((sector, index) => createTargets(sector, sections[index], progress, expedition, open.includes(sector.id),
    sector.id === active?.id ? task : undefined, sector.id === active?.id ? field : undefined));
  const targets = targetGroups.flatMap(group => group.targets);
  const preferredId = targetGroups[active ? sections.indexOf(active) : sections.length - 1]?.preferred;
  const guide = targets.find(target => target.id === preferredId);
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
        setPopup({ kind: 'brief', chapter });
        return;
      case 'read':
        onExpedition(previous => previous.archives.includes(chapter.id) ? previous : { ...previous, archives: [...previous.archives, chapter.id] });
        show('撿到失聯錄音', roomData[chapter.id].log, 'pass');
        return;
      case 'collect':
        onExpedition(previous => collectCore(previous, progress, chapter));
        show('電源核心已拾取', '把發光的核心帶到這一區的電源插座。');
        return;
      case 'restore':
        onExpedition(previous => restoreSector(previous, chapter.id));
        setMessage(null);
        setPopup({ kind: 'restored', chapter });
        return;
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
          show(`${sample.label} 探針讀值`, `pH ${sample.ph.toFixed(1)} · 導電度 ${sample.conductivity} mS/cm。數據已記在現場面板。`);
        }
        if (task.mode === 'survey') {
          const id = String(action.option);
          const reading = task.readings[action.option];
          if (!field.scanned.includes(id)) setDraft({ ...field, scanned: [...field.scanned, id] });
          show(reading.label, reading.result);
        }
        return;
      case 'control': {
        const key = action.key;
        const operated = [...new Set([...field.operated, key])];
        if (task.mode === 'timing') {
          const dial = timingDials.find(entry => entry.id === key);
          if (!dial) return;
          const value = cycleValue(dial.values, field.controls[key]);
          setDraft({ ...field, operated, controls: { ...field.controls, [key]: value } });
          show(dial.label, `已調到 ${value}${key === 'micros' ? ' μs' : ''}。`);
        }
        if (task.mode === 'heat') {
          const value = cycleValue([1, -1], field.controls[key]);
          setDraft({ ...field, operated, controls: { ...field.controls, [key]: value } });
          show(`${key} 槽切換`, value === 1 ? '放熱：熱從反應區傳到外側的水。' : '吸熱：熱從外側的水傳進反應區。');
        }
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
        show(field.carried ? '已放回' : '已拿起', parts[action.part]);
        return;
      case 'socket': {
        const update = changeSocket(field, action.socket);
        setDraft(update.field);
        show(target.label, update.message, update.field === field ? 'retry' : 'info');
        return;
      }
      case 'submit':
        if (task.mode === 'timing') {
          const { coefficient, exponent, micros } = field.controls;
          evaluateWorld(activePuzzle, { kind: 'numeric', values: [String(coefficient), String(exponent), String(micros)] });
        }
        if (task.mode === 'controls') evaluateWorld(activePuzzle, { kind: 'panel', values: field.controls });
        if (task.mode === 'battery') evaluateWorld(activePuzzle, batteryAnswer(field));
        if (task.mode === 'heat') {
          const { A, B } = field.controls;
          if (A === 1 && B === -1) evaluateWorld(activePuzzle, { kind: 'decision', selected: ['a-release', 'b-absorb'] });
          else finishWorldPuzzle(activePuzzle, {
            correct: false, message: activePuzzle.retry, details: [
              A === 1 ? '' : 'A 槽附近的水升溫了，表示水收到反應區傳來的熱。',
              B === -1 ? '' : 'B 槽附近的水降溫了，表示水把熱傳給反應區。',
            ].filter(Boolean),
          });
        }
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
  const locationName = here ? roomData[here.id].name : '中央走廊';
  const areaToList = here && open.includes(here.id) ? here.id : active?.id;
  const listedTargets = targets.filter(target => target.areaId === areaToList && target.interaction.type !== 'blocked');
  const fromRoom = active ? `走向 ${roomData[active.id].name}` : '探索研究站';
  const objective = active
    ? !isBriefed ? `找到 ${active.character.name}` : activePuzzle ? activePuzzle.title : expedition.core === active.id ? '裝回電源核心' : '拾取區域電源核心'
    : open.includes('finale') ? '查看事故結案報告' : '等待課程開放';
  const done = sections.slice(0, -1).filter(chapter => expedition.powered.includes(chapter.id)).length;
  const readings = active?.id === 'greenhouse' && activePuzzle?.kind === 'panel' && field
    ? panelReadings(activePuzzle.model, field.controls) : null;
  const greenhouse = readings && activePuzzle?.kind === 'panel' &&
    activePuzzle.metrics.every(metric => meetsTarget(metric, readings[metric.id]));
  const navigationTip = !here ? fromRoom : guide ? '跟著黃色驚嘆號找下一個目標。'
    : task?.mode === 'route' ? '走到對應的分流口就能測試。' : '可回到已通電的設備重新演練。';

  function walkTo(target: Target) {
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
          <span title="已尋獲的失聯錄音"><Icon name="radio" size={19}/><strong>{expedition.archives.length}<small>/9</small></strong> <span>錄音</span></span>
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
              : !isBriefed && active && <div className="stage-core stage-objective">!　找到 {active.character.name}</div>}
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
          <ExpeditionPanel active={active} objective={objective} guide={guide} task={isBriefed ? task : undefined} puzzle={activePuzzle}
            field={field} hints={activePuzzle ? puzzleLog(progress, activePuzzle.id).hints : 0}
            devices={listedTargets} message={message} onWalk={walkTo} onHint={onHint} onDismiss={() => setMessage(null)}/>
          <Minimap open={open} expedition={expedition} activeId={active?.id} location={walker.location}/>
          <p className="station-tip">{navigationTip}</p>
        </aside>
      </div>
      {popup?.kind === 'bench' && <WindowDialog title={popup.device} icon="settings" onClose={() => setPopup(null)}>
        {close => <LabBench key={popup.puzzle.id} puzzle={popup.puzzle}
          inspected={popup.scanned} solved={puzzleLog(progress, popup.puzzle.id).solved}
          hints={puzzleLog(progress, popup.puzzle.id).hints} onAttempt={onAttempt} onHint={onHint} onReturn={close}/>}
      </WindowDialog>}
      {popup && popup.kind !== 'bench' && <StoryDialog key={`${popup.kind}-${popup.chapter.id}`} chapter={popup.chapter}
        restored={popup.kind === 'restored'} onAccept={() => acceptBrief(popup.chapter)} onClose={() => setPopup(null)}
        onReport={popup.chapter.id === 'finale' && popup.kind === 'restored' ? onReport : undefined}/>}
    </div>
  );
}

function StoryDialog({ chapter, restored, onAccept, onClose, onReport }: {
  chapter: Chapter;
  restored: boolean;
  onAccept: () => void;
  onClose: () => void;
  onReport?: () => void;
}) {
  const [line, setLine] = useState(0);
  const speech = restored ? [chapter.resolution] : [roomData[chapter.id].opening, chapter.briefing];
  return (
    <WindowDialog title={restored ? '區域通電！' : `與 ${chapter.character.name} 交談`} icon={restored ? 'bolt' : 'radio'} onClose={onClose}>
      {close => (
        <div className="story-dialog">
          <div className={`dialog-sprite ${restored ? 'energized' : ''}`}>
            {restored ? <DeviceArt icon="core"/> : <Suit variant={chapter.character.initials === 'G' ? 'robot' : 'crew'}/>}
          </div>
          <div>
            <strong>{restored ? roomData[chapter.id].name : chapter.character.name}</strong>
            <p aria-live="polite">{speech[line]}</p>
          </div>
          <button type="button" className="button primary" onClick={() => {
            if (line + 1 < speech.length) setLine(line + 1);
            else {
              if (!restored) onAccept();
              close();
              onReport?.();
            }
          }}>
            {line + 1 < speech.length ? '繼續對話' : onReport ? '查看結案報告' : restored ? '返回研究站' : '開始調查'} <Icon name="arrow" size={19}/>
          </button>
        </div>
      )}
    </WindowDialog>
  );
}
