import { useId } from 'react';
import type { DragEvent } from 'react';
import type { Answer, AssayPuzzle, BalancePuzzle, CellAnswer, CircuitPuzzle, DecisionPuzzle, GraphPuzzle, NumberField, PanelPuzzle, Puzzle, ReferenceTable, Species } from '../data/types';
import { meetsTarget } from '../engine/evaluate';
import { checkBalance, panelReadings, readCell } from '../engine/models';
import { Icon } from './Icon';
import { ForestComparison, RadiationDiagram } from './ClimateInstruments';

export const instrumentNames: Record<Puzzle['kind'], string> = {
  numeric: '數值校驗',
  graph: '圖表分析',
  balance: '反應式操作台',
  decision: '證據研判',
  assay: '水質探針',
  circuit: '虛擬電池',
  panel: '模擬控制台',
};

export function initialAnswer(puzzle: Puzzle): Answer {
  switch (puzzle.kind) {
    case 'numeric': return { kind: 'numeric', values: puzzle.fields.map(() => '') };
    case 'graph': return { kind: 'graph', values: puzzle.fields.map(() => ''), x: null };
    case 'balance': return { kind: 'balance', coefficients: [...puzzle.reactants, ...puzzle.products].map(() => 1) };
    case 'decision':
      return puzzle.forestMonths
        ? { kind: 'decision', selected: [], observedMonths: [puzzle.forestMonths[0].id] }
        : { kind: 'decision', selected: [] };
    case 'assay': return { kind: 'assay', inspected: [], selections: puzzle.targets.map(() => '') };
    case 'circuit': return { kind: 'circuit', cell: { left: '', right: '', bridge: false } };
    case 'panel': {
      const values = Object.fromEntries(puzzle.controls.map(control => [control.id, control.initial]));
      return puzzle.fields
        ? { kind: 'panel', values, entries: puzzle.fields.map(() => '') }
        : { kind: 'panel', values };
    }
  }
}

