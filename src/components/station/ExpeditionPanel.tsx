import { useId } from 'react';
import { batteryAnswer, parts, sampleReadings } from '../../data/field';
import type { FieldState, FieldTask } from '../../data/field';
import { roomData } from '../../data/station';
import type { Chapter, Puzzle } from '../../data/types';
import { meetsTarget } from '../../engine/evaluate';
import type { Expedition } from '../../engine/expedition';
import { door, halls, sectors } from '../../engine/map';
import type { Point } from '../../engine/map';
import { panelReadings, readCell } from '../../engine/models';
import { Icon } from '../Icon';
import type { Target } from './targets';

export type FieldMessage = { tone: 'info' | 'pass' | 'retry'; title: string; detail: string };

export function Minimap({ open, expedition, activeId, location }: { open: string[]; expedition: Expedition; activeId?: string; location: Point }) {
  return (
    <figure className="mini-station">
      <figcaption><Icon name="grid" size={16} />基地平面圖</figcaption>
      <svg viewBox="35 65 1350 1040" aria-label="研究站小地圖" role="img">
        {halls.map(hall => <rect key={`${hall.x}-${hall.y}-${hall.w}`} x={hall.x} y={hall.y} width={hall.w} height={hall.h} fill="#384768" rx="14" />)}
        {sectors.map(({ id, rect, northDoor }, i) => {
          const color = expedition.powered.includes(id) ? '#80e4be' : activeId === id ? '#f8d974' : open.includes(id) ? '#a3aad5' : '#666d91';
          const entry = door({ id, rect, northDoor });
          return (
            <g key={id}>
              <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={color} fillOpacity=".14" stroke={color} strokeWidth="11" rx="16" />
              <text x={rect.x + rect.w / 2} y={rect.y + rect.h / 2 + 27} textAnchor="middle" fill={color} fontSize="78" fontWeight="800">{i === 8 ? '★' : String(i + 1).padStart(2, '0')}</text>
              <rect x={entry.x - 30} y={entry.y - 9} width="60" height="18" rx="5" fill={color}/>
            </g>
          );
        })}
        <circle cx={location.x} cy={location.y} r="42" fill="#84e4f0" fillOpacity=".33"/>
        <circle cx={location.x} cy={location.y} r="22" fill="#f5fffb" stroke="#498eaa" strokeWidth="8"/>
      </svg>
      <div className="mini-key"><span><i className="here" />你的位置</span><span><i className="active" />任務</span><span><i className="done" />已通電</span></div>
    </figure>
  );
}

function FieldReadings({ field, puzzle, task }: { field: FieldState; puzzle: Puzzle; task: FieldTask }) {
  if (task.mode === 'controls' && puzzle.kind === 'panel') {
    const readings = panelReadings(puzzle.model, field.controls);
    return <dl className="live-readings">{puzzle.metrics.map(metric => {
      const objective = metric.min === metric.max ? `正好 ${metric.min}`
        : metric.min !== undefined ? `至少 ${metric.min}` : `最多 ${metric.max}`;
      const passes = meetsTarget(metric, readings[metric.id]);
      return (
        <div key={metric.id} className={passes ? 'reading-met' : ''}>
          <dt>{metric.label}</dt>
          <dd>{Number(readings[metric.id].toFixed(3))} <small>{metric.unit}</small></dd>
          {(metric.min !== undefined || metric.max !== undefined) && (
            <dd className="reading-goal">{passes ? '✓ 已達標' : `目標 ${objective}`}</dd>
          )}
        </div>
      );
    })}</dl>;
  }
  if (task.mode === 'battery' && puzzle.kind === 'circuit') {
    const voltage = readCell(batteryAnswer(field).cell, puzzle.voltage);
    return <dl className="live-readings">
      <div><dt>手上零件</dt><dd>{field.carried ? parts[field.carried] : '空手'}</dd></div>
      <div><dt>負載電表</dt><dd>{voltage === null ? '未接通' : `${voltage > 0 ? '+' : ''}${voltage.toFixed(2)} V`}</dd></div>
    </dl>;
  }
  if (task.mode === 'samples' && puzzle.kind === 'assay') {
    return <ul className="scan-lines">{field.scanned.length
      ? sampleReadings(puzzle, field.scanned).map(line => <li key={line}>{line}</li>)
      : <li>探針還沒有讀值</li>}</ul>;
  }
  if (task.mode === 'survey') {
    return <ul className="scan-lines">{field.scanned.length ? task.readings.filter((_, i) => field.scanned.includes(String(i)))
      .map(reading => <li key={reading.label}>{reading.label}已查閱</li>) : <li>尚未採集證據</li>}</ul>;
  }
  return null;
}

export function ExpeditionPanel({ active, objective, guide, task, puzzle, field, hints, devices, message, onWalk, onHint, onAreaStory, onDismiss }: {
  active?: Chapter;
  objective: string;
  guide?: Pick<Target, 'label' | 'approach'>;
  task?: FieldTask;
  puzzle?: Puzzle;
  field?: FieldState;
  hints: number;
  devices: Target[];
  message: FieldMessage | null;
  onWalk: (target: Pick<Target, 'label' | 'approach'>) => void;
  onAreaStory?: () => void;
  onHint: (puzzle: Puzzle) => void;
  onDismiss: () => void;
}) {
  const goalId = useId();
  return (
    <section className="expedition-panel" aria-labelledby={goalId}>
      <div className="quest-label"><Icon name="radio" size={16} />目前任務</div>
      <h2 id={goalId}>{objective}</h2>
      {active && <p className="quest-location">{roomData[active.id].name}</p>}
      {task && puzzle && field && (
        <>
          {(task.mode !== 'survey' || task.readings.length === field.scanned.length) && (
            <div className="field-summary">
              {puzzle.prompt.map((line, index) => (
                <p key={line} className={index === puzzle.prompt.length - 1 ? 'field-question' : undefined}>{line}</p>
              ))}
            </div>
          )}
          <p className="field-action">{task.action}</p>
          <FieldReadings field={field} puzzle={puzzle} task={task}/>
          {hints > 0 && <ol className="quest-hints">{puzzle.hints.slice(0, hints).map(hint => <li key={hint}>{hint}</li>)}</ol>}
        </>
      )}
      <div className="quest-controls">
        {guide && <button type="button" className="button seek-button" aria-label={`帶路到${guide.label}`} onClick={() => onWalk(guide)}><Icon name="arrow" size={17}/> 帶路</button>}
        {onAreaStory && <button type="button" className="button seek-button" onClick={onAreaStory}><Icon name="notebook" size={16}/> 區域故事</button>}
        {task && puzzle && hints < puzzle.hints.length && <button type="button" className="button seek-button" onClick={() => onHint(puzzle)}>
          <Icon name="hint" size={16}/>{hints ? '下一則提示' : '提示'}
        </button>}
      </div>
      {devices.length > 1 && (
        <details className="quest-details device-links">
          <summary>附近設備與人物</summary>
          <div>{devices.map(device => (
            <button key={device.id} type="button" className="button small" aria-label={`走到${device.label}`} onClick={() => onWalk(device)}>
              {device.label}<Icon name="arrow" size={14}/>
            </button>
          ))}</div>
        </details>
      )}
      {message && (
        <section className={`field-message ${message.tone}`} role="status">
          <div><strong>{message.title}</strong><button type="button" onClick={onDismiss} aria-label="關閉現場訊息"><Icon name="close" size={16}/></button></div>
          <p>{message.detail}</p>
        </section>
      )}
    </section>
  );
}
