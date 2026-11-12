/** Design Lab view state (camera, overlays, quality). Not part of the rover design. */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { QualityLevel } from "@/scene/quality";
import type { Category } from "@/rover/catalogue";

export type CameraView = "overview" | "front" | "side" | "rear" | "top" | "underside" | Category;

interface LabState {
  view: CameraView;
  viewNonce: number;
  requestView: (v: CameraView) => void;
  quality: QualityLevel;
  setQuality: (q: QualityLevel) => void;
  overlays: { mounts: boolean; coverage: boolean; collision: boolean };
  toggleOverlay: (k: keyof LabState["overlays"]) => void;
  hovered: string | null;
  setHovered: (id: string | null) => void;
  articulation: boolean;
  setArticulation: (on: boolean) => void;
}

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      view: "overview",
      viewNonce: 0,
      requestView: (view) => set((s) => ({ view, viewNonce: s.viewNonce + 1 })),
      quality: "medium",
      setQuality: (quality) => set({ quality }),
      overlays: { mounts: false, coverage: false, collision: false },
      toggleOverlay: (k) => set((s) => ({ overlays: { ...s.overlays, [k]: !s.overlays[k] } })),
      hovered: null,
      setHovered: (hovered) => set({ hovered }),
      articulation: false,
      setArticulation: (articulation) => set({ articulation }),
    }),
    { name: "rover-lab:view:v1", storage: createJSONStorage(() => localStorage), partialize: (s) => ({ quality: s.quality }) },
  ),
);
