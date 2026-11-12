import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RampFeature } from "@/environment/environmentDefinition";
import type { SimulationObstacle } from "@/simulation/types";

export type LevelTool = "rock" | "boulder" | "barrier" | "ramp" | "checkpoint" | "sample";
export type TerrainPreset = "yard" | "crater" | "ridge";

export interface CustomLevel {
  id: string;
  name: string;
  terrain: TerrainPreset;
  start: { x: number; z: number; yaw: number };
  target: { x: number; z: number; radius: number; label: string };
  obstacles: SimulationObstacle[];
  ramps: RampFeature[];
  checkpoints: { id: string; x: number; z: number; radius: number }[];
}

const DEFAULT_LEVEL: CustomLevel = {
  id: "my-first-level",
  name: "My Mars Test",
  terrain: "yard",
  start: { x: 0, z: 0, yaw: 0 },
  target: { x: 20, z: 0, radius: 2.2, label: "Goal marker" },
  obstacles: [
    { id: "starter-rock", kind: "rock", x: 9, z: -1, radius: 0.62, height: 0.55 },
  ],
  ramps: [],
  checkpoints: [],
};

interface LevelStore {
  levels: CustomLevel[];
  selectedId: string;
  tool: LevelTool;
  selectedLevel: () => CustomLevel;
  select: (id: string) => void;
  setTool: (tool: LevelTool) => void;
  updateSelected: (patch: Partial<CustomLevel>) => void;
  addObstacle: (obstacle: SimulationObstacle) => void;
  removeObstacle: (id: string) => void;
  removeRamp: (id: string) => void;
  removeCheckpoint: (id: string) => void;
  addRamp: (ramp: RampFeature) => void;
  addCheckpoint: (x: number, z: number) => void;
  create: () => void;
  save: () => void;
}

export const useLevelStore = create<LevelStore>()(persist((set, get) => ({
  levels: [DEFAULT_LEVEL],
  selectedId: DEFAULT_LEVEL.id,
  tool: "rock",
  selectedLevel: () => get().levels.find((level) => level.id === get().selectedId) ?? DEFAULT_LEVEL,
  select: (id) => set({ selectedId: id }),
  setTool: (tool) => set({ tool }),
  updateSelected: (patch) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, ...patch } : level),
  })),
  addObstacle: (obstacle) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, obstacles: [...level.obstacles, obstacle] } : level),
  })),
  removeObstacle: (id) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, obstacles: level.obstacles.filter((item) => item.id !== id) } : level),
  })),
  removeRamp: (id) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, ramps: level.ramps.filter((item) => item.id !== id) } : level),
  })),
  removeCheckpoint: (id) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, checkpoints: level.checkpoints.filter((item) => item.id !== id) } : level),
  })),
  addRamp: (ramp) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? { ...level, ramps: [...level.ramps, ramp] } : level),
  })),
  addCheckpoint: (x, z) => set((state) => ({
    levels: state.levels.map((level) => level.id === state.selectedId ? {
      ...level,
      checkpoints: [...level.checkpoints, { id: `checkpoint-${Date.now()}`, x, z, radius: 1.8 }],
    } : level),
  })),
  create: () => set((state) => {
    const id = `level-${Date.now()}`;
    return { levels: [...state.levels, { ...DEFAULT_LEVEL, id, name: `Mars Test ${state.levels.length + 1}`, obstacles: [], ramps: [], checkpoints: [] }], selectedId: id };
  }),
  save: () => set((state) => ({ levels: [...state.levels] })),
}), { name: "rover-lab:custom-levels:v1", storage: createJSONStorage(() => localStorage) }));
