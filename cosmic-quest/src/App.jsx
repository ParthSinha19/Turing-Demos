import { Ico } from './ui/Ico.jsx';
import { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';
import { save } from './game/save.js';
import { flow } from './game/flow.js';
import { TitleScene, TitleUI } from './scenes/Title.jsx';
import { AcademyScene, AcademyUI } from './scenes/Academy.jsx';
import { GalaxyScene, GalaxyUI } from './scenes/Galaxy.jsx';
import { RewardOverlay, Ending } from './ui/Overlays.jsx';
import { SCENES, UIS } from './missions/index.js';

class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="fatal panel">
        <h2>Oh no, the 3D world could not start</h2>
        <p>Try a different browser (Chrome, Edge or Firefox), or turn on hardware acceleration. Your saved game is safe.</p>
        <button className="btn" onClick={() => location.reload()}>Try again</button>
      </div>
    );
  }
}

function World() {
  const f = flow.use();
  if (f.screen === 'title') return <TitleScene />;
  if (f.screen === 'academy') return <AcademyScene />;
  if (f.screen === 'map') return <GalaxyScene key="map" />;
  const Scene = SCENES[f.mission];
  return Scene ? (
    <Suspense fallback={null}>
      <Scene key={f.mission} />
    </Suspense>
  ) : null;
}

function UI() {
  const f = flow.use();
  if (f.screen === 'title') return <TitleUI />;
  if (f.screen === 'academy') return <AcademyUI />;
  if (f.screen === 'map') return <GalaxyUI />;
  const M = UIS[f.mission];
  return M ? (
    <Suspense fallback={<div className="loading panel"><Ico e="🚀" /> Getting ready…</div>}>
      <M key={f.mission} />
    </Suspense>
  ) : null;
}

export default function App() {
  const s = save.use();
  const f = flow.use();
  return (
    <Boundary>
      <div className="stage">
        <Canvas
          dpr={s.low ? [0.7, 1] : [1, 1.75]}
          gl={{ antialias: !s.low, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
          camera={{ fov: 50, position: [0, 24, 40], near: 0.1, far: 400 }}
          onPointerMissed={() => f.screen === 'map' && !f.launching && flow.set({ selected: null })}
        >
          <color attach="background" args={['#050816']} />
          <fog attach="fog" args={['#050816', 90, 320]} />
          <World />
          {!s.low && (
            <EffectComposer multisampling={0}>
              <SMAA />
              <Bloom intensity={0.75} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur />
              <Vignette offset={0.28} darkness={0.62} />
            </EffectComposer>
          )}
        </Canvas>
        <div className="stage-glow" aria-hidden="true" />
        <div className="ui" key={f.screen === 'mission' ? f.mission : f.screen}>
          <UI />
        </div>
        <RewardOverlay />
        <Ending />
      </div>
    </Boundary>
  );
}
