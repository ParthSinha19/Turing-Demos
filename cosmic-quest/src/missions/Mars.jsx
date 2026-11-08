import { Ico } from '../ui/Ico.jsx';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createStore, sleep } from '../game/mini.js';
import { LEVELS, GRID, DIRS, startState, stepCmd, shortest } from '../game/nav.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { Stars, PlanetBall, Dust } from '../scenes/Space.jsx';

const TILE = 1.15;
export const tileXZ = (x, z) => [(x - (GRID - 1) / 2) * TILE, (z - (GRID - 1) / 2) * TILE];

// ---------- shared state for this mission ----------
const init = () => ({ phase: 'intro', level: 0, prog: [], sim: startState(LEVELS[0]), running: false, now: -1, status: 'plan', msg: '', stars: 0, tries: 0, bump: 0 });
export const M = createStore(init());

const CMD = { F: [<Ico e="⬆️" />, 'Forward'], B: [<Ico e="⬇️" />, 'Back'], L: [<Ico e="↺" />, 'Turn left'], R: [<Ico e="↻" />, 'Turn right'] };
const hash = (x, z) => ((x * 73856093) ^ (z * 19349663)) >>> 0;

// ---------- reusable 3D board (also used by the final mission) ----------
export function Board({ level, sim, theme = 'mars', collected = false }) {
  const rob = useRef();
  const crystal = useRef();
  const bumpT = useRef(0);
  const asteroid = theme === 'space';
  useFrame((s, dt) => {
    if (!rob.current) return;
    const [tx, tz] = tileXZ(sim.x, sim.z);
    const p = rob.current.position;
    const k = 1 - Math.exp(-dt * 7);
    p.x += (tx - p.x) * k;
    p.z += (tz - p.z) * k;
    rob.current.rotation.y += (sim.ang - rob.current.rotation.y) * k;
    if (crystal.current) {
      crystal.current.rotation.y += dt;
      crystal.current.position.y = 0.55 + Math.sin(s.clock.elapsedTime * 2) * 0.08;
    }
    bumpT.current = Math.max(0, bumpT.current - dt);
  });
  const tiles = [];
  for (let x = 0; x < GRID; x++)
    for (let z = 0; z < GRID; z++) {
      const h = hash(x, z);
      const [px, pz] = tileXZ(x, z);
      const shade = 0.88 + ((h % 100) / 100) * 0.2;
      tiles.push(
        <mesh key={`${x}${z}`} position={[px, -0.12 + ((h >> 8) % 4) * 0.012, pz]}>
          <boxGeometry args={[TILE * 0.94, 0.24, TILE * 0.94]} />
          <meshStandardMaterial color={asteroid ? new THREE.Color('#3b4766').multiplyScalar(shade) : new THREE.Color('#c4572f').multiplyScalar(shade)} roughness={0.95} />
        </mesh>
      );
    }
  const [rx, rz] = tileXZ(level.rover.x, level.rover.z);
  return (
    <group>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[GRID * TILE + 0.5, 0.3, GRID * TILE + 0.5]} />
        <meshStandardMaterial color={asteroid ? '#1a2036' : '#6e2c18'} />
      </mesh>
      {tiles}
      {level.rocks.map((r, i) => {
        const [px, pz] = tileXZ(r.x, r.z);
        return (
          <group key={i} position={[px, 0, pz]} rotation={[0, i * 1.7, 0]}>
            <mesh position={[0, 0.3, 0]} scale={[1, 0.85, 0.9]}><dodecahedronGeometry args={[0.46, 0]} /><meshStandardMaterial color={asteroid ? '#7d7f8f' : '#8a4a32'} flatShading roughness={1} /></mesh>
            <mesh position={[0.25, 0.14, 0.2]}><dodecahedronGeometry args={[0.18, 0]} /><meshStandardMaterial color={asteroid ? '#6b6d7c' : '#764030'} flatShading /></mesh>
          </group>
        );
      })}
      {level.craters.map((c, i) => {
        const [px, pz] = tileXZ(c.x, c.z);
        return (
          <group key={i} position={[px, 0.01, pz]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.46, 24]} /><meshStandardMaterial color="#1b0d0a" /></mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[0.46, 0.58, 24]} /><meshStandardMaterial color={asteroid ? '#4b5575' : '#9a4a2a'} /></mesh>
          </group>
        );
      })}
      {level.crystal && !collected && (
        <group ref={crystal} position={[tileXZ(level.crystal.x, level.crystal.z)[0], 0.55, tileXZ(level.crystal.x, level.crystal.z)[1]]}>
          <mesh><octahedronGeometry args={[0.28]} /><meshStandardMaterial color="#6ef2ff" emissive="#2fd6ff" emissiveIntensity={1.4} roughness={0.1} /></mesh>
          <pointLight color="#6ef2ff" intensity={4} distance={3} />
        </group>
      )}
      {/* the rover (or the glowing gate in the final mission) */}
      <group position={[rx, 0, rz]}>
        {asteroid ? (
          <>
            <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.42, 0.06, 10, 28]} /><meshStandardMaterial color="#7dfcd8" emissive="#2ee6b6" emissiveIntensity={1.6} /></mesh>
            <pointLight color="#7dfcd8" intensity={4} distance={3} />
          </>
        ) : (
          <group scale={0.8}>
            <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.7, 0.25, 0.5]} /><meshStandardMaterial color="#e9edf5" /></mesh>
            <mesh position={[0.1, 0.55, 0]}><boxGeometry args={[0.3, 0.2, 0.3]} /><meshStandardMaterial color="#3a86ff" /></mesh>
            <mesh position={[-0.25, 0.7, 0]} rotation={[0, 0, 0.4]}><cylinderGeometry args={[0.02, 0.02, 0.4, 6]} /><meshStandardMaterial color="#aab" /></mesh>
            {[-0.28, 0, 0.28].flatMap((x) => [-0.28, 0.28].map((z) => <mesh key={x + '' + z} position={[x, 0.12, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.1, 12]} /><meshStandardMaterial color="#222" /></mesh>))}
            <mesh position={[0, 0.62, 0.0]} rotation={[0, 0, 0]}><boxGeometry args={[0.02, 0.02, 0.02]} /><meshStandardMaterial color="#f00" emissive="#f00" /></mesh>
          </group>
        )}
      </group>
      {/* start position gets a landing marker */}
      <mesh position={[tileXZ(level.start.x, level.start.z)[0], 0.01, tileXZ(level.start.x, level.start.z)[1]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 24]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <group ref={rob} position={[tileXZ(level.start.x, level.start.z)[0], 0, tileXZ(level.start.x, level.start.z)[1]]}>
        <PlayerRobot scale={0.5} />
      </group>
    </group>
  );
}

