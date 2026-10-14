import { describe, expect, it } from "vitest";
import {
  chooseMostCommon, generate, mulberry32, predict, sampleNext, sentenceText,
  temperedProbs, tokenise, trainModel, validateSentences, END, type Model,
} from "./ngram";

const train = (s: string[]) => trainModel(s);

describe("tokenise", () => {
  it("lower-cases and drops punctuation", () => {
    expect(tokenise("The Cat's hat!")).toEqual(["the", "cat's", "hat"]);
    expect(tokenise("  ... ")).toEqual([]);
  });
});

describe("training and probabilities", () => {
  const m = train(["the cat sat", "the cat slept", "the cat sat"]);
  it("counts next words from real data", () => {
    const p = predict(m, ["the", "cat"]);
    expect(p.kind).toBe("exact");
    expect(p.total).toBe(3);
    expect(p.candidates[0]).toMatchObject({ word: "sat", count: 2 });
    expect(p.candidates[0].prob).toBeCloseTo(2 / 3);
    expect(p.candidates[1]).toMatchObject({ word: "slept", count: 1 });
  });
  it("breaks ties alphabetically", () => {
    const t = train(["a dog ran", "a dog barked"]);
    expect(predict(t, ["a", "dog"]).candidates.map((c) => c.word)).toEqual(["barked", "ran"]);
  });
  it("uses sentence start as context", () => {
    expect(predict(m, []).candidates[0].word).toBe("the");
  });
});

describe("backoff", () => {
  const m = train(["the cat sat"]);
  it("falls back to a bigram when the trigram is unseen", () => {
    const p = predict(m, ["a", "cat"]);
    expect(p.kind).toBe("backoff");
    expect(p.contextLength).toBe(1);
    expect(p.candidates[0].word).toBe("sat");
  });
  it("falls back to unigram counts for unseen words", () => {
    const p = predict(m, ["zebra"]);
    expect(p.kind).toBe("unigram");
    expect(p.contextLength).toBe(0);
  });
  it("reports no continuation for an empty model", () => {
    const empty: Model = { order: 2, tables: [new Map(), new Map(), new Map()], sentences: 0, tokens: 0, vocabSize: 0 };
    expect(predict(empty, ["x"]).kind).toBe("none");
  });
});

describe("selection and sampling", () => {
  const cands = [
    { word: "a", count: 9, prob: 0.9 },
    { word: "b", count: 1, prob: 0.1 },
  ];
  const freqA = (t: number, seed = 1) => {
    const rng = mulberry32(seed);
    let a = 0;
    for (let i = 0; i < 3000; i++) if (sampleNext(cands, t, rng)!.word === "a") a++;
    return a / 3000;
  };
  it("most common picks the top candidate", () => {
    expect(chooseMostCommon(cands)!.word).toBe("a");
    expect(chooseMostCommon([])).toBeUndefined();
  });
  it("sampling follows the distribution and the temperature setting", () => {
    expect(freqA(1)).toBeGreaterThan(0.86);
    expect(freqA(1)).toBeLessThan(0.94);
    expect(freqA(0.4)).toBeGreaterThan(freqA(1));
    expect(freqA(2)).toBeLessThan(freqA(1));
  });
  it("is repeatable with a seed and safe with bad temperatures", () => {
    expect(freqA(1, 7)).toBe(freqA(1, 7));
    expect(sampleNext(cands, 0, Math.random)!.word).toBe("a");
    expect(sampleNext(cands, NaN, Math.random)!.word).toBe("a");
    expect(temperedProbs(cands, 1).reduce((x, y) => x + y)).toBeCloseTo(1);
  });
});

describe("generation", () => {
  const m = train(["the cat sat"]);
  const base = { mode: "common" as const, temperature: 1, rng: mulberry32(1) };
  it("stops at the word limit", () => {
    const r = generate(m, ["the", "cat"], { ...base, maxWords: 1 });
    expect(r).toMatchObject({ words: ["sat"], stop: "limit" });
  });
  it("stops at the end-of-sentence marker", () => {
    const r = generate(m, ["the", "cat"], { ...base, maxWords: 5 });
    expect(r.stop).toBe("end");
    expect(r.steps[r.steps.length - 1].chosen!.word).toBe(END);
    expect(sentenceText(["the", ...r.words], true)).toBe("The sat.");
  });
  it("stops when there is no continuation", () => {
    const empty: Model = { order: 2, tables: [new Map(), new Map(), new Map()], sentences: 0, tokens: 0, vocabSize: 0 };
    expect(generate(empty, ["x"], { ...base, maxWords: 5 }).stop).toBe("none");
  });
});

describe("retraining and invalid data", () => {
  it("new examples change predictions", () => {
    const a = train(["the cat sat"]);
    const b = train(["the cat sat", "the cat slept", "the cat slept"]);
    expect(predict(a, ["the", "cat"]).candidates[0].word).toBe("sat");
    expect(predict(b, ["the", "cat"]).candidates[0].word).toBe("slept");
  });
  it("rejects empty or unusable data", () => {
    expect(() => trainModel([])).toThrow();
    expect(() => trainModel(["  ", "..."])).toThrow();
    expect(validateSentences([]).ok).toBe(false);
    expect(validateSentences(["hello"]).ok).toBe(false);
    expect(validateSentences(["hello there", ""]).clean).toEqual(["hello there"]);
  });
});
