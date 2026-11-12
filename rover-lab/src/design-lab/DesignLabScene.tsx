import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { MarsEnvironment } from "@/environment/MarsEnvironment";
import { computeRoverLayout } from "@/rover/layout";
import { QUALITY } from "@/scene/quality";
import { useLabStore } from "@/state/labStore";
import { useRoverStore } from "@/state/roverStore";
import { CameraRig } from "./CameraRig";
import { RoverRig } from "./RoverRig";
import { RoverOverlays } from "./RoverOverlays";
import { registerRenderer } from "./devHooks";

/** Marks the canvas wrapper ready once textures are in and a few real frames have drawn. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current >= 3) { done.current = true; onReady(); }
  });
  return null;
}

export function DesignLabScene({ onReady }: { onReady: () => void }) {
  const config = useRoverStore((s) => s.config);
  const qualityLevel = useLabStore((s) => s.quality);
  const view = useLabStore((s) => s.view);
  const articulation = useLabStore((s) => s.articulation);
  const quality = QUALITY[qualityLevel];
  const layout = useMemo(() => computeRoverLayout(config), [config]);

  return (
    <Canvas
      key={qualityLevel}
      shadows="percentage"
      dpr={quality.dpr}
      gl={{ antialias: quality.antialias, powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.05, far: 1500, position: [3.9, 2.1, 3.7] }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 0.95; registerRenderer(gl); }}
    >
      <MarsEnvironment quality={quality} />
      <RoverRig config={config} layout={layout} lifted={view === "underside" || articulation} articulation={articulation}>
        <RoverOverlays config={config} layout={layout} />
      </RoverRig>
      <CameraRig layout={layout} />
      <Suspense fallback={null}>
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
