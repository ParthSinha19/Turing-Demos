import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Tulip } from "./Tulip";
import { CameraRig, World } from "./World";

export function GameCanvas({ env, mode }: { env: number; mode: "menu" | "default" | "maze" }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="absolute inset-0" data-scene-ready={ready ? "" : undefined}>
      <Canvas shadows dpr={[1, 1.25]} camera={{ position: [-1.4, 2, 4.6], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <hemisphereLight args={["#fff6e8", "#b8c6d0", env === 5 ? 0.6 : 1.1]} />
        <directionalLight position={[4, 7, 4]} intensity={env === 5 ? 0.8 : 2.2} castShadow shadow-mapSize={[512, 512]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} />
        <Environment resolution={64}>
          <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
          <Lightformer intensity={1} color="#bff" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
          <Lightformer intensity={1} color="#fdb" position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>
        <World env={env} />
        <Tulip />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={14} blur={2.5} far={4} resolution={256} />
        <CameraRig mode={mode} />
      </Canvas>
    </div>
  );
}