export function DataTable({ table }: { table: ReferenceTable }) {
  return (
    <div className="table-scroll">
      <table>
        <caption>{table.title}</caption>
        <thead><tr>{table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{table.rows.map(([label, ...cells], index) => (
          <tr key={index}><th scope="row">{label}</th>{cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function NumberInputs({ fields, values, onChange }: {
  fields: NumberField[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const id = useId();
  return (
    <div className="number-fields">
      {fields.map((field, index) => (
        <label className="field" key={field.label}>
          <span>{field.label}</span>
          <span className="input-row">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              maxLength={40}
              value={values[index]}
              aria-describedby={field.unit ? `${id}-unit-${index}` : undefined}
              onChange={event => onChange(values.map((value, i) => i === index ? event.target.value : value))}
              placeholder="輸入數值"
            />
            {field.unit && <span id={`${id}-unit-${index}`} className="input-unit" aria-hidden="true">{field.unit}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

function Graph({ graph, selected, onSelect }: { graph: GraphPuzzle['graph']; selected: number | null; onSelect: (x: number) => void }) {
  const scale = (value: number, ticks: number[]) => 100 * (value - ticks[0]) / (ticks.at(-1)! - ticks[0] || 1);
  const x = (value: number) => scale(value, graph.xTicks);
  const y = (value: number) => scale(value, graph.yTicks);
  const xTickLabel = (value: number) => graph.xTickLabels?.[value] ?? String(value);
  const picked = graph.points.find(point => point.x === selected);
  return (
    <figure className="graph">
      <figcaption>{graph.title}</figcaption>
      <p className="graph-y-name">{graph.yLabel}</p>
      <div className="plot">
        {graph.yTicks.map(tick => <div key={tick} className="plot-gridline" style={{ bottom: `${y(tick)}%` }}><span>{tick}</span></div>)}
        {graph.xTicks.map(tick => <span key={tick} className="plot-x-tick" style={{ left: `${x(tick)}%` }}>{xTickLabel(tick)}</span>)}
        <svg className="plot-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={graph.points.map(point => `${x(point.x)},${100 - y(point.y)}`).join(' ')} vectorEffect="non-scaling-stroke" />
          {picked && <path className="plot-guide" d={`M0 ${100 - y(picked.y)}H${x(picked.x)}V100`} vectorEffect="non-scaling-stroke" />}
        </svg>
        {graph.points.map(point => (
          <button
            key={point.x}
            type="button"
            className="plot-point"
            style={{ left: `${x(point.x)}%`, bottom: `${y(point.y)}%` }}
            aria-label={`${graph.xLabel} ${xTickLabel(point.x)}，${graph.yLabel} ${point.y}`}
            aria-pressed={selected === point.x}
            title={`${xTickLabel(point.x)}，${point.y}`}
            onClick={() => onSelect(point.x)}
          ><span /></button>
        ))}
      </div>
      <p className="graph-x-name">{graph.xLabel}</p>
      <p className="plot-selection" aria-live="polite">
        <strong>{graph.pickLabel}</strong>
        <span>{picked ? `已選 ${graph.xLabel} ${xTickLabel(picked.x)} · ${graph.yLabel} ${picked.y}` : '點圖上的圓點，這裡就會顯示讀值。'}</span>
      </p>
      <details className="plot-table">
        <summary>用資料表看數字</summary>
        <div className="table-scroll">
          <table aria-label={graph.title}>
            <thead><tr><th scope="col">{graph.xLabel}</th><th scope="col">{graph.yLabel}</th><th scope="col">標記</th></tr></thead>
            <tbody>{graph.points.map(point => (
              <tr key={point.x}>
                <th scope="row">{xTickLabel(point.x)}</th><td>{point.y}</td>
                <td><button type="button" className="button small" aria-label={`標記 ${graph.xLabel} ${xTickLabel(point.x)}`} aria-pressed={selected === point.x} onClick={() => onSelect(point.x)}>{selected === point.x ? '已選' : '選取'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

function Balancer({ puzzle, values, onChange }: { puzzle: BalancePuzzle; values: number[]; onChange: (values: number[]) => void }) {
  const numbers = Array.from({ length: puzzle.maximumCoefficient ?? 12 }, (_, index) => index + 1);
  const changeCoefficient = (index: number, coefficient: number) => onChange(values.map((value, i) => i === index ? coefficient : value));
  const drop = (event: DragEvent, index: number) => {
    event.preventDefault();
    const coefficient = Number(event.dataTransfer.getData('text/plain'));
    if (numbers.includes(coefficient)) changeCoefficient(index, coefficient);
  };
  const renderSide = (species: Species[], offset: number, side: string) => (
    <div className="equation-side">
      {species.map((item, index) => (
        <div className="equation-term" key={item.formula}>
          {index > 0 && <span className="operator">+</span>}
          <label className="drop-coefficient" onDragOver={event => event.preventDefault()} onDrop={event => drop(event, offset + index)}>
            <select aria-label={`${side} ${item.formula} 係數`} value={values[offset + index]} onChange={event => changeCoefficient(offset + index, Number(event.target.value))}>
              {numbers.map(number => <option key={number} value={number}>{number}</option>)}
            </select>
            <span>{item.formula}</span>
          </label>
        </div>
      ))}
    </div>
  );
  const balance = checkBalance(puzzle.reactants, puzzle.products, values, puzzle.maximumCoefficient);
  return (
    <div className="instrument">
      <div className="instrument-heading"><Icon name="flask" /><h3>係數托盤</h3></div>
      <div className="coefficient-tray" aria-label="可拖曳的係數">
        {numbers.map(number => <span key={number} draggable onDragStart={event => {
          event.dataTransfer.setData('text/plain', String(number));
          event.dataTransfer.effectAllowed = 'copy';
        }}>{number}</span>)}
      </div>
      <div className="equation" aria-label="反應式">
        {renderSide(puzzle.reactants, 0, '反應物')}
        <span className="operator reaction-arrow" aria-label="生成">→</span>
        {renderSide(puzzle.products, puzzle.reactants.length, '生成物')}
      </div>
      <DataTable table={{
        title: '即時原子盤點',
        columns: ['元素', '反應物', '生成物', '比對'],
        rows: balance.atoms.map(({ element, left, right }) => [element, String(left), String(right), left === right ? '相等' : '有差距']),
      }} />
    </div>
  );
}

function Decisions({ puzzle, selected, onChange }: { puzzle: DecisionPuzzle; selected: string[]; onChange: (selected: string[]) => void }) {
  const id = useId();
  return (
    <fieldset className="choices">
      <legend>{puzzle.select === 1 ? '點一個答案' : `選 ${puzzle.select} 個答案`}</legend>
      {puzzle.options.map(option => (
        <label className="choice" key={option.id}>
          <input
            type={puzzle.select === 1 ? 'radio' : 'checkbox'}
            name={id}
            checked={selected.includes(option.id)}
            onChange={event => onChange(puzzle.select === 1 ? [option.id] : event.target.checked
              ? [...selected, option.id]
              : selected.filter(id => id !== option.id))}
          />
          <span><strong>{option.label}</strong><span>{option.detail}</span></span>
        </label>
      ))}
    </fieldset>
  );
}

function Assay({ puzzle, answer, onChange, fieldSamples }: { puzzle: AssayPuzzle; answer: Extract<Answer, { kind: 'assay' }>; onChange: (answer: Answer) => void; fieldSamples: boolean }) {
  const sample = puzzle.samples.find(item => item.id === answer.inspected.at(-1));
  return (
    <div className="instrument">
      <div className="instrument-heading"><Icon name="drop" /><h3>雙探針採樣台</h3></div>
      {!fieldSamples && <><div className="sample-tray">
        {puzzle.samples.map(item => (
          <button key={item.id} type="button" aria-pressed={item.id === sample?.id} className="button sample"
            onClick={() => onChange({ ...answer, inspected: [...answer.inspected.filter(id => id !== item.id), item.id] })}>
            <Icon name={answer.inspected.includes(item.id) ? 'check' : 'flask'} size={17} />{item.label}
          </button>
        ))}
      </div>
      <div className="sample-meter" aria-live="polite">
        <span>{sample ? `正在量測 ${sample.label}` : '選擇樣本以開始量測'}</span>
        <div><strong>{sample ? sample.ph.toFixed(1) : '—'}</strong> pH</div>
        <div><strong>{sample ? sample.conductivity : '—'}</strong> mS/cm</div>
      </div>
      </>}
      <DataTable table={{
        title: '量測紀錄',
        columns: ['樣本', 'pH', '導電度 (mS/cm)'],
        rows: puzzle.samples.map(item => answer.inspected.includes(item.id)
          ? [item.label, item.ph.toFixed(1), String(item.conductivity)]
          : [item.label, '未量測', '未量測']),
      }} />
      <div className="assay-fields">
        {puzzle.targets.map((target, index) => (
          <label className="field" key={target.label}>
            <span>{target.label}</span>
            <select value={answer.selections[index]} onChange={event => onChange({ ...answer, selections: answer.selections.map((value, i) => i === index ? event.target.value : value) })}>
              <option value="">選擇樣本</option>
              {puzzle.samples.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

function Circuit({ puzzle, cell, onChange }: { puzzle: CircuitPuzzle; cell: CellAnswer; onChange: (cell: CellAnswer) => void }) {
  const voltage = readCell(cell, puzzle.voltage);
  const renderElectrode = (side: 'left' | 'right', wire: string, label: string) => (
    <label className={`electrode ${side}`}>
      <span>{label}</span>
      <span className="lead"><i />{wire}</span>
      <select value={cell[side]} onChange={event => onChange({ ...cell, [side]: event.target.value })}>
        <option value="">選取金屬</option>
        <option value="Zn">鋅 Zn</option>
        <option value="Cu">銅 Cu</option>
      </select>
      <span className="electrolyte">{cell[side] === 'Zn' ? '溶液含 Zn²⁺' : cell[side] === 'Cu' ? '溶液含 Cu²⁺' : '待裝半電池'}</span>
    </label>
  );
  return (
    <div className="instrument">
      <div className="instrument-heading"><Icon name="bolt" /><h3>雙半電池測試台</h3></div>
      <div className="circuit-meter" aria-live="polite">
        <span>負載測試電表</span>
        <strong>{voltage === null ? '—' : `${voltage > 0 ? '+' : ''}${voltage.toFixed(2)}`} <small>V</small></strong>
        <span>{voltage === null ? '等待有效回路' : voltage === 0 ? '無電位差' : voltage > 0 ? '正向' : '反向'}</span>
      </div>
      <div className="electrodes">
        {renderElectrode('left', '電表黑端', '左側電極')}
        {renderElectrode('right', '電表紅端', '右側電極')}
      </div>
      <label className={`bridge ${cell.bridge ? 'connected' : ''}`}>
        <input type="checkbox" checked={cell.bridge} onChange={event => onChange({ ...cell, bridge: event.target.checked })} />
        <span>接上鹽橋</span>
        <span>{cell.bridge ? '離子通道已接通' : '離子通道未接通'}</span>
      </label>
    </div>
  );
}

function ControlPanel({ puzzle, values, onChange }: { puzzle: PanelPuzzle; values: Record<string, number>; onChange: (values: Record<string, number>) => void }) {
  const readings = panelReadings(puzzle.model, values);
  return (
    <div className="instrument">
      <div className="instrument-heading"><Icon name="settings" /><h3>即時模擬</h3></div>
      {puzzle.model.kind === 'radiation' && <RadiationDiagram incoming={puzzle.model.incoming} reflected={values.reflected} infrared={values.infrared} />}
      <div className="panel-layout">
        <div className="panel-controls">
          {puzzle.controls.map(control => {
            const value = values[control.id];
            const set = (next: number) => onChange({ ...values, [control.id]: Math.min(control.max, Math.max(control.min, next)) });
            return (
              <div className="slider" key={control.id}>
                <div className="slider-title"><strong>{control.label}</strong><span>{value} {control.unit}</span></div>
                <div className="slider-row">
                  <button type="button" className="button stepper" aria-label={`減少${control.label}`} disabled={value === control.min} onClick={() => set(value - control.step)}>−</button>
                  <input type="range" aria-label={control.label} aria-valuetext={`${value} ${control.unit}`} min={control.min} max={control.max} step={control.step} value={value}
                    onChange={event => set(Number(event.target.value))} />
                  <button type="button" className="button stepper" aria-label={`增加${control.label}`} disabled={value === control.max} onClick={() => set(value + control.step)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
        <dl className="metrics">
          {puzzle.metrics.map(metric => {
            const hasTarget = metric.min !== undefined || metric.max !== undefined;
            const passed = meetsTarget(metric, readings[metric.id]);
            return (
              <div key={metric.id} className={hasTarget ? passed ? 'metric pass' : 'metric pending' : 'metric'}>
                <dt>{metric.label}</dt>
                <dd>
                  <strong>{Number(readings[metric.id].toFixed(4))}</strong><span>{metric.unit}</span>
                  {hasTarget && <span className="metric-state">{passed ? '達標' : '未達標'}</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}

export function Instrument({ puzzle, answer, onChange, fieldSamples = false }: { puzzle: Puzzle; answer: Answer; onChange: (answer: Answer) => void; fieldSamples?: boolean }) {
  if (puzzle.kind === 'numeric' && answer.kind === 'numeric') {
    return <NumberInputs fields={puzzle.fields} values={answer.values} onChange={values => onChange({ ...answer, values })} />;
  }
  if (puzzle.kind === 'graph' && answer.kind === 'graph') {
    return <>
      <Graph graph={puzzle.graph} selected={answer.x} onSelect={x => onChange({ ...answer, x })} />
      {puzzle.fields.length > 0 && (
        <fieldset className="graph-answers">
          <legend>填入讀值或計算結果</legend>
          <NumberInputs fields={puzzle.fields} values={answer.values} onChange={values => onChange({ ...answer, values })} />
        </fieldset>
      )}
    </>;
  }
  if (puzzle.kind === 'balance' && answer.kind === 'balance') {
    return <Balancer puzzle={puzzle} values={answer.coefficients} onChange={coefficients => onChange({ ...answer, coefficients })} />;
  }
  if (puzzle.kind === 'decision' && answer.kind === 'decision') {
    return <>
      {puzzle.forestMonths && (
        <ForestComparison months={puzzle.forestMonths} observed={answer.observedMonths ?? []}
          onSelect={id => onChange({ ...answer, observedMonths: [...(answer.observedMonths ?? []).filter(month => month !== id), id] })} />
      )}
      <Decisions puzzle={puzzle} selected={answer.selected} onChange={selected => onChange({ ...answer, selected })} />
    </>;
  }
  if (puzzle.kind === 'assay' && answer.kind === 'assay') {
    return <Assay puzzle={puzzle} answer={answer} onChange={onChange} fieldSamples={fieldSamples} />;
  }
  if (puzzle.kind === 'circuit' && answer.kind === 'circuit') {
    return <Circuit puzzle={puzzle} cell={answer.cell} onChange={cell => onChange({ ...answer, cell })} />;
  }
  if (puzzle.kind === 'panel' && answer.kind === 'panel') {
    return <>
      <ControlPanel puzzle={puzzle} values={answer.values} onChange={values => onChange({ ...answer, values })} />
      {puzzle.fields && (
        <NumberInputs fields={puzzle.fields} values={answer.entries ?? []} onChange={entries => onChange({ ...answer, entries })} />
      )}
    </>;
  }
  return null;
}
