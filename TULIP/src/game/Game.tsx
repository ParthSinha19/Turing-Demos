import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Check, Lock, Play, RotateCcw } from "lucide-react";
import { UPGRADES, unlockedUpTo, useGame } from "./state";
import { playMusic, sfx } from "./audio";
const GameCanvas = lazy(() => import("./three/GameCanvas").then((m) => ({ default: m.GameCanvas })));
import { AssistProvider, useAssist } from "./ui/assist";
import { HelpPanel, HintPointer, Hud, MISSION_TITLES, RewardModal, SpeechBubble, Stage, UPGRADE_ICON } from "./ui/shell";
import { Btn, Confetti, Token } from "./ui/kit";
import { MissionDebrief } from "./ui/debrief";
import { MISSIONS, REWARD_LINES } from "./missions/missions";

export function Game() {
  return (
    <AssistProvider>
      <GameInner />
    </AssistProvider>
  );
}

function GameInner() {
  const { screen, mission, maze } = useGame();
  const env = screen === "mission" || screen === "ending" ? (screen === "ending" ? 6 : mission) : 0;
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <Suspense fallback={null}><GameCanvas env={env} mode={screen === "menu" ? "menu" : maze ? "maze" : "default"} /></Suspense>
      <div className="pointer-events-none absolute inset-0">
        {screen === "menu" && <Menu />}
        {screen === "map" && <MapScreen />}
        {screen === "mission" && <MissionScreen key={mission} />}
        {screen === "ending" && <Ending />}
        <div className={`pointer-events-none absolute left-6 top-24 z-20 ${screen === "menu" ? "hidden" : ""}`}>
          <SpeechBubble />
        </div>
        <HelpPanel />
        <HintPointer />
      </div>
    </div>
  );
}

function Menu() {
  const { completed, setScreen, reset, setMood } = useGame();
  useEffect(() => setMood("idle"), [setMood]);
  return (
    <div className="pointer-events-auto absolute bottom-6 right-4 top-6 flex w-[48%] flex-col items-start justify-center gap-4 sm:bottom-10 sm:right-8 sm:top-10 sm:w-[44%] sm:gap-6">
      <p className="font-display text-2xl font-bold text-primary">The little robot who wanted to be human</p>
      <h1 className="text-5xl font-extrabold leading-none text-ink sm:text-[9rem]" style={{ textShadow: "0 8px 0 var(--sun)" }}>TULIP</h1>
      <p className="max-w-md text-lg text-ink sm:text-2xl">TULIP wants to go to the Welcome Festival. Can you teach him how?</p>
      <div className="flex gap-3">
        <Btn className="px-10 py-5 text-3xl glow-pulse" onClick={() => { sfx.fanfare(); setScreen("map"); }}>
          <Play /> {completed.length ? "Continue" : "Start"}
        </Btn>
        {completed.length > 0 && (
          <Btn variant="soft" onClick={() => { if (confirm("Start again from the beginning?")) reset(); }}>
            <RotateCcw /> Restart
          </Btn>
        )}
      </div>
    </div>
  );
}

function MapScreen() {
  const { completed, startMission, setScreen, upgrades, setMood } = useGame();
  const { say } = useAssist();
  const open = unlockedUpTo(completed);
  useEffect(() => {
    setMood("idle");
    say(completed.length === 0 ? "Hi! I'm TULIP. Will you be my trainer? Let's start with Mission 1!" : completed.length === 7 ? "We did it all! You can replay any mission." : `I have ${upgrades.length} upgrades now! Ready for the next mission?`, "happy", 3000);
    playMusic(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Hud onHome={() => setScreen("menu")} />
      <Stage>
        <h2 className="mb-4 text-4xl font-extrabold text-ink">TULIP's training journey</h2>
        <div className="flex flex-col gap-2">
          {MISSION_TITLES.map((t, i) => {
            const done = completed.includes(i);
            const locked = i > open && !done;
            return (
              <button key={t} disabled={locked} onClick={() => { sfx.click(); startMission(i); }}
                className={`chunky flex items-center gap-4 rounded-2xl border-4 p-3 text-left ${i === open && !done ? "glow-pulse border-sun bg-sun/30" : "border-transparent bg-card"} disabled:opacity-50`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-2xl font-bold text-primary-foreground">{i + 1}</span>
                <span className="flex-1 font-display text-2xl font-bold text-ink">{t}</span>
                {done ? <Check className="text-success" size={32} /> : locked ? <Lock className="text-muted-foreground" /> : null}
                <Token name={UPGRADE_ICON[UPGRADES[i]?.id ?? "energy"]} size={42} className={done ? "" : "opacity-30 grayscale"} />
              </button>
            );
          })}
        </div>
      </Stage>
    </>
  );
}

function MissionScreen() {
  const { mission, completeMission, setScreen, startMission, setMood } = useGame();
  const [progress, setProgressS] = useState(0);
  const [reward, setReward] = useState(false);
  const [debrief, setDebrief] = useState(false);
  const setProgress = useCallback((p: number) => setProgressS(p), []);
  const M = MISSIONS[mission];
  const upgrade = UPGRADES[mission];
  useEffect(() => {
    playMusic(mission);
    setMood("idle");
  }, [mission, setMood]);
  if (!M || !upgrade) return null;
  return (
    <>
      <Hud title={`${mission + 1}. ${MISSION_TITLES[mission]}`} progress={reward || debrief ? 1 : progress} onHome={() => setScreen("map")} />
      {!reward && !debrief && (
        <Stage>
          <M setProgress={setProgress} onComplete={() => { completeMission(mission); setDebrief(true); }} />
        </Stage>
      )}
      {debrief && !reward && <MissionDebrief mission={mission} onContinue={() => { setDebrief(false); setReward(true); }} />}
      {reward && (
        <RewardModal upgrade={upgrade.id} line={REWARD_LINES[mission] ?? "You did it!"} onContinue={() => {
          if (mission === 6) setScreen("ending");
          else startMission(mission + 1);
        }} />
      )}
    </>
  );
}

function Ending() {
  const { setScreen, upgrades, setMood } = useGame();
  const { say } = useAssist();
  useEffect(() => {
    sfx.fanfare();
    setMood("victory");
    say("I think I'm finally ready to be part of the human world. Thank you for teaching me!", "victory", 0);
    playMusic(6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const abilities = ["Wake up & use energy", "Make decisions", "Follow code", "Recognise things", "Understand people", "Talk kindly", "Join the festival"];
  return (
    <>
      <Confetti n={140} />
      <Stage>
        <p className="font-display text-xl font-bold uppercase tracking-widest text-primary">The festival is open!</p>
        <h2 className="mb-2 text-5xl font-extrabold text-ink">You taught TULIP to be a great friend</h2>
        <div className="my-4 grid grid-cols-2 gap-2">
          {UPGRADES.map((u, i) => (
            <div key={u.id} className="pop-in flex items-center gap-3 rounded-2xl bg-card p-2" style={{ animationDelay: `${i * 0.15}s` }}>
              <Token name={UPGRADE_ICON[u.id]} size={44} className={upgrades.includes(u.id) ? "" : "opacity-30"} />
              <div><b className="font-display text-lg text-ink">{u.name}</b><p className="text-sm text-muted-foreground">{abilities[i]}</p></div>
            </div>
          ))}
        </div>
        <Btn onClick={() => setScreen("map")}>Back to the journey</Btn>
      </Stage>
    </>
  );
}
