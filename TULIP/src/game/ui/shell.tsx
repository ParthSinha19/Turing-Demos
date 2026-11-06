import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { ArrowRight, Backpack, Home, Lightbulb, Volume2, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UPGRADES, useGame, type Mood, type UpgradeId } from "../state";
import { refreshVolume, sfx, speak } from "../audio";
import { useAssist } from "./assist";
import { Btn, Confetti, Token } from "./kit";

export const UPGRADE_ICON: Record<UpgradeId, string> = {
  energy: "zap",
  thinking: "brain",
  navigation: "pin",
  vision: "eye",
  language: "ear",
  voice: "volume",
  festival: "sparkles",
};

export const MISSION_TITLES = [
  "Wake Up, TULIP!",
  "The Decision Machine",
  "The Great Robot Rescue",
  "What Am I Looking At?",
  "What Are Humans Saying?",
  "Finding His Voice",
  "The Welcome Festival",
];

/** TULIP's speech bubble — always visible, never covering the puzzle. */
export function SpeechBubble() {
  const { bubble } = useAssist();
  if (!bubble) return null;
  return (
    <div key={bubble.key} className="pop-in panel pointer-events-auto relative max-w-sm px-5 py-3 font-display text-xl font-semibold leading-snug text-ink">
      {bubble.text}
      <button aria-label="Read aloud" className="ml-2 inline-flex translate-y-1 text-primary" onClick={() => speak(bubble.text)}>
        <Volume2 size={20} />
      </button>
      <span className="absolute -bottom-3 left-10 h-6 w-6 rotate-45 border-b-[3px] border-r-[3px] bg-card" style={{ borderColor: "color-mix(in oklab, var(--card) 60%, var(--border))" }} />
    </div>
  );
}

/** Animated pointing finger over the highlighted element. */
export function HintPointer() {
  const { pointer } = useAssist();
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!pointer) return setRect(null);
    const update = () => {
      const el = document.querySelector(pointer);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    const id = window.setInterval(update, 300);
    return () => clearInterval(id);
  }, [pointer]);
  if (!rect) return null;
  return (
    <div className="pointer-events-none fixed z-[70]" style={{ left: rect.right - 18, top: rect.bottom - 14 }}>
      <div className="pointer-bob text-5xl drop-shadow-lg" style={{ transform: "rotate(-30deg)" }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="var(--sun)" stroke="var(--ink)" strokeWidth="1.5">
          <path d="M9 11V5a2 2 0 1 1 4 0v5l4.5.7a2 2 0 0 1 1.7 2.3l-.8 5A3 3 0 0 1 15.4 21H11a3 3 0 0 1-2.4-1.2L5.3 15.4a1.6 1.6 0 0 1 2.4-2.1L9 14.5z" />
        </svg>
      </div>
    </div>
  );
}

