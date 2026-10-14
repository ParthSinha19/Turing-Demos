/**
 * A tiny trigram language model.
 *
 * Tokenisation: lower-case, keep letters/digits/apostrophes, drop punctuation.
 * Each training sentence is padded with START markers and ends with an END marker.
 * Counts are stored for context lengths 2 (trigram), 1 (bigram) and 0 (unigram).
 * Prediction tries the longest context first and backs off to shorter ones.
 * Probabilities are plain observed frequencies: count / total for that context.
 * Ties are broken alphabetically so "most common" is deterministic.
 */
export const START = "<s>";
export const END = "</s>";
export const ORDER = 2;

export type Counts = Map<string, number>;

export interface Model {
  order: number;
  /** tables[n] maps a context of n words (joined by spaces) to next-word counts. */
  tables: Map<string, Counts>[];
  sentences: number;
  tokens: number;
  vocabSize: number;
}

export interface Candidate {
  word: string;
  count: number;
  prob: number;
}

export type PredictionKind = "exact" | "backoff" | "unigram" | "none";

export interface Prediction {
  candidates: Candidate[];
  total: number;
  /** How many words of context were actually used (0 to order). */
  contextLength: number;
  /** The words used as context (START padding removed). */
  context: string[];
  kind: PredictionKind;
}

export interface Choice {
  mode: "common" | "random";
  temperature: number;
  rng: () => number;
}

export interface Step {
  context: string[];
  prediction: Prediction;
  chosen?: Candidate;
}

export type StopReason = "limit" | "end" | "none";

export function tokenise(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? [];
}

export function splitSentences(text: string): string[][] {
  return text
    .split(/[.!?]+/)
    .map(tokenise)
    .filter((w) => w.length > 0);
}

export function validateSentences(list: string[]): { ok: boolean; message?: string; clean: string[] } {
  const clean = list.map((s) => s.trim()).filter(Boolean);
  if (clean.length === 0) return { ok: false, clean, message: "Add at least one example sentence first." };
  if (!clean.some((s) => splitSentences(s).some((w) => w.length >= 2)))
    return { ok: false, clean, message: "Each example needs at least two words so the model can find a pattern." };
  return { ok: true, clean };
}

function bump(table: Map<string, Counts>, key: string, next: string) {
  let row = table.get(key);
  if (!row) table.set(key, (row = new Map()));
  row.set(next, (row.get(next) ?? 0) + 1);
}

export function trainModel(sentences: string[], order = ORDER): Model {
  const sents = sentences.flatMap(splitSentences);
  if (sents.length === 0) throw new Error("No usable sentences to learn from.");
  const tables: Map<string, Counts>[] = Array.from({ length: order + 1 }, () => new Map());
  const vocab = new Set<string>();
  let tokens = 0;
  for (const words of sents) {
    words.forEach((w) => vocab.add(w));
    tokens += words.length;
    const padded = [...Array<string>(order).fill(START), ...words, END];
    for (let i = order; i < padded.length; i++) {
      for (let n = 0; n <= order; n++) bump(tables[n], padded.slice(i - n, i).join(" "), padded[i]);
    }
  }
  return { order, tables, sentences: sents.length, tokens, vocabSize: vocab.size };
}

function rank(row: Counts): { candidates: Candidate[]; total: number } {
  let total = 0;
  row.forEach((c) => (total += c));
  const candidates = [...row.entries()]
    .map(([word, count]) => ({ word, count, prob: count / total }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return { candidates, total };
}

/** Predict the next word from the words written so far, backing off when a context is unseen. */
export function predict(model: Model, words: string[]): Prediction {
  const padded = [...Array<string>(model.order).fill(START), ...words];
  for (let n = model.order; n >= 0; n--) {
    const ctx = padded.slice(padded.length - n);
    const row = model.tables[n].get(ctx.join(" "));
    if (row && row.size > 0) {
      const { candidates, total } = rank(row);
      const kind: PredictionKind = n === model.order ? "exact" : n === 0 ? "unigram" : "backoff";
      return { candidates, total, contextLength: n, context: ctx.filter((w) => w !== START), kind };
    }
  }
  return { candidates: [], total: 0, contextLength: 0, context: [], kind: "none" };
}

export function chooseMostCommon(c: Candidate[]): Candidate | undefined {
  return c[0];
}

/** Probabilities after temperature: p^(1/T), renormalised. T=1 leaves them unchanged. */
export function temperedProbs(c: Candidate[], temperature: number): number[] {
  if (!Number.isFinite(temperature) || temperature <= 0) return c.map((_, i) => (i === 0 ? 1 : 0));
  const w = c.map((x) => Math.pow(x.prob, 1 / temperature));
  const sum = w.reduce((a, b) => a + b, 0);
  if (!(sum > 0) || !Number.isFinite(sum)) return c.map((_, i) => (i === 0 ? 1 : 0));
  return w.map((x) => x / sum);
}

export function sampleNext(c: Candidate[], temperature: number, rng: () => number): Candidate | undefined {
  if (c.length === 0) return undefined;
  const p = temperedProbs(c, temperature);
  let r = rng();
  for (let i = 0; i < c.length; i++) {
    r -= p[i];
    if (r < 0) return c[i];
  }
  return c[c.length - 1];
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stepOnce(model: Model, words: string[], choice: Choice): Step {
  const prediction = predict(model, words);
  const chosen =
    choice.mode === "common"
      ? chooseMostCommon(prediction.candidates)
      : sampleNext(prediction.candidates, choice.temperature, choice.rng);
  return { context: prediction.context, prediction, chosen };
}

export function generate(
  model: Model,
  prompt: string[],
  opts: Choice & { maxWords: number },
): { steps: Step[]; words: string[]; stop: StopReason } {
  const steps: Step[] = [];
  const words: string[] = [];
  let stop: StopReason = "limit";
  for (let i = 0; i < opts.maxWords; i++) {
    const step = stepOnce(model, [...prompt, ...words], opts);
    steps.push(step);
    if (!step.chosen) { stop = "none"; break; }
    if (step.chosen.word === END) { stop = "end"; break; }
    words.push(step.chosen.word);
  }
  return { steps, words, stop };
}

export function sentenceText(words: string[], ended: boolean): string {
  if (words.length === 0) return "";
  const text = words.join(" ");
  return text[0].toUpperCase() + text.slice(1) + (ended ? "." : "");
}
