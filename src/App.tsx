import { useEffect, useMemo, useState } from 'react';
import { Notebook, Settings } from './components/Dialogs';
import { Header, Report } from './components/Scene';
import { Station } from './components/station/Station';
import { chapters } from './data/chapters';
import { finale } from './data/finale';
import { teacherConfig } from './data/settings';
import { roomData } from './data/station';
import type { Puzzle } from './data/types';
import { decodeExpedition, freshExpedition, openSectionIds } from './engine/expedition';
import type { Expedition } from './engine/expedition';
import { sectorAt } from './engine/map';
import { decodeProgress, freshProgress, recordAttempt, recordHint, storageKey } from './engine/progress';

const sections = [...chapters, finale];
const chapterIds = chapters.map(chapter => chapter.id);

function readSave() {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    // The game can still run without persisted progress.
  }
  const progress = decodeProgress(raw, sections, chapterIds);
  return { progress, expedition: decodeExpedition(raw, progress, sections) };
}

export function App() {
  const [game, setGame] = useState(readSave);
  const [session, setSession] = useState(0);
  const [saved, setSaved] = useState(true);
  const [reportRoute, setReportRoute] = useState(() => window.location.hash === '#/report');
  const [dialog, setDialog] = useState<'notebook' | 'settings' | null>(null);
  const { progress, expedition } = game;
  const teacherLocks = teacherConfig.lockedChapters;
  const locks = useMemo(() => [...new Set([...teacherLocks, ...progress.localLocks])], [teacherLocks, progress.localLocks]);
  const open = useMemo(() => openSectionIds(sections, expedition.powered, locks), [expedition.powered, locks]);
  const report = reportRoute && open.includes(finale.id) && expedition.powered.includes(finale.id);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ ...progress, expedition }));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [progress, expedition]);

  useEffect(() => {
    const update = () => setReportRoute(window.location.hash === '#/report');
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  function setReport(show: boolean) {
    const hash = show ? '#/report' : '#/';
    if (window.location.hash !== hash) window.location.hash = hash;
    setReportRoute(show);
    window.scrollTo({ top: 0 });
  }

  function checkpoint(update: (previous: Expedition) => Expedition) {
    setGame(previous => {
      const next = update(previous.expedition);
      return next === previous.expedition ? previous : { ...previous, expedition: next };
    });
  }

  function attempt(puzzle: Puzzle, correct: boolean) {
    setGame(previous => ({
      progress: recordAttempt(previous.progress, puzzle, correct),
      expedition: correct && previous.expedition.field?.puzzleId === puzzle.id
        ? { ...previous.expedition, field: null }
        : previous.expedition,
    }));
  }

  function hint(puzzle: Puzzle) {
    setGame(previous => ({ ...previous, progress: recordHint(previous.progress, puzzle) }));
  }

  const notebookSection = report ? finale.id : expedition.position ? sectorAt(expedition.position)?.id : undefined;
  const archives = Object.fromEntries(expedition.archives.map(id => [id, roomData[id].log]));

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>跳至遊戲內容</a>
      <Header saved={saved} onMap={() => setReport(false)} onNotebook={() => setDialog('notebook')} onSettings={() => setDialog('settings')} />
      <main id="main-content" className="frame main-frame" tabIndex={-1}>
        {report
          ? <Report chapters={chapters} finale={finale} progress={progress} onMap={() => setReport(false)} onNotebook={() => setDialog('notebook')} />
          : <Station key={session} sections={sections} progress={progress} expedition={expedition} open={open} locks={locks}
              externalPause={dialog !== null} onExpedition={checkpoint} onAttempt={attempt} onHint={hint} onReport={() => setReport(true)} />}
      </main>
      <footer className="frame site-footer"><span>PROJECT GAIA</span><span>進階六年級 · 跨領域科學任務</span></footer>
      {dialog === 'notebook' && <Notebook sections={sections} selectedId={notebookSection} progress={progress} archives={archives}
        onNote={(id, note) => setGame(previous => ({ ...previous, progress: { ...previous.progress, notes: { ...previous.progress.notes, [id]: note } } }))}
        onClose={() => setDialog(null)} />}
      {dialog === 'settings' && <Settings chapters={chapters} localLocks={progress.localLocks} teacherLocks={teacherLocks}
        onLock={(id, locked) => setGame(previous => {
          const localLocks = previous.progress.localLocks;
          const nextLocks = locked ? [...new Set([...localLocks, id])] : localLocks.filter(lockedId => lockedId !== id);
          const nextExpedition = previous.expedition.core && !openSectionIds(sections, previous.expedition.powered, [...teacherLocks, ...nextLocks]).includes(previous.expedition.core)
            ? { ...previous.expedition, core: null }
            : previous.expedition;
          return { progress: { ...previous.progress, localLocks: nextLocks }, expedition: nextExpedition };
        })}
        onReset={() => {
          setGame(previous => ({ progress: freshProgress(previous.progress.localLocks), expedition: freshExpedition() }));
          setSession(value => value + 1);
          setReport(false);
        }}
        onClose={() => setDialog(null)} />}
    </>
  );
}
