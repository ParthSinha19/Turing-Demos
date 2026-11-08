import { Ico } from '../ui/Ico.jsx';
import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { createStore } from '../game/mini.js';
import { E_OBJECTS, E_CATS, E_KEYS, E_MEET, E_TEACH, E_TESTS, eItem, predict } from '../game/classify.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell, ProgressBar } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { ObjectModel } from '../scenes/Objects.jsx';
import { Stars, PlanetBall, Glow } from '../scenes/Space.jsx';

const init = () => ({ phase: 'intro', seen: [], sel: null, tIdx: 0, examples: [], msg: '', tests: [], pick: null, shown: false, fixed: false, wrong: null });
const S = createStore(init());
const catOf = (id) => E_CATS.find((c) => c.id === id) || { name: 'Plant', emoji: <Ico e="🌳" /> };

const SPOTS = {
  apple: [-2.6, 0.6], tree: [-4.3, -1.4], cat: [1.2, 1.6], bird: [3.2, 0.6], balloon: [-0.2, 2.6], ball: [-3.2, 2.2],
};

function Pedestal({ id }) {
  return (
    <group position={[1.9, 0, 1.2]}>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.8, 0.9, 0.2, 24]} /><meshStandardMaterial color="#cfd8ea" /></mesh>
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.55, 0.62, 32]} /><meshBasicMaterial color="#4cc9f0" /></mesh>
      <group position={[0, 0.2, 0]} scale={1.5}><ObjectModel kind={id} /></group>
      <Glow color="#4cc9f0" size={3} opacity={0.3} position={[0, 0.6, 0]} />
    </group>
  );
}

function Cam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0.8, 3.4, 8.2);
    camera.lookAt(-0.2, 0.9, 0);
  }, [camera]);
  useFrame(() => {});
  return null;
}

export function Scene() {
  const s = S.use();
  const cur = s.phase === 'teach' ? E_TEACH[s.tIdx] : s.phase === 'predict' ? s.tests[s.tIdx]?.id : null;
  return (
    <>
      <Cam />
      <fog attach="fog" args={['#0b1c3a', 28, 70]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 9, 5]} intensity={2.6} color="#fff4de" />
      <Stars />
      <PlanetBall tex="earth" radius={7} position={[14, 8, -34]} atmosphere="#6ec6ff" />
      {/* the ground: a big green hill-top */}
      <mesh position={[0, -9, 0]}>
        <sphereGeometry args={[9, 48, 32]} />
        <meshStandardMaterial color="#58b84e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.2, 48]} />
        <meshStandardMaterial color="#5cc152" roughness={0.9} />
      </mesh>
      {/* mountains and trees */}
      {[[-5.2, -3.6, 2.2], [-2.5, -4.6, 3], [2.5, -4.8, 2.6], [5.2, -3.4, 2]].map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}><coneGeometry args={[1.5 + (i % 2) * 0.5, h, 6]} /><meshStandardMaterial color={['#7b8aa8', '#8d9ab5', '#6f7f9f', '#8896b0'][i]} flatShading /></mesh>
          <mesh position={[0, h * 0.82, 0]}><coneGeometry args={[0.55, h * 0.3, 6]} /><meshStandardMaterial color="#fff" flatShading /></mesh>
        </group>
      ))}
      {[[-5, 0.4], [-4.6, 2.6], [4.6, 2.4], [5.2, -1], [3.9, -2.4], [-3.6, -2.6]].map(([x, z], i) => (
        <ObjectModel key={i} kind="tree" position={[x, 0, z]} scale={0.55 + (i % 3) * 0.12} />
      ))}
      <ObjectModel kind="house" position={[4.2, 0, 1.3]} scale={0.8} />
      <ObjectModel kind="house" position={[-4.6, 0, -0.3]} scale={0.65} rotation={[0, 0.7, 0]} />
      {/* futuristic research station */}
      <group position={[0.6, 0, -2.6]}>
        <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[1.2, 1.4, 0.6, 20]} /><meshStandardMaterial color="#e6ecf7" metalness={0.3} roughness={0.3} /></mesh>
        <mesh position={[0, 0.9, 0]}><sphereGeometry args={[0.9, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#9fe9ff" transparent opacity={0.65} emissive="#2fb4ff" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.04, 0.04, 1, 6]} /><meshStandardMaterial color="#aab" /></mesh>
        <mesh position={[0, 2.35, 0]}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={1.5} /></mesh>
      </group>
      {/* floating things */}
      {[[-1, 3.4, -1], [2.8, 3, -0.5], [-3.3, 3.8, 0.8]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}><octahedronGeometry args={[0.2]} /><meshStandardMaterial color={['#ffd166', '#ff7fb5', '#7dfcd8'][i]} emissive={['#ffb703', '#ff4f9a', '#2ee6b6'][i]} emissiveIntensity={1} /></mesh>
      ))}
      {/* the robot */}
      <group position={[0.3, 0, -0.5]} rotation={[0, 0.3, 0]}><PlayerRobot scale={1} /></group>
      {/* meet-the-world objects (clickable) */}
      {s.phase === 'meet' &&
        E_MEET.map((id) => {
          const [x, z] = SPOTS[id];
          const seen = s.seen.includes(id);
          return (
            <group
              key={id}
              position={[x, 0, z]}
              scale={id === 'tree' ? 0.8 : 1.15}
              onClick={(e) => {
                e.stopPropagation();
                sfx('select');
                S.set({ sel: id, seen: seen ? s.seen : [...s.seen, id] });
              }}
              onPointerOver={() => (document.body.style.cursor = 'pointer')}
              onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
              <ObjectModel kind={id} />
              {s.sel === id && (
                <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.55, 0.68, 32]} /><meshBasicMaterial color="#ffd166" /></mesh>
              )}
              {!seen && <mesh position={[0, 1.55, 0]}><sphereGeometry args={[0.08, 8, 6]} /><meshBasicMaterial color="#ffd166" /></mesh>}
            </group>
          );
        })}
      {cur && <Pedestal id={cur} />}
    </>
  );
}

