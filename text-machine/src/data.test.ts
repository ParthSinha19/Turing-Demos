import { describe, expect, it } from "vitest";
import { ANIMALS, ROBOTS, STARTER } from "./data";
import { generate, mulberry32, predict, tokenise, trainModel } from "./model/ngram";

const words = (s: string) => tokenise(s);

describe("bundled training data", () => {
  const m = trainModel(STARTER);
  it("has a sensible number of starter sentences", () => {
    expect(STARTER.length).toBeGreaterThanOrEqual(25);
    expect(m.sentences).toBe(STARTER.length);
  });
  it("learns that a book goes on the table, and boats sail across water", () => {
    expect(predict(m, words("I put the book on the")).candidates[0].word).toBe("table");
    expect(predict(m, words("The boat sailed across the")).candidates[0].word).toBe("lake");
  });
  it("different collections give different text for the same prompt", () => {
    const run = (list: string[]) => {
      const mm = trainModel(list);
      return generate(mm, words("The little"), { mode: "common", temperature: 1, rng: mulberry32(1), maxWords: 12 }).words.join(" ");
    };
    expect(run(ANIMALS)).not.toBe(run(ROBOTS));
  });
});
