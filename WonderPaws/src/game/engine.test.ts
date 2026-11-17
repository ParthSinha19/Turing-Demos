import { beforeEach, describe, expect, it } from "bun:test";
import { animals } from "./animals";
import { runChallenge } from "./engine";
import { levels, levelById } from "./levels";
import { evaluateCondition, validateProgram } from "./interpreter";
import { emptyProgress, isLevelUnlocked, isWorldUnlocked, levelStars, loadProgress, markAcademyLesson, recordChallengeResult, resetProgress, worldStars } from "./progress";
import type { Condition, ProgramNode } from "./types";

const storage = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

Object.defineProperty(globalThis, "window", {
  value: { localStorage: localStorageMock },
  configurable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

const route = (destinationId: string, id = "route") => ({ id, type: "route", destinationId }) as ProgramNode;

function ruleSolution(challenge: (typeof levels)[number]["challenges"][number]): ProgramNode[] {
  let nodes: ProgramNode[] = [route(challenge.defaultDestinationId, `fallback-${challenge.id}`)];
  for (let index = challenge.rules.length - 1; index >= 0; index -= 1) {
    const rule = challenge.rules[index]!;
    nodes = [{
      id: `rule-${challenge.id}-${index}`,
      type: "if",
      condition: rule.condition,
      then: [route(rule.destinationId, `then-${challenge.id}-${index}`)],
      else: nodes,
    }];
  }
  return nodes;
}

describe("WonderPaws content catalogue", () => {
  it("contains five worlds, 50 levels and 150 challenges", () => {
    expect(new Set(levels.map((level) => level.worldId)).size).toBe(5);
    expect(levels).toHaveLength(50);
    expect(levels.every((level) => level.challenges.length === 3)).toBe(true);
    expect(levels.flatMap((level) => level.challenges)).toHaveLength(150);
    expect(levelById["jurassic-03"].challenges[0].availableBlocks).toContain("forEach");
    expect(levelById["jurassic-05"].challenges[0].availableBlocks).toContain("while");
  });

  it("keeps every referenced animal and destination in the registry", () => {
    for (const level of levels) {
      for (const challenge of level.challenges) {
        expect(challenge.animalIds.length).toBeGreaterThan(0);
        expect(challenge.animalIds.every((id) => animals.some((animal) => animal.id === id))).toBe(true);
        expect(challenge.destinations.some((destination) => destination.id === challenge.defaultDestinationId)).toBe(true);
        expect(challenge.rules.every((rule) => challenge.destinations.some((destination) => destination.id === rule.destinationId))).toBe(true);
      }
    }
  });

  it("executes a reference solution for every one of the 150 challenges", () => {
    for (const level of levels) {
      for (const challenge of level.challenges) {
        const result = runChallenge(level.id, challenge.id, ruleSolution(challenge));
        expect(result.valid, challenge.id).toBe(true);
        expect(result.completed, challenge.id).toBe(true);
        expect(result.mistakes, challenge.id).toBe(0);
      }
    }
  });
});

describe("WonderPaws block interpreter", () => {
  it("runs a sequence and routes the entire first farm shipment", () => {
    const challenge = levelById["meadows-01"].challenges[0];
    const result = runChallenge("meadows-01", challenge.id, [route("farm")]);
    expect(result.completed).toBe(true);
    expect(result.correct).toBe(challenge.animalIds.length);
    expect(result.stars).toBe(3);
  });

  it("executes IF / ELSE with species-specific routing", () => {
    const challenge = levelById["meadows-04"].challenges[0];
    const program: ProgramNode[] = [{
      id: "if-duck",
      type: "if",
      condition: { kind: "predicate", property: "id", operator: "equals", value: "duck" },
      then: [route("pond", "then-route")],
      else: [route("farm", "else-route")],
    }];
    const result = runChallenge("meadows-04", challenge.id, program);
    expect(result.completed).toBe(true);
    expect(result.mistakes).toBe(0);
  });

  it("evaluates AND, OR and NOT conditions", () => {
    const walrus = animals.find((animal) => animal.id === "walrus");
    const penguin = animals.find((animal) => animal.id === "baby_penguin");
    expect(walrus).toBeDefined();
    expect(penguin).toBeDefined();
    const mammalAndArctic: Condition = { kind: "and", conditions: [
      { kind: "predicate", property: "speciesGroup", operator: "equals", value: "mammal" },
      { kind: "predicate", property: "climate", operator: "equals", value: "arctic" },
    ] };
    const swimsOrFlies: Condition = { kind: "or", conditions: [
      { kind: "predicate", property: "movement", operator: "includes", value: "swim" },
      { kind: "predicate", property: "movement", operator: "includes", value: "fly" },
    ] };
    const cannotFly: Condition = { kind: "not", condition: { kind: "predicate", property: "movement", operator: "includes", value: "fly" } };
    expect(evaluateCondition(mammalAndArctic, walrus!)).toBe(true);
    expect(evaluateCondition(swimsOrFlies, penguin!)).toBe(true);
    expect(evaluateCondition(cannotFly, penguin!)).toBe(true);
    const cow = animals.find((animal) => animal.id === "cow");
    expect(cow).toBeDefined();
    expect(evaluateCondition({ kind: "predicate", property: "size", operator: "greaterThan", value: 3 }, cow!)).toBe(true);
    expect(evaluateCondition({ kind: "predicate", property: "movement", operator: "excludes", value: "fly" }, penguin!)).toBe(true);
  });

  it("repeats a block sequence the requested number of times", () => {
    const challenge = levelById["meadows-06"].challenges[0];
    const program: ProgramNode[] = [{ id: "repeat-gate", type: "repeat", times: 3, body: [route("farm", "repeat-route")] }];
    const result = runChallenge("meadows-06", challenge.id, program);
    expect(result.completed).toBe(true);
    expect(result.events.filter((event) => event.type === "animal-routed")).toHaveLength(challenge.animalIds.length * 3);
  });

  it("supports a bounded WHILE loop with a loop counter", () => {
    const challenge = levelById["meadows-01"].challenges[0];
    const program: ProgramNode[] = [{
      id: "while-three",
      type: "while",
      condition: { kind: "predicate", property: "loopCounter", operator: "lessThan", value: 3 },
      body: [route("farm", "loop-route")],
    }];
    expect(runChallenge("meadows-01", challenge.id, program).completed).toBe(true);
  });

  it("halts an endless WHILE loop with a child-friendly error", () => {
    const challenge = levelById["meadows-01"].challenges[0];
    const program: ProgramNode[] = [{
      id: "while-endless",
      type: "while",
      condition: { kind: "predicate", property: "id", operator: "equals", value: "chicken" },
      body: [route("farm", "loop-route")],
    }];
    const result = runChallenge("meadows-01", challenge.id, program);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("did not stop");
  });

  it("runs a FOR EACH block over the animal list", () => {
    const challenge = levelById["jurassic-03"].challenges[0];
    const program: ProgramNode[] = [{ id: "for-all", type: "forEach", collection: "animals", body: [route("dinosaur", "body-route")] }];
    expect(runChallenge("jurassic-03", challenge.id, program).completed).toBe(true);
  });

  it("supports a nested IF inside a FOR EACH block", () => {
    const challenge = levelById["jurassic-07"].challenges[0];
    const herbivore: Condition = { kind: "and", conditions: [
      { kind: "predicate", property: "speciesGroup", operator: "equals", value: "dinosaur" },
      { kind: "predicate", property: "diet", operator: "equals", value: "herbivore" },
    ] };
    const program: ProgramNode[] = [{
      id: "for-each-dinosaur",
      type: "forEach",
      collection: "animals",
      body: [{ id: "nested-diet-check", type: "if", condition: herbivore, then: [route("herbivore", "plant-route")], else: [route("carnivore", "meat-route")] }],
    }];
    const result = runChallenge("jurassic-07", challenge.id, program);
    expect(result.completed).toBe(true);
    expect(result.mistakes).toBe(0);
  });

  it("supports a nested IF inside a WHILE block, so looping still makes a per-animal decision", () => {
    // Regression test: a bare route inside WHILE (no nested IF) routes every animal to the
    // same place every time, which is indistinguishable from having no condition at all — this
    // is what the WHILE block's default program used to build before it was fixed. A WHILE
    // loop is only meaningful for sorting once a decision lives inside it.
    const challenge = levelById["jurassic-05"].challenges[0];
    const swims: Condition = { kind: "predicate", property: "movement", operator: "includes", value: "swim" };
    const program: ProgramNode[] = [{
      id: "while-with-decision",
      type: "while",
      condition: { kind: "predicate", property: "loopCounter", operator: "lessThan", value: 3 },
      body: [{ id: "nested-swim-check", type: "if", condition: swims, then: [route("water", "swim-route")], else: [route("dinosaur", "land-route")] }],
    }];
    const result = runChallenge("jurassic-05", challenge.id, program);
    expect(result.completed).toBe(true);
    expect(result.mistakes).toBe(0);
  });

  it("rejects unknown chutes and empty programs before execution", () => {
    const challenge = levelById["meadows-01"].challenges[0];
    expect(validateProgram([], challenge).valid).toBe(false);
    expect(validateProgram([route("not-a-real-chute")], challenge).valid).toBe(false);
  });

  it("rejects unknown or incorrectly typed animal clues", () => {
    const challenge = levelById["meadows-01"].challenges[0];
    const invalid: ProgramNode[] = [{
      id: "bad-clue",
      type: "if",
      condition: { kind: "predicate", property: "unknownProperty" as never, operator: "equals", value: "bird" },
      then: [route("farm", "then")],
      else: [],
    }];
    expect(validateProgram(invalid, challenge).valid).toBe(false);
  });
});


describe("WonderPaws local progress", () => {
  beforeEach(() => localStorage.clear());

  it("persists and reloads Academy completion", () => {
    markAcademyLesson(emptyProgress(), "sequence");
    expect(loadProgress().academyCompletedIds).toContain("sequence");
  });

  it("recovers safely from corrupted saved data and resets progress", () => {
    window.localStorage.setItem("wonderpaws-progress", "{not valid json");
    expect(loadProgress().completedChallengeIds).toEqual([]);
    window.localStorage.setItem("wonderpaws-progress", JSON.stringify({ version: 1, academyCompletedIds: ["sequence"] }));
    expect(resetProgress().academyCompletedIds).toEqual([]);
    expect(loadProgress().academyCompletedIds).toEqual([]);
  });

  it("awards level stars and unlocks the next world at nine stars", () => {
    let progress = emptyProgress();
    expect(isWorldUnlocked(progress, "frozen")).toBe(false);
    for (const level of levels.filter((item) => item.worldId === "meadows" && item.order <= 3)) {
      for (const challenge of level.challenges) {
        const result = runChallenge(level.id, challenge.id, ruleSolution(challenge));
        progress = recordChallengeResult(progress, challenge.id, result);
      }
    }
    expect(levelStars(progress, "meadows-01")).toBe(3);
    expect(worldStars(progress, "meadows")).toBe(9);
    expect(isLevelUnlocked(progress, "meadows-04")).toBe(true);
    expect(isWorldUnlocked(progress, "frozen")).toBe(true);
  });
});
