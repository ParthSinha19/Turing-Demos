import { useState } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "../audio";
import { useAssist, useHint } from "./assist";
import { Btn, Choice, Token } from "./kit";
import { Draggable, DropZone } from "./drag";

/* ---------------- Picture quiz ---------------- */
export type QuizOption = { label: string; icon?: string; ok?: boolean; why?: string };
export type QuizItem = {
  prompt: string;
  icon?: string;
  speaker?: { name: string; line: string; tulip?: string };
  options: QuizOption[];
  clue: string;
  explain: string; // said on success / solution
};

export function Quiz({ items, onDone, onProgress }: { items: QuizItem[]; onDone: () => void; onProgress?: (p: number) => void }) {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const { fail, succeed } = useAssist();
  const q = items[qi];
  const okIdx = q?.options.findIndex((o) => o.ok) ?? -1;

  const choose = (i: number) => {
    const option = q?.options[i];
    if (picked !== null || !q || !option) return;
    if (option.ok) {
      setPicked(i);
      succeed(q.explain);
      window.setTimeout(() => {
        setPicked(null);
        setWrong([]);
        if (qi + 1 >= items.length) onDone();
        else {
          setQi(qi + 1);
          onProgress?.((qi + 1) / items.length);
        }
      }, 2300);
    } else {
      setWrong([...wrong, i]);
      fail(option.why ?? "Hmm, I don't think that's it. Look again!");
    }
  };

  useHint(
    q ? {
      clue: q.clue,
      highlight: `[data-choice="q${qi}-${okIdx}"]`,
      solve: { say: q.explain, run: () => choose(okIdx) },
    } : null,
    [qi],
  );

  if (!q) return null;
  return (
    <div key={qi} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {items.map((_, i) => (
          <span key={i} className={cn("h-3 w-8 rounded-full", i < qi ? "bg-success" : i === qi ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
      {q.speaker && (
        <div className="pop-in flex flex-col gap-2">
          <div className="flex items-end gap-3">
            <Token name="smile" size={48} />
            <div className="rounded-3xl rounded-bl-none bg-sun/40 px-4 py-3 font-display text-2xl font-bold text-ink">
              <span className="block text-sm uppercase opacity-60">{q.speaker.name}</span>"{q.speaker.line}"
            </div>
          </div>
          {q.speaker.tulip && (
            <div className="ml-auto max-w-[80%] rounded-3xl rounded-br-none bg-primary/20 px-4 py-2 font-display text-xl font-semibold text-ink">
              <span className="block text-sm uppercase opacity-60">TULIP</span>"{q.speaker.tulip}"
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        {q.icon && <Token name={q.icon} size={60} />}
        <h3 className="text-3xl font-extrabold leading-tight text-ink">{q.prompt}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-1">
        {q.options.map((o, i) => (
          <Choice key={i} id={`q${qi}-${i}`} icon={o.icon} label={o.label} onClick={() => choose(i)} state={picked === i ? "right" : wrong.includes(i) ? "wrong" : null} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Drag-to-sort ---------------- */
export type SortItem = { id: string; icon: string; label: string; zone: string; why: string };
export type SortZone = { id: string; label: string; icon: string };

export function Sorter({ items, zones, onDone, clue, demoFirst, cols = 3 }: { items: SortItem[]; zones: SortZone[]; onDone: () => void; clue: string; demoFirst?: boolean; cols?: number }) {
  const [placed, setPlaced] = useState<Record<string, string>>(() => {
    const first = items[0];
    return demoFirst && first ? { [first.id]: first.zone } : {};
  });
  const [shake, setShake] = useState<string | null>(null);
  const { fail, succeed, say } = useAssist();
  const left = items.filter((i) => !placed[i.id]);
  const next = left[0];

  const drop = (it: SortItem, zone: string) => {
    if (zone === it.zone) {
      const np = { ...placed, [it.id]: zone };
      setPlaced(np);
      sfx.drop();
      const rem = items.filter((i) => !np[i.id]);
      if (rem.length === 0) {
        succeed("I sorted everything! My brain is buzzing!");
        window.setTimeout(onDone, 2000);
      } else say(`${it.label} goes in ${zones.find((z) => z.id === zone)!.label}. Got it!`, "learning", 1600);
    } else {
      setShake(it.id);
      window.setTimeout(() => setShake(null), 700);
      fail(it.why);
    }
  };

  useHint(
    next
      ? {
          clue: clue + " " + next.why,
          highlight: `[data-drag="${next.id}"], [data-drop="${next.zone}"]`,
          demo: { say: `Watch: ${next.label} goes in ${zones.find((z) => z.id === next.zone)!.label}.`, run: () => drop(next, next.zone) },
          solve: {
            say: "Here's how I'd sort them all. Look at what each thing is used for!",
            run: () => {
              const all: Record<string, string> = {};
              items.forEach((i) => (all[i.id] = i.zone));
              setPlaced(all);
              window.setTimeout(onDone, 2600);
            },
          },
        }
      : null,
    [next?.id],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex min-h-24 flex-wrap justify-center gap-4 rounded-3xl bg-muted/60 p-4">
        {left.map((it) => (
          <Draggable key={it.id} id={it.id} onDrop={(z) => drop(it, z)} className={cn("pop-in", shake === it.id && "shake")}>
            <div className="flex flex-col items-center gap-1 p-1">
              <Token name={it.icon} size={70} />
              <span className="font-display text-lg font-bold text-ink">{it.label}</span>
            </div>
          </Draggable>
        ))}
        {left.length === 0 && <p className="self-center font-display text-2xl font-bold text-success">All sorted!</p>}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {zones.map((z) => (
          <DropZone key={z.id} id={z.id} className="flex min-h-32 cursor-pointer flex-col items-center gap-2 rounded-3xl border-4 border-dashed border-primary/40 bg-card p-3 transition-colors hover:border-primary">
            <div className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
              <Token name={z.icon} size={34} /> {z.label}
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {items.filter((i) => placed[i.id] === z.id).map((i) => (
                <span key={i.id} className="pop-in" title={i.label}>
                  <Token name={i.icon} size={40} />
                </span>
              ))}
            </div>
          </DropZone>
        ))}
      </div>
      <p className="text-center text-base font-semibold text-muted-foreground">Drag a picture into a box — or tap it, then tap the box.</p>
    </div>
  );
}

/* ---------------- IF / YES / NO rule builder ---------------- */
export type RuleCard = { id: string; icon: string; label: string };

export function RuleBuilder({ question, qIcon, yes, no, cards, tests, onDone, prefilled }: { question: string; qIcon: string; yes: string; no: string; cards: RuleCard[]; tests: { label: string; icon: string; answer: "yes" | "no" }[]; onDone: () => void; prefilled?: boolean }) {
  const [slots, setSlots] = useState<{ yes?: string; no?: string }>(prefilled ? { yes, no } : {});
  const [testing, setTesting] = useState(-1);
  const { fail, succeed, say } = useAssist();
  const card = (id?: string) => cards.find((c) => c.id === id);
  const ready = slots.yes && slots.no;

  const run = () => {
    if (slots.yes !== yes || slots.no !== no) {
      const wrongSlot = slots.yes !== yes ? "YES" : "NO";
      fail(`Hmm, look at the ${wrongSlot} side. If the answer is ${wrongSlot}, what should I do?`);
      return;
    }
    let i = 0;
    const tick = () => {
      if (i >= tests.length) {
        setTesting(-1);
        succeed("My rule works every time!");
        window.setTimeout(onDone, 1800);
        return;
      }
      setTesting(i);
      const t = tests[i];
      if (!t) return;
      say(`${t.label}? ${t.answer.toUpperCase()}! So I... ${card(t.answer === "yes" ? yes : no)!.label}!`, "thinking", 1800);
      sfx.beep();
      i++;
      window.setTimeout(tick, 2200);
    };
    tick();
  };

  const nextSlot: "yes" | "no" = slots.yes !== yes ? "yes" : "no";
  useHint(
    prefilled
      ? null
      : {
          clue: `Think: ${question} If YES, what should I do? If NO, what should I do?`,
          highlight: `[data-drag="${nextSlot === "yes" ? yes : no}"], [data-drop="${nextSlot}"]`,
          demo: { say: `This card goes on the ${nextSlot.toUpperCase()} side.`, run: () => setSlots((s) => ({ ...s, [nextSlot]: nextSlot === "yes" ? yes : no })) },
          solve: { say: `If YES: ${card(yes)!.label}. If NO: ${card(no)!.label}. Now press Test!`, run: () => setSlots({ yes, no }) },
        },
    [nextSlot, prefilled],
  );

  const Slot = ({ side }: { side: "yes" | "no" }) => {
    const c = card(slots[side]);
    const active = testing >= 0 && tests[testing]?.answer === side;
    return (
      <DropZone id={side} className={cn("flex min-h-36 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-4 border-dashed p-3 transition-all", side === "yes" ? "border-success/60 bg-success/10" : "border-destructive/50 bg-destructive/10", active && "scale-105 border-solid border-sun bg-sun/30")}>
        <span className={cn("rounded-full px-4 py-1 font-display text-xl font-extrabold text-primary-foreground", side === "yes" ? "bg-success" : "bg-destructive")}>{side.toUpperCase()}</span>
        {c ? (
          <div className="pop-in flex flex-col items-center">
            <Token name={c.icon} size={56} />
            <span className="font-display text-lg font-bold text-ink">{c.label}</span>
          </div>
        ) : (
          <span className="font-semibold text-muted-foreground">drop a card here</span>
        )}
      </DropZone>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-3xl bg-sun/40 p-4" data-rule-question>
        <span className="rounded-xl bg-ink px-3 py-1 font-display text-xl font-extrabold text-primary-foreground">IF</span>
        <Token name={tests[testing]?.icon ?? qIcon} size={56} />
        <span className="font-display text-2xl font-extrabold text-ink">{question}</span>
      </div>
      <div className="flex gap-3">
        <Slot side="yes" />
        <Slot side="no" />
      </div>
      {!prefilled && (
        <div className="flex flex-wrap justify-center gap-3">
          {cards.map((c) => (
            <Draggable key={c.id} id={c.id} onDrop={(t) => { if (t === "yes" || t === "no") { sfx.drop(); setSlots((s) => ({ ...s, [t]: c.id })); } }}>
              <div className="flex flex-col items-center rounded-2xl bg-card p-2 shadow-md">
                <Token name={c.icon} size={52} />
                <span className="font-display text-base font-bold text-ink">{c.label}</span>
              </div>
            </Draggable>
          ))}
        </div>
      )}
      <Btn variant="sun" disabled={!ready || testing >= 0} onClick={run} data-test-rule>
        Test my rule!
      </Btn>
    </div>
  );
}
