import React, { useState } from 'react';
import { Lock, Check, Link2, MapPin } from 'lucide-react';
import { Overlay, HudButton } from '../components/Hud';
import { EvidenceCard } from '../components/Evidence';
import Character, { Detective } from '../components/Characters';
import Glyph from '../components/Glyph';
import { useGame } from '../state/GameContext';
import { MISSIONS } from '../data/missions';
import { EVIDENCE, CONNECTIONS, CONCEPTS } from '../data/evidence';
import { CHARACTERS } from '../data/characters';
import { GADGETS } from '../data/customise';

/* ───────── World map + mission board ───────── */
export function MapOverlay() {
  const { state, closeOverlay, startMission } = useGame();
  const [tab, setTab] = useState('map');
  const [sel, setSel] = useState((MISSIONS.find((m) => state.unlocked.includes(m.id) && !state.completed.includes(m.id)) || MISSIONS[0]).id);
  const m = MISSIONS.find((x) => x.id === sel);
  const st = (x) => (state.completed.includes(x.id) ? 'done' : state.unlocked.includes(x.id) ? 'open' : 'locked');
  const forest = MISSIONS.filter((x) => x.realm === 'forest'), space = MISSIONS.filter((x) => x.realm === 'space');
  const line = (arr) => arr.map((x) => x.map.join(',')).join(' ');
  return (
    <Overlay title="World map" tag="Cases" onClose={closeOverlay} wide className="map-ov">
      <div className="tabs"><button className={tab === 'map' ? 'on' : ''} onClick={() => setTab('map')}>Map</button><button className={tab === 'board' ? 'on' : ''} onClick={() => setTab('board')}>Mission board</button></div>
      {tab === 'map' ? (
        <div className="worldmap" data-component="WorldMap">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="wm-svg">
            <defs><radialGradient id="wm-f" cx=".3" cy=".6" r=".6"><stop offset="0" stopColor="#2a8f7a" stopOpacity=".6" /><stop offset="1" stopColor="#2a8f7a" stopOpacity="0" /></radialGradient><radialGradient id="wm-s" cx=".8" cy=".5" r=".6"><stop offset="0" stopColor="#7d4fd1" stopOpacity=".6" /><stop offset="1" stopColor="#7d4fd1" stopOpacity="0" /></radialGradient></defs>
            <rect width="100" height="100" fill="url(#wm-f)" /><rect width="100" height="100" fill="url(#wm-s)" />
            <polyline points={line(forest)} fill="none" stroke="#7be0a4" strokeWidth="1.4" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" opacity=".7" />
            <polyline points={line(space)} fill="none" stroke="#5ee7ff" strokeWidth="1.4" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" opacity=".7" />
            <polyline points={`${forest[forest.length - 1].map.join(',')} ${space[0].map.join(',')}`} fill="none" stroke="#ff4fd8" strokeWidth="2" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" className="wm-glitch" />
          </svg>
          <span className="wm-label f">The Forest</span><span className="wm-label s">Orbital Network</span>
          {MISSIONS.map((x) => (
            <button key={x.id} className={`wm-node ${st(x)} ${sel === x.id ? 'sel' : ''} realm-${x.realm}`} style={{ left: `${x.map[0]}%`, top: `${x.map[1]}%` }} onClick={() => setSel(x.id)} aria-label={x.title}>
              {st(x) === 'done' ? <Check size={16} /> : st(x) === 'locked' ? <Lock size={14} /> : <span>{x.chapterLabel}</span>}
            </button>
          ))}
        </div>
      ) : (
        <ul className="case-list" data-component="MissionBoard">
          {MISSIONS.map((x) => <li key={x.id}><button className={`case-row ${st(x)} ${sel === x.id ? 'sel' : ''}`} onClick={() => setSel(x.id)}><b>{x.chapterLabel}</b><span>{x.title}</span><em>{st(x) === 'done' ? 'Solved' : st(x) === 'open' ? 'Open' : 'Locked'}</em></button></li>)}
        </ul>
      )}
      <div className={`case-detail realm-${m.realm}`}>
        <div><small><MapPin size={13} /> Chapter {m.chapterLabel}</small><h3>{m.title}</h3><p>{m.summary}</p>{m.realm === 'space' && !state.unlocked.includes('space-1') && <p className="unlock-explainer">The Space Wing unlocks when the Forest investigation is complete.</p>}</div>
        <HudButton primary disabled={st(m) === 'locked'} onClick={() => startMission(m.id, m.realm === 'space' ? 'warp' : 'iris')} data-id="begin-mission">{st(m) === 'locked' ? 'Locked' : st(m) === 'done' ? 'Replay case' : 'Begin investigation'}</HudButton>
      </div>
    </Overlay>
  );
}

