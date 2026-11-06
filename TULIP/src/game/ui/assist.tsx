import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useGame, type Mood } from "../state";
import { sfx } from "../audio";

/**
 * Reusable guidance engine. A puzzle registers a Hint describing its four
 * assistance levels; the HELP button and failure counter escalate through them.
 */
export type Hint = {
  clue: string; // Level 1 — TULIP says it
  highlight?: string; // Level 2 — CSS selector to glow
  demo?: { say: string; run: () => void }; // Level 3 — do one step
  solve?: { say: string; run: () => void }; // Level 4 — full solution + explanation
};

type Bubble = { text: string; mood?: Mood; key: number };

type Assist = {
  say: (text: string, mood?: Mood, ms?: number) => void;
  bubble: Bubble | null;
  setHint: (h: Hint | null) => void;
  hint: Hint | null;
  fail: (msg?: string) => void;
  succeed: (msg?: string) => void;
  helpOpen: boolean;
  setHelpOpen: (b: boolean) => void;
  level: number;
  fails: number;
  highlight: (sel?: string, ms?: number) => void;
  pointer: string | null;
};

const Ctx = createContext<Assist | null>(null);
export const useAssist = () => useContext(Ctx)!;

export function AssistProvider({ children }: { children: ReactNode }) {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [hint, setHintState] = useState<Hint | null>(null);
  const [fails, setFails] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pointer, setPointer] = useState<string | null>(null);
  const keyRef = useRef(0);
  const hlTimer = useRef<number>(0);
  const setMood = useGame((s) => s.setMood);

  const say = useCallback(
    (text: string, mood: Mood = "speaking", ms = 2200) => {
      keyRef.current++;
      setBubble({ text, mood, key: keyRef.current });
      setMood(mood, ms);
    },
    [setMood],
  );

  const clearHighlight = () => {
    document.querySelectorAll(".hint-glow").forEach((e) => e.classList.remove("hint-glow"));
    setPointer(null);
  };

  const highlight = useCallback((sel?: string, ms = 5000) => {
    clearHighlight();
    if (!sel) return;
    document.querySelectorAll(sel).forEach((e) => e.classList.add("hint-glow"));
    setPointer(sel);
    window.clearTimeout(hlTimer.current);
    hlTimer.current = window.setTimeout(clearHighlight, ms);
  }, []);

  const setHint = useCallback((h: Hint | null) => {
    setHintState(h);
    setFails(0);
    setHelpOpen(false);
    clearHighlight();
  }, []);

  const fail = useCallback(
    (msg?: string) => {
      sfx.bad();
      setFails((f) => {
        const n = f + 1;
        if (n >= 2) {
          // Progressive assistance: open help automatically after 2 tries.
          window.setTimeout(() => setHelpOpen(true), 900);
        }
        return n;
      });
      say(msg ?? "Oops! That didn't work. Let's try again!", "confused", 2600);
    },
    [say],
  );

  const succeed = useCallback(
    (msg?: string) => {
      sfx.good();
      setFails(0);
      setHelpOpen(false);
      clearHighlight();
      say(msg ?? "Yes! I get it now!", "happy", 2200);
    },
    [say],
  );

  useEffect(() => () => clearHighlight(), []);

  const level = Math.min(4, Math.max(1, fails));
  return (
    <Ctx.Provider value={{ say, bubble, setHint, hint, fail, succeed, helpOpen, setHelpOpen, level, fails, highlight, pointer }}>
      {children}
    </Ctx.Provider>
  );
}

/** Register a hint for the lifetime of the calling puzzle step. */
export function useHint(h: Hint | null, deps: unknown[]) {
  const { setHint } = useAssist();
  useEffect(() => {
    setHint(h);
    return () => setHint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
