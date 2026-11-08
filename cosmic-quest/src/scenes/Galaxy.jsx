import { Ico } from '../ui/Ico.jsx';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { save, PLANET_ORDER, isUnlocked } from '../game/save.js';
import { flow, launch, STORY } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, RobotChip, SettingsButtons } from '../ui/kit.jsx';
import { PlanetBall, Asteroids, Glow, Ship, Stars } from './Space.jsx';
import { planetTexture, ringGeometry, ringTexture } from './textures.js';

export const DEFS = {
  earth: { r: 1.15, orbit: 7.5, speed: 0.06, a0: 0.5, tex: 'earth', atm: '#6ec6ff' },
  mars: { r: 0.85, orbit: 11, speed: 0.048, a0: 2.4, tex: 'mars', atm: '#ff9a6e' },
  jupiter: { r: 2.1, orbit: 16.5, speed: 0.035, a0: 4.1, tex: 'jupiter', atm: '#ffd7a0' },
  saturn: { r: 1.7, orbit: 22.5, speed: 0.028, a0: 1.2, tex: 'saturn', rings: true, atm: '#ffe9b0' },
  neptune: { r: 1.4, orbit: 28, speed: 0.022, a0: 5.3, tex: 'neptune', atm: '#6e9bff' },
  final: { r: 1.3, orbit: 33.5, speed: 0.014, a0: 5.7 },
};
export const POS = {};
Object.entries(DEFS).forEach(([k, d]) => (POS[k] = new THREE.Vector3(Math.cos(d.a0) * d.orbit, 0, Math.sin(d.a0) * d.orbit)));
const shipPos = new THREE.Vector3(4, 1, 4);

function Orbit({ r }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r - 0.025, r + 0.025, 160]} />
      <meshBasicMaterial color="#6fb6ff" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Planet({ id }) {
  const d = DEFS[id];
  const grp = useRef();
  const ball = useRef();
  const halo = useRef();
  const angle = useRef(d.a0);
  const s = save.use();
  const f = flow.use();
  const locked = !isUnlocked(id, s.completed);
  const done = !!s.completed[id];
  const sel = f.selected === id;
  const map = useMemo(() => planetTexture(d.tex), [d.tex]);
  const rg = useMemo(() => (d.rings ? ringGeometry(d.r * 1.4, d.r * 2.4, 96) : null), [d]);
  const rt = useMemo(() => (d.rings ? ringTexture() : null), [d]);
  useFrame((st, dt) => {
    angle.current += dt * d.speed;
    const x = Math.cos(angle.current) * d.orbit;
    const z = Math.sin(angle.current) * d.orbit;
    grp.current.position.set(x, 0, z);
    POS[id].set(x, 0, z);
    ball.current.rotation.y += dt * 0.25;
    const sc = ball.current.scale.x;
    ball.current.scale.setScalar(sc + ((sel ? 1.1 : 1) - sc) * Math.min(1, dt * 6));
    if (halo.current) halo.current.rotation.z += dt * 0.8;
  });
  return (
    <group ref={grp}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          sfx('select');
          flow.set({ selected: id });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <group ref={ball}>
          <mesh>
            <sphereGeometry args={[d.r, 48, 32]} />
            <meshStandardMaterial map={map} roughness={0.85} color={locked ? '#5b6382' : '#ffffff'} emissive={locked ? '#0a0f22' : '#000'} />
          </mesh>
          {!locked && (
            <mesh scale={1.08}>
              <sphereGeometry args={[d.r, 32, 16]} />
              <meshBasicMaterial color={d.atm} transparent opacity={0.2} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          )}
          {d.rings && (
            <mesh rotation={[-Math.PI / 2 + 0.45, 0.1, 0]} geometry={rg}>
              <meshBasicMaterial map={rt} transparent side={THREE.DoubleSide} depthWrite={false} color={locked ? '#6a7090' : '#fff'} />
            </mesh>
          )}
        </group>
      </group>
      {sel && (
        <mesh ref={halo} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[d.r * 1.55 + (d.rings ? 1.6 : 0), 0.035, 8, 80]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      )}
      <Html center position={[0, d.r + (d.rings ? 1.3 : 0.9), 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`plabel ${locked ? 'locked' : ''} ${done ? 'done' : ''} ${sel ? 'sel' : ''}`}>
          {locked ? <Ico e="🔒" /> : done ? <Ico e="✅" /> : <Ico e={STORY[id].emoji} />} {STORY[id].name}
        </div>
      </Html>
    </group>
  );
}

function MysteryShip() {
  const grp = useRef();
  const lights = useRef();
  const angle = useRef(DEFS.final.a0);
  const s = save.use();
  const f = flow.use();
  const locked = !isUnlocked('final', s.completed);
  const done = !!s.completed.final;
  const sel = f.selected === 'final';
  useFrame((st, dt) => {
    const d = DEFS.final;
    angle.current += dt * d.speed;
    const x = Math.cos(angle.current) * d.orbit;
    const z = Math.sin(angle.current) * d.orbit;
    grp.current.position.set(x, 1.5 + Math.sin(st.clock.elapsedTime) * 0.3, z);
    POS.final.set(x, 1.5, z);
    grp.current.rotation.y += dt * 0.2;
    lights.current.rotation.y -= dt * 1.2;
  });
  const col = locked ? '#444b66' : '#8fb5ff';
  return (
    <group ref={grp}>
      <group
        onClick={(e) => {
          e.stopPropagation();
          sfx('select');
          flow.set({ selected: 'final' });
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh scale={[1, 0.28, 1]}>
          <sphereGeometry args={[1.6, 32, 16]} />
          <meshStandardMaterial color={col} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <sphereGeometry args={[0.7, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={locked ? '#2b3150' : '#9ff0ff'} transparent opacity={0.75} emissive={locked ? '#000' : '#2fb4ff'} emissiveIntensity={0.5} />
        </mesh>
        <group ref={lights}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[Math.cos((i / 8) * 6.28) * 1.45, -0.05, Math.sin((i / 8) * 6.28) * 1.45]}>
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshBasicMaterial color={locked ? '#555' : i % 2 ? '#ffd166' : '#ff6b6b'} />
            </mesh>
          ))}
        </group>
      </group>
      {!locked && !done && <Glow color="#7ad7ff" size={6} opacity={0.5} />}
      {sel && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.035, 8, 80]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      )}
      <Html center position={[0, 2.1, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className={`plabel ${locked ? 'locked' : ''} ${done ? 'done' : ''} ${sel ? 'sel' : ''}`}>
          {locked ? <Ico e="🔒" /> : done ? <Ico e="✅" /> : <Ico e="🛸" />} {locked ? 'Mystery ship' : 'Strange ship'}
        </div>
      </Html>
    </group>
  );
}

function Sun() {
  const map = useMemo(() => planetTexture('sun'), []);
  const ref = useRef();
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * 0.05));
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[3.2, 48, 32]} />
        <meshBasicMaterial map={map} />
      </mesh>
      <Glow color="#ffb347" size={16} opacity={0.9} />
      <Glow color="#ff7a1a" size={30} opacity={0.35} />
      <pointLight intensity={4.2} distance={0} decay={0} color="#fff1d6" />
    </group>
  );
}

