import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Chapter, Feedback, Puzzle } from '../data/types';
import { evaluate } from '../engine/evaluate';
import { countSolved, puzzleIsOpen, puzzleLog } from '../engine/progress';
import type { Progress } from '../engine/progress';
import { Icon } from './Icon';
import { DataTable, initialAnswer, Instrument, instrumentNames } from './Instruments';

type MissionProps = {
  chapter: Chapter;
  puzzle: Puzzle;
  progress: Progress;
  chapterIndex: number;
  continuation: { label: string; run: () => void };
  onAttempt: (puzzle: Puzzle, correct: boolean) => void;
  onHint: (puzzle: Puzzle) => void;
  onSelect: (puzzle: Puzzle) => void;
  onMap: () => void;
  onNotebook: () => void;
};

export function Mission({ chapter, puzzle, progress, chapterIndex, continuation, onAttempt, onHint, onSelect, onMap, onNotebook }: MissionProps) {
  const index = chapter.puzzles.findIndex(step => step.id === puzzle.id);
  const log = puzzleLog(progress, puzzle.id);
  const solved = countSolved(progress, chapter);
  const finished = solved === chapter.puzzles.length;

  return (
    <div className={`mission theme-${chapter.accent}`}>
      <div className="mission-bar">
        <button type="button" className="button text-button" onClick={onMap}><Icon name="back" size={18} />研究站地圖</button>
        <span><Icon name="clock" size={16} />約 {chapter.minutes} 分鐘</span>
      </div>
      <header className="mission-heading">
        <span className="room-icon"><Icon name={chapter.icon} size={30} /></span>
        <div>
          <p>{chapterIndex < 0 ? '終章' : `研究區 ${String(chapterIndex + 1).padStart(2, '0')}`} <span> / </span>{chapter.area}</p>
          <h1 id="page-heading" tabIndex={-1}>{chapter.title}</h1>
        </div>
        <div className="mission-count"><strong>{solved} / {chapter.puzzles.length}</strong><span>步驟已驗收</span></div>
      </header>
      <div className="mission-layout">
        <div className="mission-main">
          <section className="briefing" aria-label="通訊簡報">
            <span className="avatar" aria-hidden="true">{chapter.character.initials}</span>
            <div>
              <div className="speaker"><strong>{chapter.character.name}</strong><span>{chapter.character.role}</span></div>
              <p>{chapter.briefing}</p>
            </div>
          </section>
          <Challenge key={puzzle.id} puzzle={puzzle} index={index} solved={log.solved} hints={log.hints} continuation={continuation}
            resolution={finished && index === chapter.puzzles.length - 1 ? chapter.resolution : undefined} onAttempt={onAttempt} onHint={onHint} />
        </div>
        <aside className="mission-sidebar">
          <section className="sidebar-card" aria-labelledby="steps-title">
            <h2 id="steps-title"><Icon name="grid" size={18} />修復步驟</h2>
            <ol className="step-list">
              {chapter.puzzles.map((step, i) => {
                const complete = puzzleLog(progress, step.id).solved;
                const current = step.id === puzzle.id;
                return (
                  <li key={step.id}>
                    <button type="button" disabled={!puzzleIsOpen(progress, chapter, step.id)} aria-current={current ? 'step' : undefined} onClick={() => onSelect(step)}>
                      <span className={complete ? 'step-marker complete' : 'step-marker'}>
                        {complete ? <Icon name="check" size={16} /> : i + 1}
                      </span>
                      <span>{step.title}<small>{complete ? '已驗收' : current ? '調查中' : '待解鎖'}</small></span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
          <section className="sidebar-card sidebar-notes" aria-labelledby="field-notes-title">
            <h2 id="field-notes-title"><Icon name="notebook" size={18} />區域筆記</h2>
            <p>{solved ? `本區已記錄 ${solved} 則證據。你也可以寫下自己的算式與觀察。` : '通過驗收後，證據與公式會自動記入筆記。'}</p>
            {finished && <p className="discussion-preview">{chapter.labQuestion}</p>}
            <button type="button" className="button small" onClick={onNotebook}>開啟科學筆記 <Icon name="arrow" size={16} /></button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Challenge({ puzzle, index, solved, hints, resolution, continuation, onAttempt, onHint }: {
  puzzle: Puzzle;
  index: number;
  solved: boolean;
  hints: number;
  resolution?: string;
  continuation: MissionProps['continuation'];
  onAttempt: MissionProps['onAttempt'];
  onHint: MissionProps['onHint'];
}) {
  const [answer, setAnswer] = useState(() => initialAnswer(puzzle));
  const [result, setResult] = useState<Feedback | null>(null);
  const [practice, setPractice] = useState(false);
  const resultBox = useRef<HTMLDivElement>(null);
  const exercise = useRef<HTMLHeadingElement>(null);
  const showInstrument = !solved || practice;
  const feedback = result ?? (solved && !practice ? { correct: true, message: puzzle.success, details: [] } : null);

  useEffect(() => {
    if (result) {
      resultBox.current?.focus({ preventScroll: true });
      resultBox.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [result]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = evaluate(puzzle, answer);
    if (next.correct) setPractice(false);
    onAttempt(puzzle, next.correct);
    setResult(next);
  }

  function replay() {
    setAnswer(initialAnswer(puzzle));
    setResult(null);
    setPractice(true);
    exercise.current?.focus();
  }

  return (
    <section className="challenge" aria-labelledby="challenge-title">
      <header className="challenge-heading">
        <span className="challenge-tag"><span>步驟 {String(index + 1).padStart(2, '0')}</span><span>{instrumentNames[puzzle.kind]}</span></span>
        <h2 id="challenge-title" ref={exercise} tabIndex={-1}>{puzzle.title}</h2>
        <div className="challenge-prompt">{puzzle.prompt.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      </header>
      {showInstrument && puzzle.table && <DataTable table={puzzle.table} />}
      <form className="challenge-form" aria-label={puzzle.title} onSubmit={submit}>
        {showInstrument && <Instrument puzzle={puzzle} answer={answer} onChange={setAnswer} />}
        {showInstrument && hints > 0 && (
          <div className="hints" aria-live="polite">
            <strong><Icon name="hint" size={18} />已揭開的提示</strong>
            <ol>{puzzle.hints.slice(0, hints).map(hint => <li key={hint}>{hint}</li>)}</ol>
          </div>
        )}
        {feedback && (
          <div className={`feedback ${feedback.correct ? 'success' : 'retry'}`} ref={resultBox} tabIndex={-1} role="status">
            <strong><Icon name={feedback.correct ? 'check' : 'radio'} size={19} />{feedback.correct ? '驗收通過' : '需要重新核對'}</strong>
            <p>{feedback.message}</p>
            {feedback.details.length > 0 && <ul>{feedback.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}
            {feedback.correct && resolution && <p className="resolution">{resolution}</p>}
          </div>
        )}
        <div className="challenge-actions">
          {showInstrument && <button type="submit" className="button primary">送出驗收 <Icon name="arrow" size={18} /></button>}
          {showInstrument && hints < puzzle.hints.length && (
            <button type="button" className="button hint-button" onClick={() => onHint(puzzle)}><Icon name="hint" size={18} />{hints > 0 ? '下一則提示' : '顯示提示'} <span>{hints}/{puzzle.hints.length}</span></button>
          )}
          {solved && !practice && (
            <>
              <button type="button" className="button primary" onClick={continuation.run}>{continuation.label} <Icon name="arrow" size={18} /></button>
              <button type="button" className="button" onClick={replay}>重新演練</button>
            </>
          )}
          {solved && practice && <button type="button" className="button" onClick={() => { setResult(null); setPractice(false); }}>結束演練</button>}
        </div>
      </form>
    </section>
  );
}
