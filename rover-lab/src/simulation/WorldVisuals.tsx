import { Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useSimulationStore } from "./simulationStore";
import type { SimulationObstacle, SimulationWorld } from "./types";

function ObstacleMesh({ obstacle, height }: { obstacle: SimulationObstacle; height: (x: number, z: number) => number }) {
  const position = [obstacle.x, height(obstacle.x, obstacle.z) + obstacle.height * 0.46, obstacle.z] as [number, number, number];
  if (obstacle.kind === "barrier" || obstacle.kind === "crate") {
    return (
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={[obstacle.width ?? obstacle.radius * 1.5, obstacle.height, obstacle.depth ?? obstacle.radius * 1.6]} />
        <meshStandardMaterial color={obstacle.color ?? (obstacle.kind === "barrier" ? "#685347" : "#8a6b52")} roughness={0.95} />
      </mesh>
    );
  }
  return (
    <mesh position={position} scale={[obstacle.radius * 1.8, obstacle.height, obstacle.radius * 1.5]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.62, 1]} />
      <meshStandardMaterial color={obstacle.color ?? "#71594a"} flatShading roughness={0.98} />
    </mesh>
  );
}

function TargetMarker({ x, z, y, label, color }: { x: number; z: number; y: number; label: string; color: string }) {
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.75, 0.95, 0.16, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 2.7, 8]} />
        <meshStandardMaterial color="#d8c9ae" metalness={0.35} roughness={0.6} />
      </mesh>
      <mesh position={[0.38, 2.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.8, 0.45]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 2.85, 0]}>
        <mesh><sphereGeometry args={[0.18, 12, 10]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} /></mesh>
      </group>
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <group userData={{ label }} />
    </group>
  );
}

export function WorldVisuals({ world, height, showSensors = true }: { world: SimulationWorld; height: (x: number, z: number) => number; showSensors?: boolean }) {
  const custom = useMemo(() => world.obstacles.filter((obstacle) => !obstacle.id.startsWith(`${world.environmentId}-`)), [world.obstacles, world.environmentId]);
  const snapshot = useSimulationStore((s) => s.snapshot);
  return (
    <>
      {custom.filter((o) => !["sample", "checkpoint", "beacon", "station"].includes(o.kind)).map((obstacle) => <ObstacleMesh key={obstacle.id} obstacle={obstacle} height={height} />)}
      {world.target && <TargetMarker x={world.target.x} z={world.target.z} y={height(world.target.x, world.target.z)} label={world.target.label} color="#70d5ee" />}
      {(snapshot?.collectedSamples ? [] : world.sample ? [world.sample] : custom.filter((o) => o.kind === "sample").map((o) => ({ x: o.x, z: o.z, radius: o.radius, label: "Sample" }))).map((sample, index) => <group key={`sample-${index}`} position={[sample.x, height(sample.x, sample.z), sample.z]}>
        <mesh position={[0, 0.2, 0]} rotation={[0.25, 0, 0.45]} castShadow><dodecahedronGeometry args={[0.42, 1]} /><meshStandardMaterial color="#d6b08a" roughness={0.9} /></mesh>
        <mesh position={[0, 0.02, 0]}><cylinderGeometry args={[0.7, 0.8, 0.06, 20]} /><meshStandardMaterial color="#56bfd9" transparent opacity={0.55} /></mesh>
      </group>)}
      {world.checkpoints?.map((point) => <group key={point.id} position={[point.x, height(point.x, point.z) + 0.05, point.z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[point.radius * 0.78, point.radius, 48]} /><meshBasicMaterial color="#e7b45e" side={THREE.DoubleSide} /></mesh>
      </group>)}
      {showSensors && snapshot?.telemetry.sensors.map((reading) => {
        if (!["lidar", "distance", "side", "camera"].includes(reading.kind)) return null;
        const end = reading.hitPoint ?? [
          reading.worldOrigin[0] + reading.worldDirection[0] * reading.maxRangeM,
          reading.worldOrigin[1],
          reading.worldOrigin[2] + reading.worldDirection[2] * reading.maxRangeM,
        ];
        return <Line key={reading.id} points={[reading.worldOrigin, end]} color={reading.distanceM === null ? "#64c8dd" : "#e9b55e"} lineWidth={reading.kind === "lidar" ? 0.8 : 1.4} transparent opacity={reading.kind === "lidar" ? 0.45 : 0.8} />;
      })}
    </>
  );
}
