import { useMemo } from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SandboxPage } from "@/simulation/SandboxPage";
import { useMissionStore } from "./missionStore";
import { MISSIONS, createMissionWorld, getMission } from "./definitions";
import { useSimulationStore } from "@/simulation/simulationStore";
import { useRoverStore } from "@/state/roverStore";
import { cn } from "@/lib/utils";

export function MissionsPage() {
  const activeId = useMissionStore((s) => s.activeMissionId);
  const completed = useMissionStore((s) => s.completed);
  const attempts = useMissionStore((s) => s.attempts);
  const mission = activeId ? getMission(activeId) : null;
  const world = useMemo(() => mission ? createMissionWorld(mission) : null, [mission]);
  if (mission && world) return <MissionRun mission={mission} world={world} />;
  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <div className="label-caps">Guided field programme</div>
            <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Mars missions</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Take the rover into progressively more demanding field tests. Every mission uses the rover you built in the Design Lab and the same Sandbox physics.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MISSIONS.map((item) => {
              const done = completed.includes(item.id);
              return (
                <article key={item.id} className="panel flex flex-col p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded border border-signal/25 bg-signal/10 font-mono text-sm font-semibold text-signal">{item.number}</div>
                      <div><h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2><p className="text-[11px] text-muted-foreground">{item.subtitle}</p></div>
                    </div>
                    {done && <span className="flex items-center gap-1 rounded bg-positive/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-positive"><Check className="h-3 w-3" /> Complete</span>}
                  </div>
                  <p className="mt-3 flex-1 text-[12px] leading-relaxed text-muted-foreground">{item.briefing}</p>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <div className="label-caps">Engineering focus</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">{item.learning.map((label) => <span key={label} className="rounded bg-white/[0.045] px-2 py-1 text-[10px] text-foreground/80">{label}</span>)}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{attempts[item.id] ?? 0} attempts</span>
                      <Button size="sm" onClick={() => {
                        useMissionStore.getState().begin(item.id);
                        useSimulationStore.getState().clearSnapshot();
                        useSimulationStore.getState().setMode("manual");
                        useSimulationStore.getState().setPaused(false);
                      }}>{done ? "Replay mission" : "Start mission"}<ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionRun({ mission, world }: { mission: ReturnType<typeof getMission>; world: NonNullable<ReturnType<typeof createMissionWorld>> }) {
  const hintIndex = useMissionStore((s) => s.hintIndex);
  const nextHint = useMissionStore((s) => s.nextHint);
  const snapshot = useSimulationStore((s) => s.snapshot);
  const completed = useMissionStore((s) => s.completed.includes(mission.id));
  const returnToList = () => {
    useMissionStore.getState().leave();
    useSimulationStore.getState().setPaused(true);
  };
  const retry = () => {
    useMissionStore.getState().retry(mission.id);
    useSimulationStore.getState().clearSnapshot();
    useSimulationStore.getState().setMode("manual");
    useSimulationStore.getState().setPaused(false);
  };
  const config = useRoverStore((s) => s.config);
  const missingAttachment = mission.requirements?.attachment && !mission.requirements.attachment.some((id) => config.attachments.includes(id));
  return (
    <>
      <SandboxPage world={world} missionId={mission.id} heading={`MISSION ${mission.number}`} subheading={mission.objective} />
      <div className="pointer-events-none fixed inset-x-0 top-12 z-20 flex justify-center px-3 pt-2">
        <div className="pointer-events-auto panel w-full max-w-[570px] p-3">
          <div className="flex items-center justify-between gap-3">
            <div><div className="label-caps">{mission.number} / 05 · {mission.title}</div><p className="mt-0.5 text-[11px] text-foreground/90">{snapshot?.missionMessage || mission.objective}</p></div>
            <div className="font-mono text-sm font-semibold text-signal">{Math.round((snapshot?.missionProgress ?? 0) * 100)}%</div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-signal transition-all" style={{ width: `${Math.round((snapshot?.missionProgress ?? 0) * 100)}%` }} /></div>
          {missingAttachment && <p className="mt-2 text-[10px] leading-snug text-caution">This mission requires a sample collector or robotic arm. Return to the Design Lab to install one.</p>}
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="min-w-0 text-[10px] text-muted-foreground"><span className="font-semibold text-signal">Hint {hintIndex + 1}:</span> {mission.hints[hintIndex]}</p>
            <button className="shrink-0 rounded px-2 py-1 text-[10px] font-semibold text-signal hover:bg-white/10" onClick={() => nextHint(mission.hints.length)}>{hintIndex === mission.hints.length - 1 ? "Restart hints" : "Next hint"}</button>
          </div>
          {snapshot?.missionComplete && <div className="mt-2 rounded border border-positive/25 bg-positive/10 p-2">
            <div className="text-[11px] font-semibold text-positive">Mission complete</div>
            <p className="mt-0.5 text-[10px] text-foreground/80">You achieved the objective. {mission.learning.join(" · ")}.</p>
            <div className="mt-2 flex gap-2"><Button size="sm" variant="outline" onClick={returnToList}>Mission list</Button><Button size="sm" onClick={retry}><RotateCcw className="mr-1 h-3 w-3" />Try again</Button></div>
          </div>}
          {!snapshot?.missionComplete && <div className="mt-2 flex justify-end"><button onClick={returnToList} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground hover:bg-white/10 hover:text-foreground"><ArrowLeft className="h-3 w-3" />Mission list</button></div>}
        </div>
      </div>
    </>
  );
}
