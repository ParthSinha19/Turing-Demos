import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mood =
  | "idle"
  | "thinking"
  | "confused"
  | "happy"
  | "sad"
  | "speaking"
  | "learning"
  | "walking"
  | "victory"
  | "asleep";

export type Personality = "friendly" | "funny" | "helpful";

export const UPGRADES = [
  { id: "energy", name: "Energy Cell", mission: 0 },
  { id: "thinking", name: "Thinking Chip", mission: 1 },
  { id: "navigation", name: "Navigation Chip", mission: 2 },
  { id: "vision", name: "Vision Upgrade", mission: 3 },
  { id: "language", name: "Language Pack", mission: 4 },
  { id: "voice", name: "Voice Upgrade", mission: 5 },
  { id: "festival", name: "Festival Access", mission: 6 },
] as const;

export type UpgradeId = (typeof UPGRADES)[number]["id"];

/** Maze runtime state read by the 3D scene every frame. */
export type MazeView = {
  map: string[];
  x: number;
  y: number;
  dir: number; // 0=E 1=S 2=W 3=N
  revealed: boolean;
  ghost: [number, number][];
  bump: number; // timestamp of last bump
};

type GameState = {
  screen: "menu" | "map" | "mission" | "ending";
  mission: number;
  completed: number[];
  upgrades: UpgradeId[];
  personality: Personality;
  muted: boolean;
  volume: number;
  /** Lessons TULIP remembers, e.g. "umbrella". */
  memories: string[];
  mood: Mood;
  moodUntil: number;
  maze: MazeView | null;
  setScreen: (s: GameState["screen"]) => void;
  startMission: (i: number) => void;
  completeMission: (i: number) => void;
  setMood: (m: Mood, ms?: number) => void;
  remember: (m: string) => void;
  setPersonality: (p: Personality) => void;
  setMuted: (m: boolean) => void;
  setVolume: (v: number) => void;
  setMaze: (m: MazeView | null) => void;
  reset: () => void;
};

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "menu",
      mission: 0,
      completed: [],
      upgrades: [],
      personality: "friendly",
      muted: false,
      volume: 0.7,
      memories: [],
      mood: "asleep",
      moodUntil: 0,
      maze: null,
      setScreen: (screen) => set({ screen }),
      startMission: (mission) => set({ mission, screen: "mission", maze: null }),
      completeMission: (i) => {
        const upgrade = UPGRADES[i];
        if (!upgrade) return;
        const up = upgrade.id;
        set({
          completed: Array.from(new Set([...get().completed, i])),
          upgrades: Array.from(new Set([...get().upgrades, up])),
        });
      },
      setMood: (mood, ms = 0) => set({ mood, moodUntil: ms ? Date.now() + ms : 0 }),
      remember: (m) => set({ memories: Array.from(new Set([...get().memories, m])) }),
      setPersonality: (personality) => set({ personality }),
      setMuted: (muted) => set({ muted }),
      setVolume: (volume) => set({ volume }),
      setMaze: (maze) => set({ maze }),
      reset: () =>
        set({
          screen: "menu",
          mission: 0,
          completed: [],
          upgrades: [],
          memories: [],
          personality: "friendly",
          mood: "asleep",
          maze: null,
        }),
    }),
    {
      name: "tulip-save-v1",
      partialize: (s) => ({
        mission: s.mission,
        completed: s.completed,
        upgrades: s.upgrades,
        personality: s.personality,
        muted: s.muted,
        volume: s.volume,
        memories: s.memories,
      }),
    },
  ),
);

/** Highest mission index the player may enter. */
export function unlockedUpTo(completed: number[]) {
  let i = 0;
  while (completed.includes(i) && i < 6) i++;
  return i;
}
