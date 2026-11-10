import React, { useState, useEffect } from 'react';
import { Play, FolderOpen, Settings as Cog } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import { GlitchSigil } from '../components/Hud';
import { useGame } from '../state/GameContext';

const LINES = ['SIGNAL DETECTED\u2026', 'ORIGIN: UNKNOWN', 'EVERY CLUE CONNECTS TO A BIGGER MYSTERY.'];

export default function MainMenu() {
  const { state, go, newGame, openOverlay } = useGame();
  const beginNewGame = () => {
    if (state.hasSave && !window.confirm('Start a new investigation? Your saved cases and discoveries will be erased.')) return;
    newGame();
    go('customise', { kind: 'iris' });
  };
  const continueGame = () => {
    const target = state.screen && state.screen !== 'menu'
      ? state.screen
      : state.activeMissionId ? 'mission' : state.completed.length ? 'hq' : 'customise';
    go(target, { kind: 'none', missionId: state.activeMissionId });
  };
  const [k, setK] = useState(0);
  useEffect(() => { const t = setInterval(() => setK((v) => (v + 1) % LINES.length), 3200); return () => clearInterval(t); }, []);
  return (
    <div className="screen menu" data-screen="MainMenu" data-realm="forest">
      <Environment id="forestExplore" glitch={1}>
        <div className="menu-cast">
          <div className="menu-pip"><Character id="pip" size={170} expression="happy" /></div>
          <div className="menu-fern"><Character id="fern" size={300} expression="happy" flip /></div>
        </div>
        <div className="menu-title">
          <div className="title-sigil"><GlitchSigil size={56} color="#f6c453" /></div>
          <h1><span>Detective</span><span>Atlas</span></h1>
          <h2>The Signal Files</h2>
          <p className="tagline">Every clue connects to a bigger mystery.</p>
          <nav className="menu-nav" aria-label="Main menu">
            <button className="mbtn primary" onClick={beginNewGame}><Play size={20} /> New Game</button>
            <button className="mbtn" disabled={!state.hasSave} onClick={continueGame}><FolderOpen size={20} /> Continue</button>
            <button className="mbtn" onClick={() => openOverlay('settings')}><Cog size={20} /> Settings</button>
          </nav>
        </div>
        <div className="ticker" key={k}><i /> {LINES[k]}</div>
      </Environment>
    </div>
  );
}