function ShipRig() {
  const ref = useRef();
  const t = useRef(0);
  useFrame((s, dt) => {
    const f = flow.get();
    const target = new THREE.Vector3();
    const a = s.clock.elapsedTime * 0.8;
    if (f.launching) {
      target.copy(POS[f.launching]);
      t.current += dt;
      if (t.current > 2.4) {
        t.current = 0;
        flow.set({ screen: 'mission', mission: f.launching, launching: null });
      }
    } else {
      t.current = 0;
      if (f.selected && POS[f.selected]) {
        const r = (DEFS[f.selected].r || 1) + 1.7;
        target.copy(POS[f.selected]).add(new THREE.Vector3(Math.cos(a) * r, 0.6 + Math.sin(a * 1.3) * 0.3, Math.sin(a) * r));
      } else target.set(Math.cos(a * 0.4) * 6, 0.8, Math.sin(a * 0.4) * 6);
    }
    const prev = shipPos.clone();
    shipPos.lerp(target, 1 - Math.exp(-dt * (f.launching ? 2.4 : 1.5)));
    ref.current.position.copy(shipPos);
    const v = shipPos.clone().sub(prev);
    if (v.lengthSq() > 1e-9) ref.current.lookAt(shipPos.clone().add(v));
    const close = f.launching ? Math.max(0.15, shipPos.distanceTo(target) / 8) : 1;
    ref.current.scale.setScalar(Math.min(1, close) * 1.3);
  });
  return <Ship innerRef={ref} />;
}

