import React, { useEffect, useMemo, useState } from 'react';
import { ALIENS, FEATURE_KEYS, FEATURE_META, STAGES, STAGE4_TRAIN, STAGE4_TEST, STAGE5_TRAIN, STAGE5_TEST, featureValue, humanFeatureValue } from './data/aliens.js';
import { trainKModes, predictCluster, distance, matchMessage } from './cluster.js';

const SAVE_KEY = 'cluster-galaxy-save-v1';
const groupPaint = ['#72e8df', '#ff90c8', '#b7ef72', '#ffc96b', '#a99aff'];
let gameMuted = true;
let audioContext;
function playSound(kind = 'tap') {
  if (gameMuted || typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  try {
    audioContext ||= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const notes = kind === 'complete' ? [523, 659, 784] : kind === 'success' ? [659, 880] : kind === 'train' ? [392, 523] : [520];
    notes.forEach((frequency, index) => {
      const start = audioContext.currentTime + index * (kind === 'complete' ? .075 : .045);
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = kind === 'tap' ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === 'tap' ? .018 : .035, start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .13);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start); oscillator.stop(start + .14);
    });
  } catch { /* audio is decorative; gameplay never depends on it */ }
}

function Icon({ name, size = 18 }) {
  const shared = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    scan: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M4 10.5h13M10.5 4v13"/></>,
    sort: <><path d="M4 6h16M7 12h10M10 18h4"/><path d="m18 9 2 3-2 3"/></>,
    cluster: <><circle cx="7" cy="8" r="3"/><circle cx="17" cy="7" r="2"/><circle cx="14" cy="17" r="3"/><path d="M9 10 12 14M15 8l-1 6M10 7l5 0"/></>,
    lab: <><path d="M9 3h6M10 3v7l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3"/><path d="M8 16h8"/></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>,
    back: <><path d="m14 5-7 7 7 7"/><path d="M7 12h14"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20"/><path d="M8 7h8M8 10h7"/></>,
    speaker: <><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></>,
    mute: <><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="m17 9 4 6m0-6-4 6"/></>,
    arrow: <><path d="M4 12h15M13 5l7 7-7 7"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></>,
    edit: <><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5z"/><path d="m13.5 7 3.5 3.5"/></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"/></>,
    ship: <><path d="M12 3c4 2 6 6 6 11l-6 6-6-6c0-5 2-9 6-11z"/><circle cx="12" cy="10" r="2"/><path d="m6 14-3 2 1 4 5-2M18 14l3 2-1 4-5-2"/></>,
  };
  return <svg {...shared}>{paths[name] || paths.spark}</svg>;
}

