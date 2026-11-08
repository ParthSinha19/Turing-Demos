import { Ico } from '../ui/Ico.jsx';
import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { createStore, sleep } from '../game/mini.js';
import { decide, J_CONDS, J_ACTS, J_ROUNDS } from '../game/rules.js';
import { finishMission } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, Shell } from '../ui/kit.jsx';
import { PlayerRobot, react } from '../scenes/Robot.jsx';
import { Visitor } from '../scenes/Objects.jsx';
import { Stars, PlanetBall, Glow } from '../scenes/Space.jsx';

const emptyRules = () => [{ id: 1, cond: null, action: null }, { id: 2, cond: null, action: null }, { id: 3, cond: null, action: null }, { id: 4, cond: null, action: null }];
const init = () => ({ phase: 'intro', round: 0, rules: emptyRules(), result: {}, fire: -1, thinking: '', running: false, msg: '', passed: false, done: {} });
const S = createStore(init());
const cond = (id) => J_CONDS.find((c) => c.id === id);
const act = (id) => J_ACTS.find((a) => a.id === id);

function Cam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 3.6, 9);
    camera.lookAt(0, 1.4, 0);
  }, [camera]);
  return null;
}

function Station({ position, scale = 1 }) {
  const r = useRef();
  useFrame((_, dt) => r.current && (r.current.rotation.y += dt * 0.15));
  return (
    <group position={position} scale={scale} ref={r}>
      <mesh><torusGeometry args={[1.3, 0.2, 10, 28]} /><meshStandardMaterial color="#d8dde8" metalness={0.5} roughness={0.3} /></mesh>
      <mesh><sphereGeometry args={[0.6, 18, 12]} /><meshStandardMaterial color="#f4f6fb" metalness={0.4} /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[Math.cos(i * 1.57) * 1.3, 0, Math.sin(i * 1.57) * 1.3]}><boxGeometry args={[0.3, 0.9, 0.3]} /><meshStandardMaterial color="#ff8c42" /></mesh>)}
      <mesh position={[0, 1, 0]}><cylinderGeometry args={[0.03, 0.03, 0.8, 6]} /><meshStandardMaterial color="#aab" /></mesh>
    </group>
  );
}

const POS = [[-5.8, 0, 1.2], [-4.0, 0, 1.4], [-2.2, 0, 1.4], [-0.5, 0, 1.2]];
const GOODS = { oxygen: '#7fd8ff', repair: '#ff6b4a', food: '#ff4f6a', wave: '#ffd166' };

export function Scene() {
  const s = S.use();
  const cases = J_ROUNDS[Math.min(s.round, J_ROUNDS.length - 1)].cases;
  return (
    <>
      <Cam />
      <fog attach="fog" args={['#3b1d0f', 20, 60]} />
      <ambientLight intensity={0.8} color="#ffe8cc" />
      <directionalLight position={[5, 8, 6]} intensity={2.3} color="#fff0d8" />
      <Stars />
      <PlanetBall tex="jupiter" radius={9} position={[8, -2, -22]} atmosphere="#ffcf8f" spinSpeed={0.02} />
      <Glow color="#ff9a4a" size={26} opacity={0.2} position={[8, -2, -20]} />
      {/* storm clouds */}
      {[[-9, 4, -8], [9, 6, -10], [-5, 7, -14]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {[0, 1, 2].map((j) => <mesh key={j} position={[j * 1.1 - 1, (j % 2) * 0.3, 0]}><sphereGeometry args={[1 + (j % 2) * 0.4, 14, 10]} /><meshStandardMaterial color="#e7b987" roughness={1} transparent opacity={0.85} /></mesh>)}
        </group>
      ))}
      <Station position={[-8, 5, -5]} scale={0.8} />
      <Station position={[8.5, 3.5, -4]} scale={0.6} />
      {[[-6, 1.2, -3], [6.4, 2, -2]].map(([x, y, z], i) => <mesh key={i} position={[x, y, z]}><capsuleGeometry args={[0.2, 0.5, 6, 10]} /><meshStandardMaterial color="#f2f5fb" /></mesh>)}
      {/* platform */}
      <mesh position={[0, -0.3, 1]}><cylinderGeometry args={[7, 7.4, 0.4, 48]} /><meshStandardMaterial color="#cfc7bb" metalness={0.3} roughness={0.5} /></mesh>
      <mesh position={[0, -0.09, 1]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[6.4, 6.6, 64]} /><meshBasicMaterial color="#ffb703" /></mesh>
      <group position={[-3.2, 0, 4.4]}><PlayerRobot scale={0.7} /></group>
      {/* visitors with speech icons */}
      {cases.map((c, i) => {
        const r = s.result[c.id];
        return (
          <group key={c.id} position={POS[i]}>
            <Visitor kind={c.kind} tint={['#ff9a3c', '#3a86ff', '#ff6fb5', '#2ec4b6'][i % 4]} scale={1.3} />
            {r && <Glow color={r.ok ? '#3ddc84' : '#ff6b6b'} size={3} opacity={0.6} position={[0, 1.2, 0.2]} />}
          </group>
        );
      })}
    </>
  );
}

const TUT = [
  { icon: <Ico e="🧩" />, text: 'Pick an IF (the problem) and a THEN (the help).' },
  { icon: <Ico e="▶️" />, text: 'Press Test! The robot reads your rules from the top.' },
  { icon: <Ico e="🔁" />, text: 'Wrong help? Change a rule and test again.' },
];

