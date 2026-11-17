import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Answer, Feedback, Puzzle } from '../data/types';
import { evaluate } from '../engine/evaluate';
import { Icon } from './Icon';
import { DataTable, initialAnswer, Instrument, instrumentNames } from './Instruments';

export function LabBench({ puzzle, solved, hints, inspected, onReturn, onAttempt, onHint }: {
  puzzle: Puzzle;
  solved: boolean;
  hints: number;
  inspected?: string[];
  onReturn: () => void;
  onAttempt: (puzzle: Puzzle, correct: boolean) => void;
  onHint: (puzzle: Puzzle) => void;
}) {
  function startingAnswer() {
    const initial = initialAnswer(puzzle);
    return initial.kind === 'assay' && inspected ? { ...initial, inspected } : initial;
  }
  const [answer, setAnswer] = useState(startingAnswer);
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

  function changeAnswer(next: Answer) {
    setAnswer(next);
    if (result && !result.correct) setResult(null);
  }

  function replay() {
    setAnswer(startingAnswer());
    setResult(null);
    setPractice(true);
    exercise.current?.focus();
  }

  return (
    <section className="challenge lab-bench" aria-labelledby="challenge-title">
      <header className="challenge-heading">
        <span className="challenge-tag">{instrumentNames[puzzle.kind]}</span>
        <h2 id="challenge-title" ref={exercise} tabIndex={-1}>{puzzle.title}</h2>
        <div className="challenge-prompt">{puzzle.prompt.map((paragraph, index) => (
          <p key={paragraph} className={index === puzzle.prompt.length - 1 ? 'bench-question' : undefined}>{paragraph}</p>
        ))}</div>
      </header>
      {showInstrument && puzzle.table && <DataTable table={puzzle.table} />}
      <form className="challenge-form" aria-label={puzzle.title} onSubmit={submit}>
        {showInstrument && <Instrument puzzle={puzzle} answer={answer} onChange={changeAnswer} fieldSamples={Boolean(inspected)} />}
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
          </div>
        )}
        <div className="challenge-actions">
          {showInstrument && <button type="submit" className="button primary">送出驗收 <Icon name="arrow" size={18} /></button>}
          {showInstrument && hints < puzzle.hints.length && (
            <button type="button" className="button hint-button" onClick={() => onHint(puzzle)}><Icon name="hint" size={18} />{hints > 0 ? '下一則提示' : '顯示提示'} <span>{hints}/{puzzle.hints.length}</span></button>
          )}
          {solved && !practice && (
            <>
              <button type="button" className="button primary" onClick={onReturn}>返回現場 <Icon name="arrow" size={18} /></button>
              <button type="button" className="button" onClick={replay}>重新演練</button>
            </>
          )}
          {solved && practice && <button type="button" className="button" onClick={() => { setResult(null); setPractice(false); }}>結束演練</button>}
        </div>
      </form>
    </section>
  );
}