function Alien({ alien, size = 'md', selected = false, onClick, draggable = false, onDragStart, compact = false, showName = true }) {
  if (!alien) return null;
  const isRound = alien.shape === 'round';
  const bodyPath = alien.shape === 'round'
    ? 'M24 48 C24 30 36 20 50 20 C66 20 78 32 78 49 C78 66 66 78 50 78 C35 78 24 66 24 48Z'
    : alien.shape === 'oval'
      ? 'M31 50 C31 30 37 20 50 20 C63 20 69 30 69 50 C69 68 63 78 50 78 C37 78 31 68 31 50Z'
      : alien.shape === 'triangle'
        ? 'M50 17 C53 17 55 21 58 27 L78 64 C82 71 78 78 70 78 H30 C22 78 18 71 22 64 L42 27 C45 21 47 17 50 17Z'
        : 'M29 27 H71 Q79 27 79 35 V65 Q79 73 71 73 H29 Q21 73 21 65 V35 Q21 27 29 27Z';
  const eyePositions = alien.eyes === 1 ? [50] : alien.eyes === 2 ? [40, 60] : [33, 50, 67];
  const eyeY = alien.shape === 'triangle' ? 48 : alien.shape === 'square' ? 47 : 46;
  return (
    <button
      type="button"
      className={`alien-card alien-card--${size} ${selected ? 'is-selected' : ''} ${compact ? 'alien-card--compact' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      aria-label={`${alien.name}, ${humanFeatureValue(alien, 'color')} ${humanFeatureValue(alien, 'shape')} alien`}
    >
      <svg className="alien-art" viewBox="0 0 100 100" role="img" aria-label={`${alien.name} alien illustration`}>
        {alien.antennae && <g className="alien-antennae"><path d="M43 24 Q39 13 32 12"/><path d="M57 24 Q61 13 68 12"/><circle cx="31" cy="11" r="3.2"/><circle cx="69" cy="11" r="3.2"/></g>}
        {alien.wings && <g className="alien-wings"><path d="M29 43 C12 33 9 45 18 59 C22 65 27 65 31 61Z"/><path d="M71 43 C88 33 91 45 82 59 C78 65 73 65 69 61Z"/></g>}
        <path className="alien-body" d={bodyPath} fill={alien.colorHex}/>
        <path d={isRound ? 'M31 35 Q40 25 50 27' : 'M34 34 Q44 28 50 27'} className="alien-shine"/>
        {alien.spots && <g className="alien-spots"><circle cx="34" cy="58" r="3"/><circle cx="67" cy="61" r="2.4"/><circle cx="64" cy="34" r="2"/></g>}
        <g className="alien-eyes">{eyePositions.map((x, i) => <g key={i}><ellipse cx={x} cy={eyeY} rx={alien.eyes === 3 ? 4.2 : 5.2} ry="6" fill="#fffdf8"/><ellipse cx={x + 1} cy={eyeY + 1} rx="2.3" ry="3.2" fill="#242044"/><circle cx={x + 1.5} cy={eyeY - 0.5} r=".9" fill="white"/></g>)}</g>
        <path className="alien-mouth" d={alien.mark % 2 === 0 ? 'M44 59 Q50 64 56 59' : 'M45 60 Q50 57 55 60'}/>
        {alien.cheek && <g className="alien-cheeks"><ellipse cx="33" cy="57" rx="4" ry="2.3"/><ellipse cx="67" cy="57" rx="4" ry="2.3"/></g>}
        {alien.mark === 1 && <path className="alien-mark" d="M43 31 Q50 26 57 31"/>}
        {alien.mark === 2 && <path className="alien-mark" d="M46 68l4-4 4 4"/>}
      </svg>
      {showName && <span className="alien-name">{alien.name}</span>}
      {selected && <span className="alien-selected-check"><Icon name="check" size={12}/></span>}
    </button>
  );
}

function SpaceShip({ large = false }) {
  return <svg className={`ship-art ${large ? 'ship-art--large' : ''}`} viewBox="0 0 240 200" aria-label="The Discovery spaceship" role="img">
    <defs><linearGradient id="shipGlass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#a0f6f3"/><stop offset="1" stopColor="#7e8cff"/></linearGradient><linearGradient id="shipBody" x1="0" x2="1"><stop offset="0" stopColor="#eef0ff"/><stop offset="1" stopColor="#a5a9f8"/></linearGradient></defs>
    <ellipse cx="120" cy="174" rx="66" ry="9" fill="#8d7fff" opacity=".16"/>
    <path d="M90 111 45 145 58 91 91 81Z" fill="#f0a7e4" stroke="#514b91" strokeWidth="4" strokeLinejoin="round"/><path d="m150 111 45 34-13-54-33-10Z" fill="#8ee8e2" stroke="#514b91" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M120 16C89 39 69 73 75 123c3 23 21 39 45 39s42-16 45-39c6-50-14-84-45-107Z" fill="url(#shipBody)" stroke="#514b91" strokeWidth="4"/>
    <path d="M120 31c-18 17-28 37-29 59h58c-1-22-11-42-29-59Z" fill="url(#shipGlass)" stroke="#514b91" strokeWidth="3"/>
    <circle cx="120" cy="67" r="13" fill="#faf8ff" stroke="#4b4783" strokeWidth="3"/><circle cx="116" cy="65" r="3.4" fill="#34305e"/><circle cx="125" cy="65" r="3.4" fill="#34305e"/><path d="M115 72q5 5 10 0" fill="none" stroke="#34305e" strokeWidth="2" strokeLinecap="round"/>
    <path d="M102 145 111 170 120 158 129 170 138 145" fill="#ffa86c" stroke="#514b91" strokeWidth="3" strokeLinejoin="round"/><path d="M108 151 114 163 120 153 126 163 132 151" fill="#fff0a1"/>
    <circle cx="83" cy="111" r="4" fill="#ffd37e"/><circle cx="157" cy="111" r="4" fill="#ffd37e"/>
    <path d="M90 123q-14 3-17 15M150 123q14 3 17 15" fill="none" stroke="#514b91" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}

function PlanetArt({ index = 0, locked = false, small = false }) {
  const palette = [ ['#5fe1d7','#638dff'], ['#ff9c71','#d66be6'], ['#fb8dc9','#7d75e7'], ['#8db0ff','#4e6bd2'], ['#ffc875','#c28af7'] ][index % 5];
  return <svg className={`planet-art ${small ? 'planet-art--small' : ''} ${locked ? 'planet-art--locked' : ''}`} viewBox="0 0 150 120" aria-hidden="true">
    <ellipse cx="76" cy="91" rx="49" ry="7" fill="#080b29" opacity=".3"/>
    <ellipse cx="75" cy="65" rx="57" ry="14" transform="rotate(-18 75 65)" fill="none" stroke={palette[0]} strokeWidth="5" opacity=".75"/>
    <circle cx="75" cy="60" r="35" fill={palette[1]}/>
    <path d="M49 47q14-15 29-2t26 0q8 7 4 19t-23 9-23 4-16-30Z" fill={palette[0]} opacity=".9"/>
    <path d="M52 34q15-12 25-6" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".46"/>
    <circle cx="61" cy="55" r="3" fill="#fff" opacity=".28"/><circle cx="92" cy="70" r="5" fill="#171940" opacity=".13"/>
    {locked && <g transform="translate(62 46)" fill="none" stroke="#f3f1ff" strokeWidth="3"><rect x="0" y="10" width="26" height="21" rx="4" fill="#292954"/><path d="M6 10V7a7 7 0 0 1 14 0v3"/></g>}
  </svg>;
}

function Captain({ children, compact = false }) {
  return <div className={`captain-note ${compact ? 'captain-note--compact' : ''}`}>
    <div className="captain-bot" aria-hidden="true"><svg viewBox="0 0 70 70"><path d="M35 8v7" stroke="#b9f6eb" strokeWidth="4" strokeLinecap="round"/><circle cx="35" cy="7" r="4" fill="#ffcf7b"/><rect x="11" y="17" width="48" height="39" rx="14" fill="#d7ddff" stroke="#7774c7" strokeWidth="3"/><rect x="17" y="24" width="36" height="24" rx="9" fill="#29294e"/><ellipse cx="27" cy="34" rx="4" ry="5" fill="#73eee0"/><ellipse cx="43" cy="34" rx="4" ry="5" fill="#73eee0"/><path d="M28 42q7 6 14 0" stroke="#73eee0" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M11 31 5 34v10l6 2M59 31l6 3v10l-6 2" fill="#b9bdf3" stroke="#7774c7" strokeWidth="2.5" strokeLinejoin="round"/><rect x="23" y="56" width="24" height="5" rx="2.5" fill="#a9aef0"/></svg></div>
    <div className="captain-speech"><div className="captain-name">CAPTAIN NOVA <span>• YOUR GUIDE</span></div><p>{children}</p></div>
  </div>;
}

function Modal({ type, stage, onClose }) {
  if (!type) return null;
  const learning = type === 'learn';
  const steps = {
    1: ['Tap an alien to scan it.', 'Look at its body shape and other features.', 'Find a different alien with the same shape.'],
    2: ['Choose the rule you want to follow.', 'Tap an alien, then tap a matching cargo bay.', 'Try a new rule. The same aliens can form new groups.'],
    3: ['Tap a creature to select it.', 'Tap a group to place it there. Make a new group at any time.', 'Choose the pattern you noticed and share your discovery.'],
    4: ['Choose at least two features for the computer to notice.', 'Train the model and look at the groups it makes.', 'Guess where unseen aliens belong, ask the model, then improve it.'],
    5: ['Choose features that seem useful for this new population.', 'Train, test at least three unseen aliens, then change your settings.', 'Test again and send your field report to the Science Council.'],
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close help"><Icon name="close"/></button>
      <div className="modal-kicker"><Icon name={learning ? 'book' : 'spark'}/> {learning ? 'SCIENCE NOTEBOOK' : 'CAPTAIN NOVA’S GUIDE'}</div>
      <h2 id="help-title">{learning ? 'What am I learning?' : 'Let’s do this together.'}</h2>
      {learning ? <div className="learning-copy">
        {stage === 1 && <><p><b>Features</b> are details we can notice, like colour, shape or number of eyes.</p><p>AI can use features to look for things that are alike.</p></>}
        {stage === 2 && <><p>A <b>sorting rule</b> tells us where each thing should go. We choose the rule first.</p><p>Change the rule and the same collection may be organised in a new way.</p></>}
        {stage === 3 && <><p><b>Clustering</b> means finding groups of similar things when nobody has given the groups names.</p><p>There can be more than one useful way to group the same aliens.</p></>}
        {(stage === 4 || stage === 5) && <><p><b>Training</b> is when the computer builds groups using the features you selected.</p><p><b>Testing</b> means trying it on aliens it did not use for training. We can then change the settings and see what happens.</p><p>The computer notices patterns; people decide whether those patterns are useful.</p></>}
      </div> : <ol className="guide-steps">{steps[stage].map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol>}
      <button className="button button--primary button--wide" onClick={onClose}>Got it, let’s explore <Icon name="arrow"/></button>
    </section>
  </div>;
}

function TopBar({ onMap, onHelp, onLearn, muted, setMuted, activeStage = 0, completedCount = 0 }) {
  return <header className="topbar">
    <button className="brand-mark" onClick={onMap} aria-label="Back to galaxy map"><span className="brand-emblem"><Icon name="spark" size={20}/></span><span>CLUSTER <b>GALAXY</b><small>GALACTIC DISCOVERY AGENCY</small></span></button>
    <div className="topbar-right">
      <div className="mini-progress"><span>MISSION LOG</span><div className="mini-progress-track"><i style={{ width: `${Math.min(100, completedCount / 5 * 100)}%` }}/></div><b>{completedCount}/5</b></div>
      {activeStage > 0 && <><button className="utility-button" onClick={onHelp}><Icon name="spark"/> <span>Show me how</span></button><button className="utility-button" onClick={onLearn}><Icon name="book"/> <span>What am I learning?</span></button></>}
      <button className="sound-button" onClick={() => { const next = !muted; gameMuted = next; setMuted(next); if (next === false) playSound('tap'); }} aria-label={muted ? 'Sound off. Turn sound on' : 'Sound on. Turn sound off'}><Icon name={muted ? 'mute' : 'speaker'} size={19}/></button>
    </div>
  </header>;
}

function Intro({ onStart, onContinue, hasSave }) {
  const [briefing, setBriefing] = useState(false);
  return <div className="intro-screen">
    <div className="intro-nav"><div className="agency-stamp"><span className="stamp-dot"/><span>GALACTIC DISCOVERY AGENCY</span><b>FIELD DIVISION 07</b></div><span className="intro-top-label">A STORY ABOUT FINDING PATTERNS</span></div>
    <div className="intro-main">
      <div className="intro-copy">
        <div className="eyebrow"><span className="eyebrow-line"/> YOUR FIRST SPACE MISSION</div>
        <h1>Somewhere out there,<br/>everything is <em>connected.</em></h1>
        <p className="intro-lede">A new galaxy. A ship full of questions. And a whole universe of curious little creatures to meet.</p>
        <p className="intro-subcopy">Join Captain Nova and discover how a computer can spot patterns — one alien at a time.</p>
        <div className="intro-actions"><button className="button button--primary button--hero" onClick={onStart}>Begin expedition <Icon name="arrow" size={20}/></button>{hasSave && <button className="button button--ghost" onClick={onContinue}>Continue mission log</button>}</div>
        <div className="intro-facts"><span><Icon name="star" size={16}/> 5 story missions</span><span><Icon name="ship" size={17}/> Your own spaceship</span><span><Icon name="spark" size={16}/> No time limits</span></div>
      </div>
      <div className="intro-scene">
        <div className="orbit orbit--one"/><div className="orbit orbit--two"/><div className="planet planet--hero"><div/><span/></div>
        <div className="planet planet--moon"/><div className="planet planet--tiny"/>
        <div className="scene-star scene-star--a">✦</div><div className="scene-star scene-star--b">✦</div><div className="scene-star scene-star--c">✧</div>
        <div className="ship-wrap"><SpaceShip large/></div>
        <div className="scene-alien scene-alien--one"><Alien alien={ALIENS[0]} size="hero" showName={false}/></div>
        <div className="scene-alien scene-alien--two"><Alien alien={ALIENS[6]} size="hero" showName={false}/></div>
        <div className="scene-alien scene-alien--three"><Alien alien={ALIENS[9]} size="hero" showName={false}/></div>
        <div className="scene-signal"><span/><span/><span/> A SIGNAL FROM NOVA</div>
        <div className="scene-caption"><div className="caption-pin"/><div><b>UNKNOWN LIFE FORMS DETECTED</b><small>Mission 01 // Planet Nova</small></div></div>
      </div>
    </div>
    <div className="intro-bottom"><span>DISCOVER · GROUP · TEST · IMPROVE</span><span>MADE FOR CURIOUS MINDS <i>✦</i> AGES 7–9</span></div>
    {briefing && <Modal type="guide" stage={1} onClose={() => setBriefing(false)}/>}
  </div>;
}

function GalaxyMap({ completed, onLaunch, onReset }) {
  return <div className="map-screen">
    <div className="map-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> THE GALACTIC DISCOVERY AGENCY</div><h1>Your galaxy <em>awaits.</em></h1><p>Five missions are waiting. Take your time, explorer — every discovery counts.</p></div><div className="map-stat"><div className="map-stat-orb"><Icon name="star" size={26}/></div><div><b>{completed.length} of 5</b><span>missions complete</span></div></div></div>
    <div className="galaxy-route"><div className="route-path"/><div className="route-path route-path--second"/>
      {STAGES.map((stage, i) => {
        const unlocked = i === 0 || completed.includes(i);
        const done = completed.includes(stage.id);
        return <button key={stage.id} className={`mission-planet mission-planet--${stage.colour} ${unlocked ? '' : 'is-locked'} ${done ? 'is-done' : ''} mission-planet--pos-${i + 1}`} onClick={() => unlocked && onLaunch(stage.id)} disabled={!unlocked} aria-label={`${stage.title}${done ? ', complete' : unlocked ? ', start mission' : ', locked'}`}>
          <div className="mission-orb"><PlanetArt index={i} locked={!unlocked}/>{done && <span className="planet-done"><Icon name="check" size={15}/></span>}<span className="mission-orbit"/></div>
          <div className="mission-info"><span className="mission-number">MISSION 0{stage.id} <i>{done ? 'COMPLETE' : !unlocked ? 'LOCKED' : stage.time.toUpperCase()}</i></span><b>{stage.title}</b><small>{stage.subtitle}</small></div>
        </button>;
      })}
      <div className="map-you-are-here"><span className="pilot-dot"/> YOU ARE HERE</div>
      <div className="map-ship"><SpaceShip/></div>
    </div>
    <div className="map-bottom"><div className="captain-note captain-note--map"><div className="captain-bot" aria-hidden="true"><svg viewBox="0 0 70 70"><rect x="11" y="17" width="48" height="39" rx="14" fill="#d7ddff" stroke="#7774c7" strokeWidth="3"/><rect x="17" y="24" width="36" height="24" rx="9" fill="#29294e"/><ellipse cx="27" cy="34" rx="4" ry="5" fill="#73eee0"/><ellipse cx="43" cy="34" rx="4" ry="5" fill="#73eee0"/><path d="M28 42q7 6 14 0" stroke="#73eee0" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M35 8v9" stroke="#b9f6eb" strokeWidth="4"/><circle cx="35" cy="7" r="4" fill="#ffcf7b"/></svg></div><div className="captain-speech"><div className="captain-name">CAPTAIN NOVA <span>• SHIP’S AI</span></div><p>{completed.length === 0 ? 'Our sensors are picking up something curious. Let’s land on Nova and take a closer look!' : completed.length === 5 ? 'Every mission complete, Chief Scientist! The galaxy has never looked so full of patterns.' : `Great work, explorer! ${completed.length} mission${completed.length === 1 ? '' : 's'} complete. Your next discovery is waiting just ahead.`}</p></div></div><div className="map-bottom-side"><span className="map-tip-label"><Icon name="info" size={15}/> YOUR MISSION LOG SAVES ON THIS DEVICE</span><button className="text-button" onClick={onReset}>Reset progress</button></div></div>
  </div>;
}

function StageHeader({ stage, onMap, completedCount }) {
  return <div className="stage-header">
    <button className="back-to-map" onClick={onMap}><Icon name="back"/> Galaxy map</button>
    <div className="stage-heading"><div className={`stage-icon stage-icon--${stage.colour}`}><Icon name={stage.icon} size={22}/></div><div><div className="eyebrow">MISSION 0{stage.id} <span className="eyebrow-divider">/</span> {stage.planet.toUpperCase()}</div><h1>{stage.title}</h1><p>{stage.subtitle}</p></div></div>
    <div className="stage-meter"><div className="stage-meter-top"><span>EXPEDITION PROGRESS</span><b>{completedCount}/5</b></div><div className="stage-meter-track">{STAGES.map((s) => <i key={s.id} className={completedCount >= s.id || stage.id === s.id ? 'is-lit' : ''}/>)}</div></div>
  </div>;
}

function StoryScene({ stage, onStart }) {
  const stories = {
    1: { title: 'A little hello from Planet Nova', body: 'The Discovery has landed. Strange little creatures are hiding among the rocks. Captain Nova needs your help to scan them and spot shared features.', mission: 'Scan. Compare. Find three matching shapes.', label: 'FIRST CONTACT', colour: 'mint' },
    2: { title: 'Cargo chaos at Tidy-9', body: 'The research station’s specimens are mixed up. The cargo robot needs a sorting rule — but it cannot choose one for you.', mission: 'Choose a rule. Sort the specimens. Try another rule.', label: 'THE GREAT SPACE SORT', colour: 'orange' },
    3: { title: 'The tribes of Planet Mosaic', body: 'Nobody knows which creatures travel together. The records have names, but no group labels. Can you notice a pattern?', mission: 'Make your own groups. Tell the council what you noticed.', label: 'MYSTERY OF THE TRIBES', colour: 'pink' },
    4: { title: 'The lab computer has an idea', body: 'Captain Nova’s computer can make groups from the features you choose. The scientists need you to test it on creatures it has never seen.', mission: 'Choose features. Train. Test. Improve.', label: 'TRAIN, TEST & IMPROVE', colour: 'blue' },
    5: { title: 'A message from the Science Council', body: 'A new population has appeared beyond the map. You are in charge now. Build a model, challenge it with new specimens, and prepare your field report.', mission: 'Lead the experiment. Check unseen aliens. Explain your discovery.', label: 'CHIEF GALAXY SCIENTIST', colour: 'gold' },
  };
  const story = stories[stage.id];
  return <div className="story-backdrop" role="presentation">
    <section className={`story-scene story-scene--${story.colour}`} role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="story-scene-top"><div className="agency-stamp"><span className="stamp-dot"/><span>GALACTIC DISCOVERY AGENCY</span><b>MISSION BRIEFING / 0{stage.id}</b></div><span className="story-file-tag">NEW TRANSMISSION</span></div>
      <div className="story-scene-body"><div className="story-copy"><div className="eyebrow"><span className="eyebrow-line"/> {story.label}</div><h2 id="story-title">{story.title}</h2><p>{story.body}</p><div className="story-objective"><span><Icon name="star" size={17}/></span><div><small>YOUR MISSION</small><b>{story.mission}</b></div></div><div className="story-cta-row"><button className="button button--primary" onClick={onStart}>Begin mission <Icon name="arrow"/></button><button className="story-skip" onClick={onStart}>Skip story</button></div></div>
        <div className="story-art"><div className="story-art-orbit story-art-orbit--one"/><div className="story-art-orbit story-art-orbit--two"/><div className="story-art-planet"><PlanetArt index={stage.id - 1}/></div><div className="story-art-ship"><SpaceShip/></div><div className="story-art-alien story-art-alien--one"><Alien alien={ALIENS[(stage.id * 3) % ALIENS.length]} size="hero" showName={false}/></div><div className="story-art-alien story-art-alien--two"><Alien alien={ALIENS[(stage.id * 5 + 4) % ALIENS.length]} size="hero" showName={false}/></div><span className="story-art-star story-art-star--one">✦</span><span className="story-art-star story-art-star--two">✧</span><div className="story-transmission"><i/><span>CAPTAIN NOVA // ONLINE</span></div></div></div>
      <div className="story-scene-bottom"><span>THE DISCOVERY · DEEP SPACE EXPLORATION VESSEL</span><span>NO TIMER. NO WRONG WAY TO BE CURIOUS.</span></div>
    </section>
  </div>;
}

function MissionShell({ stage, onMap, completedCount, children }) {
  const [storyOpen, setStoryOpen] = useState(() => {
    try { return localStorage.getItem(`cluster-galaxy-briefing-${stage.id}`) !== 'seen'; } catch { return true; }
  });
  const closeStory = () => {
    try { localStorage.setItem(`cluster-galaxy-briefing-${stage.id}`, 'seen'); } catch { /* story may be replayed next visit if storage is unavailable */ }
    setStoryOpen(false);
  };
  return <div className="mission-screen"><StageHeader stage={stage} onMap={onMap} completedCount={completedCount}/>{children}{storyOpen && <StoryScene stage={stage} onStart={closeStory}/>}</div>;
}

function FeatureGlyph({ feature }) {
  if (feature === 'eyes') return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M2.8 12s3.2-5 9.2-5 9.2 5 9.2 5-3.2 5-9.2 5-9.2-5-9.2-5Z" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><circle cx="12.8" cy="11.2" r=".8" fill="#fff"/></svg>;
  if (feature === 'wings') return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M11 11C7 5 3.5 5 3 6c-.5 4 2 9 8 10M13 11c4-6 7.5-6 8-5 .5 4-2 9-8 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="m6 9 3 4m9-4-3 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
  return <Icon name="spark" size={15}/>;
}

function FeaturePill({ feature, alien, selected = false, onClick }) {
  const meta = FEATURE_META[feature];
  return <button type="button" className={`feature-pill ${selected ? 'is-active' : ''}`} onClick={onClick}>
    <span className={`feature-icon feature-icon--${feature}`}>{feature === 'color' ? <i style={{ background: alien?.colorHex || '#a78bfa' }}/> : feature === 'shape' ? <Icon name="cluster" size={15}/> : feature === 'eyes' ? <FeatureGlyph feature="eyes"/> : feature === 'wings' ? <FeatureGlyph feature="wings"/> : <Icon name="spark" size={15}/>}</span>
    <span><small>{meta.short}</small><b>{alien ? humanFeatureValue(alien, feature) : '—'}</b></span>
  </button>;
}

function MissionOne({ onComplete }) {
  const aliens = ALIENS.slice(0, 10);
  const [challenge, setChallenge] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [matches, setMatches] = useState(0);
  const [feedback, setFeedback] = useState({ type: 'tip', text: 'Tap any alien to scan it. Then find another with the same body shape.' });
  const target = aliens[challenge % 8];
  const selected = aliens.find((a) => a.id === selectedId);
  const handleSelect = (alien) => {
    if (matches >= 3) { setFeedback('You have found three matching shapes. Your field guide is ready for the next mission!'); return; }
    setSelectedId(alien.id);
    if (alien.id === target.id) {
      setFeedback({ type: 'tip', text: `This is our example, ${target.name}! Choose a different alien to compare with it.` });
      return;
    }
    if (alien.shape === target.shape) {
      playSound('success');
      setMatches((n) => n + 1);
      setChallenge((n) => n + 1);
      setFeedback({ type: 'good', text: `You spotted it! ${alien.name} and ${target.name} both have ${target.shape} bodies. Their other features can be different.` });
    } else {
      setFeedback({ type: 'hint', text: `Look at the outline of ${target.name}'s body. ${alien.name} has a ${alien.shape} body — can you find a ${target.shape} one?` });
    }
  };
  return <MissionShell stage={STAGES[0]} onMap={() => window.dispatchEvent(new CustomEvent('cg-map'))} completedCount={0}>
    <div className="mission-layout mission-layout--field">
      <section className="mission-main-panel">
        <div className="panel-heading"><div><span className="section-kicker">PLANET NOVA · SCAN BAY</span><h2>Meet the locals</h2><p>Every alien has features — little details we can notice.</p></div><div className="counter-badge"><Icon name="scan" size={17}/><b>{matches}/3</b><span>shape matches</span></div></div>
        <Captain>Let’s scan <b>{target.name}</b> first. Its body is <b>{target.shape}</b>. Can you find a different alien with that same shape?</Captain>
        <div className="scan-target-row"><div className="scan-target-art"><Alien alien={target} size="lg" selected showName={false}/><span className="scan-ring"/></div><div className="scan-target-copy"><span className="target-label"><Icon name="scan" size={14}/> YOUR EXAMPLE ALIEN</span><h3>{target.name}</h3><p>Look closely at the outside edge of its body.</p><div className="shape-clue"><span className={`shape-sample shape-sample--${target.shape}`}/><span><small>BODY SHAPE</small><b>{target.shape[0].toUpperCase() + target.shape.slice(1)}</b></span></div></div><div className="scan-sweep"/></div>
        <div className="subsection-title"><div><b>Alien field guide</b><span>Choose a different creature to compare</span></div><span className="subsection-count">{aliens.length} specimens</span></div>
        <div className="alien-grid alien-grid--ten">{aliens.map((alien) => <Alien key={alien.id} alien={alien} size="md" selected={selectedId === alien.id} onClick={() => handleSelect(alien)} />)}</div>
        <div className={`feedback-strip feedback-strip--${feedback.type}`}><span className="feedback-symbol"><Icon name={feedback.type === 'good' ? 'check' : feedback.type === 'hint' ? 'info' : 'spark'} size={18}/></span><p>{feedback.text}</p><span className="feedback-pips"><i/><i/><i/></span></div>
        {selected && <div className="inspection-drawer"><div className="inspection-title"><div><span className="section-kicker">SCANNER REPORT</span><h3>{selected.name}’s features</h3></div><span className="scan-status"><i/> SCAN COMPLETE</span></div><div className="feature-row">{FEATURE_KEYS.map((key) => <FeaturePill feature={key} alien={selected} key={key}/>)}</div><p className="inspection-footnote">A feature is a detail we can see or count. Two aliens can share one feature and still be different in other ways.</p></div>}
        <div className="mission-footer"><div className="footer-progress"><span>YOUR DISCOVERY LOG</span><div className="tiny-track"><i style={{ width: `${Math.min(100, matches / 3 * 100)}%` }}/></div><b>{matches >= 3 ? 'Ready!' : `${3 - matches} more to find`}</b></div>{matches >= 3 ? <button className="button button--primary" onClick={() => onComplete(1)}>Unlock the cargo bay <Icon name="arrow"/></button> : <span className="footer-hint">Hint: focus on the body outline, not the colour.</span>}</div>
      </section>
      <aside className="mission-aside"><div className="aside-panel field-guide-panel"><div className="aside-panel-top"><span className="aside-icon"><Icon name="book" size={19}/></span><span>FIELD GUIDE 01</span><i className="tiny-status">LIVE</i></div><h3>What should I look for?</h3><p>Take a closer look at these five features.</p><div className="guide-feature-list">{FEATURE_KEYS.map((key, i) => <div className="guide-feature-item" key={key}><span className={`guide-feature-symbol guide-feature-symbol--${key}`}>{key === 'color' ? <i/> : key === 'shape' ? <Icon name="cluster" size={16}/> : key === 'eyes' ? <FeatureGlyph feature="eyes"/> : key === 'wings' ? <FeatureGlyph feature="wings"/> : <Icon name="spark" size={15}/>}</span><span><b>{FEATURE_META[key].label}</b><small>{["The colour of its body", "The outline of its body", "How many eyes it has", "Whether wings are there", "Little feelers on its head"][i]}</small></span></div>)}</div><div className="field-guide-tip"><Icon name="spark" size={16}/><span><b>Nova’s tip</b> One matching feature does not make two aliens exactly the same.</span></div></div><div className="aside-mini-card"><div className="mini-planet-mini"><PlanetArt index={0} small/></div><div><small>YOUR DESTINATION</small><b>Planet Nova</b><span>First contact established</span></div></div><div className="aside-objective"><span className="objective-star"><Icon name="star" size={17}/></span><div><b>Mission objective</b><p>Notice features and find 3 matching shapes. There is no time limit.</p></div></div></aside>
    </div>
  </MissionShell>;
}

