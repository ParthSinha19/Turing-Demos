/** Dev-only handle for scripted checks: window.__roverLab. Not shipped to students. */
import { computePhysicsProfile } from "@/rover/physicsProfile";
import { computeStats } from "@/rover/stats";
import { useLabStore, type CameraView } from "@/state/labStore";
import { useRoverStore } from "@/state/roverStore";

let renderer: { info: { render: { calls: number; triangles: number } } } | null = null;
export function registerRenderer(gl: typeof renderer) { renderer = gl; }
let joints: unknown = null;
export function registerJoints(j: unknown) { joints = j; }

export function installDevHooks() {
  if (!import.meta.env.DEV || typeof window === "undefined") return;
  (window as unknown as Record<string, unknown>)["__roverLab"] = {
    config: () => useRoverStore.getState().config,
    install: (id: string) => useRoverStore.getState().install(id),
    reset: () => useRoverStore.getState().reset(),
    stats: () => computeStats(useRoverStore.getState().config),
    profile: () => computePhysicsProfile(useRoverStore.getState().config),
    view: (v: CameraView) => useLabStore.getState().requestView(v),
    joints: () => JSON.parse(JSON.stringify(joints)),
    renderInfo: () => (renderer ? { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles } : null),
  };
}
