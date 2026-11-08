import { Ico } from '../ui/Ico.jsx';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { createStore, sleep } from '../game/mini.js';
import { FINAL_LEVEL, startState } from '../game/nav.js';
import { decide } from '../game/rules.js';
import { F_SHIP_OBJECTS, S_CATS, E_CATS, eItem } from '../game/classify.js';
import { SIGNALS, kmeans, GROUP_COLOURS } from '../game/cluster.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { SpaceItem, ObjectModel } from '../scenes/Objects.jsx';
import { Stars, PlanetBall, Glow } from '../scenes/Space.jsx';
import { Board, NavPanel } from './Mars.jsx';

const NAV = createStore({ prog: [], sim: startState(FINAL_LEVEL), running: false, now: -1, status: 'plan', msg: '', stars: 0, bump: 0 });
const init = () => ({ stage: 0, msg: '', picks: {}, ok: {}, rules: {}, signals: null, k: 2, said: '' });
const F = createStore(init());

const E_PAIR = ['ball', 'cat'];
const DECIDE_FACTS = [
  { id: 'calm', label: 'The ship is calm', emoji: <Ico e="😌" /> },
  { id: 'shield', label: 'The ship has a shield up', emoji: <Ico e="🛡️" /> },
  { id: 'damaged', label: 'The ship is damaged', emoji: <Ico e="💥" /> },
];
const DECIDE_ACTS = [
  { id: 'wave', label: 'Say hello', emoji: <Ico e="👋" /> },
  { id: 'wait', label: 'Wait and watch', emoji: '⏳' },
  { id: 'repair', label: 'Send a repair kit', emoji: <Ico e="🧰" /> },
];
const DECIDE_RIGHT = { calm: 'wave', shield: 'wait', damaged: 'repair' };
const STAGES = ['Understand', 'Navigate', 'Decide', 'Recognise', 'Group'];

function Cam() {
  const s = F.use().stage;
  const { camera } = useThree();
  useEffect(() => {
    if (s === 1) camera.position.set(0, 9.6, 8.2), camera.lookAt(0, 0, 0.6);
    else camera.position.set(0, 2.8, 9.5), camera.lookAt(0, 1.6, 0);
  }, [camera, s]);
  return null;
}

