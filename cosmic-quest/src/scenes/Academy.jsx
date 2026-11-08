import { Ico } from '../ui/Ico.jsx';
import { useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { save, setRobot, toggleAccessory, randomRobot, patch, OPTIONS, LABELS, ACCESSORIES, PALETTES, NAMES, PLANET_ORDER } from '../game/save.js';
import { flow } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, SettingsButtons } from '../ui/kit.jsx';
import { PlayerRobot, react } from './Robot.jsx';
import { Stars, Glow } from './Space.jsx';

function useWide() {
  const [w, setW] = useState(typeof window !== 'undefined' && window.innerWidth > 860);
  useEffect(() => {
    const f = () => setW(window.innerWidth > 860);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return w;
}

function SetCam({ pos, target }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...target);
  }, [camera, pos, target]);
  return null;
}

export function AcademyScene() {
  const wide = useWide();
  const x = wide ? 1.5 : 0;
  const target = [x, wide ? 1.3 : 2.2, 0];
  return (
    <>
      <SetCam pos={[x, wide ? 2.2 : 3.2, 6.2]} target={target} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <pointLight position={[-4, 2, -3]} intensity={30} color="#7aa8ff" />
      <Stars />
      <group position={[x, 0, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[1.6, 1.8, 0.2, 40]} />
          <meshStandardMaterial color="#1a2748" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 48]} />
          <meshBasicMaterial color="#4cc9f0" />
        </mesh>
        <Glow color="#4cc9f0" size={5} opacity={0.35} position={[0, 0.1, 0]} />
        <PlayerRobot scale={1.25} />
      </group>
      <OrbitControls target={target} enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={0.6} />
    </>
  );
}

function Row({ title, children }) {
  return (
    <section className="opt">
      <h3>{title}</h3>
      <div className="opt-row">{children}</div>
    </section>
  );
}
function Opt({ on, onClick, children, label }) {
  return (
    <button className={`opt-btn ${on ? 'on' : ''}`} aria-pressed={on} aria-label={label} onClick={() => { sfx('click'); onClick(); }}>
      {children}
    </button>
  );
}

export function AcademyUI() {
  const s = save.use();
  const r = s.robot;
  const has = PLANET_ORDER.some((p) => s.completed[p]);
  const finish = () => {
    let name = r.name.trim();
    if (!name) {
      name = NAMES[Math.floor(Math.random() * NAMES.length)];
      setRobot({ name });
    }
    sfx('unlock');
    react('celebrate', 1500);
    patch({ created: true });
    setTimeout(() => flow.set({ screen: 'map', selected: null }), 600);
  };
  return (
    <>
      <div className="hud-tr">
        <SettingsButtons />
        {s.created && <Btn kind="ghost small" onClick={() => flow.set({ screen: 'title' })}><Ico e="🏠" /></Btn>}
      </div>
      <aside className="academy panel" aria-label="Build your robot">
        <div className="scroll">
        <small>ROBOT ACADEMY</small>
        <h2>Build your robot</h2>
        {has && <p className="muted">Your upgrades from missions stay on your robot.</p>}
        <Row title="Name">
          <input
            className="name-in"
            value={r.name}
            maxLength={14}
            placeholder="Type a name…"
            aria-label="Robot name"
            onChange={(e) => setRobot({ name: e.target.value.replace(/[<>]/g, '') })}
          />
          <Opt label="Random name" onClick={() => setRobot({ name: NAMES[Math.floor(Math.random() * NAMES.length)] })}><Ico e="🎲" /></Opt>
        </Row>
        <Row title="Body">
          {OPTIONS.body.map((o) => <Opt key={o} on={r.body === o} onClick={() => setRobot({ body: o })}>{LABELS.body[o]}</Opt>)}
        </Row>
        <Row title="Head">
          {OPTIONS.head.map((o) => <Opt key={o} on={r.head === o} onClick={() => setRobot({ head: o })}>{LABELS.head[o]}</Opt>)}
        </Row>
        <Row title="Eyes">
          {OPTIONS.eyes.map((o) => <Opt key={o} on={r.eyes === o} onClick={() => setRobot({ eyes: o })}>{LABELS.eyes[o]}</Opt>)}
        </Row>
        <Row title="Antenna">
          {OPTIONS.antenna.map((o) => <Opt key={o} on={r.antenna === o} onClick={() => setRobot({ antenna: o })}>{LABELS.antenna[o]}</Opt>)}
        </Row>
        <Row title="Colours">
          {PALETTES.map((p, i) => (
            <button
              key={p.name}
              className={`swatch ${r.palette === i ? 'on' : ''}`}
              aria-label={p.name}
              aria-pressed={r.palette === i}
              style={{ background: `linear-gradient(135deg, ${p.c1} 55%, ${p.c2} 55%)` }}
              onClick={() => { sfx('click'); setRobot({ palette: i }); }}
            />
          ))}
        </Row>
        <Row title="Extras">
          {ACCESSORIES.map((a) => (
            <Opt key={a.id} on={r.accessories.includes(a.id)} onClick={() => toggleAccessory(a.id)}>
              <Ico e={a.icon} /> {a.label}
            </Opt>
          ))}
        </Row>
        <Row title="Try it out">
          <Opt label="Wave" onClick={() => react('wave', 2200)}><Ico e="👋" /> Wave</Opt>
          <Opt label="Cheer" onClick={() => react('celebrate', 2000)}><Ico e="🎉" /> Cheer</Opt>
          <Opt label="Oops" onClick={() => react('oops', 1500)}><Ico e="😬" /> Oops</Opt>
        </Row>
        </div>
        <div className="foot">
          <Btn kind="ghost" onClick={() => { randomRobot(); react('wave', 1500); }}><Ico e="🎲" /> Surprise me</Btn>
          <Btn kind="good" onClick={finish}>{s.created ? 'Done' : 'Start'}</Btn>
        </div>
      </aside>
    </>
  );
}
