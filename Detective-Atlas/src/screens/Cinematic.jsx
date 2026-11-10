import React, { useEffect, useState } from 'react';
import { SkipForward, Rocket } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import { DialogueBox } from '../components/Dialogue';
import { GlitchSigil, HudButton } from '../components/Hud';
import { PineRow, Stars, Layer } from '../scenes/util';
import { useGame } from '../state/GameContext';
import { getMission } from '../data/missions';
import FinaleCinematic from './FinaleCinematic';

// Picks the right cinematic. "forest-to-space" is the default; "last-signal" ends the adventure.
export default function Cinematic() {
  const { state } = useGame();
  return getMission(state.activeMissionId)?.cinematic === 'last-signal' ? <FinaleCinematic /> : <ForestToSpace />;
}

// forest restored → transmission → Pip's shard → board the shuttle → launch → flight → arrive → space-1 begins.
const TX = ['INCOMING TRANSMISSION', 'SOURCE: UNKNOWN', 'ORIGIN: ORBITAL NETWORK', 'MESSAGE: ...HELP... SYSTEM FAILURE... SIGNAL CORRUPTED...'];
const PIP_LINES = [
  { speaker: 'pip', expression: 'surprised', text: 'That symbol! I have seen it. One of my shiny things has it!' },
  { speaker: 'pip', expression: 'worried', text: 'It fell out of the sky last week. I thought it was a star.' },
  { speaker: 'detective', expression: 'thinking', text: 'Then the mystery did not start in the forest. It started up there.' },
  { speaker: 'fern', expression: 'happy', text: 'Then we are going up. Hold on to your hat, Detective!' },
];
const BOARD_LINES = [
  { speaker: 'forest', expression: 'neutral', text: 'Beneath the Memory Tree sleeps an old research shuttle. It was built to reach the orbital network. I have just woken its engines.' },
  { speaker: 'fern', expression: 'happy', text: 'A real spaceship! Seatbelts on, everyone. Pip, that means you too.' },
  { speaker: 'pip', expression: 'happy', text: 'Can I bring the shard? It is my favourite shiny thing in the whole sky!' },
  { speaker: 'detective', expression: 'happy', text: 'Systems check done. Let us follow the signal!' },
];

function Shuttle() {
  return (
    <svg viewBox="0 0 120 260" width="120" height="260" aria-hidden>
      <path d="M60 4 Q92 50 92 120 V190 H28 V120 Q28 50 60 4Z" fill="#dfe8ff" stroke="#6d8bff" strokeWidth="3" />
      <circle cx="60" cy="96" r="16" fill="#0b1030" stroke="#5ee7ff" strokeWidth="4" /><circle cx="60" cy="96" r="7" fill="#5ee7ff" opacity=".6" />
      <path d="M28 150 L2 214 L28 196Z M92 150 L118 214 L92 196Z" fill="#ff6b6b" stroke="#a02c2c" strokeWidth="2" />
      <rect x="44" y="190" width="32" height="14" fill="#6d8bff" />
      <path className="fl-flame" d="M46 204 Q60 280 74 204Z" fill="#ffb347" /><path className="fl-flame" d="M52 204 Q60 250 68 204Z" fill="#fff3cf" />
    </svg>
  );
}

