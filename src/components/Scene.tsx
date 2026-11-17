import type { Chapter } from '../data/types';
import { countSolved } from '../engine/progress';
import type { Progress } from '../engine/progress';
import { Icon } from './Icon';

export function Header({ saved, onMap, onNotebook, onSettings }: { saved: boolean; onMap: () => void; onNotebook: () => void; onSettings: () => void }) {
  return (
    <header className="site-header">
      <div className="frame header-inner">
        <button className="brand" type="button" onClick={onMap} aria-label="Project GAIA · 回研究站地圖">
          <span className="brand-mark"><Icon name="globe" size={25} /></span>
          <span className="brand-copy"><strong>PROJECT GAIA</strong><span>地球研究站</span></span>
        </button>
        <nav className="header-tools" aria-label="研究站工具">
          <span className={`save-status ${saved ? '' : 'save-off'}`}><i />{saved ? '本機自動存檔' : '目前僅暫存'}</span>
          <button type="button" className="button header-notebook" onClick={onNotebook}><Icon name="notebook" size={19} /><span>科學筆記</span></button>
          <button type="button" className="button icon-button" onClick={onSettings} aria-label="課程與存檔設定" title="課程與存檔設定"><Icon name="settings" size={19} /></button>
        </nav>
      </div>
    </header>
  );
}

function OrbitalView() {
  return (
    <div className="orbital-view" aria-hidden="true">
      <div className="orbital-mist" />
      <div className="planet" />
      <svg className="orbit-lines" viewBox="0 0 680 420" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id="orbit-ink" x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#4e9eab" stopOpacity="0.18" />
            <stop offset="0.53" stopColor="#a2f8e6" stopOpacity="0.72" />
            <stop offset="1" stopColor="#4e9eab" stopOpacity="0.22" />
          </linearGradient>
        </defs>
        <circle cx="392" cy="218" r="192" stroke="#86bcce" strokeOpacity=".26" strokeDasharray="2 6" />
        <circle cx="392" cy="218" r="207" stroke="#82bac7" strokeOpacity=".14" />
        <ellipse cx="392" cy="218" rx="253" ry="111" transform="rotate(-22 392 218)" stroke="url(#orbit-ink)" />
        <ellipse cx="392" cy="218" rx="253" ry="111" transform="rotate(-22 392 218)" stroke="#b1fbe9" strokeOpacity=".52" strokeDasharray="148 1083" strokeDashoffset="390" />
        <path d="M392 6v23m0 368v17M174 218h24m390 0h24M144 133h49l36 32m389 122h-44l-30-21" stroke="#97d9de" opacity=".45" />
        <circle cx="145" cy="133" r="3.3" fill="#e1feff" />
        <circle cx="617" cy="287" r="3.3" fill="#f6b779" />
        <path d="M121 57h22M132 46v22m500 314h18m-9-9v18M552 41h10m-5-5v10M96 318h10m-5-5v10" stroke="#a6e4e3" opacity=".47" />
        <path d="M507 91h9v9m-9 15h9v-9m-32-15h-9v9m9 15h-9v-9" stroke="#d7ffe9" strokeOpacity=".65" />
        <path d="M496 96v14m-7-7h14" stroke="#d7ffe9" strokeOpacity=".65" />
      </svg>
      <div className="orbital-label"><span>地球監測影像</span><strong><i /> 備援畫面</strong></div>
    </div>
  );
}

export function Report({ chapters, finale, progress, onMap, onNotebook }: {
  chapters: Chapter[];
  finale: Chapter;
  progress: Progress;
  onMap: () => void;
  onNotebook: () => void;
}) {
  const count = [...chapters, finale].reduce((total, chapter) => total + countSolved(progress, chapter), 0);
  return (
    <div className="report">
      <section className="report-hero" aria-labelledby="page-heading">
        <OrbitalView />
        <div className="hero-copy">
          <div className="signal signal-safe"><Icon name="check" size={17} />全站恢復</div>
          <h1 id="page-heading" tabIndex={-1}>調查結案</h1>
          <p>{finale.resolution}</p>
          <div className="report-stats"><span><strong>{chapters.length}</strong> 研究區修復</span><span><strong>{count}</strong> 環節通過</span></div>
        </div>
      </section>
      <section className="report-body" aria-labelledby="evidence-review">
        <h2 id="evidence-review">事故紀錄</h2>
        <ol>
          <li><strong>05:40 · 資料同步中斷</strong><p>封包遺失校正標籤。獨立複測確認讀值 28 格代表 12 mA，低於 15 mA 的門檻。</p></li>
          <li><strong>05:42 · 誤觸供電隔離</strong><p>溫室補光停止，光合吸碳下降。呼吸仍可釋出 CO₂。局部實測的酸水則依酸當量獨立處理。</p></li>
          <li><strong>復電 · 分區驗收</strong><p>逐區核對單位與時序，驗證水、碳與能量收支。族群資料依乾濕條件各自比較，保留異常與雨後樣本。</p></li>
        </ol>
        <div className="report-actions">
          <button type="button" className="button primary" onClick={onNotebook}><Icon name="notebook" />開啟科學筆記</button>
          <button type="button" className="button" onClick={onMap}>返回研究站地圖 <Icon name="arrow" /></button>
        </div>
      </section>
    </div>
  );
}
