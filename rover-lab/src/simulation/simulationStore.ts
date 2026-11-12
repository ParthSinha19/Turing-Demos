import { create } from "zustand";
import type { DriveInput, SimulationSnapshot } from "./types";

export type AppSection = "design" | "sandbox" | "missions" | "levels";

interface SimulationStore {
  section: AppSection;
  mode: "manual" | "autonomous";
  paused: boolean;
  followCamera: boolean;
  input: DriveInput;
  snapshot: SimulationSnapshot | null;
  worldId: string | null;
  resetToken: number;
  setSection: (section: AppSection) => void;
  setMode: (mode: "manual" | "autonomous") => void;
  setPaused: (paused: boolean) => void;
  setFollowCamera: (follow: boolean) => void;
  setInput: (input: Partial<DriveInput>) => void;
  setSnapshot: (snapshot: SimulationSnapshot) => void;
  clearSnapshot: () => void;
  requestReset: () => void;
  setWorldId: (id: string | null) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  section: "design",
  mode: "manual",
  paused: false,
  followCamera: true,
  input: { throttle: 0, steer: 0, brake: false },
  snapshot: null,
  worldId: null,
  resetToken: 0,
  setSection: (section) => set({ section }),
  setMode: (mode) => set({ mode, input: { throttle: 0, steer: 0, brake: true } }),
  setPaused: (paused) => set({ paused, input: paused ? { throttle: 0, steer: 0, brake: true } : { throttle: 0, steer: 0, brake: false } }),
  setFollowCamera: (followCamera) => set({ followCamera }),
  setInput: (input) => set((state) => ({ input: { ...state.input, ...input } })),
  setSnapshot: (snapshot) => set({ snapshot }),
  clearSnapshot: () => set((state) => ({
    snapshot: null,
    worldId: null,
    resetToken: state.resetToken + 1,
    input: { throttle: 0, steer: 0, brake: true },
  })),
  requestReset: () => set((state) => ({
    resetToken: state.resetToken + 1,
    input: { throttle: 0, steer: 0, brake: true },
  })),
  setWorldId: (worldId) => set({ worldId }),
}));
