import { useState } from 'react';
import type { CSSProperties } from 'react';
import { roomData } from '../../data/station';
import type { DialogueLine } from '../../data/station';
import type { Chapter, IconName } from '../../data/types';
import { WindowDialog } from '../Dialogs';
import { Icon } from '../Icon';
import { DeviceArt, Suit } from './StationArt';

export type StoryScene = {
  chapter: Chapter;
  title: string;
  lines: DialogueLine[];
  icon: IconName;
  finishLabel: string;
  after?: 'brief' | 'report';
};

export function storyIntroduction(chapter: Chapter): StoryScene {
  const info = roomData[chapter.id];
  return { chapter, title: `進入${info.name}`, lines: info.arrival, icon: chapter.icon, finishLabel: '探索本區' };
}

export function StoryDialog({ scene, onFinish, onClose }: {
  scene: StoryScene;
  onFinish: () => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const { chapter, lines } = scene;
  const info = roomData[chapter.id];
  const beat = lines[page];
  const actor = beat.speaker === 'npc' ? chapter.character.name
    : beat.speaker === 'player' ? '你' : beat.speaker === 'record' ? '拾到的紀錄' : '旁白';
  return (
    <WindowDialog className="story-window" title={scene.title} icon={scene.icon} onClose={onClose}>
      {close => (
        <div className="story-dialog" style={{ '--room-color': info.color } as CSSProperties}>
          <div className="dialog-sprite" aria-hidden="true">
            {beat.speaker === 'npc' ? <Suit variant={chapter.character.initials === 'G' ? 'robot' : 'crew'}/>
              : beat.speaker === 'player' ? <Suit variant="player"/>
                : beat.speaker === 'record' ? <DeviceArt icon="record"/>
                  : <Icon name={chapter.icon} size={31}/>}
          </div>
          <div className="scene-speech" aria-live="polite">
            <span className="scene-room">{info.name}</span>
            <strong>{actor}</strong>
            <p>{beat.text}</p>
          </div>
          <div className="scene-nav">
            {lines.length > 1 && (
              <div className="scene-pages">
                <button type="button" className="button small" disabled={page === 0} onClick={() => setPage(page - 1)}>上一句</button>
                <span aria-label={`第 ${page + 1} 段，共 ${lines.length} 段`}>{page + 1} / {lines.length}</span>
              </div>
            )}
            <button type="button" className="button primary" data-dialog-advance onClick={() => {
              if (page + 1 < lines.length) setPage(page + 1);
              else {
                close();
                onFinish();
              }
            }}>
              {page + 1 === lines.length ? scene.finishLabel : '繼續對話'} <Icon name="arrow" size={19}/>
            </button>
          </div>
        </div>
      )}
    </WindowDialog>
  );
}
