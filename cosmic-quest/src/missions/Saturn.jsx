import { Ico } from '../ui/Ico.jsx';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { createStore, sleep } from '../game/mini.js';
import { S_TRAIN, S_TEST, S_CATS, S_PASS, runTest } from '../game/classify.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell, ProgressBar } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { SpaceItem } from '../scenes/Objects.jsx';
import { Stars, PlanetBall, Glow, Asteroids } from '../scenes/Space.jsx';

const CAT_COL = { crystal: '#6ef2ff', rock: '#c49a6c', plant: '#6ee06e', gadget: '#ffd166' };
const cat = (id) => S_CATS.find((c) => c.id === id);
const init = () => ({ phase: 'intro', sel: null, taught: [], msg: '', model: null, results: [], training: 0, tested: false, round: 0 });
const S = createStore(init());

function Cam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 2.6, 10.5);
    camera.lookAt(0, 1.5, 0);
  }, [camera]);
  return null;
}

function Disc({ colour, r = 0.6 }) {
  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r * 0.8, r, 28]} />
      <meshBasicMaterial color={colour} />
    </mesh>
  );
}

function Drift({ children, y = 0, speed = 0.8, amp = 0.1, ...p }) {
  const r = useRef();
  useFrame((s) => r.current && (r.current.position.y = y + Math.sin(s.clock.elapsedTime * speed + (p.position?.[0] || 0)) * amp));
  return <group ref={r} {...p}>{children}</group>;
}

export function Scene() {
  const s = S.use();
  const showPool = s.phase === 'train' || s.phase === 'intro';
  return (
    <>
      <Cam />
      <ambientLight intensity={0.8} color="#fff2d6" />
      <directionalLight position={[5, 8, 7]} intensity={2.4} />
      <Stars />
      <PlanetBall tex="saturn" radius={6} rings position={[9, 5, -26]} spinSpeed={0.015} atmosphere="#ffe9b0" />
      <Glow color="#ffe2a0" size={34} opacity={0.15} position={[9, 5, -24]} />
      <Asteroids count={40} inner={9} outer={17} spread={5} />
      {[[-8, 5, -6], [7.5, 4, -5]].map(([x, y, z], i) => (
        <Drift key={i} position={[x, y, z]} y={y}><mesh><octahedronGeometry args={[0.5 + i * 0.2]} /><meshStandardMaterial color="#8ee9ff" emissive="#2fb4ff" emissiveIntensity={0.8} flatShading /></mesh></Drift>
      ))}
      {/* shelf */}
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[11.5, 0.3, 3.4]} /><meshStandardMaterial color="#c9bba0" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0, 2.35, 0]}><boxGeometry args={[11.5, 0.2, 3.4]} /><meshStandardMaterial color="#c9bba0" metalness={0.3} roughness={0.5} /></mesh>
      <group position={[-5.0, 0, 3.4]}><PlayerRobot scale={0.7} /></group>
      {showPool &&
        S_TRAIN.map((it, i) => {
          const row = Math.floor(i / 6);
          const x = ((i % 6) - 2.5) * 1.8;
          const taught = s.taught.find((t) => t.id === it.id);
          return (
            <group
              key={it.id}
              position={[x, row === 0 ? 2.45 : 0.2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (s.phase !== 'train' || taught) return;
                sfx('select');
                S.set({ sel: it.id, msg: '' });
              }}
              onPointerOver={() => s.phase === 'train' && !taught && (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <SpaceItem f={it.f} scale={0.85} spin={s.sel === it.id} />
              {taught && <Disc colour={CAT_COL[taught.label]} />}
              {s.sel === it.id && <Disc colour="#fff" r={0.75} />}
            </group>
          );
        })}
      {(s.phase === 'test' || s.phase === 'done') &&
        S_TEST.map((it, i) => {
          const r = s.results[i];
          return (
            <group key={it.id} position={[((i % 6) - 2.5) * 1.8, 1.3, 0]}>
              <SpaceItem f={it.f} scale={0.9} />
              {r && <Disc colour={r.ok ? '#3ddc84' : '#ff6b6b'} r={0.8} />}
              {r && <Glow color={r.ok ? '#3ddc84' : '#ff6b6b'} size={2.6} opacity={0.5} position={[0, 0.5, 0]} />}
            </group>
          );
        })}
    </>
  );
}

const TUT = [
  { icon: <Ico e="👆" />, text: 'Tap an object, then pick its group.' },
  { icon: <Ico e="🏋️" />, text: 'Press Train so the robot learns from your examples.' },
  { icon: <Ico e="🧪" />, text: 'Test it on new objects it has never seen!' },
];
const STEPS = ['Groups', 'Examples', 'Train', 'Test', 'Improve'];