function Rig() {
  const ctl = useRef();
  const { camera } = useThree();
  const trans = useRef(1.6);
  const last = useRef(new THREE.Vector3());
  const gT = useRef(new THREE.Vector3());
  const gP = useRef(new THREE.Vector3());
  const sel = flow.use().selected;
  useEffect(() => {
    trans.current = 1.8;
    last.current.set(0, 0, 0);
    if (sel && POS[sel]) last.current.copy(POS[sel]);
  }, [sel]);
  useFrame((_, dt) => {
    const c = ctl.current;
    if (!c) return;
    if (sel && POS[sel]) {
      const p = POS[sel];
      const r = DEFS[sel].r + (DEFS[sel].rings ? 1.6 : 0);
      const dir = new THREE.Vector3(p.x, 0, p.z).normalize();
      if (dir.lengthSq() === 0) dir.set(0, 0, 1);
      const right = new THREE.Vector3(dir.z, 0, -dir.x);
      const shift = window.innerWidth > 820 ? r * 1.1 : 0;
      gT.current.copy(p).addScaledVector(right, -shift);
      gP.current.copy(p).addScaledVector(dir, r * 2.6 + 3.2).addScaledVector(right, -shift);
      gP.current.y += r * 0.9 + 0.8;
    } else {
      gT.current.set(0, 0, 0);
      gP.current.set(0, 24, 40);
    }
    if (trans.current > 0) {
      trans.current -= dt;
      const k = 1 - Math.exp(-dt * 3.2);
      camera.position.lerp(gP.current, k);
      c.target.lerp(gT.current, k);
    } else if (sel && POS[sel] && last.current.lengthSq() > 0) {
      const dx = POS[sel].clone().sub(last.current);
      camera.position.add(dx);
      c.target.add(dx);
    }
    if (sel && POS[sel]) last.current.copy(POS[sel]);
    c.update();
  });
  return <OrbitControls ref={ctl} enablePan={false} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={75} maxPolarAngle={Math.PI * 0.85} />;
}

export function GalaxyScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <Stars />
      <Sun />
      {PLANET_ORDER.map((p) => (
        <Orbit key={p} r={DEFS[p].orbit} />
      ))}
      <Orbit r={DEFS.final.orbit} />
      {PLANET_ORDER.map((p) => (
        <Planet key={p} id={p} />
      ))}
      <MysteryShip />
      <Asteroids inner={13.2} outer={14.6} />
      <Asteroids count={40} inner={36} outer={40} spread={3} />
      <ShipRig />
      <Rig />
    </>
  );
}

export function GalaxyUI() {
  const s = save.use();
  const f = flow.use();
  const sel = f.selected;
  const info = sel && STORY[sel];
  const unlocked = sel && isUnlocked(sel, s.completed);
  const done = sel && s.completed[sel];
  const prev = sel === 'final' ? 'all five planets' : sel && PLANET_ORDER[PLANET_ORDER.indexOf(sel) - 1];
  const all = [...PLANET_ORDER, 'final'];
  return (
    <>
      <div className="hud-tl">
        <RobotChip />
        <div className="title-mini">COSMIC QUEST</div>
      </div>
      <div className="hud-tr">
        <SettingsButtons />
        <Btn kind="ghost small" onClick={() => flow.set({ screen: 'academy' })}><Ico e="🤖" /> Robot</Btn>
        <Btn kind="ghost small" onClick={() => flow.set({ screen: 'title', selected: null })}><Ico e="🏠" /></Btn>
      </div>
      <nav className="mission-bar" aria-label="Missions">
        {all.map((id) => {
          const un = isUnlocked(id, s.completed);
          return (
            <button
              key={id}
              className={`planet-pill ${s.completed[id] ? 'done' : ''} ${!un ? 'locked' : ''} ${sel === id ? 'sel' : ''}`}
              onClick={() => {
                sfx('select');
                flow.set({ selected: id });
              }}
              aria-label={`${STORY[id].name}${un ? '' : ' (locked)'}${s.completed[id] ? ' (complete)' : ''}`}
            >
              {!un ? <Ico e="🔒" /> : <Ico e={STORY[id].emoji} />}
            </button>
          );
        })}
      </nav>
      <div className="bottom">
        {info ? (
          <div className="panel info-card">
            <small>{info.concept.toUpperCase()}</small>
            <h2>
              <Ico e={info.emoji} /> {info.name}: {info.title}
            </h2>
            <p>{info.intro}</p>
            <div className="row">
              {unlocked ? (
                <Btn kind="good" disabled={!!f.launching} onClick={() => launch(sel)}>
                  {f.launching ? 'Launching…' : done ? 'Play again' : 'Launch mission'}
                </Btn>
              ) : (
                <span className="lock-msg"><Ico e="🔒" /> Finish {prev === 'all five planets' ? prev : STORY[prev].name} first!</span>
              )}
              {done && <span className="tick"><Ico e="✅" /> Complete</span>}
              <Btn kind="ghost small" onClick={() => flow.set({ selected: null })}><Ico e="✕" /></Btn>
            </div>
          </div>
        ) : (
          <div className="panel hint"><Ico e="👆" /> Tap a planet to begin. Drag to look around, scroll to zoom.</div>
        )}
      </div>
    </>
  );
}