function Rules({ s }) {
  const set = (i, p) => S.set({ rules: s.rules.map((r, j) => (j === i ? { ...r, ...p } : r)), result: {}, msg: '', passed: false });
  return (
    <div className="act">
      {s.rules.map((r, i) => (
        <div key={r.id} className={`rule ${s.fire === i ? 'fire' : ''}`}>
          <b>IF</b>
          <div className="sel-wrap">
            {J_CONDS.map((c) => (
              <button key={c.id} disabled={s.running} className={`mini ${r.cond === c.id ? 'on' : ''}`} title={c.label} aria-label={`If ${c.label}`} aria-pressed={r.cond === c.id} onClick={() => { sfx('click'); set(i, { cond: r.cond === c.id ? null : c.id }); }}><Ico e={c.emoji} /></button>
            ))}
          </div>
          <b>THEN</b>
          <div className="sel-wrap">
            {J_ACTS.map((a) => (
              <button key={a.id} disabled={s.running} className={`mini ${r.action === a.id ? 'on' : ''}`} title={a.label} aria-label={a.label} aria-pressed={r.action === a.id} onClick={() => { sfx('click'); set(i, { action: r.action === a.id ? null : a.id }); }}><Ico e={a.emoji} /></button>
            ))}
          </div>
          <span aria-hidden>{i + 1}</span>
        </div>
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
  const round = J_ROUNDS[s.round];

  const test = async () => {
    if (s.running) return;
    S.set({ running: true, result: {}, msg: '', fire: -1, passed: false });
    const result = {};
    let allOk = true;
    for (const c of round.cases) {
      const d = decide(s.rules, c.facts);
      const names = c.facts.map((f) => cond(f).label.toLowerCase()).join(' and ');
      S.set({ thinking: `${c.who}: ${names}…`, fire: d.index });
      await sleep(900);
      const ok = d.action === c.correct;
      allOk = allOk && ok;
      result[c.id] = { ok, action: d.action };
      sfx(ok ? 'good' : 'oops');
      react(ok ? 'wave' : 'oops', 900);
      S.set({
        result: { ...result },
        thinking: d.action ? `${c.who}: my rule ${d.index + 1} says ${act(d.action).label.toLowerCase()}. ${ok ? '' : `${c.who} needs ${act(c.correct).label.toLowerCase()}!`}` : `${c.who}: I have no rule for this! `,
      });
      await sleep(1300);
    }
    S.set({ running: false, fire: -1, passed: allOk, msg: allOk ? 'Every visitor got the right help!' : 'Some visitors got the wrong help. Look at the rules and change one.' });
    if (allOk) { sfx('unlock'); react('celebrate', 1800); }
  };
  const nextRound = () => {
    if (s.round + 1 >= J_ROUNDS.length) finishMission('jupiter');
    else S.set({ round: s.round + 1, result: {}, msg: '', passed: false, thinking: '' });
  };

  if (s.phase === 'intro')
    return (
      <Shell id="jupiter" objective="Teach the robot rules" say="A space station is in trouble! I can help, but I need rules to know what to do." tutorial={TUT}>
        <div className="panel act">
          <h3><Ico e="🧠" /> IF this… THEN that</h3>
          <p>A <b>rule</b> tells a computer what to do. “IF oxygen is low, THEN give oxygen.” The robot reads rules from the top and uses the <b>first one that fits</b>.</p>
          <div className="chips">
            <span className="chip"><Ico e="😮‍💨" /> Oxygen low <Ico e="➜" /> <Ico e="🫧" /> oxygen</span>
            <span className="chip"><Ico e="🔧" /> Engine broken <Ico e="➜" /> <Ico e="🧰" /> repair kit</span>
            <span className="chip"><Ico e="😋" /> Hungry <Ico e="➜" /> <Ico e="🍎" /> food</span>
          </div>
          <Btn onClick={() => S.set({ phase: 'play' })}>Build the rules <Ico e="🚀" /></Btn>
        </div>
      </Shell>
    );

  return (
    <Shell id="jupiter" objective={round.title} steps={['Round 1', 'Round 2', 'Round 3']} step={s.round} say={s.msg || round.say} tutorial={TUT}>
      <div className="panel act">
        <div className="chips">
          {round.cases.map((c) => {
            const r = s.result[c.id];
            return (
              <span key={c.id} className={`chip ${r ? (r.ok ? 'yes' : 'no') : ''}`}>
                {c.kind === 'alien' ? <Ico e="👽" /> : <Ico e="🧑‍🚀" />} {c.who}: {c.facts.map((f) => <Ico key={f} e={cond(f).emoji} />)} {r && r.action ? <><Ico e="➜" /> <Ico e={act(r.action).emoji} /></> : ''}
              </span>
            );
          })}
        </div>
        <Rules s={s} />
        <p className="think" aria-live="polite">{s.thinking && `${s.thinking}`}</p>
        <div className="row">
          <Btn kind="good" disabled={s.running} onClick={test}><Ico e="▶" /> Test my rules</Btn>
          {s.rules.length > 1 && (
            <Btn kind="ghost small" disabled={s.running} onClick={() => S.set({ rules: [...s.rules.slice(1), s.rules[0]], result: {}, passed: false, msg: 'Rule order changed!' })}><Ico e="↕" /> Move top rule to bottom</Btn>
          )}
          {s.passed && <Btn onClick={nextRound}>{s.round + 1 >= J_ROUNDS.length ? 'Finish mission' : 'Next round'}</Btn>}
        </div>
      </div>
    </Shell>
  );
}
