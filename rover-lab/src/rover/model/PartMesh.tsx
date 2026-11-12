import { useEffect, useMemo } from "react";
import { disposePart, type BuiltPart } from "./partBuilder";
import { getRoverMaterials, type MatKey } from "./materials";

/** Renders a built part (one mesh per material) and frees its GPU memory when replaced. */
export function PartMesh({ part, shadows = true, disposeOnUnmount = true }: { part: BuiltPart; shadows?: boolean; disposeOnUnmount?: boolean }) {
  const mats = getRoverMaterials();
  useEffect(() => (disposeOnUnmount ? () => disposePart(part) : undefined), [part, disposeOnUnmount]);
  const entries = useMemo(() => Object.entries(part) as [MatKey, NonNullable<BuiltPart[MatKey]>][], [part]);
  return (
    <>
      {entries.map(([key, geo]) => (
        <mesh key={key} geometry={geo} material={mats[key]} castShadow={shadows} receiveShadow={shadows} />
      ))}
    </>
  );
}
