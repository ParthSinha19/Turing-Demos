import { useMemo } from "react";
import * as THREE from "three";

/** Martian daytime sky: butterscotch haze near the horizon, deeper ochre overhead, a small pale sun with a cool halo. */
export function Sky({ sunDirection }: { sunDirection: THREE.Vector3 }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          sunDir: { value: sunDirection.clone().normalize() },
          horizon: { value: new THREE.Color("#d8a77c") },
          zenith: { value: new THREE.Color("#7d4a30") },
          ground: { value: new THREE.Color("#a06a48") },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 sunDir; uniform vec3 horizon; uniform vec3 zenith; uniform vec3 ground;
          varying vec3 vDir;
          void main() {
            vec3 d = normalize(vDir);
            float h = clamp(d.y, -1.0, 1.0);
            float up = sqrt(max(h, 0.0));
            vec3 col = mix(horizon, zenith, up);
            col = mix(col, ground, smoothstep(0.0, -0.08, h));
            float sd = max(dot(d, sunDir), 0.0);
            float halo = sd * sd; halo *= halo; halo *= halo; halo *= halo; // ^16
            float disc = smoothstep(0.99955, 0.9997, sd);
            col += vec3(0.55, 0.62, 0.7) * halo * 0.5;
            col += vec3(1.0, 0.97, 0.92) * disc * 3.0;
            col += horizon * 0.12 * (1.0 - abs(h)) ;
            gl_FragColor = vec4(min(col, vec3(4.0)), 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      }),
    [sunDirection],
  );
  return (
    <mesh material={material} frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[900, 48, 24]} />
    </mesh>
  );
}
