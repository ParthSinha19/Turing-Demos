import React, { useEffect, useState } from 'react';
import { Radar, Palette } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import Hotspot from '../components/Hotspot';
import { DialogueBox } from '../components/Dialogue';
import { PipMeter } from '../components/Hud';
import { useGame } from '../state/GameContext';
import { MISSIONS } from '../data/missions';

const HQ_LABELS = { 1: 'Forest Office', 2: 'Expanded Headquarters', 3: 'Orbital Observatory' };
const L = (speaker, expression, text) => ({ speaker, expression, text });
const HQ_LINES = {
  fern: [
    L('fern', 'happy', 'Open the world map to pick your next case. I will be right behind you.'),
    L('fern', 'thinking', 'Tip: the investigation board shows how clues connect. Even clues from different worlds.'),
  ],
  pip: [
    L('pip', 'happy', 'I like shiny things. They are easier to find when they sparkle!'),
    L('pip', 'worried', 'That sky shard? I did not know it was important. I thought it was a very fancy pebble.'),
  ],
  orbit: [
    L('orbit', 'neutral', 'Orbital systems connected. I am now 73% less confused. That is an improvement.'),
    L('orbit', 'worried', 'The same strange errors appear in both networks. I cannot yet identify their source.'),
  ],
  guardian: [
    L('guardian', 'happy', 'I check every message before I block it now. And when I am not sure, I ask a person.'),
    L('guardian', 'thinking', 'Somebody woke me long ago. One day we will find out who. Until then: check, think, ask.'),
  ],
};
const SHUTTLE_LINES = {
  fern: [
    L('fern', 'happy', 'Welcome aboard the Starship Atlas! Open the star map to choose your next case.'),
    L('fern', 'thinking', 'Tip: the evidence board connects clues from the forest and from space.'),
  ],
};

export default function Headquarters() {
  const { state, dispatch, openOverlay, startMission, go } = useGame();
  const [talk, setTalk] = useState(null);
  const [banner, setBanner] = useState(state.hqJustExpanded);
  useEffect(() => { if (state.hqJustExpanded) { const t = setTimeout(() => { setBanner(false); dispatch({ type: 'HQ_SEEN' }); }, 3600); return () => clearTimeout(t); } return undefined; }, []); // eslint-disable-line
  const next = MISSIONS.find((m) => state.unlocked.includes(m.id) && !state.completed.includes(m.id));
  // From the moment the shuttle leaves the forest, the Starship Atlas is the detective's headquarters.
  const shuttle = state.completed.includes('forest-5');
  const lines = { ...HQ_LINES, ...(shuttle ? SHUTTLE_LINES : {}) };
  const has = (id) => state.characters.includes(id);
  const label = shuttle ? 'Starship Atlas' : HQ_LABELS[state.hqLevel];
  return (
    <div className={`screen hq ${shuttle ? 'is-shuttle' : ''}`} data-screen="Headquarters" data-realm={shuttle ? 'space' : 'hq'}>
      <Environment id={shuttle ? 'shuttle' : 'hq'} level={state.hqLevel} className={banner ? 'expanding' : ''}>
        <div className="hq-detective"><Character id="detective" player={state.player} size={360} expression="happy" /></div>
        <div className="hq-fern"><Character id="fern" size={210} expression="happy" flip /></div>
        {has('pip') && <div className="hq-pip"><Character id="pip" size={130} expression="happy" /></div>}
        {has('orbit') && <div className="hq-orbit"><Character id="orbit" size={150} expression="neutral" /></div>}
        {has('guardian') && state.completed.includes('space-7') && <div className="hq-guardian"><Character id="guardian" size={150} expression="happy" /></div>}
        <Hotspot id="hs-map" x={12.5} y={30} label={shuttle ? 'Star map & cases' : 'World map & cases'} icon="globe" onClick={() => openOverlay('map')} badge={next ? '!' : null} />
        <Hotspot id="hs-board" x={87} y={30} label="Investigation board" icon="eye" onClick={() => openOverlay('board')} />
        <Hotspot id="hs-notebook" x={50} y={80} label="Detective notebook" icon="star" onClick={() => openOverlay('notebook')} />
        <Hotspot id="hs-workshop" x={90} y={73} label={state.hqLevel >= 2 ? 'Gadget workshop' : 'Workshop (locked)'} icon="cog" locked={state.hqLevel < 2} onClick={() => openOverlay('workshop')} />
        <Hotspot id="hs-fern" x={24} y={66} label="Talk to Fern" icon="paw" onClick={() => setTalk({ who: 'fern', index: 0 })} />
        {has('pip') && <Hotspot id="hs-pip" x={75} y={70} label="Talk to Pip" icon="feather" onClick={() => setTalk({ who: 'pip', index: 0 })} />}
        {has('orbit') && <Hotspot id="hs-orbit" x={76} y={46} label="Talk to O.R.B.I.T." icon="orbit" onClick={() => setTalk({ who: 'orbit', index: 0 })} />}
        {has('guardian') && state.completed.includes('space-7') && <Hotspot id="hs-guardian" x={30} y={40} label="Talk to the Guardian" icon="shield" onClick={() => setTalk({ who: 'guardian', index: 0 })} />}
        {state.completed.includes('space-7') && <Hotspot id="hs-code" x={62} y={55} label="AI Safety Code" icon="shieldcheck" onClick={() => openOverlay('code')} />}
        {state.hqLevel >= 3 && <Hotspot id="hs-holo" x={50} y={63} label={shuttle ? 'Star map hologram' : 'Orbit star map'} icon="orbit" onClick={() => openOverlay('map')} />}

        <div className="hud-top hq-top">
          <div className="hud hq-badge"><Radar size={18} /><div><b>{state.player.name}'s {shuttle ? 'Starship' : 'HQ'}</b><small>{label}</small></div></div>
          <div className="hud hq-progress"><small>Cases solved</small><PipMeter total={MISSIONS.length} value={state.completed.length} /></div>
          <button className="icon-btn hud" onClick={() => go('customise')} aria-label="Change your name and look" title="Change your name and look" data-id="change-look"><Palette size={20} /></button>
        </div>
        {next && <button className="next-case hud" onClick={() => startMission(next.id, next.realm === 'space' ? 'warp' : 'iris')} data-id="next-case"><small>Next case</small><b>{next.title}</b></button>}
        {talk !== null && <div className="hq-talk"><DialogueBox line={lines[talk.who][talk.index]} isLast={talk.index + 1 >= lines[talk.who].length} onNext={() => setTalk(talk.index + 1 >= lines[talk.who].length ? null : { ...talk, index: talk.index + 1 })} /></div>}
        {banner && <div className="expand-banner" data-component="ExpansionBanner"><small>{shuttle ? 'Your new headquarters' : 'Headquarters upgraded'}</small><b>{label}</b></div>}
      </Environment>
    </div>
  );
}