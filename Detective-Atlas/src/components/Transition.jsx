import React from 'react';
import { useGame } from '../state/GameContext';
import { GlitchSigil } from './Hud';

// Global scene-transition layer. Trigger with go(screen, { kind: 'iris' | 'scan' | 'warp' }).
export default function TransitionLayer() {
  const { state } = useGame();
  const t = state.transition;
  if (!t) return null;
  return (
    <div className={`tx tx-${t.kind}`} aria-hidden data-component="TransitionLayer">
      {t.kind === 'scan' && <><div className="tx-bar" /><div className="tx-label">SCANNING…</div></>}
      {t.kind === 'warp' && <><div className="tx-streaks" /><div className="tx-flash" /></>}
      {t.kind === 'iris' && <div className="tx-sigil"><GlitchSigil size={74} color="#f6c453" /></div>}
    </div>
  );
}
