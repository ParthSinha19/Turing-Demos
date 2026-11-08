import { Ico } from '../ui/Ico.jsx';
import { useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { save, resetAll } from '../game/save.js';
import { flow } from '../game/flow.js';
import { sfx } from '../game/sound.js';
import { Btn, SettingsButtons } from '../ui/kit.jsx';
import { ConfirmReset } from '../ui/Overlays.jsx';
import { PlayerRobot } from './Robot.jsx';
import { Stars, PlanetBall, Glow, Ship } from './Space.jsx';

function Cam() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 1.6, 7.5);
    camera.lookAt(0, 1.3, 0);
  }, [camera]);
  useFrame((s) => {
    camera.position.x = Math.sin(s.clock.elapsedTime * 0.2) * 0.5;
    camera.lookAt(0, 1.3, 0);
  });
  return null;
}

export function TitleScene() {
  const wide = typeof window !== 'undefined' && window.innerWidth > 860;
  return (
    <>
      <Cam />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 4, 6]} intensity={2.4} />
      <Stars />
      <PlanetBall tex="earth" radius={5} position={[wide ? 5 : 2, wide ? -1.5 : -3.5, -10]} atmosphere="#6ec6ff" spinSpeed={0.03} />
      <PlanetBall tex="saturn" radius={1} rings position={[-7, 4, -14]} spinSpeed={0.05} />
      <Glow color="#6ec6ff" size={16} opacity={0.18} position={[wide ? 5 : 2, wide ? -1.5 : -3.5, -10]} />
      <group position={[wide ? -2.6 : 0, 0, 0]}>
        <PlayerRobot scale={1.5} />
      </group>
      <group position={[wide ? 1.6 : -1, 3.4, -2]} rotation={[0, -0.8, 0]}>
        <Ship scale={1.4} />
      </group>
    </>
  );
}

export function TitleUI() {
  const s = save.use();
  const [ask, setAsk] = useState(false);
  return (
    <>
      <div className="hud-tr">
        <SettingsButtons />
      </div>
      <div className="title-block">
        <small>TURING EDUCATION PRESENTS</small>
        <h1>
          COSMIC
          <br />
          QUEST
        </h1>
        <p className="tagline">Build a robot. Explore the galaxy. Discover intelligence.</p>
        <div className="row col">
          {s.created ? (
            <>
              <Btn kind="good big" onClick={() => flow.set({ screen: 'map', selected: null })}><Ico e="▶" /> Continue as {s.robot.name}</Btn>
              <Btn kind="ghost" onClick={() => flow.set({ screen: 'academy' })}><Ico e="🤖" /> Robot Academy</Btn>
              <button className="link" onClick={() => { sfx('click'); setAsk(true); }}>Start again</button>
            </>
          ) : (
            <Btn kind="good big" onClick={() => flow.set({ screen: 'academy' })}><Ico e="🚀" /> Play</Btn>
          )}
        </div>
      </div>
      {ask && (
        <ConfirmReset
          onNo={() => setAsk(false)}
          onYes={() => {
            resetAll();
            flow.set({ selected: null, reward: null, mission: null });
            setAsk(false);
          }}
        />
      )}
    </>
  );
}
