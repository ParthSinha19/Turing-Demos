import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MissionState {
  activeMissionId: string | null;
  completed: string[];
  attempts: Record<string, number>;
  hintIndex: number;
  begin: (id: string) => void;
  finish: (id: string) => void;
  retry: (id: string) => void;
  nextHint: (count: number) => void;
  leave: () => void;
}

export const useMissionStore = create<MissionState>()(persist((set, get) => ({
  activeMissionId: null,
  completed: [],
  attempts: {},
  hintIndex: 0,
  begin: (id) => set((state) => ({ activeMissionId: id, hintIndex: 0, attempts: { ...state.attempts, [id]: (state.attempts[id] ?? 0) + 1 } })),
  finish: (id) => set((state) => ({ completed: state.completed.includes(id) ? state.completed : [...state.completed, id] })),
  retry: (id) => set((state) => ({ activeMissionId: id, hintIndex: 0, attempts: { ...state.attempts, [id]: (state.attempts[id] ?? 0) + 1 } })),
  nextHint: (count) => set((state) => ({ hintIndex: count > 0 ? (state.hintIndex + 1) % count : 0 })),
  leave: () => set({ activeMissionId: null, hintIndex: 0 }),
}), { name: "rover-lab:missions:v1", storage: createJSONStorage(() => localStorage) }));
