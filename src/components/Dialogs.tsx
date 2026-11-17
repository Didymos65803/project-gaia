import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Chapter, IconName } from '../data/types';
import { countSolved, puzzleLog } from '../engine/progress';
import type { Progress } from '../engine/progress';
import { Icon } from './Icon';

function WindowDialog({ title, icon, onClose, children }: {
  title: string;
  icon: IconName;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);
  const close = () => ref.current?.close();
  return (
    <dialog className="window-dialog" ref={ref} aria-labelledby={id} onClose={onClose}>
      <div className="dialog-heading">
        <h2 id={id}><Icon name={icon} size={25} />{title}</h2>
        <button type="button" className="button icon-button" aria-label="關閉視窗" onClick={close}><Icon name="close" /></button>
      </div>
      {children(close)}
    </dialog>
  );
}

export function Notebook({ sections, selectedId, progress, onNote, onClose }: {
  sections: Chapter[];
  selectedId?: string;
  progress: Progress;
  onNote: (id: string, note: string) => void;
  onClose: () => void;
}) {
  const [sectionId, setSectionId] = useState(selectedId ?? sections.find(section => countSolved(progress, section) > 0)?.id ?? sections[0].id);
  const section = sections.find(item => item.id === sectionId) ?? sections[0];
  const evidence = section.puzzles.filter(puzzle => puzzleLog(progress, puzzle.id).solved).map(puzzle => puzzle.evidence);
  return (
    <WindowDialog title="科學筆記" icon="notebook" onClose={onClose}>
      {() => (
        <div className="notebook">
          <nav className="notebook-nav" aria-label="筆記區域">
            {sections.map(item => (
              <button type="button" key={item.id} aria-current={item.id === section.id ? 'page' : undefined} onClick={() => setSectionId(item.id)}>
                <Icon name={item.icon} size={17} /><span>{item.title}</span><small>{countSolved(progress, item)}</small>
              </button>
            ))}
          </nav>
          <section className="notebook-page" aria-labelledby="notebook-section">
            <h3 id="notebook-section">{section.title}</h3>
            {evidence.length > 0 ? (
              <ol className="evidence-list">
                {evidence.map(item => <li key={item.title}><strong>{item.title}</strong><p>{item.detail}</p></li>)}
              </ol>
            ) : <p className="empty-note">完成這個區域的第一步後，這裡會出現已核對的證據。</p>}
            {evidence.length === section.puzzles.length && <div className="lab-question"><Icon name="hint" size={19} /><p>{section.labQuestion}</p></div>}
            <label className="field field-note">
              <span>我的算式與觀察</span>
              <textarea maxLength={1200} rows={4} value={progress.notes[section.id] ?? ''} onChange={event => onNote(section.id, event.target.value)}
                placeholder="把你的推理或小組討論結果記在這裡。" />
            </label>
          </section>
        </div>
      )}
    </WindowDialog>
  );
}

export function Settings({ chapters, localLocks, teacherLocks, onLock, onReset, onClose }: {
  chapters: Chapter[];
  localLocks: string[];
  teacherLocks: readonly string[];
  onLock: (id: string, locked: boolean) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <WindowDialog title="課程與存檔設定" icon="settings" onClose={onClose}>
      {close => (
        <div className="settings-body">
          <section aria-labelledby="course-locks">
            <h3 id="course-locks">課程鎖定</h3>
            <p>勾選本機要暫時關閉的研究區。後續區域會等待前一區解鎖並修復。</p>
            <div className="locks-list">
              {chapters.map(chapter => {
                const siteWide = teacherLocks.includes(chapter.id);
                return <label key={chapter.id} className="lock-setting">
                  <input type="checkbox" checked={siteWide || localLocks.includes(chapter.id)} disabled={siteWide} onChange={event => onLock(chapter.id, event.target.checked)} />
                  <span>鎖定 {chapter.title}</span>
                  {siteWide && <small>網站統一鎖定</small>}
                </label>;
              })}
            </div>
          </section>
          <section className="reset-block" aria-labelledby="reset-heading">
            <h3 id="reset-heading">遊戲存檔</h3>
            {confirmReset
              ? <>
                <p>要清除這台瀏覽器的修復進度與科學筆記嗎？課程鎖定設定會保留。</p>
                <div className="reset-actions">
                  <button type="button" className="button" onClick={() => setConfirmReset(false)}>取消</button>
                  <button type="button" className="button danger" onClick={() => { close(); onReset(); }}>確認清除進度</button>
                </div>
              </>
              : <button type="button" className="button" onClick={() => setConfirmReset(true)}>重置遊戲進度</button>}
          </section>
        </div>
      )}
    </WindowDialog>
  );
}