/** HELP panel with the four assistance levels. */
export function HelpPanel() {
  const { hint, helpOpen, setHelpOpen, level, say, highlight } = useAssist();
  if (!helpOpen || !hint) return null;
  const opts: { lvl: number; label: string; icon: string; act: () => void; show: boolean }[] = [
    { lvl: 1, label: "Give me a clue", icon: "idea", act: () => say(hint.clue, "thinking", 4000), show: true },
    { lvl: 2, label: "Show me where", icon: "eye", act: () => { say(hint.clue, "thinking", 3000); highlight(hint.highlight); }, show: !!hint.highlight },
    { lvl: 3, label: "Do one step", icon: "hand", act: () => { say(hint.demo!.say, "speaking", 3500); hint.demo!.run(); }, show: !!hint.demo },
    { lvl: 4, label: "Show the answer", icon: "sparkles", act: () => { say(hint.solve!.say, "learning", 5000); hint.solve!.run(); }, show: !!hint.solve },
  ];
  return (
    <div className="pop-in panel pointer-events-auto absolute bottom-24 left-4 z-40 w-80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-ink">Need a hand?</h3>
        <button aria-label="Close help" onClick={() => setHelpOpen(false)} className="text-muted-foreground">
          <X />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {opts.filter((o) => o.show).map((o) => (
          <button
            key={o.lvl}
            onClick={() => {
              sfx.click();
              o.act();
              setHelpOpen(false);
            }}
            className={cn("chunky flex items-center gap-3 rounded-2xl border-2 bg-card p-2 text-left font-display text-lg font-bold text-ink", o.lvl === level ? "border-sun" : "border-border")}
          >
            <Token name={o.icon} size={40} />
            {o.label}
            {o.lvl === level && <span className="ml-auto rounded-full bg-sun px-2 text-sm">try this</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Hud({ title, progress, onHome }: { title?: string; progress?: number; onHome: () => void }) {
  const { muted, setMuted, volume, setVolume, upgrades } = useGame();
  const { setHelpOpen, helpOpen, hint } = useAssist();
  const [bag, setBag] = useState(false);
  return (
    <>
      <div className="pointer-events-auto absolute left-4 right-4 top-4 z-30 flex items-center gap-3">
        <Btn variant="soft" className="h-14 w-14 p-0" onClick={onHome} aria-label="Back to map">
          <Home />
        </Btn>
        {title && (
          <div className="panel flex items-center gap-4 px-5 py-2">
            <h2 className="text-2xl font-bold text-ink">{title}</h2>
            {progress !== undefined && (
              <div className="h-4 w-36 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="panel flex items-center gap-2 px-3 py-2">
            <button aria-label={muted ? "Sound on" : "Sound off"} onClick={() => { setMuted(!muted); setTimeout(refreshVolume); }} className="text-ink">
              {muted ? <VolumeX /> : <Volume2 />}
            </button>
            <input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => { setVolume(+e.target.value); refreshVolume(); }} className="w-20 accent-[var(--primary)]" />
          </div>
          <Btn variant="sun" className="h-14 px-4" onClick={() => setBag(!bag)} aria-label="Upgrades">
            <Backpack /> {upgrades.length}/7
          </Btn>
        </div>
      </div>
      {bag && (
        <div className="pop-in panel pointer-events-auto absolute right-4 top-24 z-40 w-72 p-4">
          <h3 className="mb-2 text-2xl font-bold text-ink">TULIP's upgrades</h3>
          <div className="grid grid-cols-4 gap-2">
            {UPGRADES.map((u) => {
              const got = upgrades.includes(u.id);
              return (
                <div key={u.id} className="flex flex-col items-center text-center text-xs font-bold text-ink" title={u.name}>
                  <Token name={UPGRADE_ICON[u.id]} size={48} className={got ? "" : "opacity-25 grayscale"} />
                  {u.name}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {hint && (
        <button
          onClick={() => { sfx.click(); setHelpOpen(!helpOpen); }}
          className="chunky glow-pulse pointer-events-auto absolute bottom-5 left-4 z-30 flex items-center gap-2 rounded-full bg-sun px-5 py-3 font-display text-2xl font-bold text-ink"
          aria-label="Help"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
            <TulipFace />
          </span>
          HELP <Lightbulb />
        </button>
      )}
    </>
  );
}

/** Small 2D portrait used on the help button and menus. */
export function TulipFace({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path d="M20 3c-2 2-3 4-2 6h4c1-2 0-4-2-6z" fill="var(--petal)" />
      <rect x="4" y="9" width="32" height="26" rx="11" fill="#f4f1ea" stroke="var(--primary)" strokeWidth="2" />
      <rect x="8" y="13" width="24" height="17" rx="7" fill="#14202e" />
      <ellipse cx="15" cy="21" rx="3" ry="3.5" fill="#7ff7e8" />
      <ellipse cx="25" cy="21" rx="3" ry="3.5" fill="#7ff7e8" />
      <rect x="18" y="26" width="4" height="1.6" rx=".8" fill="#7ff7e8" />
    </svg>
  );
}

export type GuideLine = { text: string; mood?: Mood; highlight?: string; action?: () => void };

/**
 * Tutorial engine: plays short TULIP lines, highlighting parts of the puzzle and
 * running demonstrations, then hands control to the player.
 */
export function Guide({ lines, onDone, children }: { lines: GuideLine[]; onDone?: () => void; children: ReactNode }) {
  const [i, setI] = useState(0);
  const { say, highlight } = useAssist();
  const done = i >= lines.length;
  useEffect(() => {
    if (done) {
      highlight(undefined);
      onDone?.();
      return;
    }
    const l = lines[i];
    if (!l) return;
    say(l.text, l.mood ?? "speaking", 2600);
    highlight(l.highlight, 60000);
    l.action?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  return (
    <div className="relative">
      <div className={cn(!done && "pointer-events-none")}>{children}</div>
      {!done && (
        <div className="pointer-events-auto mt-4 flex justify-end">
          <Btn className="glow-pulse" onClick={() => setI(i + 1)}>
            {i === lines.length - 1 ? "Let's go!" : "Next"} <ArrowRight />
          </Btn>
        </div>
      )}
    </div>
  );
}

export function RewardModal({ upgrade, line, onContinue }: { upgrade: string; line: string; onContinue: () => void }) {
  const u = UPGRADES.find((x) => x.id === upgrade);
  useEffect(() => {
    sfx.reward();
    useGame.getState().setMood("victory");
  }, []);
  if (!u) return null;
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-end bg-ink/20 p-6 md:pr-16">
      <Confetti />
      <div className="pop-in panel flex max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="font-display text-xl font-bold uppercase tracking-wider text-primary">Upgrade unlocked!</p>
        <div className="glow-pulse rounded-full">
          <Token name={UPGRADE_ICON[u.id]} size={128} />
        </div>
        <h2 className="text-4xl font-extrabold text-ink">{u.name}</h2>
        <p className="text-xl text-ink">{line}</p>
        <Btn onClick={onContinue} className="mt-2">
          Continue <ArrowRight />
        </Btn>
      </div>
    </div>
  );
}

/** Right-hand stage that holds each puzzle without covering TULIP. */
export function Stage({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn("pointer-events-auto absolute bottom-4 right-4 top-24 z-20 flex flex-col overflow-y-auto", wide ? "left-[34%]" : "left-[46%]")}>
      <div className="panel my-auto p-5 md:p-6">{children}</div>
    </div>
  );
}

export function StepTitle({ icon, children }: { icon?: string; children: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon && <Token name={icon} size={44} />}
      <h3 className="text-3xl font-extrabold leading-tight text-ink">{children}</h3>
    </div>
  );
}
