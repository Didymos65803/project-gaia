import { useEffect, useState } from 'react';
import { Notebook, Settings } from './components/Dialogs';
import { Mission } from './components/Mission';
import { Header, Home, Report } from './components/Scene';
import { chapters } from './data/chapters';
import { finale } from './data/finale';
import { teacherConfig } from './data/settings';
import type { Chapter, Puzzle } from './data/types';
import { chapterStatus, countSolved, currentPuzzle, decodeProgress, freshProgress, puzzleIsOpen, recordAttempt, recordHint, storageKey } from './engine/progress';

const sections = [...chapters, finale];
const chapterIds = chapters.map(chapter => chapter.id);

function readSave() {
  try {
    return decodeProgress(window.localStorage.getItem(storageKey), sections, chapterIds);
  } catch {
    return freshProgress();
  }
}

export function App() {
  const [progress, setProgress] = useState(readSave);
  const [saved, setSaved] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash);
  const [dialog, setDialog] = useState<'notebook' | 'settings' | null>(null);
  const locks = teacherConfig.lockedChapters;
  const finaleOpen = chapters.every(chapter => chapterStatus(progress, chapters, chapter.id, locks) === 'restored');
  const reportOpen = finaleOpen && countSolved(progress, finale) === finale.puzzles.length;
  const [, sectionId, stepId] = route.match(/^#\/area\/([a-z0-9-]+)\/([a-z0-9-]+)$/) ?? [];
  const chapter = sections.find(section => section.id === sectionId);
  const status = chapterStatus(progress, chapters, sectionId, locks);
  const open = chapter && (chapter === finale ? finaleOpen : status === 'available' || status === 'restored');
  const puzzle = open && puzzleIsOpen(progress, chapter, stepId) ? chapter.puzzles.find(item => item.id === stepId) : undefined;
  const screen = open && puzzle ? route : route === '#/report' && reportOpen ? '#/report' : '';
  const pageIsReport = screen === '#/report';

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(progress));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [progress]);

  useEffect(() => {
    const update = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    if (!screen && !route) return;
    window.scrollTo(0, 0);
    document.getElementById('page-heading')?.focus({ preventScroll: true });
  }, [screen, route]);

  function navigate(hash: string) {
    if (window.location.hash !== hash) window.location.hash = hash;
    setRoute(hash);
  }

  const goMap = () => navigate('#/');
  const goReport = () => navigate('#/report');
  const openSection = (section: Chapter, step = currentPuzzle(progress, section)) => navigate(`#/area/${section.id}/${step.id}`);
  const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
  const stepIndex = chapter && puzzle ? chapter.puzzles.indexOf(puzzle) : -1;
  const nextStep = chapter?.puzzles[stepIndex + 1];
  const nextSection = chapters[chapterIndex + 1];
  const nextStatus = nextSection ? chapterStatus(progress, chapters, nextSection.id, locks) : 'unavailable';
  const continuation = chapter && nextStep
    ? { label: '進入下一步', run: () => openSection(chapter, nextStep) }
    : chapter === finale
      ? { label: '查看結案報告', run: goReport }
      : nextSection && (nextStatus === 'available' || nextStatus === 'restored')
        ? { label: '前往下一研究區', run: () => openSection(nextSection) }
        : finaleOpen ? { label: '前往中央指揮台', run: () => openSection(finale) }
          : { label: '返回研究站地圖', run: goMap };

  function addAttempt(step: Puzzle, correct: boolean) {
    setProgress(previous => recordAttempt(previous, step, correct));
  }

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault();
        document.getElementById('main-content')?.focus();
      }}>跳至遊戲內容</a>
      <Header saved={saved} onMap={goMap} onNotebook={() => setDialog('notebook')} onSettings={() => setDialog('settings')} />
      <main id="main-content" className="frame main-frame" tabIndex={-1}>
        {pageIsReport
          ? <Report chapters={chapters} finale={finale} progress={progress} onMap={goMap} onNotebook={() => setDialog('notebook')} />
          : screen && chapter && puzzle
            ? <Mission chapter={chapter} puzzle={puzzle} progress={progress} chapterIndex={chapterIndex} continuation={continuation} onAttempt={addAttempt}
                onHint={step => setProgress(previous => recordHint(previous, step))} onSelect={step => openSection(chapter, step)} onMap={goMap} onNotebook={() => setDialog('notebook')} />
            : <Home chapters={chapters} finale={finale} progress={progress} locks={locks} finaleOpen={finaleOpen} reportOpen={reportOpen} onOpen={openSection} onReport={goReport} />}
      </main>
      <footer className="frame site-footer"><span>PROJECT GAIA</span><span>進階六年級 · 跨領域科學任務</span></footer>
      {dialog === 'notebook' && <Notebook sections={sections} selectedId={puzzle && chapter ? chapter.id : pageIsReport ? finale.id : undefined} progress={progress}
        onNote={(id, note) => setProgress(previous => ({ ...previous, notes: { ...previous.notes, [id]: note } }))} onClose={() => setDialog(null)} />}
      {dialog === 'settings' && <Settings chapters={chapters} localLocks={progress.localLocks} teacherLocks={locks}
        onLock={(id, locked) => setProgress(previous => ({
          ...previous,
          localLocks: locked ? [...new Set([...previous.localLocks, id])] : previous.localLocks.filter(lockedId => lockedId !== id),
        }))}
        onReset={() => { setProgress(previous => freshProgress(previous.localLocks)); goMap(); }}
        onClose={() => setDialog(null)} />}
    </>
  );
}