const SORT_ALIENS = ALIENS.filter((a) => ['coral', 'aqua', 'violet'].includes(a.color)).slice(0, 12);
const sortCategory = (alien, rule) => rule === 'wings' ? (alien.wings ? 'Has wings' : 'No wings') : rule === 'shape' ? alien.shape : alien.color;
const sortLabel = (value, rule) => rule === 'color' ? value[0].toUpperCase() + value.slice(1) : value[0].toUpperCase() + value.slice(1);
function MissionTwo({ onComplete }) {
  const [rule, setRule] = useState('wings');
  const [selectedId, setSelectedId] = useState(null);
  const [placements, setPlacements] = useState({});
  const [completedRules, setCompletedRules] = useState([]);
  const [feedback, setFeedback] = useState('Choose an alien, then tap the cargo bay where it belongs.');
  const [showRuleHint, setShowRuleHint] = useState(false);
  const sortedValues = useMemo(() => [...new Set(SORT_ALIENS.map((a) => sortCategory(a, rule)))], [rule]);
  const placedCount = Object.keys(placements).length;
  const correctCount = SORT_ALIENS.filter((a) => placements[a.id] === sortCategory(a, rule)).length;
  const allCorrect = correctCount === SORT_ALIENS.length;
  const ruleNames = { wings: 'Wings', shape: 'Body shape', color: 'Body colour' };
  const changeRule = (nextRule) => {
    setRule(nextRule); setPlacements({}); setSelectedId(null); setFeedback(`New rule: sort by ${ruleNames[nextRule].toLowerCase()}. The same aliens, a new way to group them!`); setShowRuleHint(false);
  };
  const place = (value, alienId = selectedId) => {
    if (!alienId) { setFeedback('First choose an alien from the specimen tray.'); return; }
    const alien = SORT_ALIENS.find((a) => a.id === alienId);
    if (!alien) return;
    const expected = sortCategory(alien, rule);
    setPlacements((old) => ({ ...old, [alienId]: value }));
    setSelectedId(null);
    if (expected === value) { playSound('success'); setFeedback(`Good sorting! ${alien.name} belongs in “${sortLabel(value, rule)}” for this rule.`); }
    else setFeedback(`Nearly! Check ${alien.name}’s ${ruleNames[rule].toLowerCase()}. You can move it to another bay.`);
    if (expected === value && SORT_ALIENS.every((a) => a.id === alienId || oldPlacementCorrect(a, placements, rule))) {
      setCompletedRules((old) => old.includes(rule) ? old : [...old, rule]);
    }
  };
  function oldPlacementCorrect(alien, oldPlacements, activeRule) { return oldPlacements[alien.id] === sortCategory(alien, activeRule); }
  const chooseRule = (next) => { if (next !== rule) changeRule(next); };
  const rulesDone = completedRules.length;
  return <MissionShell stage={STAGES[1]} onMap={() => window.dispatchEvent(new CustomEvent('cg-map'))} completedCount={1}>
    <div className="mission-layout mission-layout--sorting">
      <section className="mission-main-panel">
        <div className="panel-heading"><div><span className="section-kicker">RESEARCH STATION · CARGO BAY</span><h2>Every alien has a place.</h2><p>Sort this collection by one clear rule. Then try a different rule.</p></div><div className="counter-badge"><Icon name="sort" size={17}/><b>{rulesDone}/2</b><span>rules mastered</span></div></div>
        <Captain>A sorting rule is like a little instruction: “put every alien with wings together”. You pick the rule — then look at each creature carefully.</Captain>
        <div className="rule-selector"><div className="rule-selector-label"><span className="section-kicker">YOUR SORTING RULE</span><b>What should the cargo bays look at?</b></div><div className="rule-tabs">{Object.entries(ruleNames).map(([key, label]) => <button key={key} className={`rule-tab ${rule === key ? 'is-active' : ''} ${completedRules.includes(key) ? 'is-done' : ''}`} onClick={() => chooseRule(key)}><span className={`rule-tab-icon rule-tab-icon--${key}`}>{key === 'wings' ? <FeatureGlyph feature="wings"/> : key === 'shape' ? <Icon name="cluster" size={16}/> : <i/>}</span><span>{label}</span>{completedRules.includes(key) && <Icon name="check" size={14}/>}</button>)}</div><p className="rule-explain">{rule === 'wings' ? 'Look for wings. There are only two places to choose from.' : rule === 'shape' ? 'Compare each body outline. Aliens with the same shape go together.' : 'Match the body colour. Colourful creatures can still share other features.'}</p></div>
        <div className="cargo-bays" style={{ '--bay-count': sortedValues.length }}>
          {sortedValues.map((value, index) => {
            const items = SORT_ALIENS.filter((a) => placements[a.id] === value);
            const isCorrectBay = items.length > 0 && items.every((a) => sortCategory(a, rule) === value);
            return <div key={value} role="button" tabIndex={0} aria-label={`Cargo bay ${index + 1}: ${sortLabel(value, rule)}`} className={`cargo-bay cargo-bay--${index % 4} ${isCorrectBay ? 'cargo-bay--good' : ''} ${selectedId ? 'cargo-bay--ready' : ''}`} onClick={() => place(value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(value); } }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); place(value, e.dataTransfer.getData('text/plain')); }}>
              <div className="cargo-bay-top"><span className="bay-number">BAY 0{index + 1}</span><span className="bay-count">{items.length}</span></div><div className="bay-category"><span className={`bay-category-symbol bay-category-symbol--${rule}`}>{rule === 'color' ? <i style={{ background: ALIENS.find((a) => a.color === value)?.colorHex || '#aaa' }}/> : rule === 'shape' ? <span className={`shape-sample shape-sample--${value}`}/> : value === 'Has wings' ? <FeatureGlyph feature="wings"/> : <Icon name="close" size={13}/>}</span><b>{sortLabel(value, rule)}</b></div>
              <div className="bay-drop-zone">{items.length ? <div className="bay-mini-aliens">{items.map((alien) => <span key={alien.id} title={alien.name}><Alien alien={alien} size="xs" showName={false} onClick={(e) => e?.stopPropagation?.()}/></span>)}</div> : <><span className="drop-target"><Icon name="plus" size={18}/></span><small>{selectedId ? 'Place selected alien here' : 'Tap to place an alien'}</small></>}</div>
              {items.length > 0 && <span className="bay-footer-label">{isCorrectBay ? 'MATCHING RULE' : 'CHECK THIS BAY'}</span>}
            </div>;
          })}
        </div>
        <div className="feedback-strip feedback-strip--tip"><span className="feedback-symbol"><Icon name="info" size={18}/></span><p>{feedback}</p><button className="feedback-action" onClick={() => setShowRuleHint(!showRuleHint)}>{showRuleHint ? 'Hide hint' : 'Need a hint?'}</button></div>
        {showRuleHint && <div className="hint-card"><Icon name="spark"/><p>{rule === 'wings' ? 'Look at the sides of the alien’s body. Winged aliens have little wings sticking out.' : rule === 'shape' ? 'Imagine drawing around the body with a pencil. Do the outlines match?' : 'Ignore the eyes and wings for now. Look only at the colour filling the body.'}</p></div>}
        <div className="subsection-title"><div><b>Specimen tray</b><span>Tap one to select it, or drag it to a bay</span></div><span className="subsection-count">{SORT_ALIENS.length - correctCount} to check</span></div>
        <div className="alien-grid alien-grid--tray">{SORT_ALIENS.map((alien) => <div key={alien.id} className={`tray-item ${placements[alien.id] === sortCategory(alien, rule) ? 'tray-item--placed' : ''}`}><Alien alien={alien} size="sm" selected={selectedId === alien.id} onClick={() => { setSelectedId(alien.id); setFeedback(`${alien.name} selected. Choose a bay that matches ${ruleNames[rule].toLowerCase()}.`); }} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', alien.id); setSelectedId(alien.id); }}/>{placements[alien.id] === sortCategory(alien, rule) && <span className="tray-check"><Icon name="check" size={11}/></span>}</div>)}</div>
        <div className="mission-footer"><div className="footer-progress"><span>CARGO CHECK</span><div className="tiny-track"><i style={{ width: `${correctCount / SORT_ALIENS.length * 100}%` }}/></div><b>{correctCount}/{SORT_ALIENS.length} sorted</b></div>{allCorrect ? <div className="footer-success"><Icon name="check"/> Rule complete!</div> : <span className="footer-hint">{rulesDone > 0 ? 'Great! Try a different rule to earn your badge.' : 'Complete this rule, then try another one.'}</span>}{rulesDone >= 2 && <button className="button button--primary" onClick={() => onComplete(2)}>Open the mystery planet <Icon name="arrow"/></button>}</div>
      </section>
      <aside className="mission-aside"><div className="aside-panel station-panel"><div className="station-illustration"><div className="station-ring"/><div className="station-core"><Icon name="sort" size={29}/></div><span className="station-dot station-dot--one"/><span className="station-dot station-dot--two"/><span className="station-dot station-dot--three"/></div><span className="section-kicker">RESEARCH STATION 09</span><h3>The cargo bays</h3><p>Each bay holds one kind of answer for your chosen rule. You decide how to organise the collection.</p><div className="station-rule-progress">{Object.entries(ruleNames).map(([key, label]) => <div key={key} className={completedRules.includes(key) ? 'is-complete' : key === rule ? 'is-current' : ''}><span>{completedRules.includes(key) ? <Icon name="check" size={13}/> : <i/>}</span><b>{label}</b><small>{completedRules.includes(key) ? 'Done' : key === rule ? 'In progress' : 'Try this rule'}</small></div>)}</div></div><div className="aside-objective"><span className="objective-star"><Icon name="spark" size={17}/></span><div><b>Science discovery</b><p>Sorting follows a rule you already know. Clustering is different — the computer must find the patterns itself.</p></div></div><div className="aside-mini-card"><div className="mini-planet-mini"><PlanetArt index={1} small/></div><div><small>NEXT STOP</small><b>Planet Mosaic</b><span>Unknown groups detected</span></div></div></aside>
    </div>
  </MissionShell>;
}

function MissionThree({ onComplete }) {
  const aliens = ALIENS.slice(4, 18);
  const [groups, setGroups] = useState([
    { id: 'group-a', name: 'Group A', colour: groupPaint[0], ids: [] },
    { id: 'group-b', name: 'Group B', colour: groupPaint[1], ids: [] },
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [reason, setReason] = useState('features');
  const [feedback, setFeedback] = useState('Tap a creature, then tap a group. Make your own discovery!');
  const [reported, setReported] = useState(false);
  const assignedIds = groups.flatMap((g) => g.ids);
  const unassigned = aliens.filter((a) => !assignedIds.includes(a.id));
  const placedTotal = assignedIds.length;
  const enoughGroups = groups.filter((g) => g.ids.length > 0).length >= 2;
  const placeAlien = (groupId, alienId = selectedId) => {
    if (!alienId) { setFeedback('Choose a creature first, then add it to a group.'); return; }
    const alien = aliens.find((a) => a.id === alienId);
    if (!alien) return;
    setGroups((old) => old.map((g) => ({ ...g, ids: g.id === groupId ? [...g.ids.filter((id) => id !== alienId), alienId] : g.ids.filter((id) => id !== alienId) })));
    setSelectedId(null); setReported(false); playSound('success');
    setFeedback(`${alien.name} has joined ${groups.find((g) => g.id === groupId)?.name}. You can move it again at any time.`);
  };
  const createGroup = () => {
    const name = newName.trim() || `New group ${groups.length + 1}`;
    if (groups.length >= 5) { setFeedback('Five groups is plenty for this mission. Try moving aliens between them.'); return; }
    setGroups((old) => [...old, { id: `group-${Date.now()}`, name, colour: groupPaint[old.length % groupPaint.length], ids: [] }]);
    setNewName(''); setFeedback(`“${name}” is ready. Which aliens belong together?`); setReported(false);
  };
  const saveName = (groupId) => {
    if (draftName.trim()) setGroups((old) => old.map((g) => g.id === groupId ? { ...g, name: draftName.trim().slice(0, 24) } : g));
    setEditingId(null); setReported(false);
  };
  const removeGroup = (groupId) => {
    if (groups.length <= 2) return;
    const name = groups.find((g) => g.id === groupId)?.name;
    setGroups((old) => old.filter((g) => g.id !== groupId));
    setFeedback(`${name} has been removed. Its aliens are back in the tray, ready for a new pattern.`); setReported(false);
  };
  const reasonText = { color: 'I noticed aliens with the same colour.', shape: 'I noticed aliens with similar body shapes.', features: 'I looked at more than one feature.', other: 'I noticed a different pattern.' };
  return <MissionShell stage={STAGES[2]} onMap={() => window.dispatchEvent(new CustomEvent('cg-map'))} completedCount={2}>
    <div className="mission-layout mission-layout--clustering">
      <section className="mission-main-panel">
        <div className="panel-heading"><div><span className="section-kicker">PLANET MOSAIC · MYSTERY ZONE</span><h2>No labels. No rules. Just clues.</h2><p>Can you discover which aliens seem to belong together?</p></div><div className="counter-badge"><Icon name="cluster" size={17}/><b>{placedTotal}/{aliens.length}</b><span>aliens grouped</span></div></div>
        <Captain>Nobody has named these tribes yet. You get to look for patterns. There can be several good ways to group the same creatures!</Captain>
        <div className="cluster-workspace">
          <div className="cluster-workspace-heading"><div><span className="section-kicker">YOUR DISCOVERY BOARD</span><b>Make your own groups</b></div><span className="freeform-label"><Icon name="spark" size={14}/> NO SINGLE RIGHT ANSWER</span></div>
          <div className="group-board" style={{ '--group-count': groups.length }}>
            {groups.map((group, index) => {
              const members = aliens.filter((a) => group.ids.includes(a.id));
              return <section key={group.id} className="discovery-group" style={{ '--group-colour': group.colour }} onClick={(e) => { if (e.target.closest('button, input, form')) return; if (selectedId) placeAlien(group.id); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); placeAlien(group.id, e.dataTransfer.getData('text/plain')); }}>
                <div className="discovery-group-head"><span className="group-orb"/><div className="group-name-wrap">{editingId === group.id ? <form onSubmit={(e) => { e.preventDefault(); saveName(group.id); }}><input autoFocus value={draftName} maxLength={24} onChange={(e) => setDraftName(e.target.value)} aria-label="New group name"/><button type="submit" className="tiny-action" aria-label="Save group name"><Icon name="check" size={13}/></button></form> : <><b>{group.name}</b><button className="tiny-action" onClick={() => { setEditingId(group.id); setDraftName(group.name); }} aria-label={`Rename ${group.name}`}><Icon name="edit" size={13}/></button></>}</div><span className="group-member-count">{members.length}</span>{groups.length > 2 && <button className="tiny-action tiny-action--danger" onClick={() => removeGroup(group.id)} aria-label={`Remove ${group.name}`}><Icon name="trash" size={12}/></button>}</div>
                <div className={`group-drop-area ${members.length ? 'has-members' : ''}`}>{members.length ? <div className="group-member-grid">{members.map((a) => <Alien key={a.id} alien={a} size="sm" selected={selectedId === a.id} onClick={() => setSelectedId(a.id)} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', a.id); setSelectedId(a.id); }}/>)}</div> : <div className="empty-group-prompt"><span className="empty-group-icon"><Icon name="plus" size={17}/></span><b>Drop a creature here</b><small>or select one below</small></div>}</div>
                <div className="group-drop-foot"><span>{index === 0 ? 'PATTERN A' : index === 1 ? 'PATTERN B' : `PATTERN ${String.fromCharCode(65 + index)}`}</span><button onClick={() => placeAlien(group.id)} disabled={!selectedId} className="add-to-group">Add selected <Icon name="arrow" size={13}/></button></div>
              </section>;
            })}
            <div className="new-group-card"><span className="new-group-icon"><Icon name="plus" size={19}/></span><b>Create a group</b><small>Have you spotted another pattern?</small><form onSubmit={(e) => { e.preventDefault(); createGroup(); }}><input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={24} placeholder="Name your group" aria-label="New group name"/><button className="button button--small button--outline" type="submit" disabled={groups.length >= 5}>Create group</button></form></div>
          </div>
        </div>
        <div className="feedback-strip feedback-strip--tip"><span className="feedback-symbol"><Icon name="spark" size={18}/></span><p>{feedback}</p><span className="feedback-pips"><i/><i/><i/></span></div>
        <div className="subsection-title"><div><b>Unsorted aliens</b><span>Tap to select, then choose a group — or drag them in</span></div><span className="subsection-count">{unassigned.length} waiting</span></div>
        <div className="alien-grid alien-grid--unassigned">{unassigned.map((alien) => <Alien key={alien.id} alien={alien} size="sm" selected={selectedId === alien.id} onClick={() => { setSelectedId(alien.id); setFeedback(`${alien.name} selected. Which group shares a pattern with this creature?`); }} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', alien.id); setSelectedId(alien.id); }}/>)}</div>
        <div className="pattern-report"><div className="report-heading"><span className="report-icon"><Icon name="book"/></span><div><span className="section-kicker">YOUR SCIENCE NOTE</span><h3>What pattern did you notice?</h3></div></div><p>There is no single correct answer. Choose the idea that best describes your groups.</p><div className="reason-options">{Object.entries({ color: 'Same colour', shape: 'Similar shapes', features: 'More than one feature', other: 'A different pattern' }).map(([key, label]) => <button key={key} className={`reason-option ${reason === key ? 'is-selected' : ''}`} onClick={() => { setReason(key); setReported(false); }}><span className="reason-radio">{reason === key && <i/>}</span>{label}</button>)}</div><div className="mission-footer"><div className="footer-progress"><span>DISCOVERY BOARD</span><div className="tiny-track"><i style={{ width: `${placedTotal / aliens.length * 100}%` }}/></div><b>{placedTotal}/{aliens.length} placed</b></div>{!reported ? <button className="button button--primary" disabled={placedTotal < 10 || !enoughGroups} onClick={() => { setReported(true); setFeedback(reasonText[reason] + ' Other explorers might notice a different pattern, too.'); }}>Share my discovery <Icon name="arrow"/></button> : <button className="button button--primary" onClick={() => onComplete(3)}>Claim Pattern Finder badge <Icon name="arrow"/></button>}</div>{placedTotal < 10 && <small className="subtle-hint">Group at least 10 creatures to finish. You can always move them later.</small>}</div>
      </section>
      <aside className="mission-aside"><div className="aside-panel mystery-panel"><div className="mystery-scene"><div className="mystery-planet"/><div className="mystery-satellite"/><div className="mystery-star mystery-star--one">✦</div><div className="mystery-star mystery-star--two">✧</div><div className="mystery-scan-line"/></div><span className="section-kicker">MYSTERY SPECIMENS</span><h3>What is clustering?</h3><p>Clustering means discovering groups of similar things when no one has supplied the group names.</p><div className="clustering-mini-example"><span className="mini-cluster mini-cluster--a"><i/><i/><i/></span><span className="mini-cluster mini-cluster--b"><i/><i/><i/></span><span className="mini-cluster mini-cluster--c"><i/><i/></span><div><b>Similar things...</b><small>can form a cluster</small></div></div></div><div className="aside-objective"><span className="objective-star"><Icon name="info" size={17}/></span><div><b>Your groups, your idea</b><p>Try colour, shape, or several features together. Moving an alien is part of exploring.</p></div></div><div className="aside-mini-card"><div className="mini-planet-mini"><PlanetArt index={2} small/></div><div><small>REWARD AHEAD</small><b>Pattern Finder</b><span>Unlock the Galaxy Lab</span></div></div></aside>
    </div>
  </MissionShell>;
}

function prettyValue(feature, value) {
  if (feature === 'color' || feature === 'shape') return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  if (feature === 'eyes') return `${value} ${value === '1' ? 'eye' : 'eyes'}`;
  return value === 'Yes' ? 'Yes' : 'No';
}

function ClusterSwatch({ index, small = false }) {
  return <span className={`cluster-swatch cluster-swatch--${index % 5} ${small ? 'cluster-swatch--small' : ''}`}><i/><i/><i/></span>;
}

function ModelLab({ finalMission = false, onComplete }) {
  const trainingSet = finalMission ? STAGE5_TRAIN : STAGE4_TRAIN;
  const testSet = finalMission ? STAGE5_TEST : STAGE4_TEST;
  const [features, setFeatures] = useState(finalMission ? ['shape', 'eyes', 'wings'] : ['color', 'shape', 'eyes']);
  const [k, setK] = useState(3);
  const [model, setModel] = useState(null);
  const [previousModel, setPreviousModel] = useState(null);
  const [previousTestResults, setPreviousTestResults] = useState({});
  const [testResults, setTestResults] = useState({});
  const [testIndex, setTestIndex] = useState(0);
  const [guess, setGuess] = useState(null);
  const [feedback, setFeedback] = useState('Choose the features you want the computer to notice, then train your model.');
  const [modelVersion, setModelVersion] = useState(0);
  const [reportChoice, setReportChoice] = useState('checked');
  const [reportSent, setReportSent] = useState(false);
  const [showTrainingSet, setShowTrainingSet] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const testAlien = testSet[testIndex];
  const testedCount = Object.keys(testResults).length;
  const hasChangedSettings = !!model && (features.join('|') !== model.features.join('|') || k !== model.k);
  const canTrain = !model || testedCount >= Math.min(3, testSet.length);
  const readyForCompletion = !!model && !!previousModel && testedCount >= Math.min(3, testSet.length) && (!finalMission || reportSent);

  const toggleFeature = (feature) => {
    setReportSent(false);
    setFeatures((old) => {
      if (old.includes(feature)) {
        if (old.length <= 2) { setFeedback('Pick at least two features so the computer has something to compare.'); return old; }
        setFeedback(`${FEATURE_META[feature].label} removed from the next experiment. Train again to use your new settings.`);
        return old.filter((f) => f !== feature);
      }
      setFeedback(`${FEATURE_META[feature].label} added. The computer will use it after you train again.`);
      return [...old, feature];
    });
  };
  const train = () => {
    if (model && testedCount < Math.min(3, testSet.length)) {
      setFeedback(`Test ${Math.min(3, testSet.length) - testedCount} more unseen alien${Math.min(3, testSet.length) - testedCount === 1 ? '' : 's'} before changing your model.`);
      return;
    }
    try {
      const nextModel = trainKModes(trainingSet, features, k);
      playSound('train');
      if (model) { setPreviousModel(model); setPreviousTestResults(testResults); }
      setModel(nextModel);
      setModelVersion((v) => v + 1);
      setTestResults({}); setTestIndex(0); setGuess(null); setReportSent(false);
      setFeedback(`Model trained! It used ${features.length} features to make ${k} groups. Now inspect its patterns, then test an unseen alien.`);
    } catch (error) { setFeedback(error.message || 'Something went wrong. Try choosing the features again.'); }
  };
  const askModel = () => {
    if (!model || guess === null) return;
    const prediction = predictCluster(testAlien, model);
    playSound('success');
    setTestResults((old) => ({ ...old, [testAlien.id]: prediction }));
    const match = matchMessage(prediction.distance, model.features.length);
    setFeedback(`The computer placed ${testAlien.name} in Group ${prediction.cluster + 1}. ${match.detail} Look at the listed features to see why.`);
  };
  const goToTest = (index) => { setTestIndex(index); setGuess(null); };
  const oldPrediction = previousModel ? previousTestResults[testAlien.id] : null;
  const newPrediction = model ? testResults[testAlien.id] : null;
  const testCluster = newPrediction?.cluster;
  const clusterMembers = model ? model.members : [];
  const reportOptions = [
    ['checked', 'The new groups fit my chosen features better.'],
    ['features', 'Changing the features changed the groups, so I compared the same test aliens.'],
    ['surprise', 'Some results still surprised me, so I would investigate more.'],
  ];

  return <MissionShell stage={STAGES[finalMission ? 4 : 3]} onMap={() => window.dispatchEvent(new CustomEvent('cg-map'))} completedCount={finalMission ? 4 : 3}>
    <div className="lab-intro-row"><Captain>{finalMission ? 'This is your own science mission. Pick the features you think matter, then test the computer fairly. Remember: a different result is not always a worse result.' : 'The ship computer can build groups from the features you choose. But is its idea useful? We need to test it on aliens it has never seen.'}</Captain><div className="lab-stage-stamp"><span><Icon name="lab" size={20}/></span><div><small>{finalMission ? 'FINAL FIELD MISSION' : 'RESEARCH PROTOCOL'}</small><b>{finalMission ? 'Chief Scientist' : 'Model Lab'}</b></div></div></div>
    <div className="lab-workflow"><div className={`workflow-step ${!model ? 'is-current' : 'is-done'}`}><span>{model ? <Icon name="check" size={15}/> : '01'}</span><div><b>Choose & train</b><small>Build a model</small></div></div><i className="workflow-link"/><div className={`workflow-step ${model && testedCount < 3 ? 'is-current' : testedCount >= 3 ? 'is-done' : ''}`}><span>{testedCount >= 3 ? <Icon name="check" size={15}/> : '02'}</span><div><b>Test</b><small>Try unseen aliens</small></div></div><i className="workflow-link"/><div className={`workflow-step ${previousModel && testedCount >= 3 ? 'is-current' : readyForCompletion ? 'is-done' : ''}`}><span>{previousModel && testedCount >= 3 ? <Icon name="check" size={15}/> : '03'}</span><div><b>Improve</b><small>Try again</small></div></div></div>
    <div className="lab-grid">
      <section className="model-console panel-card">
        <div className="panel-card-header"><div><span className="section-kicker">01 / MODEL SETTINGS</span><h2>Teach the computer</h2></div><span className="console-led"><i/> READY</span></div>
        <p className="panel-lede">Choose what the computer should pay attention to. Changing the features can change its groups.</p>
        <div className="settings-label"><b>Which features matter?</b><span>{features.length} selected</span></div>
        <div className="feature-toggle-grid">{FEATURE_KEYS.map((feature) => <button key={feature} className={`feature-toggle ${features.includes(feature) ? 'is-selected' : ''}`} onClick={() => toggleFeature(feature)}><span className={`toggle-feature-icon toggle-feature-icon--${feature}`}>{feature === 'color' ? <i/> : feature === 'shape' ? <Icon name="cluster" size={17}/> : feature === 'eyes' ? <FeatureGlyph feature="eyes"/> : feature === 'wings' ? <FeatureGlyph feature="wings"/> : <Icon name="spark" size={16}/>}</span><span><b>{FEATURE_META[feature].label}</b><small>{features.includes(feature) ? 'Included' : 'Not included'}</small></span><span className="toggle-check">{features.includes(feature) && <Icon name="check" size={13}/>}</span></button>)}</div>
        <div className="settings-divider"/>
        <div className="settings-label"><b>How many groups?</b><span>Choose 2 or 3</span></div>
        <div className="cluster-count-picker">{[2, 3].map((value) => <button key={value} className={`cluster-count-option ${k === value ? 'is-selected' : ''}`} onClick={() => { setK(value); setReportSent(false); setFeedback(`${value} groups selected. Train again when you are ready to try this setting.`); }}><ClusterSwatch index={value - 1}/><span><b>{value} groups</b><small>{value === 2 ? 'Two larger patterns' : 'More, smaller patterns'}</small></span><span className="radio-dot">{k === value && <i/>}</span></button>)}</div>
        <div className="training-data-fold"><button className="fold-toggle" onClick={() => setShowTrainingSet(!showTrainingSet)}><span><Icon name="book" size={16}/> Training collection <b>{trainingSet.length} aliens</b></span><Icon name={showTrainingSet ? 'close' : 'arrow'} size={16}/></button>{showTrainingSet && <div className="training-mini-grid">{trainingSet.map((alien) => <div key={alien.id} title={alien.name}><Alien alien={alien} size="xs" showName={false}/><small>{alien.name}</small></div>)}</div>}<p>These aliens help form the groups. The test collection below stays separate.</p></div>
        {hasChangedSettings && <div className="pending-settings"><Icon name="info" size={16}/><span>Settings changed. Train again to use these choices. Your current model still uses {model.features.length} features.</span></div>}
        <button className="button button--train" onClick={train} disabled={!canTrain || features.length < 2}><span className="train-button-icon"><Icon name={model ? 'refresh' : 'lab'} size={19}/></span><span><b>{model ? 'Train an improved model' : 'Train my model'}</b><small>{!model ? 'Build groups from the selected features' : testedCount < 3 ? `Test ${3 - testedCount} more alien${3 - testedCount === 1 ? '' : 's'} before retraining` : 'Keep the same test aliens for a fair comparison'}</small></span><Icon name="arrow" size={18}/></button>
        {model && <div className="model-meta"><span><i/> MODEL VERSION {modelVersion}</span><span>{model.iterations} learning rounds</span><span>REPRODUCIBLE RUN</span></div>}
      </section>

      <section className="model-output panel-card">
        <div className="panel-card-header"><div><span className="section-kicker">02 / WHAT THE MODEL FOUND</span><h2>{model ? 'Your computer’s groups' : 'Waiting for your model'}</h2></div><span className={`model-status ${model ? 'model-status--trained' : ''}`}><i/>{model ? 'TRAINED' : 'NOT TRAINED'}</span></div>
        {!model ? <div className="model-empty-state"><div className="computer-illustration"><div className="computer-screen"><span/><span/><span/><div className="computer-face"><i/><i/><b/></div></div><div className="computer-neck"/><div className="computer-foot"/><div className="computer-spark computer-spark--one">✦</div><div className="computer-spark computer-spark--two">✧</div></div><h3>Ready to find a pattern?</h3><p>Choose your features on the left, then press <b>Train my model</b>. The aliens will move into groups based on your choices.</p><div className="empty-state-tips"><span><Icon name="check" size={14}/> You choose the features</span><span><Icon name="check" size={14}/> Your settings change the result</span></div></div> : <>
          <div className="model-summary-row"><div><span>FEATURES USED</span><b>{model.features.length}</b><small>{model.features.map((f) => FEATURE_META[f].short).join(' · ')}</small></div><div><span>GROUPS MADE</span><b>{model.k}</b><small>from {trainingSet.length} training aliens</small></div><div><span>TRAINING ROUNDS</span><b>{model.iterations}</b><small>repeatable process</small></div></div>
          <div className="model-clusters">{clusterMembers.map((members, i) => <div key={i} className="model-cluster-card" style={{ '--cluster-color': groupPaint[i] }}><div className="model-cluster-head"><ClusterSwatch index={i}/><div><b>Group {i + 1}</b><small>{members.length} {members.length === 1 ? 'alien' : 'aliens'}</small></div><span className="cluster-count-pill">{members.length}</span></div><div className="model-cluster-aliens">{members.slice(0, 5).map((alien) => <span key={alien.id} title={alien.name}><Alien alien={alien} size="xs" showName={false}/></span>)}{members.length > 5 && <span className="more-aliens">+{members.length - 5}</span>}</div><div className="cluster-pattern"><small>GROUP PATTERN</small><div>{model.features.map((feature) => <span key={feature}>{FEATURE_META[feature].short}: <b>{prettyValue(feature, model.modes[i][feature])}</b></span>)}</div></div></div>)}</div>
          <button className="fold-toggle fold-toggle--why" onClick={() => setShowWhy(!showWhy)}><span><Icon name="info" size={16}/> How did it decide?</span><Icon name={showWhy ? 'close' : 'arrow'} size={16}/></button>{showWhy && <div className="algorithm-note"><b>Inside the model</b><p>The computer compares each alien with each group’s typical features. It puts the alien in the closest group, updates each group’s most common feature values, then repeats. It only uses the features you selected.</p><p>It does not know the “correct” tribe. You decide if the pattern is useful.</p></div>}
        </>}
      </section>
    </div>

    <section className="test-bench panel-card">
      <div className="test-bench-top"><div><span className="section-kicker">03 / THE UNSEEN TEST COLLECTION</span><h2>Meet an alien the model has never seen.</h2><p>These specimens were kept out of training. Guess first, ask the computer, then compare the clues.</p></div><div className="test-count-badge"><span><Icon name="scan" size={19}/></span><div><b>{testedCount}/{Math.min(3, testSet.length)}</b><small>tested with this model</small></div></div></div>
      <div className="test-bench-content">
        <div className="test-specimen-list">{testSet.map((alien, index) => <button key={alien.id} className={`test-specimen-tab ${testIndex === index ? 'is-active' : ''} ${testResults[alien.id] ? 'is-tested' : ''}`} onClick={() => goToTest(index)}><span className="test-tab-alien"><Alien alien={alien} size="xs" showName={false}/></span><span><b>{alien.name}</b><small>{testResults[alien.id] ? `Placed in Group ${testResults[alien.id].cluster + 1}` : 'Not tested yet'}</small></span><span className="test-tab-status">{testResults[alien.id] ? <Icon name="check" size={14}/> : <Icon name="arrow" size={14}/>}</span></button>)}</div>
        <div className="test-specimen-card">
          <div className="unseen-ribbon"><Icon name="spark" size={13}/> UNSEEN BY MODEL</div>
          <div className="test-alien-focus"><div className="test-orbit-ring"/><Alien alien={testAlien} size="hero" showName={false}/><div className="specimen-id">SPECIMEN {String(testIndex + 1).padStart(2, '0')}</div></div>
          <div className="test-focus-name"><span className="section-kicker">NEW SPECIMEN</span><h3>{testAlien.name}</h3><p>Make your own prediction before asking the computer.</p></div>
          <div className="test-feature-chips">{model ? model.features.map((feature) => <span key={feature}><small>{FEATURE_META[feature].short}</small><b>{prettyValue(feature, featureValue(testAlien, feature))}</b></span>) : <span className="no-model-hint">Train a model to inspect the features it uses.</span>}</div>
        </div>
        <div className="test-prediction-panel">
          <div className="prediction-step-title"><span>YOUR TURN</span><h3>Which group do you predict?</h3><p>Choose a group. It’s a prediction, not a test score.</p></div>
          {model ? <div className="guess-options">{model.modes.map((_, i) => <button key={i} className={`guess-option ${guess === i ? 'is-selected' : ''}`} onClick={() => setGuess(i)}><ClusterSwatch index={i}/><span>Group {i + 1}</span><span className="radio-dot">{guess === i && <i/>}</span></button>)}</div> : <div className="locked-explainer"><Icon name="lock"/><span>Train the model first to see its groups.</span></div>}
          <button className="button button--ask" onClick={askModel} disabled={!model || guess === null}><span><Icon name="lab" size={18}/></span> Ask the computer <Icon name="arrow" size={16}/></button>
          {newPrediction && <div className="prediction-result"><div className="prediction-result-head"><span className="result-computer-icon"><Icon name="lab" size={17}/></span><div><small>COMPUTER’S PREDICTION</small><b>Group {testCluster + 1}</b></div><ClusterSwatch index={testCluster}/></div><div className={`match-verdict match-verdict--${matchMessage(newPrediction.distance, model.features.length).tone}`}><b>{matchMessage(newPrediction.distance, model.features.length).title}</b><p>{matchMessage(newPrediction.distance, model.features.length).detail}</p></div><div className="comparison-lines"><div><span>Your guess</span><b>Group {guess + 1}</b></div><div><span>Computer’s guess</span><b>Group {testCluster + 1}</b></div><div><span>Features that differ</span><b>{newPrediction.distance} of {model.features.length}</b></div></div>{guess === testCluster ? <p className="prediction-reaction reaction-good"><Icon name="check" size={15}/> You and the computer made the same prediction.</p> : <p className="prediction-reaction"><Icon name="info" size={15}/> Different predictions! Compare the features — neither guess is a mark.</p>}{oldPrediction && <div className="old-model-note"><b>Last model:</b> this alien was placed in Group {oldPrediction.cluster + 1}. Group numbers can change when the model is retrained.</div>}</div>}
          {!newPrediction && model && <div className="prediction-nudge"><Icon name="spark" size={15}/> Look at the group patterns in the panel above before choosing.</div>}
        </div>
      </div>
      {previousModel && <div className="model-comparison"><div className="comparison-title"><span className="comparison-icon"><Icon name="refresh" size={17}/></span><div><span className="section-kicker">MODEL EXPERIMENT</span><h3>Before and after</h3></div><span className="comparison-version">V{modelVersion - 1} <Icon name="arrow" size={13}/> V{modelVersion}</span></div><div className="before-after-grid"><div><span className="before-after-label">PREVIOUS MODEL</span><b>{previousModel.k} groups · {previousModel.features.length} features</b><small>{previousModel.features.map((f) => FEATURE_META[f].short).join(', ')}</small></div><div><span className="before-after-label">CURRENT MODEL</span><b>{model.k} groups · {model.features.length} features</b><small>{model.features.map((f) => FEATURE_META[f].short).join(', ')}</small></div><div className="before-after-note"><Icon name="info" size={16}/><p>Check the same unseen aliens with both versions. A new grouping is not automatically better — ask whether its features are useful for your goal.</p></div></div><div className="comparison-table">{testSet.map((alien) => {const old=previousTestResults[alien.id]; const now=testResults[alien.id]; return <div className="comparison-row" key={alien.id}><span>{alien.name}</span><b>{old ? `Group ${old.cluster + 1}` : 'Not checked'}</b><Icon name="arrow" size={14}/><b>{now ? `Group ${now.cluster + 1}` : 'Not checked yet'}</b><span className="comparison-row-status">{now ? <Icon name="check" size={13}/> : '—'}</span></div>; })}</div></div>}
      <div className="lab-feedback"><span><Icon name="spark" size={17}/></span><p>{feedback}</p>{testedCount >= 3 && !previousModel && <b className="feedback-ready">READY TO IMPROVE</b>}</div>
      {finalMission && previousModel && testedCount >= 3 && <div className="field-report-card"><div className="report-heading"><span className="report-icon"><Icon name="book"/></span><div><span className="section-kicker">FINAL MISSION · FIELD REPORT</span><h3>What did your experiment teach you?</h3></div></div><p>Tell the Science Council how you tested and improved your model. There is no one perfect grouping.</p><div className="field-report-options">{reportOptions.map(([key, label]) => <button key={key} className={`field-report-option ${reportChoice === key ? 'is-selected' : ''}`} onClick={() => { setReportChoice(key); setReportSent(false); }}><span className="reason-radio">{reportChoice === key && <i/>}</span>{label}</button>)}</div>{reportSent ? <div className="report-sent-note"><Icon name="check" size={17}/> Field report ready. Chief Scientist, your expedition is complete!</div> : <button className="button button--primary" onClick={() => setReportSent(true)}>Send field report <Icon name="arrow"/></button>}</div>}
      <div className="mission-footer lab-footer"><div className="footer-progress"><span>MODEL TESTING</span><div className="tiny-track"><i style={{ width: `${testedCount / Math.min(3, testSet.length) * 100}%` }}/></div><b>{testedCount}/{Math.min(3, testSet.length)} test aliens</b></div><span className="footer-hint">{!model ? 'Your model is waiting to be trained.' : !previousModel ? `Test ${Math.min(3, testSet.length) - testedCount} unseen aliens, then change your settings and retrain.` : `Test ${Math.min(3, testSet.length) - testedCount} aliens with the new model${finalMission && !reportSent ? ', then send your field report' : '.'}`}</span>{readyForCompletion && <button className="button button--primary" onClick={() => onComplete(finalMission ? 5 : 4)}>{finalMission ? 'Finish expedition' : 'Unlock Galaxy Mapper'} <Icon name="arrow"/></button>}</div>
    </section>
  </MissionShell>;
}

function RewardScene({ stageId, onContinue }) {
  const rewardData = {
    1: { badge: 'Feature Finder', title: 'First contact complete!', body: 'You scanned the locals and spotted a shared feature. Your Alien Field Guide is ready.', next: 'Cargo chaos awaits at Tidy-9.', accent: 'mint', reward: 'FIELD GUIDE UNLOCKED' },
    2: { badge: 'Cargo Captain', title: 'Every crate, in place!', body: 'You sorted the same aliens by more than one rule. You discovered that the way we group things depends on the rule we choose.', next: 'A mysterious population is waiting on Planet Mosaic.', accent: 'orange', reward: 'CARGO BAY CLEARED' },
    3: { badge: 'Pattern Finder', title: 'A pattern of your own!', body: 'You created groups without being given their names. Your discovery is one possible way to make sense of the galaxy.', next: 'The ship computer is waiting in the Galaxy Lab.', accent: 'pink', reward: 'PATTERN FINDER BADGE' },
    4: { badge: 'Model Tester', title: 'You challenged the computer!', body: 'You trained a model, tested unseen aliens, changed the settings and tried again. That is how scientists learn what a model can do.', next: 'The Science Council has one final mission for you.', accent: 'blue', reward: 'GALAXY MAPPER UNLOCKED' },
    5: { badge: 'Chief Galaxy Scientist', title: 'The galaxy is full of patterns!', body: 'You led the experiment from features to clustering, tested your model on unseen aliens, and prepared a field report for the Science Council.', next: 'Your achievement certificate is ready.', accent: 'gold', reward: 'EXPEDITION COMPLETE' },
  };
  const stage = STAGES[stageId - 1];
  const reward = rewardData[stageId] || rewardData[1];
  return <div className="reward-screen">
    <div className="reward-top"><div className="agency-stamp"><span className="stamp-dot"/><span>GALACTIC DISCOVERY AGENCY</span><b>MISSION DEBRIEF / 0{stageId}</b></div><span className="reward-top-status"><Icon name="check" size={14}/> MISSION COMPLETE</span></div>
    <div className={`reward-scene reward-scene--${reward.accent}`}>
      <div className="reward-spark reward-spark--one">✦</div><div className="reward-spark reward-spark--two">✧</div><div className="reward-spark reward-spark--three">✦</div>
      <div className="reward-badge-wrap"><div className="reward-orbit reward-orbit--one"/><div className="reward-orbit reward-orbit--two"/><div className="reward-medal"><div><Icon name={stage.icon} size={42}/></div><span className="medal-shine"/></div><div className="reward-mini-alien reward-mini-alien--left"><Alien alien={ALIENS[(stageId * 3) % ALIENS.length]} size="hero" showName={false}/></div><div className="reward-mini-alien reward-mini-alien--right"><Alien alien={ALIENS[(stageId * 7 + 2) % ALIENS.length]} size="hero" showName={false}/></div></div>
      <div className="reward-copy"><span className="reward-kicker"><Icon name="spark" size={14}/> {reward.reward}</span><h1>{reward.title}</h1><p>{reward.body}</p><div className="reward-badge-name"><span><Icon name="star" size={16}/></span><div><small>NEW ACHIEVEMENT</small><b>{reward.badge}</b></div><Icon name="check" size={19}/></div><div className="reward-next"><span>NEXT TRANSMISSION</span><b>{reward.next}</b></div><button className="button button--primary button--hero" onClick={() => { playSound('complete'); onContinue(); }}>{stageId === 5 ? 'Receive my certificate' : 'Return to galaxy map'} <Icon name="arrow" size={19}/></button></div>
    </div>
    <div className="reward-bottom"><span>CAPTAIN NOVA <i>✦</i> VERY GOOD WORK, EXPLORER</span><span>THE GALAXY IS STILL FULL OF MYSTERIES</span></div>
  </div>;
}

function Finale({ completed, onMap, onReset }) {
  const [name, setName] = useState('Chief Scientist');
  return <div className="finale-screen">
    <div className="finale-top"><div className="agency-stamp"><span className="stamp-dot"/><span>GALACTIC DISCOVERY AGENCY</span><b>MISSION ARCHIVE / 05</b></div><button className="utility-button" onClick={onMap}><Icon name="back"/> Galaxy map</button></div>
    <div className="finale-confetti finale-confetti--one">✦</div><div className="finale-confetti finale-confetti--two">✧</div><div className="finale-confetti finale-confetti--three">✦</div><div className="finale-confetti finale-confetti--four">✧</div>
    <div className="finale-hero"><div className="finale-medal"><div className="medal-ring"><Icon name="star" size={49}/></div><span className="medal-ribbon medal-ribbon--left"/><span className="medal-ribbon medal-ribbon--right"/></div><div className="eyebrow"><span className="eyebrow-line"/> EXPEDITION COMPLETE</div><h1>You found a universe<br/>of <em>patterns.</em></h1><p>You explored, grouped, tested, and tried again. That is what real scientists do.</p><div className="finale-ships"><SpaceShip large/><span className="finale-alien finale-alien--one"><Alien alien={ALIENS[3]} size="hero" showName={false}/></span><span className="finale-alien finale-alien--two"><Alien alien={ALIENS[18]} size="hero" showName={false}/></span></div></div>
    <section className="certificate-card"><div className="certificate-border"><div className="certificate-topline"><span>GDA • FIELD DIVISION 07</span><span>OFFICIAL DISCOVERY RECORD</span></div><div className="certificate-star"><Icon name="star" size={23}/></div><span className="certificate-kicker">CERTIFICATE OF GALACTIC DISCOVERY</span><h2>Chief Galaxy Scientist</h2><p className="certificate-small">Proudly awarded to</p><input value={name} onChange={(e) => setName(e.target.value)} aria-label="Name on certificate" maxLength={36}/><p className="certificate-description">For showing curiosity, finding patterns, testing ideas, and improving a model with care.</p><div className="certificate-skills">{['FEATURE FINDER','PATTERN SPOTTER','MODEL TESTER'].map((label,i)=><span key={label}><i><Icon name={i===0?'scan':i===1?'cluster':'lab'} size={16}/></i>{label}</span>)}</div><div className="certificate-footer"><span>CLUSTER GALAXY</span><span>5 MISSIONS • 1 BIG DISCOVERY</span><span>CAPTAIN NOVA <b>✦</b></span></div></div><div className="certificate-actions"><button className="button button--primary" onClick={() => window.print()}><Icon name="book"/> Print certificate</button><button className="button button--outline" onClick={onMap}>Explore the galaxy again</button></div></section>
    <section className="recap-section"><div className="eyebrow"><span className="eyebrow-line"/> YOUR SCIENCE RECAP</div><h2>Five things you now know.</h2><div className="recap-grid">{[
      ['01','Features','Details help us describe things.'],['02','Similarity','Things can share some features but differ in others.'],['03','Clustering','A model can discover groups without group names.'],['04','Testing','Try a model on examples it did not train on.'],['05','Improving','Change the features and check what happens.'],
    ].map(([num,title,desc])=><div className="recap-card" key={num}><span>{num}</span><b>{title}</b><p>{desc}</p></div>)}</div></section>
    <div className="finale-bottom"><span>END OF MISSION FILE <b>•</b> THE GALAXY IS STILL FULL OF MYSTERIES</span><button className="text-button" onClick={onReset}>Start fresh</button></div>
  </div>;
}

export default function App() {
  const [screen, setScreen] = useState('intro');
  const [currentStage, setCurrentStage] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [modal, setModal] = useState(null);
  const [muted, setMuted] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [pendingRewardId, setPendingRewardId] = useState(null);

  useEffect(() => {
    gameMuted = muted;
  }, [muted]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (stored && Array.isArray(stored.completed)) {
        const cleaned = stored.completed.filter((n) => Number.isInteger(n) && n >= 1 && n <= 5);
        setCompleted([...new Set(cleaned)]);
        setHasSave(cleaned.length > 0);
        if (cleaned.length === 5) setScreen('final');
      }
    } catch { /* local progress is optional; the game still works without it */ }
    const mapListener = () => setScreen('map');
    window.addEventListener('cg-map', mapListener);
    return () => window.removeEventListener('cg-map', mapListener);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ completed, updatedAt: new Date().toISOString() })); } catch { /* private browsing may block local storage */ }
    if (completed.length) setHasSave(true);
  }, [completed]);

  const launchStage = (stageId) => {
    if (stageId > 1 && !completed.includes(stageId - 1)) return;
    setCurrentStage(stageId); setScreen('stage'); setModal(null);
  };
  const completeStage = (stageId) => {
    playSound('complete');
    setPendingRewardId(stageId);
    setScreen('reward');
  };
  const finishReward = () => {
    const stageId = pendingRewardId;
    if (!stageId) return;
    setCompleted((old) => [...new Set([...old, stageId])].sort((a,b)=>a-b));
    setPendingRewardId(null);
    setScreen(stageId === 5 ? 'final' : 'map');
  };
  const resetProgress = () => {
    try { localStorage.removeItem(SAVE_KEY); for (let i = 1; i <= 5; i += 1) localStorage.removeItem(`cluster-galaxy-briefing-${i}`); } catch { /* ignore */ }
    setCompleted([]); setCurrentStage(1); setPendingRewardId(null); setModal(null); setScreen('intro'); setHasSave(false);
  };
  const goMap = () => { setScreen('map'); setModal(null); };

  return <div className="app-shell">
    <div className="ambient-stars ambient-stars--one"/><div className="ambient-stars ambient-stars--two"/><div className="ambient-glow ambient-glow--left"/><div className="ambient-glow ambient-glow--right"/>
    {screen === 'intro' ? <Intro hasSave={hasSave} onStart={() => { setCurrentStage(1); setScreen('map'); }} onContinue={() => setScreen('map')}/> : screen === 'map' ? <><TopBar onMap={goMap} onHelp={() => setModal('guide')} onLearn={() => setModal('learn')} muted={muted} setMuted={setMuted} completedCount={completed.length}/><GalaxyMap completed={completed} onLaunch={launchStage} onReset={resetProgress}/></> : screen === 'final' ? <Finale completed={completed} onMap={goMap} onReset={resetProgress}/> : screen === 'reward' ? null : <><TopBar onMap={goMap} onHelp={() => setModal('guide')} onLearn={() => setModal('learn')} muted={muted} setMuted={setMuted} activeStage={currentStage} completedCount={completed.length}/>{currentStage === 1 ? <MissionOne key="stage-1" onComplete={completeStage}/> : currentStage === 2 ? <MissionTwo key="stage-2" onComplete={completeStage}/> : currentStage === 3 ? <MissionThree key="stage-3" onComplete={completeStage}/> : currentStage === 4 ? <ModelLab key="stage-4" onComplete={completeStage}/> : <ModelLab key="stage-5" finalMission onComplete={completeStage}/>}</>}
    {screen === 'reward' && <RewardScene stageId={pendingRewardId || 1} onContinue={finishReward}/> }
    {modal && <Modal type={modal} stage={currentStage} onClose={() => setModal(null)}/>}
    <footer className="site-footer"><span>CLUSTER GALAXY <i>✦</i> A LITTLE GAME ABOUT BIG PATTERNS</span><span>YOUR PROGRESS STAYS ON THIS DEVICE</span></footer>
  </div>;
}