/* ───────── Investigation board ───────── */
export function BoardOverlay() {
  const { state, closeOverlay, tryLink } = useGame();
  const [pick, setPick] = useState(null);
  const [miss, setMiss] = useState(false);
  const have = (id) => state.evidence.includes(id);
  const pos = (id) => EVIDENCE.find((e) => e.id === id).boardPos;
  const click = (id) => {
    if (!have(id)) return;
    if (!pick) { setPick(id); return; }
    if (pick === id) { setPick(null); return; }
    const c = tryLink(pick, id);
    if (!c) { setMiss(true); setTimeout(() => setMiss(false), 900); }
    setPick(null);
  };
  const found = CONNECTIONS.filter((c) => state.links.includes(c.id));
  return (
    <Overlay title="Investigation board" tag="Evidence" onClose={closeOverlay} wide className="board-ov">
      <p className="board-help"><Link2 size={15} /> Tap two clues to see if they connect. Red strings link clues from different worlds.</p>
      <div className={`board ${miss ? 'miss' : ''}`} data-component="InvestigationBoard">
        <svg className="board-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {found.map((c) => { const a = pos(c.a), b = pos(c.b); const cross = EVIDENCE.find((e) => e.id === c.a).realm !== EVIDENCE.find((e) => e.id === c.b).realm; return <line key={c.id} className={cross ? 'string cross' : 'string'} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} vectorEffect="non-scaling-stroke" />; })}
        </svg>
        {EVIDENCE.map((e, i) => (
          <button key={e.id} className={`pin ${pick === e.id ? 'pick' : ''} ${have(e.id) ? 'have' : ''}`} style={{ left: `${e.boardPos[0]}%`, top: `${e.boardPos[1]}%`, transform: `translate(-50%,-50%) rotate(${(i % 5) * 2 - 4}deg)` }} onClick={() => click(e.id)} aria-label={have(e.id) ? e.title : 'Undiscovered clue'}>
            <i className="pushpin" />{have(e.id) ? <EvidenceCard evidence={e} small /> : <EvidenceCard locked small />}
          </button>
        ))}
      </div>
      <div className="found-list">{found.length === 0 ? <em>No connections yet. Collect more evidence, then link clues.</em> : found.map((c) => <p key={c.id}><Link2 size={14} /> {c.label}</p>)}</div>
    </Overlay>
  );
}

