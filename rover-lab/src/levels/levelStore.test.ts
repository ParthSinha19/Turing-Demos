import { describe, expect, it } from "vitest";
import { useLevelStore } from "./levelStore";

describe("custom level persistence", () => {
  it("persists edits and rehydrates the saved level from browser storage", async () => {
    const store = useLevelStore.getState();
    const originalLevels = store.levels;
    const originalId = store.selectedId;
    const originalTool = store.tool;

    try {
      store.create();
      const created = useLevelStore.getState().selectedLevel();
      useLevelStore.getState().updateSelected({
        name: "Saved Crater Test",
        terrain: "crater",
        target: { ...created.target, x: 31, label: "Ridge beacon" },
      });
      useLevelStore.getState().addObstacle({ id: "saved-boulder", kind: "boulder", x: 12, z: -2, radius: 0.9, height: 0.9 });
      useLevelStore.getState().save();
      await useLevelStore.persist.rehydrate();

      const persisted = JSON.parse(localStorage.getItem("rover-lab:custom-levels:v1") ?? "null");
      expect(persisted.state.levels.some((level: { id: string; name: string }) => level.id === created.id && level.name === "Saved Crater Test")).toBe(true);

      useLevelStore.getState().select(originalId);
      useLevelStore.getState().select(created.id);
      const loaded = useLevelStore.getState().selectedLevel();
      expect(loaded.terrain).toBe("crater");
      expect(loaded.target.x).toBe(31);
      expect(loaded.obstacles.some((item) => item.id === "saved-boulder")).toBe(true);
    } finally {
      useLevelStore.setState({ levels: originalLevels, selectedId: originalId, tool: originalTool });
    }
  });
});