function CamPose({ pos = [0, 9.6, 8.2], look = [0, 0, 0.6] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...look);
  }, [camera, pos, look]);
  return null;
}

export function Scene() {
  const s = M.use();
  const level = LEVELS[s.level];
  return (
    <>
      <CamPose />
      <fog attach="fog" args={['#2a0f0a', 22, 60]} />
      <ambientLight intensity={0.7} color="#ffd9c4" />
      <directionalLight position={[6, 9, 4]} intensity={2.4} color="#ffe2c8" />
      <Stars />
      <PlanetBall tex="mars" radius={6} position={[-14, 6, -26]} spinSpeed={0.02} atmosphere="#ff9a6e" />
      <Dust color="#ffb08a" y={5} />
      <Board level={level} sim={s.sim} collected={s.sim.crystal} />
      {/* scenery around the board */}
      {[[-6.2, -3], [6.4, -2], [-6, 3.5], [6.5, 4], [0, -6.4], [-3.5, -6.6], [3.6, -6.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.5 + (i % 3) * 0.2, z]} rotation={[0, i, 0]} scale={[1.3 + (i % 3) * 0.4, 1 + (i % 4) * 0.4, 1.2]}>
          <coneGeometry args={[0.9, 1.6, 6]} />
          <meshStandardMaterial color={['#9b4a30', '#b25a38', '#833d28'][i % 3]} flatShading roughness={1} />
        </mesh>
      ))}
      {/* research station */}
      <group position={[6.2, 0, -5.2]}>
        <mesh position={[0, 0.5, 0]}><sphereGeometry args={[0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#e9edf5" /></mesh>
        <mesh position={[0.9, 0.35, 0]}><boxGeometry args={[0.8, 0.5, 0.6]} /><meshStandardMaterial color="#cfd6e4" /></mesh>
        <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.03, 0.03, 0.9, 6]} /><meshStandardMaterial color="#aab" /></mesh>
        <mesh position={[0, 1.9, 0]}><sphereGeometry args={[0.09, 8, 6]} /><meshStandardMaterial color="#ff6b6b" emissive="#ff3b3b" emissiveIntensity={1.4} /></mesh>
      </group>
      {/* little bridge over a gully, and rover tracks */}
      <group position={[-6.4, 0, 0.5]}>
        <mesh position={[0, -0.05, 0]}><boxGeometry args={[1.6, 0.1, 5]} /><meshStandardMaterial color="#2a0f0a" /></mesh>
        <mesh position={[0, 0.12, 0]}><boxGeometry args={[1.8, 0.08, 1]} /><meshStandardMaterial color="#8a7050" /></mesh>
      </group>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-2.5 + i * 0.5, 0.005, 5.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.28, 0.12]} />
          <meshBasicMaterial color="#8a3c24" />
        </mesh>
      ))}
    </>
  );
}

