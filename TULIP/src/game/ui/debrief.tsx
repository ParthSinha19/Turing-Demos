import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { sfx } from "../audio";
import { useGame } from "../state";
import { useAssist } from "./assist";
import { Btn, Token } from "./kit";

type Recap = {
  goal: string;
  did: string[];
  idea: string;
  ai: string;
  check: { q: string; options: string[]; correct: number; why: string };
};

/** End-of-mission recap: tells the child what the mission was for and what they learned. */
export const RECAPS: Recap[] = [
  {
    goal: "Wake TULIP up and give him power.",
    did: ["You pressed the power button.", "You gave him a battery.", "You matched his parts to their jobs."],
    idea: "INPUT → THINK → OUTPUT. A robot gets information in, works on it, then does something.",
    ai: "Every computer and AI works like this: something goes in, it thinks, something comes out.",
    check: { q: "You press a button and TULIP's eyes light up. What is the button?", options: ["Input", "Output"], correct: 0, why: "The button sends information IN. The glowing eyes are the output!" },
  },
  {
    goal: "Teach TULIP to make choices.",
    did: ["You answered 'what should I do?' questions.", "You built a rule: IF it rains, THEN take an umbrella."],
    idea: "A rule asks a question. YES does one thing. NO does another.",
    ai: "Computers use IF rules all the time to decide what to do next.",
    check: { q: "IF the light is red → ???", options: ["Stop", "Eat cake"], correct: 0, why: "Red means stop. That's a rule TULIP can follow!" },
  },
  {
    goal: "Teach TULIP to follow steps to rescue a robot.",
    did: ["You dragged code blocks together.", "You used Repeat to save time.", "You fixed your program when it went wrong."],
    idea: "Instructions run in order, one after another. Repeat does the same thing many times.",
    ai: "A program is a list of steps. Fixing mistakes is called debugging!",
    check: { q: "Why do we use a Repeat block?", options: ["To do the same step many times", "To make TULIP sleep"], correct: 0, why: "Repeat saves us from placing the same block again and again." },
  },
  {
    goal: "Teach TULIP to recognise everyday things.",
    did: ["You sorted objects into groups.", "You spotted clues like 'you can eat it'."],
    idea: "Look for clues, then put things in the right group.",
    ai: "AI learns from clues called patterns, so it can tell an apple from a ball.",
    check: { q: "What helps TULIP tell things apart?", options: ["Clues like shape and use", "Guessing randomly"], correct: 0, why: "Clues and patterns help AI recognise things." },
  },
  {
    goal: "Teach TULIP what people really mean.",
    did: ["You found the hidden meaning in what people said.", "You used clues from the situation."],
    idea: "Words can mean more than they say. The situation gives clues.",
    ai: "AI that understands language has to work out what people MEAN, not just the words.",
    check: { q: "Someone says 'Give me a hand!'. What do they want?", options: ["Help", "A robot hand"], correct: 0, why: "It's a saying that means 'help me'." },
  },
  {
    goal: "Teach TULIP to answer politely.",
    did: ["You chose kind replies.", "You built a chat: greet, ask, reply.", "You picked TULIP's talking style."],
    idea: "A good answer fits the question and is kind.",
    ai: "Chatbots pick or write replies that match what was said.",
    check: { q: "Someone says 'Hello! Nice to meet you.' Best reply?", options: ["Hello! Nice to meet you too!", "Go away!"], correct: 0, why: "A friendly reply fits a friendly hello." },
  },
  {
    goal: "Use everything TULIP learned at the festival.",
    did: ["You helped a visitor find the food stall.", "You used the umbrella rule in the rain.", "You helped TULIP greet a new friend."],
    idea: "Skills work best together: understand, decide, then answer.",
    ai: "Real AI combines many skills to help people.",
    check: { q: "It starts to rain. Which lesson helps?", options: ["The IF rule from Mission 2", "The maze from Mission 3"], correct: 0, why: "IF raining → take umbrella!" },
  },
];

export function MissionDebrief({ mission, onContinue }: { mission: number; onContinue: () => void }) {
  const r = RECAPS[mission];
  const { say } = useAssist();
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => {
    useGame.getState().setMood("happy");
    say("Let's remember what we did together!", "happy", 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!r) return null;
  const ok = pick === r.check.correct;
  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-end bg-ink/20 p-4 md:pr-12">
      <div className="pop-in panel flex max-h-[92vh] w-full max-w-xl flex-col gap-3 overflow-y-auto p-6">
        <p className="font-display text-lg font-bold uppercase tracking-wider text-primary">Mission complete!</p>
        <h2 className="text-3xl font-extrabold text-ink">Our goal: {r.goal}</h2>
        <div>
          <b className="font-display text-xl text-ink">What you did</b>
          <ul className="mt-1 space-y-1">
            {r.did.map((d) => (
              <li key={d} className="flex items-center gap-2 text-lg text-ink"><Check className="shrink-0 text-success" /> {d}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-sun/30 p-3 text-lg text-ink"><b>Big idea:</b> {r.idea}</div>
        <div className="rounded-2xl bg-card p-3 text-lg text-ink"><Token name="idea" size={28} className="mr-2 inline" /><b>Real AI:</b> {r.ai}</div>
        <div className="rounded-2xl border-4 border-primary/30 p-3">
          <b className="text-lg text-ink">Quick check: {r.check.q}</b>
          <div className="mt-2 flex flex-wrap gap-2">
            {r.check.options.map((o, i) => (
              <Btn key={o} variant="soft" onClick={() => { setPick(i); i === r.check.correct ? sfx.good() : sfx.bad(); }}>{o}</Btn>
            ))}
          </div>
          {pick !== null && <p className="mt-2 text-lg text-ink">{ok ? `🎉 ${r.check.why}` : "Not quite — try the other one!"}</p>}
        </div>
        <Btn onClick={onContinue} disabled={!ok} className="self-end">
          Get my upgrade <ArrowRight />
        </Btn>
      </div>
    </div>
  );
}
