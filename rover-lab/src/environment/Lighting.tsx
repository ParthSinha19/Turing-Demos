import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/** One shadowed sun + sky fill + a local image-based light (no network HDR) for metal reflections. */
export function Lighting({ sunDirection, shadowMapSize, focus = [0, 0, 0] }: { sunDirection: THREE.Vector3; shadowMapSize: number; focus?: [number, number, number] }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  useEffect(() => {
    const l = sun.current;
    if (!l) return;
    l.target.position.set(...focus);
    l.position.set(focus[0] + sunDirection.x * 40, focus[1] + sunDirection.y * 40, focus[2] + sunDirection.z * 40);
    l.target.updateMatrixWorld();
    l.shadow.camera.updateProjectionMatrix();
  }, [sunDirection, focus]);
  return (
    <>
      <directionalLight
        ref={sun}
        color="#fff1df"
        intensity={3.1}
        castShadow
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={5}
        shadow-camera-far={90}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <hemisphereLight args={["#f0c49c", "#7a4128", 0.85]} />
      <Environment resolution={128} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.2} color="#ffe2c4" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[16, 16, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#e0a679" position={[-8, 1.5, 0]} rotation-y={Math.PI / 2} scale={[24, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#d8936a" position={[8, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[24, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#b06a45" position={[0, -2, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
        <Lightformer form="circle" intensity={3} color="#fff6ea" position={[sunDirection.x * 9, sunDirection.y * 9, sunDirection.z * 9]} scale={1.6} />
      </Environment>
    </>
  );
}
