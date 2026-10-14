import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { SAFE_MESSAGE, STAGES, STARTER } from "./data";
import { trainModel, validateSentences, type Model } from "./model/ngram";
import { Choose, Context, Experiment, Generate, Learn, Predict, Reflect, Welcome } from "./stages";
import { Bars, explain, type Insp, type Shared } from "./ui";

type View = "welcome" | number | "reflect";
const STAGE_VIEWS = [Predict, Learn, Context, Choose, Generate, Experiment];
const BASE_NAME = "Starter sentences";
const keyOf = (l: string[]) => l.map((s) => s.trim()).filter(Boolean).join("\n");

class Boundary extends Component<{ children: ReactNode; onReset: () => void }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e: unknown) { if (import.meta.env.DEV) console.error(e); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div className="note warn" role="alert">
        <p>Something went wrong while preparing the model. Try resetting the experiment. Your other learning stages should remain available.</p>
        <button className="btn" onClick={() => { this.props.onReset(); this.setState({ err: false }); }}>Reset experiment</button>
      </div>
    );
  }
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0B7A5D" />
      <path d="M8 12h16M8 17h10M8 22h6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Inspector({ model, stale, label, count, insp }: { model: Model | null; stale: boolean; label: string; count: number; insp: Insp | null }) {
  const p = insp?.prediction;
  return (
    <aside className="inspector" aria-label="Inside the Model">
      <h2>Inside the Model</h2>
      <dl>
        <dt>Model status</dt>
        <dd>{!model ? "Not trained yet" : stale ? "Needs retraining" : `Trained on ${label}`}</dd>
        <dt>Training sentences</dt>
        <dd>{model && !stale ? model.sentences : `${count}${model ? " (model has not learned the changes yet)" : " (not trained yet)"}`}</dd>
        {model && <><dt>Words observed</dt><dd>{model.tokens} ({model.vocabSize} different words)</dd></>}
        <dt>Model type</dt>
        <dd>Trigram: looks at the last 2 words, then 1 word, then overall word counts if it has to.</dd>
      </dl>
      {insp && p ? (
        <>
          <h3>{insp.title}</h3>
          <dl>
            <dt>Context used</dt>
            <dd>{p.context.length ? `“${p.context.join(" ")}”` : "start of a sentence"}</dd>
            <dt>Used a shorter context?</dt>
            <dd>{p.kind === "exact" ? "No" : p.kind === "none" ? "No match found" : `Yes, ${p.contextLength} word${p.contextLength === 1 ? "" : "s"}`}</dd>
            {insp.mode && <><dt>How it chooses</dt><dd>{insp.mode}</dd></>}
            {insp.generated !== undefined && <><dt>Words generated</dt><dd>{insp.generated}</dd></>}
          </dl>
          <p className="muted">{explain(p)}</p>
          <Bars p={p} chosen={insp.chosen} />
        </>
      ) : (
        <p className="muted">Try an activity to see which words the model looked at and which words it could pick.</p>
      )}
      <details>
        <summary>About this model</summary>
        <p>This model counts which words followed other words in the training sentences. The percentages are those counts divided by the total (observed frequencies). It is not a neural network and does not understand meaning. Its percentages are not the confidence scores of a large model like ChatGPT.</p>
      </details>
    </aside>
  );
}

