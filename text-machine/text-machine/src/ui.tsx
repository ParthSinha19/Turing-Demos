import type { ReactNode } from "react";
import { END, temperedProbs, type Model, type Prediction } from "./model/ngram";

export interface Insp {
  title: string;
  prediction: Prediction;
  chosen?: string;
  mode?: string;
  generated?: number;
}

export interface Shared {
  sentences: string[];
  label: string;
  edit: (list: string[]) => void;
  loadCollection: (name: string, list: string[]) => void;
  restore: () => void;
  model: Model | null;
  trainedKey: string | null;
  trainedLabel: string;
  stale: boolean;
  train: () => boolean;
  done: Set<number>;
  markDone: (i: number) => void;
  setInsp: (i: Insp | null) => void;
  say: (m: string) => void;
  go: (v: number | "reflect") => void;
}

export const showWord = (w: string) => (w === END ? "(end of sentence)" : w);
export const pct = (p: number) => `${Math.round(p * 100)}%`;

export function explain(p: Prediction): string {
  const ctx = p.context.length ? `"${p.context.join(" ")}"` : "the start of a sentence";
  switch (p.kind) {
    case "exact": return `The model looked at ${ctx} and found it in its training sentences.`;
    case "backoff": return `The model has not seen those last two words together, so it used a shorter piece: ${ctx}.`;
    case "unigram": return "The model has not seen these words before, so it can only pick words by how common they are overall. That is a weak guess.";
    default: return "The model hasn't seen a useful pattern for these words yet. Try a different starting phrase or train it with more examples.";
  }
}

export function Bars({ p, chosen, temp }: { p: Prediction; chosen?: string; temp?: number }) {
  if (p.candidates.length === 0) return <p className="note warn">{explain(p)}</p>;
  const shown = p.candidates.slice(0, 8);
  const tp = temp !== undefined && temp !== 1 ? temperedProbs(p.candidates, temp) : null;
  return (
    <ul className="bars" aria-label="Possible next words">
      {shown.map((c, i) => (
        <li key={c.word} className={c.word === chosen ? "chosen" : ""}>
          <span className="bw">{showWord(c.word)}{c.word === chosen ? " ✓ chosen" : ""}</span>
          <span className="track" aria-hidden="true"><span style={{ width: `${Math.max(3, c.prob * 100)}%` }} /></span>
          <span className="bn">
            seen {c.count} of {p.total} times · {pct(c.prob)}
            {tp ? ` · chance with this setting ${pct(tp[i])}` : ""}
          </span>
        </li>
      ))}
      {p.candidates.length > shown.length && <li className="more">…and {p.candidates.length - shown.length} more words</li>}
    </ul>
  );
}

export function ContextLine({ words, n, genFrom, extra }: { words: string[]; n: number; genFrom?: number; extra?: ReactNode }) {
  const used = Math.min(n, words.length);
  return (
    <p className="ctxline" aria-label={`Text so far: ${words.join(" ")}. Words used as context: ${words.slice(words.length - used).join(" ")}`}>
      {words.map((w, i) => (
        <span key={i} className={`chip${i >= words.length - used ? " ctx" : ""}${genFrom !== undefined && i >= genFrom ? " gen" : ""}`}>{w}</span>
      ))}
      <span className="chip blank">…</span>
      {extra}
    </p>
  );
}

export function NeedModel({ S }: { S: Shared }) {
  return (
    <div className="note warn">
      <p>First, teach the model using some example sentences.</p>
      <button className="btn" onClick={() => S.go(1)}>Go to Learn</button>
    </div>
  );
}

export function StaleBanner({ S }: { S: Shared }) {
  if (!S.stale) return null;
  return (
    <div className="note warn" role="alert">
      <p>You changed the examples. Train the model again so it can learn from the updated sentences.</p>
      <button className="btn" onClick={S.train}>Train again</button>
    </div>
  );
}
