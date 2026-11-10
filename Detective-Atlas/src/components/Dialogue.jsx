import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import Character from './Characters';
import { CHARACTERS } from '../data/characters';
import { useGame } from '../state/GameContext';

const SPEED = { slow: 48, normal: 26, fast: 10, instant: 0 };

function useTypewriter(text, speed) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (!speed) { setN(text.length); return undefined; }
    const t = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(t); return v; } return v + 1; }), speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return { shown: text.slice(0, n), done: n >= text.length, finish: () => setN(text.length) };
}

// <DialogueBox line={{speaker,expression,text}} onNext={fn} isLast />
export function DialogueBox({ line, onNext, isLast, player }) {
  const { state } = useGame();
  const ch = CHARACTERS[line.speaker];
  const name = line.speaker === 'detective' ? state.player.name : ch.name;
  const { shown, done, finish } = useTypewriter(line.text, SPEED[state.settings.textSpeed]);
  return (
    <div className={`dialogue hud speaker-${line.speaker}`} style={{ '--who': ch.color }} data-component="DialogueBox" onClick={() => (done ? onNext() : finish())} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (done ? onNext() : finish())}>
      <div className="dlg-portrait"><Character id={line.speaker} expression={line.expression} size={118} bust player={player || state.player} /></div>
      <div className="dlg-main">
        <div className="dlg-name">{name}<small>{ch.role}</small></div>
        <p className={line.speaker === 'glitch' ? 'glitch-text' : ''}>{shown}<span className="caret" /></p>
      </div>
      <button className={`dlg-next ${done ? 'ready' : ''}`} aria-label={isLast ? 'Finish' : 'Next'}>{isLast ? 'Go' : <ChevronRight size={22} />}</button>
    </div>
  );
}

// <DialogueStage lines={[…]} onDone={fn} /> — full intro scene: characters on stage + box.
export function DialogueStage({ lines, onDone, companion = 'fern' }) {
  const { state } = useGame();
  const [i, setI] = useState(0);
  const line = lines[i];
  const speakers = useRef([...new Set(['detective', companion, ...lines.map((l) => l.speaker)])].slice(0, 4)).current;
  const next = () => (i + 1 >= lines.length ? onDone() : setI(i + 1));
  return (
    <div className="dialogue-stage" data-component="DialogueStage">
      <div className="stage-cast">
        {speakers.map((id, k) => (
          <div key={id} className={`cast cast-${k} ${line.speaker === id ? 'active' : ''}`}>
            <Character id={id} size={id === 'detective' ? 340 : id === 'fern' ? 250 : 280} expression={line.speaker === id ? line.expression : 'neutral'} player={state.player} flip={k === 0 ? false : k % 2 === 1} glitchy />
          </div>
        ))}
      </div>
      <DialogueBox key={i} line={line} onNext={next} isLast={i + 1 >= lines.length} />
    </div>
  );
}