// ---------- the puzzle controls (reused by the final mission) ----------
export function NavPanel({ level, store, onWin, onFail, optimalLabel = true }) {
  const s = store.use();
  const timer = useRef(0);
  const add = (c) => {
    if (s.running || s.status === 'won' || s.prog.length >= 24) return;
    sfx('click');
    store.set({ prog: [...s.prog, c], status: 'plan', msg: '' });
  };
  useEffect(() => {
    const key = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const m = { ArrowUp: 'F', ArrowDown: 'B', ArrowLeft: 'L', ArrowRight: 'R' }[e.key];
      if (m) {
        e.preventDefault();
        add(m);
      } else if (e.key === 'Backspace') store.set((st) => (st.running ? st : { prog: st.prog.slice(0, -1) }));
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  useEffect(() => () => (timer.current = -1), []);
  const reset = () => {
    timer.current = -1;
    store.set({ sim: startState(level), running: false, now: -1, status: 'plan', msg: '' });
  };
  const run = async () => {
    if (s.running || !s.prog.length) return;
    const my = (timer.current = Date.now());
    let st = startState(level);
    store.set({ sim: st, running: true, now: -1, status: 'running', msg: '' });
    await sleep(350);
    for (let i = 0; i < s.prog.length; i++) {
      if (timer.current !== my) return;
      store.set({ now: i });
      const r = stepCmd(st, s.prog[i], level);
      if (['rock', 'crater', 'edge'].includes(r.event)) {
        sfx('oops');
        react('oops', 1500);
        const msg = r.event === 'rock' ? 'Oops! I bumped into a rock. Let’s try another route.' : r.event === 'crater' ? 'Whoa, a crater! I nearly fell in. Let’s go around it.' : 'I’m at the edge of the map! Let’s try again.';
        store.set({ running: false, status: 'bump', msg, now: i, bump: i });
        onFail && onFail(msg);
        return;
      }
      st = r.state;
      store.set({ sim: st });
      sfx(r.event === 'crystal' ? 'collect' : 'step');
      if (r.event === 'crystal') store.set({ msg: 'Energy crystal collected!' });
      await sleep(620);
      if (r.event === 'rover') {
        const best = shortest(level);
        const used = s.prog.length;
        const stars = used <= best ? 3 : used <= best + 2 ? 2 : 1;
        sfx('good');
        react('celebrate', 2200);
        store.set({ running: false, status: 'won', stars, best, now: -1, msg: stars === 3 ? 'Perfect! That was the shortest route!' : `It works! You used ${used} steps. The shortest is ${best}. Can you do it in fewer?` });
        onWin && onWin(stars);
        return;
      }
      if (r.event === 'needcrystal') {
        store.set({ msg: 'I reached the rover, but it needs the energy crystal first!' });
      }
    }
    sfx('oops');
    react('oops', 1200);
    store.set({ running: false, status: 'miss', now: -1, msg: st.x === level.rover.x && st.z === level.rover.z ? 'I’m at the rover, but I still need the crystal!' : 'I stopped before the rover. Add more steps!' });
  };
  return (
    <div className="act">
      <div className="prog" aria-label="Your plan">
        {s.prog.length === 0 && <span className="empty">Tap the arrows to build a plan <Ico e="👇" /></span>}
        {s.prog.map((c, i) => (
          <button key={i} className={`slot ${s.now === i ? 'now' : ''} ${s.status === 'bump' && s.bump === i ? 'bad' : ''}`} title="Remove" disabled={s.running} onClick={() => store.set({ prog: s.prog.filter((_, j) => j !== i), status: 'plan' })} aria-label={`${CMD[c][1]}, step ${i + 1}. Tap to remove`}>
            {CMD[c][0]}
          </button>
        ))}
      </div>
      <div className="cmds">
        {Object.keys(CMD).map((c) => (
          <Btn key={c} kind="ghost" disabled={s.running} onClick={() => add(c)} aria-label={CMD[c][1]}>
            <b>{CMD[c][0]}</b>
            {CMD[c][1]}
          </Btn>
        ))}
      </div>
      <div className="row">
        <Btn kind="good" disabled={s.running || !s.prog.length || s.status === 'won'} onClick={run}><Ico e="▶" /> Go!</Btn>
        <Btn kind="ghost small" disabled={s.running} onClick={() => { store.set({ prog: s.prog.slice(0, -1) }); }}>⌫ Undo</Btn>
        <Btn kind="ghost small" disabled={s.running} onClick={() => { store.set({ prog: [] }); reset(); }}><Ico e="🗑" /> Clear</Btn>
        <Btn kind="ghost small" disabled={s.running} onClick={reset}><Ico e="↩" /> Back to start</Btn>
      </div>
      {s.msg && <p className={`verdict ${s.status === 'won' ? 'ok' : s.status === 'bump' ? 'bad' : ''}`}>{s.msg}</p>}
    </div>
  );
}

const TUT = [
  { icon: <Ico e="🧩" />, text: 'Tap arrows to make a plan.' },
  { icon: <Ico e="▶️" />, text: 'Press Go! and watch the robot follow it.' },
  { icon: <Ico e="🪨" />, text: 'Bumped into something? Change the plan and try again!' },
];
const STEPS = ['Reach', 'Crystal', 'Rocks', 'Shortest'];

export function UI() {
  const s = M.use();
  const level = LEVELS[s.level];
  useEffect(() => {
    M.set(init());
    react('wave', 2500);
  }, []);
  const choose = (i) => M.set({ ...init(), phase: 'play', level: i, sim: startState(LEVELS[i]) });
  const nextLevel = () => {
    if (s.level >= LEVELS.length - 1) finishMission('mars');
    else choose(s.level + 1);
  };
  if (s.phase === 'intro')
    return (
      <Shell id="mars" objective="Bring the lost rover home" say="A rover is stranded on Mars! I can move, but I need you to plan the route." tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🧭" /> Give the robot a plan</h3>
          <p>Robots plan their steps before they move. Tell {`me`} exactly where to go: forward, back, or turn.</p>
          <div className="tut-steps">
            {TUT.map((t) => (
              <div key={t.text} className="chip"><Ico e={t.icon} /> {t.text}</div>
            ))}
          </div>
          <Btn onClick={() => choose(0)}>Let’s plan! <Ico e="🚀" /></Btn>
        </div>
      </Shell>
    );
  const won = s.status === 'won';
  return (
    <Shell id="mars" objective={`${level.title}${level.crystal ? ' (get the crystal first)' : ''}`} steps={STEPS} step={s.level} say={s.msg || level.say} tutorial={TUT}>
      <div className="panel act">
        <NavPanel level={level} store={M} />
        {won && (
          <div className="row">
            <span className="stars">{[0, 1, 2].map((k) => <Ico key={k} e={k < s.stars ? '⭐' : '☆'} />)}</span>
            <Btn kind="good" onClick={nextLevel}>{s.level >= LEVELS.length - 1 ? 'Finish mission' : 'Next challenge'}</Btn>
            {s.stars < 3 && <Btn kind="ghost small" onClick={() => M.set({ status: 'plan', msg: '', sim: startState(level), prog: [] })}>Try for a shorter route</Btn>}
          </div>
        )}
      </div>
    </Shell>
  );
}

export { DIRS };
