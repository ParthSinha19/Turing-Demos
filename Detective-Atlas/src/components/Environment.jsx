import React, { useState, memo } from 'react';
import { ForestExplore, ForestStation, MemoryTree } from '../scenes/ForestScenes';
import { SpaceExplore, SpaceStation, SatelliteControl } from '../scenes/SpaceScenes';
import HQScene from '../scenes/HQScene';
import { ShuttleHQ, GuardianCore } from '../scenes/ShuttleScenes';
import { ENV_META } from '../data/environments';

// ─────────────────────────────────────────────────────────────────────────────
// Seven reusable environments. Missions reference these by id.
// <Environment id="forestExplore" glitch={0..3} level={hqLevel}>…overlay content…</Environment>
// ─────────────────────────────────────────────────────────────────────────────
export const SCENES = {
  hq: memo(HQScene), forestExplore: memo(ForestExplore), forestStation: memo(ForestStation), memoryTree: memo(MemoryTree),
  shuttle: memo(ShuttleHQ), guardianCore: memo(GuardianCore),
  spaceExplore: memo(SpaceExplore), spaceStation: memo(SpaceStation), satelliteControl: memo(SatelliteControl),
};

export default function Environment({ id, glitch = 0, level = 1, className = '', children }) {
  const Scene = SCENES[id];
  const meta = ENV_META[id];
  const [p, setP] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    setP({ x: ((e.clientX - b.left) / b.width - 0.5) * 2, y: ((e.clientY - b.top) / b.height - 0.5) * 2 });
  };
  return (
    <div className={`scene realm-${meta.realm} glitch-${glitch} ${className}`} data-env={id} data-realm={meta.realm} onPointerMove={onMove} style={{ '--mx': p.x.toFixed(3), '--my': p.y.toFixed(3) }}>
      <Scene level={level} />
      <div className="vignette" /><div className="grain" />
      {glitch > 0 && <div className="glitch-fx" aria-hidden />}
      <div className="scene-content">{children}</div>
    </div>
  );
}
