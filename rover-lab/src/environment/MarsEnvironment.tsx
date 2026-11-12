import { useMemo } from "react";
import * as THREE from "three";
import type { QualityPreset } from "@/scene/quality";
import { AssemblyPad } from "./AssemblyPad";
import { Dust } from "./Dust";
import { ASSEMBLY_YARD, type EnvironmentDefinition } from "./environmentDefinition";
import { Lighting } from "./Lighting";
import { Rocks } from "./Rocks";
import { Sky } from "./Sky";
import { Terrain } from "./Terrain";
import { createTerrainHeight } from "./terrainHeight";

export const SUN_DIRECTION = new THREE.Vector3(-0.55, 0.62, 0.56).normalize();
export const FOG_COLOR = "#cf9d76";

export function MarsEnvironment({ quality, definition = ASSEMBLY_YARD }: { quality: QualityPreset; definition?: EnvironmentDefinition }) {
  const height = useMemo(() => createTerrainHeight(definition), [definition]);
  return (
    <>
      <color attach="background" args={[FOG_COLOR]} />
      <fog attach="fog" args={[FOG_COLOR, 45, 470]} />
      <Sky sunDirection={SUN_DIRECTION} />
      <Lighting sunDirection={SUN_DIRECTION} shadowMapSize={quality.shadowMapSize} />
      <Terrain height={height} extent={definition.extent} segments={quality.terrainSegments} />
      <Rocks def={definition} height={height} density={quality.rockDensity} />
      <AssemblyPad />
      {quality.dust && <Dust />}
    </>
  );
}
