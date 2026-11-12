import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";
import { getRoverMaterials } from "@/rover/model/materials";

export const PAD_RADIUS = 3.9;

function padTexture() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const rand = mulberry32(5);
  g.fillStyle = "#6a6560";
  g.fillRect(0, 0, S, S);
  // speckle
  for (let i = 0; i < 26000; i++) {
    const v = 80 + rand() * 60;
    g.fillStyle = `rgba(${v},${v * 0.95},${v * 0.9},${0.25 + rand() * 0.3})`;
    g.fillRect(rand() * S, rand() * S, 2, 2);
  }
  // panel seams
  g.strokeStyle = "rgba(25,22,20,0.75)";
  g.lineWidth = 3;
  for (let i = 1; i < 8; i++) {
    g.beginPath(); g.moveTo((i * S) / 8, 0); g.lineTo((i * S) / 8, S); g.stroke();
    g.beginPath(); g.moveTo(0, (i * S) / 8); g.lineTo(S, (i * S) / 8); g.stroke();
  }
  // bolt heads at seam crossings
  g.fillStyle = "rgba(40,38,36,0.9)";
  for (let i = 1; i < 8; i++) for (let j = 1; j < 8; j++) { g.beginPath(); g.arc((i * S) / 8, (j * S) / 8, 4, 0, Math.PI * 2); g.fill(); }
  // alignment markings (worn paint)
  const paint = "rgba(214,178,96,0.85)";
  g.strokeStyle = paint;
  g.lineWidth = 6;
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.39, 0, Math.PI * 2); g.stroke();
  for (let k = 0; k < 72; k++) {
    const a = (k / 72) * Math.PI * 2;
    const r0 = S * (k % 6 === 0 ? 0.33 : 0.345), r1 = S * 0.36;
    g.beginPath(); g.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0); g.lineTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1); g.stroke();
  }
  g.lineWidth = 4;
  g.setLineDash([22, 14]);
  g.beginPath(); g.moveTo(S * 0.12, S / 2); g.lineTo(S * 0.88, S / 2); g.stroke();
  g.beginPath(); g.moveTo(S / 2, S * 0.12); g.lineTo(S / 2, S * 0.88); g.stroke();
  g.setLineDash([]);
  // forward arrow (+X maps to +u on the cap)
  g.fillStyle = paint;
  g.beginPath(); g.moveTo(S * 0.86, S / 2); g.lineTo(S * 0.82, S / 2 - 18); g.lineTo(S * 0.82, S / 2 + 18); g.closePath(); g.fill();
  g.font = "600 26px 'IBM Plex Mono', monospace";
  g.fillText("ASSEMBLY BAY 02", S * 0.2, S * 0.16);
  g.fillText("FWD", S * 0.74, S * 0.47);
  // paint wear
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${rand() * 0.5})`; g.fillRect(rand() * S, rand() * S, 3, 2); }
  g.globalCompositeOperation = "source-over";
  // dust blown onto the pad, heavier at the edge
  const dust = g.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S * 0.52);
  dust.addColorStop(0, "rgba(190,120,75,0.05)");
  dust.addColorStop(1, "rgba(190,120,75,0.65)");
  g.fillStyle = dust;
  g.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  // the octagon is turned by π/8; turn the markings back so FWD points along the rover's +X
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI / 8;
  return t;
}

/** The test-site assembly platform the rover is built on. Top surface at y = 0. */
export function AssemblyPad() {
  const { top, side, lamps } = useMemo(() => {
    const tex = padTexture();
    const top = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, metalness: 0.25 });
    const side = new THREE.MeshStandardMaterial({ color: "#4a4643", roughness: 0.7, metalness: 0.4 });
    const lamps = Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      return [Math.cos(a) * (PAD_RADIUS - 0.05), 0.005, Math.sin(a) * (PAD_RADIUS - 0.05)] as [number, number, number];
    });
    return { top, side, lamps };
  }, []);
  useEffect(() => () => { top.map?.dispose(); top.dispose(); side.dispose(); }, [top, side]);
  const mats = getRoverMaterials();
  return (
    <group>
      <mesh position={[0, -0.14, 0]} rotation={[0, Math.PI / 8, 0]} receiveShadow castShadow material={[side, top, side]}>
        <cylinderGeometry args={[PAD_RADIUS, PAD_RADIUS + 0.12, 0.28, 8]} />
      </mesh>
      <mesh position={[0, -0.25, 0]} rotation={[0, Math.PI / 8, 0]} material={side} receiveShadow>
        <cylinderGeometry args={[PAD_RADIUS + 0.3, PAD_RADIUS + 0.6, 0.14, 8]} />
      </mesh>
      {lamps.map((p, i) => (
        <mesh key={i} position={p} rotation={[0, -((i / 8) * Math.PI * 2 + Math.PI / 8), 0]} material={mats.lamp}>
          <boxGeometry args={[0.04, 0.02, 0.22]} />
        </mesh>
      ))}
    </group>
  );
}
