import { describe, expect, it } from "vitest";
import { MAIN_MAP, PRACTICE_MAP, flatten, simulate } from "./maze";

describe("maze rules", () => {
  it("practice: two forwards reach the goal", () => {
    expect(simulate(PRACTICE_MAP, ["forward", "forward"]).result).toBe("goal");
  });
  it("main: the intended program with repeats reaches the goal", () => {
    const cmds = flatten([
      { repeat: 3, body: ["forward"] },
      "right",
      { repeat: 2, body: ["forward"] },
      "left",
      { repeat: 3, body: ["forward"] },
    ]);
    expect(simulate(MAIN_MAP, cmds).result).toBe("goal");
  });
  it("walking into a bush stops TULIP", () => {
    const r = simulate(MAIN_MAP, ["forward", "forward", "forward", "forward"]);
    expect(r.result).toBe("wall");
    expect(r.at).toBe(3);
  });
});
