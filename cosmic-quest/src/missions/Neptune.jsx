import { Ico } from '../ui/Ico.jsx';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { createStore } from '../game/mini.js';
import { CREATURES, NEW_CREATURES, FEATURES, GROUP_COLOURS, GROUP_NAMES, clusterCreatures, assignNew, describeGroup } from '../game/cluster.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { Creature } from '../scenes/Objects.jsx';
import { Stars, PlanetBall, Glow, Dust } from '../scenes/Space.jsx';

const init = () => ({ phase: 'intro', feats: ['colour', 'legs'], k: 3, run: null, prev: null, showPrev: false, sel: null, tried: [], added: [], msg: '' });
const S = createStore(init());
const key = (f) => [...f].sort().join('+');

const all = (s) => [...CREATURES, ...s.added];
function labelsOf(s, run) {
  if (!run) return null;
  const l = [...run.labels];
  s.added.forEach((c) => l.push(assignNew(c, run.centroids, run.feats).group));
  return l;
}
function targets(n, labels, k) {
  if (!labels) return Array.from({ length: n }, (_, i) => [((i % 5) - 2) * 1.7 - (n > 20 ? 0 : 0), ((Math.floor(i / 5)) - 1.5) * 1.55 - 1.0]);
  const counts = new Array(k).fill(0);
  return labels.map((g) => {
    const j = counts[g]++;
    return [(g - (k - 1) / 2) * 4.4 + ((j % 3) - 1) * 1.15, Math.floor(j / 3) * 1.25 - 2.6];
  });
}

function Cam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 8.2, 9.6);
    camera.lookAt(0, 0.4, 0.6);
  }, [camera]);
  return null;
}

function Mover({ c, target, colour, sel, onPick, isNew }) {
  const g = useRef();
  useFrame((st, dt) => {
    if (!g.current) return;
    const k = 1 - Math.exp(-dt * 3);
    g.current.position.x += (target[0] - g.current.position.x) * k;
    g.current.position.z += (target[1] - g.current.position.z) * k;
    g.current.position.y = Math.abs(Math.sin(st.clock.elapsedTime * 2 + c.id)) * 0.05;
  });
  return (
    <group
      ref={g}
      position={[target[0], 0, target[1]]}
      onClick={(e) => { e.stopPropagation(); sfx('select'); onPick(c.id); }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <Creature c={c} />
      {colour && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.68, 28]} />
          <meshBasicMaterial color={colour} />
        </mesh>
      )}
      {(sel || isNew) && (
        <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.8, 28]} />
          <meshBasicMaterial color={isNew ? '#fff' : '#ffd166'} />
        </mesh>
      )}
    </group>
  );
}

export function Scene() {
  const s = S.use();
  const list = all(s);
  const run = s.showPrev ? s.prev : s.run;
  const labels = labelsOf(s, run);
  const tg = targets(list.length, labels, run ? run.k : 1);
  return (
    <>
      <Cam />
      <fog attach="fog" args={['#0a2a4a', 24, 60]} />
      <ambientLight intensity={0.85} color="#d6f0ff" />
      <directionalLight position={[4, 9, 6]} intensity={2.2} color="#e8f6ff" />
      <Stars />
      <PlanetBall tex="neptune" radius={8} position={[-14, 7, -28]} atmosphere="#6e9bff" spinSpeed={0.02} />
      <Dust color="#aef" y={6} />
      {/* ice floor */}
      <mesh position={[0, -0.2, 0.3]}><cylinderGeometry args={[10, 10.6, 0.4, 56]} /><meshStandardMaterial color="#cdeeff" roughness={0.25} metalness={0.2} /></mesh>
      {[[-8, -3], [8.5, -2], [-8.5, 3], [8, 3.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[0, 1, 2].map((j) => <mesh key={j} position={[j * 0.5 - 0.5, 0.7 + j * 0.3, 0]} rotation={[0, j, (j - 1) * 0.25]}><coneGeometry args={[0.35, 1.4 + j * 0.6, 5]} /><meshStandardMaterial color="#8be4ff" emissive="#34b6ff" emissiveIntensity={0.5} transparent opacity={0.85} flatShading /></mesh>)}
        </group>
      ))}
      {[[-6.5, -5.5], [6.5, -5.5], [0, -6.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 2.5 + i * 0.4, z]}><boxGeometry args={[1.4, 0.4, 1.4]} /><meshStandardMaterial color="#e6f8ff" roughness={0.2} /></mesh>
      ))}
      {[[-7.2, 0.5], [7.4, 0.3]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.04, 0.06, 1, 6]} /><meshStandardMaterial color="#2ee6b6" /></mesh>
          <mesh position={[0, 1.1, 0]}><sphereGeometry args={[0.2, 10, 8]} /><meshStandardMaterial color="#7dfcd8" emissive="#2ee6b6" emissiveIntensity={1.2} /></mesh>
        </group>
      ))}
      <group position={[-9, 0.1, 6]} rotation={[0, 0.6, 0]}><PlayerRobot scale={0.8} /></group>
      {list.map((c, i) => (
        <Mover key={c.id} c={c} target={tg[i]} colour={labels ? GROUP_COLOURS[labels[i]] : null} sel={s.sel === c.id} isNew={c.id > 100} onPick={(id) => S.set({ sel: id })} />
      ))}
      {run && <Glow color="#7dfcd8" size={20} opacity={0.08} position={[0, 0.5, 0]} />}
    </>
  );
}