const TUT = [
  { icon: <Ico e="👆" />, text: 'Tap things to find out about them.' },
  { icon: <Ico e="🧸" />, text: 'Show the robot examples.' },
  { icon: <Ico e="🔮" />, text: 'Watch the robot guess new things.' },
];

function Clues({ item, hit }) {
  const labels = { colour: item.f.colour, shape: item.f.shape, size: item.f.size, moves: item.f.moves === 'moves' ? 'moves' : 'stays still' };
  return (
    <div className="chips">
      {E_KEYS.map((k, i) => (
        <span key={k} className={`chip ${hit ? (hit[i] ? 'yes' : 'no') : ''}`}>{k === 'colour' ? <Ico e="🎨" /> : k === 'shape' ? <Ico e="🔷" /> : k === 'size' ? <Ico e="📏" /> : <Ico e="🏃" />} {labels[k]}</span>
      ))}
    </div>
  );
}

export function UI() {
  const s = S.use();
  useEffect(() => {
    S.set(init());
    react('wave', 2500);
  }, []);

  if (s.phase === 'intro')
    return (
      <Shell id="earth" objective="Help your robot understand the world" say="Hello?... Where am I? I don't know what anything is! Can you help me?" tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🤖" /> Your robot just woke up</h3>
          <p>A computer learns by looking at <b>clues</b> (like colour and shape) and by seeing lots of <b>examples</b>.</p>
          <Btn onClick={() => S.set({ phase: 'meet' })}>Meet the world <Ico e="🌍" /></Btn>
        </div>
      </Shell>
    );

  if (s.phase === 'meet') {
    const it = s.sel && eItem(s.sel);
    const n = s.seen.length;
    return (
      <Shell id="earth" objective="Tap 4 things to look at their clues" steps={['Meet', 'Teach', 'Predict']} step={0} say={it ? `This is ${/^[aeiou]/i.test(it.name) ? 'an' : 'a'} ${it.name.toLowerCase()}. ${it.fact}` : 'Tap the apple, the tree, the animals... what are they like?'} tutorial={TUT}>
        <div className="panel act">
          {it ? (
            <>
              <h3><Ico e="🔎" /> {it.name}</h3>
              <Clues item={it} />
            </>
          ) : (
            <p><Ico e="👆" /> Tap an object in the world.</p>
          )}
          <ProgressBar value={Math.min(n, 4)} max={4} label="Things looked at" />
          <Btn kind="good" disabled={n < 4} onClick={() => { sfx('good'); S.set({ phase: 'teach', tIdx: 0, sel: null, msg: '' }); }}>
            {n < 4 ? `Look at ${4 - n} more` : 'Now teach the robot'}
          </Btn>
        </div>
      </Shell>
    );
  }

  if (s.phase === 'teach') {
    const id = E_TEACH[s.tIdx];
    const it = eItem(id);
    const pickCat = (cat) => {
      if (cat === it.label) {
        sfx('good');
        react('wave', 1200);
        const examples = [...s.examples, { ...it }];
        if (s.tIdx + 1 >= E_TEACH.length) S.set({ examples, phase: 'predict', tIdx: 0, tests: E_TESTS.map(eItem), msg: '', pick: null, shown: false });
        else S.set({ examples, tIdx: s.tIdx + 1, msg: '' });
      } else {
        sfx('oops');
        react('oops', 1000);
        S.set({ msg: `Hmm, look at the clues again. Think about what a ${it.name.toLowerCase()} is.` });
      }
    };
    return (
      <Shell id="earth" objective="Tell the robot what each thing is" steps={['Meet', 'Teach', 'Predict']} step={1} say={s.msg || `What is this ${it.name.toLowerCase()}? Show me, so I can remember it!`} tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🧸" /> Example {s.tIdx + 1} of {E_TEACH.length}: a {it.name}</h3>
          <Clues item={it} />
          <div className="chips">
            {E_CATS.map((c) => (
              <Btn key={c.id} kind="ghost cat-btn" onClick={() => pickCat(c.id)}>
                <span className="em"><Ico e={c.emoji} /></span>
                {c.name}
              </Btn>
            ))}
          </div>
          <ProgressBar value={s.examples.length} max={E_TEACH.length} label="Examples taught" />
          <div className="tray" aria-label="Robot's memory">{s.examples.map((e) => <span key={e.id}><Ico e={catOf(e.label).emoji} /></span>)}</div>
        </div>
      </Shell>
    );
  }

  if (s.phase === 'predict') {
    const it = s.tests[s.tIdx];
    const pred = predict(s.examples, it, E_KEYS);
    const right = pred.label === it.label;
    const near = pred.near && pred.near.ex;
    const reveal = (cat) => {
      sfx(pred.label === it.label ? 'good' : 'oops');
      react(pred.label === it.label ? 'celebrate' : 'oops', 1500);
      S.set({ pick: cat, shown: true });
    };
    const teachIt = () => {
      sfx('good');
      S.set({ examples: [...s.examples, { ...it }], fixed: true });
      react('celebrate', 1500);
    };
    const next = () => {
      if (s.tIdx + 1 >= s.tests.length) { finishMission('earth'); return; }
      S.set({ tIdx: s.tIdx + 1, pick: null, shown: false, fixed: false });
    };
    const nowPred = s.fixed ? predict(s.examples, it, E_KEYS) : pred;
    const nowRight = nowPred.label === it.label;
    const nowNear = nowPred.near && nowPred.near.ex;
    return (
      <Shell
        id="earth" objective="Can the robot guess new things?" steps={['Meet', 'Teach', 'Predict']} step={2}
        say={!s.shown ? 'A new thing! What do YOU think it is? Then I will guess too.' : s.fixed ? `Thanks! Now I know ${it.name.toLowerCase()}s. Let me try again…` : right ? `I think it is ${catOf(pred.label).name.toLowerCase()}, because it looks like the ${near.name.toLowerCase()}!` : `Oops, I thought it was ${catOf(pred.label).name.toLowerCase()} because it looks like the ${near.name.toLowerCase()}. I need more examples!`}
        tutorial={TUT}
      >
        <div className="panel act">
          <h3><Ico e="🔮" /> New thing {s.tIdx + 1} of {s.tests.length}: a {it.name}</h3>
          <Clues item={it} hit={s.shown ? nowPred.near.matches : null} />
          {!s.shown ? (
            <>
              <p>What do you think it is?</p>
              <div className="chips">
                {E_CATS.map((c) => (
                  <Btn key={c.id} kind="ghost cat-btn" onClick={() => reveal(c.id)}>
                    <span className="em"><Ico e={c.emoji} /></span>
                    {c.name}
                  </Btn>
                ))}
              </div>
            </>
          ) : (
            <>
              <p>
                You said <b><Ico e={catOf(s.pick).emoji} /> {catOf(s.pick).name}</b>. The robot says{' '}
                <b><Ico e={catOf(nowPred.label).emoji} /> {catOf(nowPred.label).name}</b>, matching the {nowNear.name}.
              </p>
              <p className={`verdict ${nowRight ? 'ok' : 'bad'}`}>
                {nowRight ? (s.fixed ? 'Better! More examples helped.' : 'Correct!') : `Not right: it is really ${catOf(it.label).name}.`}
              </p>
              <div className="row">
                {!nowRight && !s.fixed && <Btn onClick={teachIt}><Ico e="🧸" /> Teach the robot this one</Btn>}
                {(nowRight || s.fixed) && <Btn kind="good" onClick={next}>{s.tIdx + 1 >= s.tests.length ? 'Finish mission' : 'Next'}</Btn>}
              </div>
            </>
          )}
        </div>
      </Shell>
    );
  }
  return null;
}