export function UI() {
  const s = S.use();
  useEffect(() => {
    S.set(init());
    react('wave', 2500);
  }, []);
  const taughtCount = s.taught.length;
  const per = (id) => s.taught.filter((t) => t.label === id).length;

  const teach = (c) => {
    const it = S_TRAIN.find((x) => x.id === s.sel);
    if (!it) return;
    if (c !== it.label) {
      sfx('oops');
      react('oops', 900);
      S.set({ msg: `Hmm, look closely at its shape. ${cat(it.label).clue}` });
      return;
    }
    sfx('collect');
    S.set({ taught: [...s.taught, { ...it }], sel: null, msg: `Got it! I will remember that ${cat(c).name.toLowerCase()} look like this.`, model: null, tested: false });
  };
  const train = async () => {
    S.set({ training: 0.01, msg: 'Learning from your examples…' });
    for (let i = 1; i <= 10; i++) {
      await sleep(130);
      S.set({ training: i / 10 });
    }
    sfx('unlock');
    S.set({ model: [...s.taught], training: 0, phase: 'test', results: [], tested: false, msg: 'I trained! Now test me on NEW things I have never seen.' });
  };
  const test = async () => {
    const res = runTest(s.model);
    S.set({ results: [], tested: false });
    const shown = [];
    for (const r of res) {
      await sleep(550);
      shown.push(r);
      sfx(r.ok ? 'good' : 'oops');
      S.set({ results: [...shown] });
    }
    const n = res.filter((r) => r.ok).length;
    react(n >= S_PASS ? 'celebrate' : 'oops', 1600);
    S.set({
      tested: true,
      round: s.round + 1,
      msg: n >= S_PASS ? `I got ${n} out of ${S_TEST.length} right!` : n === res.length ? 'All correct!' : `I got ${n} out of ${S_TEST.length}. That was a tricky one. Maybe I need some more examples.`,
    });
  };
  const fix = (r) => {
    sfx('collect');
    const t = { ...r.item };
    S.set({ taught: [...s.taught, t], phase: 'train', sel: null, msg: `OK! I will add that ${cat(t.label).name.toLowerCase()} to my examples. Train me again!`, tested: false, results: [], model: null });
  };

  if (s.phase === 'intro')
    return (
      <Shell id="saturn" objective="Train your robot to recognise objects" say="Strange objects are drifting around Saturn! I do not know what they are. Teach me!" tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🔭" /> Four kinds of object</h3>
          <div className="chips">{S_CATS.map((c) => <span key={c.id} className="chip"><Ico e={c.emoji} /> {c.name}</span>)}</div>
          <p>You give the robot <b>examples with labels</b>. After <b>training</b>, it is <b>tested</b> on new objects it has not seen before. It can still make mistakes!</p>
          <Btn onClick={() => S.set({ phase: 'train', msg: 'Tap an object, then tell me which group it belongs to.' })}>Start training <Ico e="🏋️" /></Btn>
        </div>
      </Shell>
    );

  if (s.phase === 'train') {
    const it = S_TRAIN.find((x) => x.id === s.sel);
    return (
      <Shell id="saturn" objective="Give the robot labelled examples (at least 4)" steps={STEPS} step={s.round ? 4 : 1} say={s.msg || 'Tap an object, then tell me which group it belongs to.'} tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🏷️" /> {it ? 'Which group is this?' : 'Tap an object on the shelf'}</h3>
          {it && (
            <div className="chips">
              {S_CATS.map((c) => (
                <Btn key={c.id} kind="ghost cat-btn" onClick={() => teach(c.id)}>
                  <span className="em"><Ico e={c.emoji} /></span>
                  {c.name}
                </Btn>
              ))}
            </div>
          )}
          <div className="chips">{S_CATS.map((c) => <span key={c.id} className="chip"><Ico e={c.emoji} /> {per(c.id)}</span>)}</div>
          <ProgressBar value={s.training || Math.min(1, taughtCount / 8)} max={1} label="Examples given" />
          <div className="row">
            <Btn kind="good" disabled={taughtCount < 4 || s.training > 0} onClick={train}>{s.training > 0 ? 'Learning…' : taughtCount < 4 ? `Give ${4 - taughtCount} more` : 'Train the robot'}</Btn>
          </div>
        </div>
      </Shell>
    );
  }

  const correct = s.results.filter((r) => r.ok).length;
  const pass = s.tested && correct >= S_PASS;
  const wrong = s.results.filter((r) => !r.ok);
  return (
    <Shell id="saturn" objective="Test the robot on new objects" steps={STEPS} step={s.tested ? 4 : 3} say={s.msg} tutorial={TUT}>
      <div className="panel act">
        <h3><Ico e="🧪" /> Test: {correct} / {S_TEST.length} correct</h3>
        <ProgressBar value={correct} max={S_TEST.length} label="Correct answers" />
        <div className="chips">
          {s.results.map((r) => (
            <span key={r.item.id} className={`chip ${r.ok ? 'yes' : 'no'}`}>
              {r.ok ? <Ico e="✅" /> : <Ico e="❌" />} <Ico e={cat(r.item.label).emoji} /> <Ico e="→" /> {r.guess ? <Ico e={cat(r.guess).emoji} /> : '?'}
            </span>
          ))}
        </div>
        {s.tested && wrong.length > 0 && (
          <>
            <p className="verdict bad">Needs more examples!</p>
            <div className="chips">
              {wrong.map((r) => (
                <Btn key={r.item.id} kind="ghost small" onClick={() => fix(r)}>
                  <Ico e="➕" /> Teach: <Ico e={cat(r.item.label).emoji} /> {cat(r.item.label).name.toLowerCase()} that I got wrong
                </Btn>
              ))}
            </div>
          </>
        )}
        <div className="row">
          {!s.tested && <Btn kind="good" onClick={test}><Ico e="▶" /> Test the robot</Btn>}
          {s.tested && <Btn kind="ghost" onClick={() => S.set({ phase: 'train', msg: 'Pick better examples, then train me again!', results: [], tested: false, model: null })}><Ico e="🏋️" /> More examples</Btn>}
          {s.tested && !pass && <Btn kind="ghost" onClick={test}><Ico e="🔁" /> Test again</Btn>}
          {pass && <Btn kind="good" onClick={() => finishMission('saturn')}><Ico e="🏁" /> Finish mission</Btn>}
        </div>
      </div>
    </Shell>
  );
}
