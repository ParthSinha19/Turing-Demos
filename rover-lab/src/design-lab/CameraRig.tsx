import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { RoverLayout, Vec3 } from "@/rover/layout";
import { useLabStore, type CameraView } from "@/state/labStore";

export const LIFT_HEIGHT = 1.25;

function pose(view: CameraView, l: RoverLayout): { pos: Vec3; target: Vec3 } {
  const L = l.body.length;
  const midY = l.body.bellyY + l.body.height * 0.4;
  const right = l.wheels.find((w) => w.id === "FR")!;
  switch (view) {
    case "front": return { pos: [L / 2 + 3.6, midY + 0.5, 0.35], target: [0, midY, 0] };
    case "side": return { pos: [0.1, midY + 0.55, 4.6], target: [0, midY, 0] };
    case "rear": return { pos: [-L / 2 - 3.4, midY + 1.1, -1.2], target: [0, midY, 0] };
    case "top": return { pos: [0, 5.2 + L * 1.6, 0.02], target: [0, 0, 0] };
    case "underside": return { pos: [2.3, 0.42, 1.9], target: [0, LIFT_HEIGHT + l.body.bellyY, 0] };
    case "wheels": case "motors": return { pos: [right.hub[0] + 2.1, right.hub[1] + 1.0, right.hub[2] + 2.5], target: [right.hub[0] - 0.35, right.hub[1] + 0.1, right.hub[2] - 0.3] };
    case "sensors": { const m = l.mounts["sensor.mast"].position; return { pos: [m[0] + 3.0, m[1] + 1.5, m[2] - 2.6], target: [m[0] - 0.2, m[1] + 0.2, 0] }; }
    case "attachments": return { pos: [L / 2 + 3.1, midY + 1.6, 2.7], target: [L * 0.15, midY, 0] };
    case "chassis": return { pos: [3.4, midY + 2.5, 3.8], target: [0, midY, 0] };
    default: return { pos: [3.9, midY + 1.55, 3.7], target: [0, midY - 0.05, 0] };
  }
}

/** Orbit / zoom / pan with smooth transitions between saved viewpoints. */
export function CameraRig({ layout }: { layout: RoverLayout }) {
  const ref = useRef<CameraControls>(null);
  const view = useLabStore((s) => s.view);
  const nonce = useLabStore((s) => s.viewNonce);
  const first = useRef(true);
  const lifted = view === "underside";

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const p = pose(view, layout);
    c.setLookAt(...p.pos, ...p.target, !first.current);
    first.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, view]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={1.4}
      maxDistance={lifted ? 5 : 26}
      maxPolarAngle={lifted ? Math.PI * 0.62 : Math.PI * 0.495}
      smoothTime={0.45}
      draggingSmoothTime={0.12}
      dollySpeed={0.6}
    />
  );
}
