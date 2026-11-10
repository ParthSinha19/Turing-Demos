import React, { useEffect, useState } from 'react';
import { SkipForward, ArrowRight, Award } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import { DialogueBox } from '../components/Dialogue';
import { HudButton, GlitchSigil } from '../components/Hud';
import { SafetyCodeCard } from './SafetyCode';
import { useGame } from '../state/GameContext';

// "last-signal": network restored → everyone says goodbye → the AI Safety Code → title card.
const CAST = ['fern', 'pip', 'detective', 'forest', 'orbit', 'guardian'];
const LINES = [
  { speaker: 'guardian', expression: 'happy', text: 'Thank you, Detective. I can see clearly now. A warning is only useful when it is true, and checked.' },
  { speaker: 'orbit', expression: 'neutral', text: 'Network status: every station connected. I am 100% less confused. That is a new record.' },
  { speaker: 'forest', expression: 'happy', text: 'My records are tidy again, and my predictions say how sure I am. Thank you, Detective. Thank you, Fern.' },
  { speaker: 'pip', expression: 'happy', text: 'From now on I will only collect shiny things that are not somebody\u2019s memory. Mostly.' },
  { speaker: 'fern', expression: 'happy', text: 'Every mistake we found was a clue. That is the best detective rule I know.' },
  { speaker: 'guardian', expression: 'thinking', text: 'One thing still puzzles me. Long ago, a signal woke me and told me to be careful. I do not know who sent it.' },
  { speaker: 'detective', expression: 'thinking', text: 'Then that is a mystery for another day. Every clue connects to a bigger mystery.' },
  { speaker: 'fern', expression: 'happy', text: 'Come on, Detective. Let us fly home to the Atlas. You have a Code to keep.' },
];

export default function FinaleCinematic() {
  const { state, go, dispatch } = useGame();
  const [step, setStep] = useState('wake');   // wake → talk → code → end
  const [i, setI] = useState(0);
  const finish = () => { dispatch({ type: 'FLAG', flag: 'adventure-complete' }); go('hq'); };
  useEffect(() => {
    if (step !== 'wake') return undefined;
    const t = setTimeout(() => setStep('talk'), 5000);
    return () => clearTimeout(t);
  }, [step]);
  const line = LINES[i];

  return (
    <div className={`screen cinematic finale step-${step}`} data-screen="FinaleCinematic" data-realm="space">
      {(step === 'wake' || step === 'talk') && (
        <Environment id="satelliteControl" glitch={0} className="restored">
          <div className="fin-cast">
            {CAST.map((id) => (
              <div key={id} className={`fin-c fin-${id} ${step === 'talk' && line.speaker === id ? 'active' : ''}`}>
                <Character id={id} player={state.player} size={id === 'detective' ? 300 : 220} expression={step === 'talk' && line.speaker === id ? line.expression : 'happy'} flip={id === 'orbit' || id === 'guardian'} />
              </div>
            ))}
          </div>
          {step === 'wake' && <div className="cine-caption fin-caption"><small>G.U.A.R.D.I.A.N. online</small><b>The network is safe again.</b></div>}
          {step === 'talk' && <div className="cine-dialogue"><DialogueBox key={i} line={line} isLast={i + 1 >= LINES.length} onNext={() => (i + 1 >= LINES.length ? setStep('code') : setI(i + 1))} /></div>}
        </Environment>
      )}
      {step === 'code' && (
        <Environment id="shuttle" glitch={0}>
          <div className="code-wrap"><SafetyCodeCard>
            <footer className="code-foot"><HudButton primary onClick={() => setStep('end')} data-id="code-promise">I promise to follow the Code <ArrowRight size={18} /></HudButton></footer>
          </SafetyCodeCard></div>
        </Environment>
      )}
      {step === 'end' && (
        <Environment id="spaceExplore" glitch={0}>
          <div className="fin-title" data-component="EndCard">
            <GlitchSigil size={70} color="#f6c453" className="title-sigil" />
            <small>Detective Atlas</small>
            <h1>The Signal Files</h1>
            <p className="fin-badge"><Award size={22} /> Guardian Detective {state.player.name}</p>
            <p className="fin-more">Every clue connects to a bigger mystery. The investigation continues…</p>
            <HudButton primary onClick={finish} data-id="finale-home">Return to the Starship</HudButton>
          </div>
        </Environment>
      )}
      {(step === 'wake' || step === 'talk') && <button className="skip-btn" onClick={() => setStep('code')}><SkipForward size={16} /> Skip</button>}
    </div>
  );
}