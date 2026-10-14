import { useEffect, useMemo, useState } from "react";
import { COLLECTIONS, CTX_A, CTX_B, PREDICT, SAFE_MESSAGE, STARTER, SUGGESTIONS, isClassroomSafe } from "./data";
import {
  END, generate, mulberry32, predict, sentenceText, splitSentences, stepOnce, tokenise, trainModel,
  type Prediction, type Step, type StopReason,
} from "./model/ngram";
import { Bars, ContextLine, NeedModel, StaleBanner, explain, showWord, type Shared } from "./ui";

const TEMPS = { predictable: 0.5, balanced: 1, varied: 2 } as const;
type TempKey = keyof typeof TEMPS;
type Mode = "common" | "random";
const TLABEL: Record<TempKey, string> = { predictable: "More predictable", balanced: "Balanced", varied: "More varied" };
const LEN = { Short: 8, Medium: 16, Long: 24 } as const;
const seed = () => Math.floor(Math.random() * 2 ** 31);
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const modeName = (m: Mode, t: TempKey) => (m === "common" ? "Most common" : `Different choices (${TLABEL[t].toLowerCase()})`);

function ModePicker({ mode, setMode, tk, setTk }: { mode: Mode; setMode: (m: Mode) => void; tk: TempKey; setTk: (t: TempKey) => void }) {
  return (
    <div className="controls">
      <div role="group" aria-label="How should the model choose?" className="seg">
        <button aria-pressed={mode === "common"} onClick={() => setMode("common")}>Choose the Most Common</button>
        <button aria-pressed={mode === "random"} onClick={() => setMode("random")}>Try Different Choices</button>
      </div>
      {mode === "random" && (
        <div role="group" aria-label="How much randomness?" className="seg">
          {(Object.keys(TEMPS) as TempKey[]).map((k) => (
            <button key={k} aria-pressed={tk === k} onClick={() => setTk(k)}>{TLABEL[k]}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Welcome ---------- */
export function Welcome({ onStart }: { onStart: () => void }) {
  const starter = useMemo(() => trainModel(STARTER), []);
  const [gen, setGen] = useState<string[]>([]);
  const [rngSeed] = useState(seed);
  const rng = useMemo(() => mulberry32(rngSeed), [rngSeed]);
  const base = ["the", "little"];
  const last = useMemo(() => predict(starter, [...base, ...gen]), [starter, gen]);
  const add = () => {
    const s = stepOnce(starter, [...base, ...gen], { mode: "random", temperature: 1, rng });
    if (s.chosen && s.chosen.word !== END) setGen([...gen, s.chosen.word]);
  };
  return (
    <div className="welcome">
      <h1>Inside the Text Machine</h1>
      <p className="lead">Let's discover how AI learns to write, one word at a time.</p>
      <div className="trio">
        <div className="card"><h3>Learn from examples</h3><p>Computers can find patterns in lots of text.</p></div>
        <div className="card"><h3>Predict what comes next</h3><p>The words already written help the model choose what to add.</p></div>
        <div className="card"><h3>Create something new</h3><p>Try your own starting phrase and watch the sentence grow.</p></div>
      </div>
      <button className="btn primary big" onClick={onStart}>Start Exploring</button>
      <div className="card preview">
        <h3>Quick peek</h3>
        <ContextLine words={[...base, ...gen]} n={2} genFrom={2} />
        <p className="muted">The model looks at the last two words and picks a word it has seen after them.</p>
        {gen.length < 5 ? (
          <button className="btn" onClick={add} disabled={last.candidates.length === 0}>Add a word</button>
        ) : (
          <><p>That's the idea! Start exploring to train a model and try your own words.</p><button className="btn ghost" onClick={() => setGen([])}>Try again</button></>
        )}
      </div>
      <p className="note small">This lab uses a tiny text model that runs on this device. It helps demonstrate text-generation ideas; it is not the same model used by ChatGPT.</p>
    </div>
  );
}

/* ---------- Stage 1: Predict ---------- */
export function Predict({ S }: { S: Shared }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const ex = PREDICT[i];
  const note = ex.options.find((o) => o.w === pick)?.note;
  return (
    <>
      <p className="bigsentence">{ex.prompt} <span className="chip blank">…</span></p>
      <p><b>What do you think comes next?</b></p>
      <div className="cards" role="group" aria-label="Choose a word">
        {ex.options.map((o) => (
          <button key={o.w} className="wordcard" aria-pressed={pick === o.w} onClick={() => { setPick(o.w); S.markDone(0); }}>{o.w}</button>
        ))}
      </div>
      {pick && (
        <div className="note good" role="status">
          <p><b>You chose “{pick}”.</b> {note}</p>
          <p>More than one word can fit. A computer model can learn which words usually follow from lots of example sentences.</p>
          <button className="btn" onClick={() => { setI((i + 1) % PREDICT.length); setPick(null); }}>Try another example</button>
        </div>
      )}
      {S.done.has(0) && <p className="callout">People use experience and meaning to guess what comes next. A text model learns patterns from the text it has seen.</p>}
    </>
  );
}

/* ---------- Stage 2: Learn ---------- */
function AddSentence({ S, id }: { S: Shared; id: string }) {
  const [v, setV] = useState("");
  const add = (text: string) => {
    const t = text.trim();
    if (!t) return;
    if (!isClassroomSafe(t)) { S.say(SAFE_MESSAGE); return; }
    S.edit([...S.sentences, t]);
    setV("");
    S.say(S.model ? "You added a new example. Train the model again so it can learn from the updated sentences." : "Example added. Now train the model.");
  };
  return (
    <div className="add">
      <form onSubmit={(e) => { e.preventDefault(); add(v); }}>
        <label htmlFor={id}>Add your own sentence</label>
        <div className="row">
          <input id={id} value={v} onChange={(e) => setV(e.target.value)} placeholder="The little frog jumped over the log." maxLength={100} />
          <button className="btn" type="submit">Add sentence</button>
        </div>
      </form>
      <div className="row wrap">
        <span className="muted">Or add one of these:</span>
        {SUGGESTIONS.map((s) => <button key={s} className="btn ghost" onClick={() => add(s)}>{s}</button>)}
      </div>
      <button className="btn ghost" onClick={S.restore}>Restore original sentences</button>
    </div>
  );
}

export function Learn({ S }: { S: Shared }) {
  const [sel, setSel] = useState<number | null>(null);
  const count = S.sentences.filter((s) => s.trim()).length;
  const update = (i: number, v: string) => {
    if (!isClassroomSafe(v)) { S.say(SAFE_MESSAGE); return; }
    const l = [...S.sentences]; l[i] = v; S.edit(l);
  };
  const selWords = sel !== null && S.sentences[sel] ? splitSentences(S.sentences[sel]).flat() : [];
  return (
    <>
      <p><b>Training sentences: {count}</b>. These sentences are the examples our tiny model can learn from.</p>
      <p className="muted">A model trained on a small collection has limited knowledge and cannot reliably write about everything.</p>
      <div className="sgrid">
        {S.sentences.map((s, i) => (
          <div key={i} className={"scard" + (sel === i ? " sel" : "")}>
            <input aria-label={`Training sentence ${i + 1}`} value={s} onFocus={() => setSel(i)} onChange={(e) => update(i, e.target.value)} maxLength={100} />
            <button className="x" aria-label={`Remove sentence ${i + 1}`} onClick={() => { S.edit(S.sentences.filter((_, j) => j !== i)); setSel(null); }}>Remove</button>
          </div>
        ))}
      </div>
      {selWords.length > 0 && (
        <p className="ctxline"><span className="muted">Words the model reads in this sentence:</span>{selWords.map((w, i) => <span key={i} className="chip">{w}</span>)}<span className="chip blank">end</span></p>
      )}
      <AddSentence S={S} id="add-learn" />
      <div className="row">
        <button className="btn primary big" onClick={S.train}>Train My Model</button>
        {S.model && !S.stale && <span className="note good inline">✓ Trained on {S.model.sentences} sentences</span>}
      </div>
      <StaleBanner S={S} />
    </>
  );
}

/* ---------- Stage 3: Context ---------- */
interface Snap { prompt: string; p: Prediction; top?: string }

function CtxPanel({ S, label, presets, onRan }: { S: Shared; label: string; presets: string[]; onRan: (p: string) => void }) {
  const [prompt, setPrompt] = useState(presets[0]);
  const [snap, setSnap] = useState<Snap | null>(null);
  const [prev, setPrev] = useState<Snap | null>(null);
  const words = tokenise(prompt);
  const run = () => {
    if (!S.model || S.stale) return;
    const p = predict(S.model, words);
    const s = { prompt, p, top: p.candidates[0]?.word };
    setPrev(snap); setSnap(s);
    S.setInsp({ title: `Context ${label}`, prediction: p, chosen: s.top, mode: "Most common" });
    onRan(words.join(" "));
  };
  const fresh = snap && snap.prompt === prompt;
  return (
    <section className="card" aria-label={`Prompt ${label}`}>
      <h3>Prompt {label}</h3>
      <div className="row wrap">{presets.map((p) => <button key={p} className="btn ghost" onClick={() => setPrompt(p)}>{p} …</button>)}</div>
      <label htmlFor={`ctx-${label}`}>Or type your own start</label>
      <input id={`ctx-${label}`} value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={60} />
      <ContextLine words={words} n={fresh ? snap!.p.contextLength : S.model?.order ?? 2} />
      <button className="btn primary" onClick={run} disabled={!S.model || S.stale}>Predict next word</button>
      {snap && (
        <div className="result">
          <p className="muted">{explain(snap.p)}</p>
          <Bars p={snap.p} chosen={snap.top} />
          {snap.top && snap.top !== END && (
            <button className="btn" onClick={() => setPrompt(snap.prompt.trim() + " " + snap.top)}>Add “{snap.top}” to the prompt</button>
          )}
          {prev && (
            <p className="note">
              Before: “{prev.prompt}” → <b>{showWord(prev.top ?? "nothing")}</b>. Now: “{snap.prompt}” → <b>{showWord(snap.top ?? "nothing")}</b>.{" "}
              {prev.top === snap.top
                ? "Same word this time. That can happen when the model's counts favour the same continuation."
                : "The prediction changed when the words changed."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function Context({ S }: { S: Shared }) {
  const [ran, setRan] = useState<Set<string>>(new Set());
  useEffect(() => { if (ran.size >= 2) S.markDone(2); }, [ran]);
  if (!S.model) return <NeedModel S={S} />;
  return (
    <>
      <p className="muted">The model looks at a short piece of the sentence (the last two words) to find patterns it has seen before. The highlighted words are the ones it uses. Try changing one word, then predict again.</p>
      <StaleBanner S={S} />
      <div className="two">
        <CtxPanel S={S} label="A" presets={CTX_A} onRan={(p) => setRan((r) => new Set(r).add(p))} />
        <CtxPanel S={S} label="B" presets={CTX_B} onRan={(p) => setRan((r) => new Set(r).add(p))} />
      </div>
      <p><b>Did changing the words change what the model predicted?</b></p>
    </>
  );
}

/* ---------- Stage 4: Choose ---------- */
interface Run { id: number; mode: string; text: string }

export function Choose({ S }: { S: Shared }) {
  const [prompt, setPrompt] = useState("The little");
  const [mode, setMode] = useState<Mode>("common");
  const [tk, setTk] = useState<TempKey>("balanced");
  const [runs, setRuns] = useState<Run[]>([]);
  const [used, setUsed] = useState<Set<Mode>>(new Set());
  const usable = !!S.model && !S.stale;
  useEffect(() => {
    if (usable) S.setInsp({ title: "Choosing the next word", prediction: predict(S.model!, tokenise(prompt)), mode: modeName(mode, tk) });
  }, [prompt, mode, tk, S.model, S.stale]);
  if (!S.model) return <NeedModel S={S} />;
  const model = S.model;
  const words = tokenise(prompt);
  const pred = predict(model, words);
  const gen = (n: number) => {
    const out: Run[] = [];
    for (let k = 0; k < n; k++) {
      const r = generate(model, words, { mode, temperature: TEMPS[tk], rng: mulberry32(seed()), maxWords: 10 });
      out.push({ id: Date.now() + k, mode: modeName(mode, tk), text: sentenceText([...words, ...r.words], r.stop === "end") || "(nothing generated)" });
    }
    setRuns((x) => [...out, ...x].slice(0, 12));
    const u = new Set(used).add(mode);
    setUsed(u);
    if (u.size === 2) S.markDone(3);
  };
  return (
    <>
      <StaleBanner S={S} />
      <ModePicker mode={mode} setMode={setMode} tk={tk} setTk={setTk} />
      <p className="note">
        {mode === "common"
          ? "The model chooses the word it saw most often after these words. If two words tie, the one earlier in the alphabet wins."
          : "The model can choose a less common word, so two attempts may produce different results. With very small training data, the results may still look similar."}
      </p>
      <label htmlFor="choose-prompt">Starting words</label>
      <input id="choose-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={60} />
      <p className="muted">The model's choices for the first new word. {explain(pred)}</p>
      <Bars p={pred} temp={mode === "random" ? TEMPS[tk] : undefined} />
      <div className="row">
        <button className="btn primary" onClick={() => gen(3)} disabled={!usable}>Generate 3 times</button>
        <button className="btn ghost" onClick={() => setRuns([])}>Clear results</button>
      </div>
      {used.size < 2 && <p className="muted">Try both ways of choosing to complete this stage.</p>}
      {runs.length > 0 && (
        <ol className="runs" aria-label="Generated results">
          {runs.map((r) => <li key={r.id}><span className="tag">{r.mode}</span> {r.text}</li>)}
        </ol>
      )}
    </>
  );
}

/* ---------- Stage 5: Generate ---------- */
interface Sess { prompt: string[]; gen: string[]; last: Step | null; n: number; status: "running" | "paused" | "done"; stop?: StopReason | "stopped"; rng: () => number }

export function Generate({ S }: { S: Shared }) {
  const [text, setText] = useState("The little robot");
  const [len, setLen] = useState<keyof typeof LEN>("Short");
  const [mode, setMode] = useState<Mode>("common");
  const [tk, setTk] = useState<TempKey>("balanced");
  const [sess, setSess] = useState<Sess | null>(null);
  const model = S.model;
  const usable = !!model && !S.stale;

  const advance = (s: Sess): Sess => {
    if (!model || s.status === "done") return s;
    const step = stepOnce(model, [...s.prompt, ...s.gen], { mode, temperature: TEMPS[tk], rng: s.rng });
    const n = s.n + 1;
    if (!step.chosen) return { ...s, last: step, n, status: "done", stop: "none" };
    if (step.chosen.word === END) return { ...s, last: step, n, status: "done", stop: "end" };
    const gen = [...s.gen, step.chosen.word];
    const hitLimit = gen.length >= LEN[len];
    return { ...s, gen, last: step, n, status: hitLimit ? "done" : s.status, stop: hitLimit ? "limit" : undefined };
  };
  const make = (status: Sess["status"]): Sess => ({ prompt: tokenise(text), gen: [], last: null, n: 0, status, rng: mulberry32(seed()) });

  useEffect(() => {
    if (sess?.status !== "running") return;
    const t = setTimeout(() => setSess((s) => (s ? advance(s) : s)), reduced() ? 200 : 550);
    return () => clearTimeout(t);
  }, [sess]);
  useEffect(() => {
    if (!sess?.last) return;
    S.setInsp({ title: `Prediction ${sess.n}`, prediction: sess.last.prediction, chosen: sess.last.chosen?.word, mode: modeName(mode, tk), generated: sess.gen.length });
    if (sess.gen.length >= 2) S.markDone(4);
  }, [sess]);

  if (!model) return <NeedModel S={S} />;
  const step = () => {
    if (!usable) return;
    if (!sess) setSess(advance(make("paused")));
    else if (sess.status === "paused") setSess(advance(sess));
  };
  const finish = () => {
    let s = sess ?? make("paused");
    for (let g = 0; g < 100 && s.status !== "done"; g++) s = advance(s);
    setSess(s);
  };
  const all = sess ? [...sess.prompt, ...sess.gen] : [];
  const msg = !sess || sess.status !== "done" ? "" :
    sess.stop === "none" ? "The model hasn't seen a useful pattern for these words yet. Try a different starting phrase or train it with more examples."
    : sess.stop === "stopped" ? "Generation stopped. Start again, or step through one word at a time."
    : "Your model has finished generating text. Try changing the prompt and see what happens.";
  return (
    <>
      <StaleBanner S={S} />
      <div className="controls">
        <div className="seg" role="group" aria-label="How long should the text be?">
          {(Object.keys(LEN) as (keyof typeof LEN)[]).map((k) => <button key={k} aria-pressed={len === k} onClick={() => setLen(k)}>{k} ({LEN[k]} words)</button>)}
        </div>
        <ModePicker mode={mode} setMode={setMode} tk={tk} setTk={setTk} />
      </div>
      <form className="promptbox" onSubmit={(e) => { e.preventDefault(); if (usable) setSess(make("running")); }}>
        <label htmlFor="gen-prompt">Starting words</label>
        <div className="row">
          <input id="gen-prompt" value={text} onChange={(e) => setText(e.target.value)} placeholder="Start a sentence, such as: The little robot ..." maxLength={60} />
          <button className="btn primary" type="submit" disabled={!usable}>Generate Text</button>
        </div>
      </form>
      <div className="row wrap">
        <button className="btn" onClick={step} disabled={!usable || sess?.status === "running" || sess?.status === "done"}>Next word</button>
        <button className="btn" onClick={() => setSess((s) => s && { ...s, status: "paused" })} disabled={sess?.status !== "running"}>Pause</button>
        <button className="btn" onClick={() => setSess((s) => s && { ...s, status: "running" })} disabled={sess?.status !== "paused"}>Continue</button>
        <button className="btn" onClick={finish} disabled={!usable || sess?.status === "running" || sess?.status === "done"}>Finish</button>
        <button className="btn" onClick={() => setSess((s) => s && { ...s, status: "done", stop: "stopped" })} disabled={!sess || sess.status === "done"}>Stop</button>
        <button className="btn ghost" onClick={() => { setSess(null); S.setInsp(null); }}>Clear</button>
      </div>
      <div className="chat" aria-live="polite">
        {sess && <div className="bubble user"><span className="who">You</span>{text.trim() || "(empty start)"}</div>}
        {sess && (
          <div className="bubble bot">
            <span className="who">Output from your tiny local text model (not ChatGPT)</span>
            <ContextLine words={all} n={2} genFrom={sess.prompt.length} />
            {sess.last && <><p className="muted">Prediction {sess.n}: {explain(sess.last.prediction)}</p><Bars p={sess.last.prediction} chosen={sess.last.chosen?.word} temp={mode === "random" ? TEMPS[tk] : undefined} /></>}
            {sess.status === "done" && all.length > 0 && <p className="final">“{sentenceText(all, sess.stop === "end")}”</p>}
            {msg && <p className="note good">{msg}</p>}
          </div>
        )}
        {!sess && <p className="muted">Press Generate Text to watch the model add one word at a time, or use Next word to go step by step.</p>}
      </div>
    </>
  );
}

/* ---------- Stage 6: Experiment ---------- */
interface ExpRun { id: number; label: string; n: number; prompt: string; text: string; key: string }

export function Experiment({ S }: { S: Shared }) {
  const [prompt, setPrompt] = useState("The little");
  const [runs, setRuns] = useState<ExpRun[]>([]);
  const usable = !!S.model && !S.stale;
  const status = !S.model ? "Not trained yet" : S.stale ? "Needs retraining" : `Trained on ${S.trainedLabel}`;
  const run = () => {
    if (!S.model || S.stale || !S.trainedKey) return;
    const words = tokenise(prompt);
    const r = generate(S.model, words, { mode: "common", temperature: 1, rng: mulberry32(1), maxWords: 12 });
    const next = [{ id: Date.now(), label: S.trainedLabel, n: S.model.sentences, prompt, key: S.trainedKey, text: sentenceText([...words, ...r.words], r.stop === "end") || "(nothing generated)" }, ...runs].slice(0, 8);
    setRuns(next);
    if (r.steps[0]) S.setInsp({ title: "First prediction", prediction: r.steps[0].prediction, chosen: r.steps[0].chosen?.word, mode: "Most common" });
    if (new Set(next.map((x) => x.key)).size >= 2) S.markDone(5);
  };
  return (
    <>
      <p className="muted">Pick a collection, train, and generate with the same starting words. Then switch collections, retrain and generate again. Different training text produces different word patterns, but the model does not “know” the topic like a person does.</p>
      <div className="seg" role="group" aria-label="Training collection">
        {COLLECTIONS.map((c) => (
          <button key={c.id} aria-pressed={S.label.startsWith(c.name)} onClick={() => { S.loadCollection(c.name, [...c.list]); S.say(`Loaded ${c.name}. Train the model to learn from them.`); }}>{c.name}</button>
        ))}
      </div>
      <ul className="status">
        <li>Collection: <b>{S.label}</b></li>
        <li>Training sentences: <b>{S.sentences.filter((s) => s.trim()).length}</b></li>
        <li>Model: <b>{status}</b></li>
      </ul>
      <details><summary>Look at the example sentences</summary><ul className="slist">{S.sentences.map((s, i) => <li key={i}>{s}</li>)}</ul></details>
      <StaleBanner S={S} />
      <div className="row wrap">
        <button className="btn primary" onClick={S.train}>Train My Model</button>
        <label htmlFor="exp-prompt" className="inl">Starting words</label>
        <input id="exp-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={60} />
        <button className="btn primary" onClick={run} disabled={!usable}>Generate with this model</button>
      </div>
      {!S.model && <p className="note warn">First, teach the model using some example sentences.</p>}
      {runs.length > 0 && (
        <>
          <h3>Compare results</h3>
          <ol className="runs">
            {runs.map((r) => <li key={r.id}><span className="tag">{r.label} · {r.n} sentences</span> “{r.prompt}” → {r.text}</li>)}
          </ol>
          <button className="btn ghost" onClick={() => setRuns([])}>Clear comparison</button>
        </>
      )}
      <h3>Add a sentence</h3>
      <p className="muted">A new example only changes predictions where its words overlap with your starting words, so the effect is not guaranteed.</p>
      <AddSentence S={S} id="add-exp" />
    </>
  );
}

/* ---------- Reflection ---------- */
const QS = [
  { q: "Why did the model choose that word?", a: 1, opts: ["It understood the meaning like a person.", "It had seen that word follow those words in its examples.", "It looked up the answer online."] },
  { q: "What changed when you changed the starting phrase?", a: 0, opts: ["The words used as context changed, so the possible next words could change.", "Nothing can ever change.", "The model got tired."] },
  { q: "Why might the model generate something that does not make sense?", a: 2, opts: ["It always checks every fact.", "It has read every book.", "It follows word patterns from a small set of examples and does not check meaning or facts."] },
];

export function Reflect({ S }: { S: Shared }) {
  const [ans, setAns] = useState<(number | null)[]>([null, null, null]);
  return (
    <>
      <h3>What did you discover?</h3>
      <ul className="learned">
        <li>A model learns patterns from example text.</li>
        <li>Context changes possible continuations.</li>
        <li>The model chooses from possible next words.</li>
        <li>Repeated predictions create longer text.</li>
        <li>Different training examples can change the output.</li>
      </ul>
      {QS.map((q, qi) => (
        <fieldset key={qi} className="q">
          <legend>{qi + 1}. {q.q}</legend>
          {q.opts.map((o, oi) => (
            <button key={oi} className="opt" aria-pressed={ans[qi] === oi} onClick={() => setAns(ans.map((x, k) => (k === qi ? oi : x)))}>{o}</button>
          ))}
          {ans[qi] !== null && (
            <p className={"note " + (ans[qi] === q.a ? "good" : "warn")} role="status">
              {ans[qi] === q.a ? "Yes! " : "Have another look. "}A simple word-pattern model uses the examples it has seen. It does not understand meaning, so it can write sentences that sound odd.
            </p>
          )}
        </fieldset>
      ))}
      <p className="muted">Remember: this tiny model counts word patterns. ChatGPT uses a much larger kind of model, so this lab shows the basic idea only.</p>
      <button className="btn" onClick={() => S.go(0)}>Explore again</button>
    </>
  );
}
