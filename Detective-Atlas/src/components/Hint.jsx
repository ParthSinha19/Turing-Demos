import React from 'react';
import { Lightbulb } from 'lucide-react';
import Character from './Characters';

// <HintPanel hints={[…]} level={n} onReveal={fn} companion="fern" />
// `level` = how many hints are revealed. Lift it into game state if you want it persisted.
export default function HintPanel({ hints, level, onReveal, companion = 'fern' }) {
  return (
    <div className="hint-panel" data-component="HintPanel">
      {level > 0 && (
        <ul className="hint-list">
          {hints.slice(0, level).map((h, i) => (
            <li key={i} className="hint-bubble"><Character id={companion} size={46} bust expression="happy" /><span>{h}</span></li>
          ))}
        </ul>
      )}
      <button className="hint-btn" onClick={onReveal} disabled={level >= hints.length} data-id="hint-button">
        <Lightbulb size={18} /> {level >= hints.length ? 'No more hints' : level === 0 ? 'Need a hint?' : 'Another hint'} <em>{level}/{hints.length}</em>
      </button>
    </div>
  );
}
