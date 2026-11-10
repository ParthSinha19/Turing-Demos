import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, Search, BookOpen, Lightbulb, CheckCircle2, Radio, MousePointerClick, Sparkles, Wrench } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import { DialogueStage } from '../components/Dialogue';
import { GlitchSigil, HudPanel, HudButton } from '../components/Hud';
import { useGame } from '../state/GameContext';

// Opening briefing, played once after the detective is created:
// customise → intro → hq.  Steps are plain data, so it is easy to edit the words.
const STORY = [
  {
    kind: 'story', env: 'forestExplore', glitch: 0, realm: 'forest', visual: 'helpers',
    tag: 'Long, long ago', title: 'A world full of helpers',
    text: 'Clever computer helpers were built to look after the world. They are called AI. An AI learns by looking at lots of information and spotting patterns.',
  },
  {
    kind: 'story', env: 'spaceExplore', glitch: 0, realm: 'space', visual: 'network',
    tag: 'Far above the trees', title: 'A secret network',
    text: 'Some helpers watched the forest. Others watched the stars. They all talked to each other through a secret network of signals, even across space.',
  },
  {
    kind: 'story', env: 'forestExplore', glitch: 2, realm: 'forest', visual: 'glitch',
    tag: 'But then…', title: 'Something went wrong',
    text: 'A strange signal appeared. Records got mixed up. The helpers began making mistakes. People call it THE GLITCH. Nobody knows what it is, or what it wants.',
  },
  { kind: 'talk', env: 'forestExplore', glitch: 1, realm: 'forest' },
  { kind: 'mission', env: 'hq', glitch: 0, realm: 'hq' },
];

const talkLines = (name) => [
  { speaker: 'forest', expression: 'worried', text: `Hello! I am F.O.R.E.S.T., the helper who watches over this forest. I keep getting things wrong, and I do not know why.` },
  { speaker: 'fern', expression: 'happy', text: 'I am Fern! I know every path in these woods. But even I have never seen the forest act this strange.' },
  { speaker: 'forest', expression: 'neutral', text: 'You look like someone who notices things. Will you help us investigate?' },
  { speaker: 'detective', expression: 'happy', text: `I am Detective ${name}. A mistake is just a mystery waiting to be solved. Let us find out what is going on!` },
];

function HelpersVisual() {
  return (
    <div className="intro-visual" aria-hidden>
      <Character id="forest" size={230} expression="happy" />
    </div>
  );
}
function NetworkVisual() {
  const pts = [[40, 120], [150, 60], [270, 110], [390, 50], [500, 120]];
  return (
    <div className="intro-visual intro-net" aria-hidden>
      <svg viewBox="0 0 540 170" width="100%" height="100%">
        {pts.slice(1).map((p, i) => <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} className="net-line" style={{ animationDelay: `${i * 0.35}s` }} />)}
        {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="14" className="net-halo" style={{ animationDelay: `${i * 0.35}s` }} /><circle cx={x} cy={y} r="7" className="net-node" /></g>)}
      </svg>
    </div>
  );
}
function GlitchVisual() {
  return <div className="intro-visual"><GlitchSigil size={150} className="intro-sigil" /></div>;
}
const VISUALS = { helpers: HelpersVisual, network: NetworkVisual, glitch: GlitchVisual };

const GOALS = [
  [Search, 'Investigate', 'Find clues hidden in the forest, then in space.'],
  [Wrench, 'Help the helpers', 'Show the AI helpers where their information went wrong.'],
  [Radio, 'Follow the signal', 'Every clue connects to a bigger mystery.'],
];
const HOW = [
  [MousePointerClick, 'Tap the glowing spots', 'They hide clues for your evidence collection.'],
  [Sparkles, 'Solve the puzzle', 'Use your clues to fix what is broken.'],
  [Lightbulb, 'Stuck? Ask for a hint', 'Fern is always happy to nudge you.'],
  [BookOpen, 'Check your notebook', 'It keeps everything you discover.'],
];

export default function Intro() {
  const { state, go, dispatch } = useGame();
  const [i, setI] = useState(0);
  const step = STORY[i];
  const finish = () => { dispatch({ type: 'FLAG', flag: 'intro-seen' }); go('hq'); };
  const next = () => (i + 1 >= STORY.length ? finish() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));

  useEffect(() => {
    const onKey = (e) => {
      if (step.kind !== 'story') return;
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }); // eslint-disable-line

  const Visual = VISUALS[step.visual];
  return (
    <div className={`screen intro intro-${step.kind}`} data-screen="Intro" data-realm={step.realm}>
      <Environment id={step.env} glitch={step.glitch} level={1} key={step.env + step.glitch}>
        {step.kind === 'story' && (
          <div className="intro-stage" key={i}>
            {Visual && <Visual />}
            <HudPanel className="intro-card" tag={step.tag} data-component="IntroCard">
              <h2>{step.title}</h2>
              <p>{step.text}</p>
              <footer className="intro-nav">
                <HudButton ghost small onClick={back} disabled={i === 0}><ArrowLeft size={16} /> Back</HudButton>
                <div className="intro-dots" aria-label={`Part ${i + 1} of ${STORY.length}`}>{STORY.map((_, k) => <i key={k} className={k === i ? 'on' : k < i ? 'seen' : ''} />)}</div>
                <HudButton primary onClick={next} data-id="intro-next">Next <ArrowRight size={18} /></HudButton>
              </footer>
            </HudPanel>
          </div>
        )}

        {step.kind === 'talk' && <DialogueStage lines={talkLines(state.player.name || 'Detective')} companion="fern" onDone={next} />}

        {step.kind === 'mission' && (
          <div className="intro-stage" key={i}>
            <HudPanel className="intro-card intro-mission" tag="Case briefing" data-component="MissionBriefing">
              <h2>Your mission, Detective {state.player.name}</h2>
              <div className="brief-cols">
                <div>
                  <h4>What you will do</h4>
                  <ul>{GOALS.map(([Icon, t, d]) => <li key={t}><Icon size={20} /><span><b>{t}</b>{d}</span></li>)}</ul>
                </div>
                <div>
                  <h4>How to play</h4>
                  <ul>{HOW.map(([Icon, t, d]) => <li key={t}><Icon size={20} /><span><b>{t}</b>{d}</span></li>)}</ul>
                </div>
              </div>
              <p className="brief-tip"><CheckCircle2 size={18} /> Remember: AI helpers can make mistakes. A good detective checks the evidence!</p>
              <footer className="intro-nav">
                <HudButton ghost small onClick={back}><ArrowLeft size={16} /> Back</HudButton>
                <HudButton primary onClick={finish} data-id="intro-start">Start the investigation <ArrowRight size={18} /></HudButton>
              </footer>
            </HudPanel>
          </div>
        )}
      </Environment>
      <button className="skip-btn" onClick={finish}><SkipForward size={16} /> Skip intro</button>
    </div>
  );
}