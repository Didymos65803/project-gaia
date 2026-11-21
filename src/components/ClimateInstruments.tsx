import type { CSSProperties } from 'react';
import type { ForestMonth } from '../data/types';
import { forestBudget } from '../engine/models';

export function RadiationDiagram({ incoming, reflected, infrared }: { incoming: number; reflected: number; infrared: number }) {
  const arrows = [
    { label: '太陽入射短波', value: incoming, direction: 'incoming' },
    { label: '反射短波回太空', value: reflected, direction: 'reflected' },
    { label: '地球向外放出紅外', value: infrared, direction: 'infrared' },
  ];
  return (
    <div className="radiation-diagram">
      <div className="radiation-space">
        <span className="radiation-sun" aria-hidden="true" />
        <span>太空</span>
      </div>
      <ul className="radiation-arrows">
        {arrows.map(({ label, value, direction }) => (
          <li className={direction} key={direction}>
            <span>{label} <strong>{value} W/m²</strong></span>
            <i aria-hidden="true" style={{ '--arrow-height': `${6 + 11 * value / incoming}px` } as CSSProperties} />
          </li>
        ))}
      </ul>
      <div className="radiation-space">
        <span className="radiation-earth" aria-hidden="true" />
        <span>地球</span>
      </div>
    </div>
  );
}

function Flow({ route, process, value, unit }: { route: string; process: string; value: number; unit: string }) {
  return <div className="forest-flow"><dt>{process}<small>{route}</small></dt><dd>{value} {unit}</dd></div>;
}

export function ForestComparison({ months, observed, onSelect }: {
  months: ForestMonth[];
  observed: string[];
  onSelect: (id: string) => void;
}) {
  const month = months.find(candidate => candidate.id === observed.at(-1)) ?? months[0];
  const balance = forestBudget(month);
  const signed = (value: number) => value > 0 ? `+${value}` : String(value).replace('-', '−');
  return (
    <section className="instrument forest-compare" aria-label="森林觀測比較">
      <div className="sample-tray" role="group" aria-label="切換觀測月份">
        {months.map(item => (
          <button className="button sample" type="button" key={item.id} onClick={() => onSelect(item.id)} aria-pressed={month.id === item.id}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="forest-budgets" aria-live="polite">
        <div className="forest-water">
          <h3>{month.label}的水循環</h3>
          <dl>
            <Flow process="降雨" route="大氣 → 林地" value={month.rain} unit="mm" />
            <Flow process="蒸散" route="林地 → 大氣" value={month.evapotranspiration} unit="mm" />
            <Flow process="河道流出" route="林地 → 下游" value={month.runoff} unit="mm" />
          </dl>
          <p>林地蓄水 <strong>{signed(balance.water)} mm</strong></p>
        </div>
        <div className="forest-carbon">
          <h3>{month.label}的碳循環</h3>
          <dl>
            <Flow process="光合作用吸收" route="大氣 → 林地" value={month.uptake} unit="t C/ha" />
            <Flow process="呼吸釋出" route="林地 → 大氣" value={month.release} unit="t C/ha" />
          </dl>
          <p>林地儲碳 <strong>{signed(balance.carbon)} t C/ha</strong></p>
        </div>
      </div>
      <p className="forest-units">蒸散包含土壤蒸發和葉片蒸騰。t C/ha 是每公頃有幾噸碳。</p>
    </section>
  );
}
