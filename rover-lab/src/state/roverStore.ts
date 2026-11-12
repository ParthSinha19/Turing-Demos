/**
 * RoverStore: the single authoritative rover design, saved in the browser so it persists
 * between sessions and (later) between the Design Lab, Sandbox and Missions.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyComponent, DEFAULT_CONFIGURATION, sanitizeConfiguration, type ChangeResult, type RoverConfiguration } from "@/rover/configuration";

export interface LastChange { id: string; removed: string[]; at: number }

interface RoverState {
  config: RoverConfiguration;
  lastChange: LastChange | null;
  install: (id: string) => ChangeResult;
  reset: () => void;
}

export const useRoverStore = create<RoverState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIGURATION,
      lastChange: null,
      install: (id) => {
        const res = applyComponent(get().config, id);
        set({ config: res.config, lastChange: { id, removed: res.removed.map((r) => r.id), at: Date.now() } });
        return res;
      },
      reset: () => set({ config: DEFAULT_CONFIGURATION, lastChange: null }),
    }),
    {
      name: "rover-lab:config:v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ config: s.config }),
      merge: (persisted, current) => ({ ...current, config: sanitizeConfiguration((persisted as { config?: RoverConfiguration } | undefined)?.config) }),
    },
  ),
);