export function Scene() {
  const f = F.use();
  const n = NAV.use();
  return (
    <>
      <Cam />
      <ambientLight intensity={0.8} color="#d9e6ff" />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <Stars />
      <PlanetBall tex="neptune" radius={9} position={[-16, -4, -30]} atmosphere="#6e9bff" />
      {/* the big unknown ship */}
      <group position={[7, 6, -18]} scale={2.4}>
        <mesh scale={[1, 0.3, 1]}><sphereGeometry args={[2, 32, 16]} /><meshStandardMaterial color="#8fb5ff" metalness={0.8} roughness={0.25} /></mesh>
        <mesh position={[0, 0.4, 0]}><sphereGeometry args={[0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#9ff0ff" transparent opacity={0.7} emissive="#2fb4ff" emissiveIntensity={0.6} /></mesh>
        {Array.from({ length: 10 }).map((_, i) => <mesh key={i} position={[Math.cos(i * 0.628) * 1.85, -0.05, Math.sin(i * 0.628) * 1.85]}><sphereGeometry args={[0.1, 8, 6]} /><meshBasicMaterial color={i % 2 ? '#ffd166' : '#ff6b6b'} /></mesh>)}
      </group>
      <Glow color="#7ad7ff" size={26} opacity={0.2} position={[7, 6, -18]} />
      {f.stage === 1 ? (
        <Board level={FINAL_LEVEL} sim={n.sim} theme="space" />
      ) : (
        <group position={[-5.8, 0, 3]}><PlayerRobot scale={0.8} /></group>
      )}
      {f.stage === 0 && E_PAIR.map((id, i) => <group key={id} position={[i * 3 - 1.5, 0.6, 0]} scale={1.8}><ObjectModel kind={id} /></group>)}
      {f.stage === 3 && F_SHIP_OBJECTS.map((o, i) => <group key={o.id} position={[(i - 1.5) * 2.2, 1, 0]} scale={1.3}><SpaceItem f={o.f} /></group>)}
      {f.stage === 4 && f.signals &&
        SIGNALS.map((p, i) => {
          const g = f.signals.labels[i];
          return <mesh key={i} position={[p[0] * 1.5 - 4.5, p[1] * 1.0 + 0.4, 0]}><sphereGeometry args={[0.32, 16, 12]} /><meshStandardMaterial color={GROUP_COLOURS[g]} emissive={GROUP_COLOURS[g]} emissiveIntensity={0.9} /></mesh>;
        })}
      {f.stage === 4 && !f.signals && SIGNALS.map((p, i) => <mesh key={i} position={[p[0] * 1.5 - 4.5, p[1] * 1.0 + 0.4, 0]}><sphereGeometry args={[0.32, 16, 12]} /><meshStandardMaterial color="#cfe2ff" emissive="#7aa8ff" emissiveIntensity={0.7} /></mesh>)}
      {(f.stage === 2 || f.stage === 0) && <Glow color="#7ad7ff" size={4} opacity={0.2} position={[0, 1.5, 0]} />}
    </>
  );
}

function Pick({ options, onPick }) {
  return (
    <div className="chips">
      {options.map((c) => (
        <Btn key={c.id} kind="ghost cat-btn" onClick={() => onPick(c.id)}>
          <span className="em"><Ico e={c.emoji} /></span>
          {c.name || c.label}
        </Btn>
      ))}
    </div>
  );
}

const TUT = [
  { icon: <Ico e="🌍" />, text: 'Use what you learned on every planet.' },
  { icon: <Ico e="🧭" />, text: 'Each part of the ship needs a different skill.' },
  { icon: <Ico e="🔁" />, text: 'Wrong? Try again. Nobody is timing you!' },
];

export function UI() {
  const f = F.use();
  const nav = NAV.use();
  useEffect(() => {
    F.set(init());
    NAV.set({ prog: [], sim: startState(FINAL_LEVEL), running: false, now: -1, status: 'plan', msg: '', stars: 0, bump: 0 });
    react('wave', 2500);
  }, []);
  const next = () => F.set({ stage: f.stage + 1, msg: '', ok: {}, picks: {} });
  const say = f.msg;

  if (f.stage === 0) {
    const choose = (id, c) => {
      const right = eItem(id).label === c;
      sfx(right ? 'good' : 'oops');
      react(right ? 'wave' : 'oops', 900);
      F.set({ ok: { ...f.ok, [id]: right }, picks: { ...f.picks, [id]: c }, msg: right ? 'Yes! Clues and examples help me understand.' : 'Hmm, check the colour, shape and size again.' });
    };
    const both = E_PAIR.every((id) => f.ok[id]);
    return (
      <Shell id="final" objective="Understand the incoming messages" steps={STAGES} step={0} say={say || 'The ship is sending pictures. Let’s use clues to understand them!'} tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🌍" /> Earth skill: what is each thing?</h3>
          {E_PAIR.map((id) => (
            <div key={id} className="row">
              <b>{eItem(id).name}:</b>
              {E_CATS.map((c) => <Btn key={c.id} kind={`ghost small ${f.picks[id] === c.id ? (f.ok[id] ? 'good' : 'danger') : ''}`} onClick={() => choose(id, c.id)}><Ico e={c.emoji} /> {c.name}</Btn>)}
            </div>
          ))}
          <Btn kind="good" disabled={!both} onClick={next}>Next: navigate <Ico e="➜" /></Btn>
        </div>
      </Shell>
    );
  }
  if (f.stage === 1) {
    return (
      <Shell id="final" objective="Find a safe path through the asteroids" steps={STAGES} step={1} say={nav.msg || 'Asteroids ahead! Plan a safe path to the glowing gate.'} tutorial={TUT}>
        <div className="panel act">
          <NavPanel level={FINAL_LEVEL} store={NAV} />
          {nav.status === 'won' && <Btn kind="good" onClick={next}>Next: decide <Ico e="➜" /></Btn>}
        </div>
      </Shell>
    );
  }
  if (f.stage === 2) {
    const rules = DECIDE_FACTS.map((x) => ({ cond: x.id, action: f.rules[x.id] || null }));
    const test = async () => {
      let ok = true;
      for (const x of DECIDE_FACTS) {
        const d = decide(rules, [x.id]);
        const right = d.action === DECIDE_RIGHT[x.id];
        ok = ok && right;
        F.set({ ok: { ...f.ok, [x.id]: right }, msg: `${x.label}: I chose ${d.action ? DECIDE_ACTS.find((a) => a.id === d.action).label.toLowerCase() : 'nothing'}. ${right ? 'Correct!' : 'Not quite.'}` });
        f.ok[x.id] = right;
        sfx(right ? 'good' : 'oops');
        await sleep(1000);
      }
      F.set({ passed: ok, msg: ok ? 'My rules work for every situation!' : 'One rule is not quite right. Change it and test again.' });
      if (ok) react('celebrate', 1500);
    };
    return (
      <Shell id="final" objective="Decide how to approach the ship" steps={STAGES} step={2} say={say || 'How should I approach? Give me a rule for each situation.'} tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🧠" /> Jupiter skill: IF this, THEN that</h3>
          {DECIDE_FACTS.map((x) => (
            <div key={x.id} className="rule">
              <b>IF</b><span><Ico e={x.emoji} /> {x.label}</span><b>THEN</b>
              <div className="sel-wrap">{DECIDE_ACTS.map((a) => <button key={a.id} title={a.label} aria-label={a.label} aria-pressed={f.rules[x.id] === a.id} className={`mini ${f.rules[x.id] === a.id ? 'on' : ''}`} onClick={() => { sfx('click'); F.set({ rules: { ...f.rules, [x.id]: a.id }, passed: false, msg: '' }); }}><Ico e={a.emoji} /></button>)}</div>
              <span />
            </div>
          ))}
          <div className="row">
            <Btn kind="good" disabled={DECIDE_FACTS.some((x) => !f.rules[x.id])} onClick={test}><Ico e="▶" /> Test my rules</Btn>
            {f.passed && <Btn onClick={() => { F.set({ passed: false }); next(); }}>Next: recognise <Ico e="➜" /></Btn>}
          </div>
        </div>
      </Shell>
    );
  }
  if (f.stage === 3) {
    const choose = (id, c) => {
      const right = F_SHIP_OBJECTS.find((o) => o.id === id).label === c;
      sfx(right ? 'good' : 'oops');
      F.set({ ok: { ...f.ok, [id]: right }, picks: { ...f.picks, [id]: c }, msg: right ? 'Recognised!' : 'Not quite. Look at the shape and glow.' });
    };
    const all = F_SHIP_OBJECTS.every((o) => f.ok[o.id]);
    return (
      <Shell id="final" objective="Recognise the objects on the ship" steps={STAGES} step={3} say={say || 'There are objects aboard. What are they?'} tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🪐" /> Saturn skill: what kind of object?</h3>
          {F_SHIP_OBJECTS.map((o, i) => (
            <div key={o.id} className="row">
              <b>Object {i + 1}:</b>
              {S_CATS.map((c) => <Btn key={c.id} kind={`ghost small ${f.picks[o.id] === c.id ? (f.ok[o.id] ? 'good' : 'danger') : ''}`} onClick={() => choose(o.id, c.id)}><Ico e={c.emoji} /></Btn>)}
            </div>
          ))}
          <Btn kind="good" disabled={!all} onClick={next}>Next: group signals <Ico e="➜" /></Btn>
        </div>
      </Shell>
    );
  }
  const group = () => {
    const vecs = SIGNALS.map((p) => p);
    const r = kmeans(vecs, f.k);
    sfx('good');
    F.set({ signals: r, msg: f.k === 3 ? 'I found 3 neat groups of signals!' : `I made ${f.k} groups. Look at the dots: do they look right?` });
  };
  const good = f.signals && f.k === 3;
  return (
    <Shell id="final" objective="Group the unfamiliar signals" steps={STAGES} step={4} say={say || 'The signals are all mixed up! Let me find groups. How many do you see?'} tutorial={TUT}>
      <div className="panel act">
        <h3><Ico e="🔵" /> Neptune skill: find the groups</h3>
        <p>Look at the glowing dots. How many clumps can you see?</p>
        <div className="row">
          {[2, 3, 4].map((k) => <button key={k} className={`mini ${f.k === k ? 'on' : ''}`} aria-pressed={f.k === k} onClick={() => F.set({ k, signals: null, msg: '' })}>{k}</button>)}
          <Btn kind="good" onClick={group}><Ico e="🧲" /> Group the signals</Btn>
        </div>
        {good && <Btn kind="good" onClick={() => finishMission('final')}><Ico e="🌐" /> Restore the Galactic Network!</Btn>}
      </div>
    </Shell>
  );
}