const TUT = [
  { icon: <Ico e="🔍" />, text: 'Tap a creature to see its clues.' },
  { icon: <Ico e="☑️" />, text: 'Pick the clues the robot should compare.' },
  { icon: <Ico e="🧲" />, text: 'Press Find groups and watch similar creatures move together!' },
];
const STEPS = ['Look', 'Group', 'Try new clues', 'New creatures'];

export function UI() {
  const s = S.use();
  useEffect(() => {
    S.set(init());
    react('wave', 2500);
  }, []);
  const list = all(s);
  const labels = labelsOf(s, s.showPrev ? s.prev : s.run);
  const run = s.showPrev ? s.prev : s.run;
  const sel = s.sel && list.find((c) => c.id === s.sel);
  const toggle = (id) => {
    sfx('click');
    const f = s.feats.includes(id) ? s.feats.filter((x) => x !== id) : [...s.feats, id];
    S.set({ feats: f, msg: '' });
  };
  const go = () => {
    if (!s.feats.length) { sfx('oops'); S.set({ msg: 'Pick at least one clue for me to look at!' }); return; }
    const r = clusterCreatures(CREATURES, s.feats, s.k);
    const run = { ...r, feats: [...s.feats] };
    sfx('good');
    react('celebrate', 1400);
    S.set({ prev: s.run, run, showPrev: false, tried: s.tried.includes(key(s.feats)) ? s.tried : [...s.tried, key(s.feats)], msg: 'I think I have found a pattern! Let’s see if I’m right.' });
  };
  const step = !s.run ? (s.sel ? 1 : 0) : s.tried.length < 2 ? 2 : 3;
  const canAdd = s.run && s.added.length < NEW_CREATURES.length;
  const done = s.run && s.tried.length >= 2 && s.added.length >= 1;
  const members = (g) => list.filter((_, i) => labels && labels[i] === g);

  if (s.phase === 'intro')
    return (
      <Shell id="neptune" objective="Help the robot find groups by itself" say="Wow, strange creatures! Nobody has told me what groups they belong to." tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🔵" /> Discovering groups</h3>
          <p>On Saturn <b>you</b> told the robot the groups. Here nobody knows the groups, so the robot has to <b>discover them itself</b> by finding creatures that look alike.</p>
          <Btn onClick={() => S.set({ phase: 'play', msg: 'Tap a creature to look at it. What clues can you see?' })}>Explore Neptune <Ico e="🧊" /></Btn>
        </div>
      </Shell>
    );

  return (
    <Shell id="neptune" objective="Find groups of similar creatures" steps={STEPS} step={step} say={s.msg} tutorial={TUT}>
      <div className="panel act">
        {sel && (
          <div className="chips">
            <span className="chip"><Ico e="🎨" /> {sel.colour}</span>
            <span className="chip"><Ico e="📏" /> {sel.size}</span>
            <span className="chip"><Ico e="👁️" /> {sel.eyes}</span>
            <span className="chip"><Ico e="🦵" /> {sel.legs}</span>
            <span className="chip"><Ico e="📡" /> {sel.antennae}</span>
            <span className="chip"><Ico e="🔷" /> {sel.shape}</span>
          </div>
        )}
        <h3><Ico e="☑️" /> Which clues should the robot compare?</h3>
        <div className="chips">
          {FEATURES.map((f) => (
            <button key={f.id} className={`feat ${s.feats.includes(f.id) ? 'on' : ''}`} aria-pressed={s.feats.includes(f.id)} onClick={() => toggle(f.id)}><Ico e={f.emoji} /> {f.label}</button>
          ))}
        </div>
        <div className="row">
          <span>Groups:</span>
          {[2, 3, 4].map((k) => (
            <button key={k} className={`mini ${s.k === k ? 'on' : ''}`} aria-pressed={s.k === k} onClick={() => { sfx('click'); S.set({ k }); }}>{k}</button>
          ))}
          <Btn kind="good" onClick={go}><Ico e="🧲" /> Find groups</Btn>
        </div>
        {run && (
          <div className="legend" aria-label="Groups found">
            {Array.from({ length: run.k }).map((_, g) => {
              const m = members(g);
              const d = describeGroup(m, run.feats);
              return (
                <div key={g} className="g">
                  <span className="dot" style={{ background: GROUP_COLOURS[g] }} />
                  {GROUP_NAMES[g]} ({m.length}){d.length ? `: ${d.join(', ')}` : ''}
                </div>
              );
            })}
          </div>
        )}
        <div className="row">
          {canAdd && <Btn kind="ghost small" onClick={() => {
            const c = NEW_CREATURES[s.added.length];
            const a = assignNew(c, s.run.centroids, s.run.feats);
            sfx('collect');
            S.set({ added: [...s.added, c], sel: c.id, msg: `A new creature! I think it belongs in the ${GROUP_NAMES[a.group]}, because it is most like them.` });
          }}><Ico e="👽" /> A new creature appears!</Btn>}
          {s.prev && <Btn kind="ghost small" onClick={() => S.set({ showPrev: !s.showPrev })}>{s.showPrev ? 'Show latest grouping' : 'Compare with the one before'}</Btn>}
          {done && <Btn kind="good" onClick={() => finishMission('neptune')}><Ico e="🏁" /> Finish mission</Btn>}
        </div>
        {!done && s.run && <p className="muted">{s.tried.length < 2 ? 'Now try different clues and find groups again!' : 'Next: let a new creature appear. Which group does it join?'}</p>}
      </div>
    </Shell>
  );
}