/* ───────── Detective notebook ───────── */
const NB_TABS = [['evidence', 'Evidence'], ['characters', 'Characters'], ['discoveries', 'Discoveries'], ['concepts', 'Concepts'], ['cases', 'Cases']];
export function NotebookOverlay() {
  const { state, closeOverlay } = useGame();
  const [tab, setTab] = useState('evidence');
  const empty = (t) => <p className="nb-empty">{t}</p>;
  return (
    <Overlay title="Detective notebook" tag={state.player.name} onClose={closeOverlay} wide className="notebook-ov">
      <div className="notebook" data-component="Notebook">
        <nav className="nb-tabs">{NB_TABS.map(([id, l]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}</nav>
        <div className="nb-page">
          <div className="nb-spiral" aria-hidden>{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
          {tab === 'evidence' && (state.evidence.length ? <div className="nb-grid">{EVIDENCE.filter((e) => state.evidence.includes(e.id)).map((e) => <EvidenceCard key={e.id} evidence={e} />)}</div> : empty('Nothing collected yet. Look for sparkles in the scene.'))}
          {tab === 'characters' && <div className="nb-chars">{state.characters.map((id) => <article key={id} className="nb-char" style={{ '--who': CHARACTERS[id].color }}>{id === 'detective' ? <Detective player={state.player} view="bust" size={90} expression="happy" /> : <Character id={id} size={90} bust expression="neutral" />}<div><h4>{id === 'detective' ? state.player.name : CHARACTERS[id].name}</h4><small>{CHARACTERS[id].role}</small><p>{CHARACTERS[id].bio}</p></div></article>)}</div>}
          {tab === 'discoveries' && (state.discoveries.length ? <ul className="nb-list">{state.discoveries.map((d) => <li key={d.id}>{d.text}</li>)}</ul> : empty('Solve a case to write your first discovery.'))}
          {tab === 'concepts' && (state.concepts.length ? <div className="nb-concepts">{state.concepts.map((c) => <article key={c}><h4>{CONCEPTS[c].title}</h4><p>{CONCEPTS[c].text}</p></article>)}</div> : empty('Computing ideas you learn will be written here.'))}
          {tab === 'cases' && <ul className="nb-cases">{MISSIONS.map((m) => <li key={m.id} className={state.completed.includes(m.id) ? 'done' : ''}><Check size={16} /><span>{m.title}</span></li>)}</ul>}
        </div>
      </div>
    </Overlay>
  );
}

/* ───────── Gadget workshop ───────── */
export function WorkshopOverlay() {
  const { state, setPlayer, closeOverlay } = useGame();
  return (
    <Overlay title="Gadget workshop" tag="Upgrade" onClose={closeOverlay} className="workshop-ov">
      <div className="workshop">
        <Character id="detective" player={state.player} size={300} expression="happy" />
        <div className="gadgets">{GADGETS.map((g) => { const unlocked = state.gadgets.includes(g.id); return <button key={g.id} className={`${state.player.gadget === g.id ? 'on' : ''} ${unlocked ? '' : 'locked'}`} disabled={!unlocked} onClick={() => setPlayer({ gadget: g.id })}><b>{g.label}</b><span>{unlocked ? g.blurb : 'Unlock by solving future cases.'}</span></button>; })}</div>
      </div>
    </Overlay>
  );
}

/* ───────── Settings ───────── */
export function SettingsOverlay() {
  const { state, dispatch, closeOverlay, newGame } = useGame();
  const s = state.settings;
  const set = (patch) => dispatch({ type: 'SETTINGS', patch });
  return (
    <Overlay title="Settings" tag="Options" onClose={closeOverlay} className="settings-ov">
      <div className="settings">
        {[['sound', 'Sound (placeholder)'], ['reduceMotion', 'Calm motion'], ['bigText', 'Bigger text']].map(([k, l]) => (
          <label key={k} className="switch"><span>{l}</span><input type="checkbox" checked={s[k]} onChange={(e) => set({ [k]: e.target.checked })} /><i /></label>
        ))}
        <div className="switch"><span>Text speed</span><div className="seg">{['slow', 'normal', 'fast', 'instant'].map((v) => <button key={v} className={s.textSpeed === v ? 'on' : ''} onClick={() => set({ textSpeed: v })}>{v}</button>)}</div></div>
        <button className="reset-save" onClick={() => { if (window.confirm('Reset all cases, clues and discoveries? This cannot be undone.')) newGame(); }}>Reset game progress</button>
      </div>
    </Overlay>
  );
}