export default function App() {
  const [view, setView] = useState<View>("welcome");
  const [sentences, setSentences] = useState<string[]>([...STARTER]);
  const [base, setBase] = useState(BASE_NAME);
  const [edited, setEdited] = useState(false);
  const [model, setModel] = useState<Model | null>(null);
  const [trainedKey, setTrainedKey] = useState<string | null>(null);
  const [trainedLabel, setTrainedLabel] = useState("");
  const [done, setDone] = useState<Set<number>>(new Set());
  const [insp, setInsp] = useState<Insp | null>(null);
  const [msg, setMsg] = useState("");
  const [epoch, setEpoch] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [inspOpen, setInspOpen] = useState(() => typeof window === "undefined" || window.innerWidth >= 1100);
  const top = useRef<HTMLElement>(null);

  const label = base + (edited ? " (edited)" : "");
  const stale = !!model && trainedKey !== keyOf(sentences);
  const markDone = (i: number) => setDone((d) => (d.has(i) ? d : new Set(d).add(i)));
  const go = (v: View) => { setView(v); setMsg(""); setInsp(null); setNavOpen(false); };
  useEffect(() => { top.current?.scrollTo?.({ top: 0 }); }, [view]);

  const train = () => {
    const v = validateSentences(sentences);
    if (!v.ok) { setMsg(v.message ?? ""); return false; }
    try {
      const m = trainModel(v.clean);
      setModel(m); setTrainedKey(keyOf(sentences)); setTrainedLabel(label);
      setMsg(`Training complete! Your model read ${m.sentences} sentences and learned patterns from ${m.tokens} words.`);
      markDone(1);
      return true;
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
      setMsg("Something went wrong while preparing the model. Try resetting the experiment. Your other learning stages should remain available.");
      return false;
    }
  };
  const clearModel = () => { setSentences([...STARTER]); setBase(BASE_NAME); setEdited(false); setModel(null); setTrainedKey(null); setTrainedLabel(""); setInsp(null); setMsg(""); setEpoch((e) => e + 1); };

  const S: Shared = {
    sentences, label, model, trainedKey, trainedLabel, stale, train, done, markDone, setInsp, say: setMsg, go,
    edit: (l) => { setSentences(l); setEdited(true); },
    loadCollection: (name, l) => { setBase(name); setEdited(false); setSentences(l); },
    restore: () => { setSentences([...STARTER]); setBase(BASE_NAME); setEdited(false); setMsg(model ? "Original sentences restored. Train the model again to learn from them." : "Original sentences restored."); },
  };

  const stageIdx = typeof view === "number" ? view : -1;
  const Stage = stageIdx >= 0 ? STAGE_VIEWS[stageIdx] : null;
  const count = sentences.filter((s) => s.trim()).length;

  return (
    <div className={"app" + (inspOpen ? "" : " noinsp")}>
      <button className="menu btn" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>Menu</button>
      <nav className={"sidebar" + (navOpen ? " open" : "")} aria-label="Learning stages">
        <div className="brand"><Logo /><span>Inside the Text Machine</span></div>
        <button className="btn primary wide" onClick={() => { clearModel(); go(1); }}>+ New Experiment</button>
        <ol className="stages">
          {STAGES.map((s, i) => (
            <li key={s.name}>
              <button className={"navbtn" + (view === i ? " current" : "")} aria-current={view === i ? "step" : undefined} onClick={() => go(i)}>
                <span className="num">{done.has(i) ? "✓" : i + 1}</span>
                <span>{s.name}<small>{view === i ? "Current" : done.has(i) ? "Done" : "To do"}</small></span>
              </button>
            </li>
          ))}
        </ol>
        <label className="prog">Progress: {done.size} of 6 stages<progress max={6} value={done.size} /></label>
        <button className="navbtn" onClick={() => go("reflect")} aria-current={view === "reflect" ? "step" : undefined}><span className="num">★</span><span>What did you discover?</span></button>
        <details className="learnbox">
          <summary>What am I learning?</summary>
          <p>{stageIdx >= 0 ? STAGES[stageIdx].learn : "How a computer can decide which word comes next."}</p>
        </details>
        <button className="btn ghost wide" onClick={() => { clearModel(); setDone(new Set()); go("welcome"); }}>Reset everything</button>
      </nav>

      <main className="workspace" ref={top} tabIndex={-1}>
        <div className="inner">
          <div className="topbar">
            <button className="btn ghost" aria-expanded={inspOpen} onClick={() => setInspOpen(!inspOpen)}>{inspOpen ? "Hide" : "Show"} Inside the Model</button>
          </div>
          <Boundary key={epoch} onReset={() => { clearModel(); go(view); }}>
            {view !== "welcome" && (
              <header>
                <p className="eyebrow">{stageIdx >= 0 ? `Stage ${stageIdx + 1} of 6` : "Wrap up"}</p>
                <h1>{stageIdx >= 0 ? STAGES[stageIdx].name : "What did you discover?"}</h1>
                {stageIdx >= 0 && <p className="lead">{STAGES[stageIdx].goal}</p>}
              </header>
            )}
            <div className="status-msg" role="status" aria-live="polite">{msg && <p className={"note" + (msg === SAFE_MESSAGE || /wrong|first|Add at least|needs? at least/i.test(msg) ? " warn" : " good")}>{msg}</p>}</div>
            {view === "welcome" && <Welcome onStart={() => go(0)} />}
            {Stage && <Stage S={S} key={`${stageIdx}-${epoch}`} />}
            {view === "reflect" && <Reflect S={S} />}
            {view !== "welcome" && (
              <footer className="pager">
                <button className="btn" onClick={() => go(stageIdx > 0 ? stageIdx - 1 : view === "reflect" ? 5 : "welcome")}>Back</button>
                {stageIdx >= 0 && <button className="btn primary" onClick={() => go(stageIdx < 5 ? stageIdx + 1 : "reflect")}>{stageIdx < 5 ? "Next" : "Finish and reflect"}</button>}
              </footer>
            )}
          </Boundary>
        </div>
      </main>

      {inspOpen && <Inspector model={model} stale={stale} label={trainedLabel} count={count} insp={insp} />}
    </div>
  );
}