function ForestToSpace() {
  const { state, startMission } = useGame();
  const [step, setStep] = useState('restored');   // restored → transmission → shard → board → ready → countdown → flight → arrive
  const [txLine, setTx] = useState(0);
  const [pl, setPl] = useState(0);
  const [bl, setBl] = useState(0);
  const [count, setCount] = useState(3);
  const finish = () => { startMission('space-1', 'none'); };

  useEffect(() => {
    let t;
    if (step === 'restored') t = setTimeout(() => setStep('transmission'), 4200);
    if (step === 'flight') t = setTimeout(() => setStep('arrive'), 7600);
    if (step === 'arrive') t = setTimeout(finish, 4200);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line
  useEffect(() => {
    if (step !== 'transmission') return undefined;
    if (txLine >= TX.length) { const t = setTimeout(() => setStep('shard'), 2400); return () => clearTimeout(t); }
    const t = setTimeout(() => setTx((v) => v + 1), txLine === 0 ? 900 : 1100);
    return () => clearTimeout(t);
  }, [step, txLine]);
  useEffect(() => {
    if (step !== 'countdown') return undefined;
    if (count === 0) { const t = setTimeout(() => setStep('flight'), 900); return () => clearTimeout(t); }
    const t = setTimeout(() => setCount((v) => v - 1), 900);
    return () => clearTimeout(t);
  }, [step, count]);

  const inForest = ['restored', 'transmission', 'shard'].includes(step);
  const cabin = ['board', 'ready', 'countdown'].includes(step);
  const cast = (expr, pipExpr) => (
    <div className="cine-cast">
      <Character id="detective" player={state.player} size={320} expression={expr} />
      <Character id="fern" size={210} expression={expr} flip />
      <Character id="pip" size={190} expression={pipExpr || expr} flip />
    </div>
  );

  return (
    <div className={`screen cinematic step-${step}`} data-screen="Cinematic" data-realm={inForest ? 'forest' : 'space'}>
      {inForest && (
        <Environment id="memoryTree" glitch={step === 'transmission' ? 2 : 0} className={step === 'restored' ? 'restored' : ''}>
          {cast(step === 'restored' ? 'happy' : 'surprised', step === 'shard' ? PIP_LINES[pl].expression : undefined)}
          {step === 'restored' && <div className="cine-caption"><small>F.O.R.E.S.T. online</small><b>The forest remembers again.</b></div>}
          {step === 'transmission' && (
            <div className="terminal hud" data-component="TransmissionTerminal">
              <GlitchSigil size={54} className="term-sigil" />
              <pre>{TX.slice(0, txLine).map((l, i) => <span key={i} className={i === 0 ? 'hdr' : i === 3 ? 'msg' : ''}>{l}{'\n'}</span>)}<i className="caret" /></pre>
            </div>
          )}
          {step === 'shard' && (
            <>
              <div className="shard-hold"><GlitchSigil size={120} className="shard-sigil" /><span>Sky Shard</span></div>
              <div className="cine-dialogue"><DialogueBox key={pl} line={PIP_LINES[pl]} isLast={pl + 1 >= PIP_LINES.length} onNext={() => (pl + 1 >= PIP_LINES.length ? setStep('board') : setPl(pl + 1))} /></div>
            </>
          )}
        </Environment>
      )}

      {cabin && (
        <Environment id="shuttle" glitch={0}>
          {cast('happy', 'happy')}
          {step === 'board' && <div className="cine-dialogue"><DialogueBox key={bl} line={BOARD_LINES[bl]} isLast={bl + 1 >= BOARD_LINES.length} onNext={() => (bl + 1 >= BOARD_LINES.length ? setStep('ready') : setBl(bl + 1))} /></div>}
          {step === 'ready' && (
            <div className="launch-panel hud" data-component="LaunchPanel">
              <small>Starship Atlas</small><b>All systems ready</b>
              <ul><li>Seatbelts on</li><li>Engines warm</li><li>Signal locked</li></ul>
              <HudButton primary onClick={() => { setCount(3); setStep('countdown'); }} data-id="launch-button"><Rocket size={18} /> Launch!</HudButton>
            </div>
          )}
          {step === 'countdown' && <div className="countdown" aria-live="assertive" key={count}>{count > 0 ? count : 'Lift-off!'}</div>}
        </Environment>
      )}

      {step === 'flight' && (
        <div className="flight" data-component="ShuttleLaunch">
          <div className="fl-sky" />
          <div className="fl-stars"><Layer d={0}><Stars seed={4} n={170} /></Layer></div>
          <div className="fl-ground"><svg viewBox="0 0 1600 320" preserveAspectRatio="none"><rect y="230" width="1600" height="90" fill="#0b2a28" /><PineRow seed={3} n={16} y={250} hmin={140} hmax={260} fill="#0d3b34" jitter={30} /></svg></div>
          <div className="fl-streaks" />
          <div className="fl-earth" />
          <div className="fl-shuttle"><Shuttle /></div>
          <div className="fl-caps"><b className="c1">Lift-off!</b><b className="c2">Leaving the forest</b><b className="c3">Entering orbit</b></div>
        </div>
      )}
      {step === 'arrive' && (
        <Environment id="spaceExplore" glitch={2}>
          <div className="arrive-cap" data-component="ArrivalCaption"><small>Orbital Network</small><b>Signal source: unknown</b><span>Docking with the abandoned station…</span></div>
        </Environment>
      )}
      <button className="skip-btn" onClick={finish}><SkipForward size={16} /> Skip</button>
    </div>
  );
}