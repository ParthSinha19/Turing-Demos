import { useEffect, useMemo, useState } from "react";
import { CopyPlus, MapPin, Save, Trash2, Wrench } from "lucide-react";
import { SandboxPage } from "@/simulation/SandboxPage";
import { Button } from "@/components/ui/button";
import { useLevelStore, type LevelTool } from "./levelStore";
import { buildCustomLevelWorld } from "./levelDefinition";
import { useSimulationStore } from "@/simulation/simulationStore";
import { cn } from "@/lib/utils";

const TOOLS: { id: LevelTool; label: string }[] = [
  { id: "rock", label: "Rock" },
  { id: "boulder", label: "Boulder" },
  { id: "barrier", label: "Barrier" },
  { id: "ramp", label: "Ramp" },
  { id: "checkpoint", label: "Checkpoint" },
  { id: "sample", label: "Sample" },
];

export function CustomLevelsPage() {
  const levels = useLevelStore((s) => s.levels);
  const selectedId = useLevelStore((s) => s.selectedId);
  const tool = useLevelStore((s) => s.tool);
  const select = useLevelStore((s) => s.select);
  const setTool = useLevelStore((s) => s.setTool);
  const updateSelected = useLevelStore((s) => s.updateSelected);
  const addObstacle = useLevelStore((s) => s.addObstacle);
  const addRamp = useLevelStore((s) => s.addRamp);
  const addCheckpoint = useLevelStore((s) => s.addCheckpoint);
  const removeObstacle = useLevelStore((s) => s.removeObstacle);
  const removeRamp = useLevelStore((s) => s.removeRamp);
  const removeCheckpoint = useLevelStore((s) => s.removeCheckpoint);
  const save = useLevelStore((s) => s.save);
  const create = useLevelStore((s) => s.create);
  const level = levels.find((item) => item.id === selectedId) ?? levels[0];
  const world = useMemo(() => buildCustomLevelWorld(level), [level]);
  const hasSample = level.obstacles.some((obstacle) => obstacle.kind === "sample");
  const [x, setX] = useState("9");
  const [z, setZ] = useState("0");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    useSimulationStore.getState().setPaused(true);
  }, []);

  const place = () => {
    const px = Number(x);
    const pz = Number(z);
    if (!Number.isFinite(px) || !Number.isFinite(pz) || Math.abs(px) > 100 || Math.abs(pz) > 100) return;
    if (tool === "sample" && hasSample) return;
    const id = `${tool}-${Date.now()}`;
    if (tool === "ramp") {
      addRamp({ id, x: px, z: pz, length: 11, width: 8, rise: 3.5, heading: 0 });
    } else if (tool === "checkpoint") {
      addCheckpoint(px, pz);
    } else {
      const obstacle = tool === "rock"
        ? { id, kind: "rock" as const, x: px, z: pz, radius: 0.48, height: 0.36 }
        : tool === "boulder"
          ? { id, kind: "boulder" as const, x: px, z: pz, radius: 0.9, height: 0.92 }
          : tool === "barrier"
            ? { id, kind: "barrier" as const, x: px, z: pz, radius: 1.15, height: 0.9, width: 0.8, depth: 2.6 }
            : { id, kind: "sample" as const, x: px, z: pz, radius: 0.7, height: 0.3 };
      addObstacle(obstacle);
    }
    setSaved(false);
  };

  const resetLevel = () => {
    useSimulationStore.getState().setPaused(true);
    updateSelected({ obstacles: [], ramps: [], checkpoints: [], start: { x: 0, z: 0, yaw: 0 }, target: { x: 20, z: 0, radius: 2.2, label: "Goal marker" } });
    useSimulationStore.getState().clearSnapshot();
    setSaved(false);
    setTesting(false);
  };

  const testLevel = () => {
    useSimulationStore.getState().clearSnapshot();
    useSimulationStore.getState().setMode("manual");
    useSimulationStore.getState().setPaused(false);
    setTesting(true);
  };

  const editLevel = () => {
    useSimulationStore.getState().setPaused(true);
    setTesting(false);
  };

  return (
    <>
      <SandboxPage world={world} heading="CUSTOM LEVELS" subheading="Build a test site, save it, then drive the same rover through your layout." />
      {testing ? (
        <div className="pointer-events-none absolute left-3 top-[116px] z-20">
          <div className="pointer-events-auto panel max-w-[280px] p-3">
            <div className="label-caps">Level test in progress</div>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">Drive to the goal marker. Pause the test to return to editing.</p>
            <Button className="mt-2 w-full" size="sm" variant="outline" onClick={editLevel}>Edit level</Button>
          </div>
        </div>
      ) : <div className="pointer-events-none absolute inset-x-3 top-[116px] z-20 bottom-[148px] flex items-start">
        <aside className="pointer-events-auto panel max-h-full w-[280px] overflow-y-auto p-3">
          <div className="flex items-center justify-between">
            <div><div className="label-caps">Level editor</div><div className="font-display text-sm font-semibold text-foreground">{level.name}</div></div>
            <Wrench className="h-4 w-4 text-signal" />
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <select className="h-8 min-w-0 rounded border border-white/10 bg-background px-2 text-[11px] text-foreground" value={selectedId} onChange={(e) => { select(e.target.value); setSaved(false); }} aria-label="Load saved level">
              {levels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <Button size="sm" variant="outline" onClick={create}><CopyPlus className="mr-1 h-3 w-3" />New</Button>
          </div>
          <label className="mt-3 block text-[10px] text-muted-foreground">Level name</label>
          <input className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 text-[11px] text-foreground" value={level.name} maxLength={36} onChange={(e) => { updateSelected({ name: e.target.value }); setSaved(false); }} />
          <label className="mt-3 block text-[10px] text-muted-foreground">Terrain layout</label>
          <select className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 text-[11px] text-foreground" value={level.terrain} onChange={(e) => { updateSelected({ terrain: e.target.value as typeof level.terrain }); setSaved(false); }}>
            <option value="yard">Open test yard</option><option value="crater">Crater field</option><option value="ridge">Distant ridge</option>
          </select>
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="label-caps">Place a world object</div>
            <div className="mt-2 grid grid-cols-3 gap-1">{TOOLS.map((item) => <button key={item.id} onClick={() => setTool(item.id)} className={cn("rounded border px-1.5 py-1.5 text-[10px]", tool === item.id ? "border-signal/40 bg-signal/10 text-signal" : "border-white/10 text-muted-foreground hover:bg-white/5")}>{item.label}</button>)}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="text-[10px] text-muted-foreground">X (forward)<input type="number" min="-100" max="100" value={x} onChange={(e) => setX(e.target.value)} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Z (sideways)<input type="number" min="-100" max="100" value={z} onChange={(e) => setZ(e.target.value)} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
            </div>
            <Button className="mt-2 w-full" size="sm" onClick={place} disabled={tool === "sample" && hasSample}><MapPin className="mr-1 h-3 w-3" />Place {tool}</Button>
            <p className="mt-1.5 text-[9px] leading-snug text-muted-foreground">Coordinates are measured in metres from the rover's starting area. Ramps raise the terrain along the forward axis.</p>
            {hasSample && <p className="mt-1 text-[9px] leading-snug text-caution">One collectible sample is supported per level. Remove the existing sample to place another.</p>}
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="label-caps">Mission markers</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="text-[10px] text-muted-foreground">Goal X<input type="number" value={level.target.x} onChange={(e) => { updateSelected({ target: { ...level.target, x: Number(e.target.value) } }); setSaved(false); }} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Goal Z<input type="number" value={level.target.z} onChange={(e) => { updateSelected({ target: { ...level.target, z: Number(e.target.value) } }); setSaved(false); }} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
              <label className="col-span-2 text-[10px] text-muted-foreground">Objective label<input value={level.target.label} maxLength={30} onChange={(e) => { updateSelected({ target: { ...level.target, label: e.target.value } }); setSaved(false); }} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Start X<input type="number" value={level.start.x} onChange={(e) => { updateSelected({ start: { ...level.start, x: Number(e.target.value) } }); setSaved(false); }} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
              <label className="text-[10px] text-muted-foreground">Start Z<input type="number" value={level.start.z} onChange={(e) => { updateSelected({ start: { ...level.start, z: Number(e.target.value) } }); setSaved(false); }} className="mt-1 h-8 w-full rounded border border-white/10 bg-background px-2 font-mono text-[11px] text-foreground" /></label>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground"><span>{level.checkpoints.length} checkpoints</span><span>{level.ramps.length} ramps</span></div>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="label-caps">Placed objects ({level.obstacles.length})</div>
            <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">
              {level.obstacles.length === 0 && <p className="text-[10px] text-muted-foreground">No objects placed yet.</p>}
              {level.obstacles.map((obstacle) => <div key={obstacle.id} className="flex items-center justify-between rounded bg-white/[0.035] px-2 py-1.5"><span className="text-[10px] text-foreground/80">{obstacle.kind} · {obstacle.x.toFixed(1)}, {obstacle.z.toFixed(1)}</span><button aria-label={`Remove ${obstacle.id}`} onClick={() => { removeObstacle(obstacle.id); setSaved(false); }} className="text-muted-foreground hover:text-negative"><Trash2 className="h-3 w-3" /></button></div>)}
            </div>
            {level.checkpoints.map((checkpoint) => <div key={checkpoint.id} className="mt-1 flex items-center justify-between rounded bg-white/[0.035] px-2 py-1.5 text-[10px] text-caution"><span>Checkpoint · {checkpoint.x.toFixed(1)}, {checkpoint.z.toFixed(1)}</span><button aria-label={`Remove ${checkpoint.id}`} onClick={() => { removeCheckpoint(checkpoint.id); setSaved(false); }} className="text-muted-foreground hover:text-negative"><Trash2 className="h-3 w-3" /></button></div>)}
            {level.ramps.map((ramp) => <div key={ramp.id} className="mt-1 flex items-center justify-between rounded bg-white/[0.035] px-2 py-1.5 text-[10px] text-signal"><span>Ramp · {ramp.x.toFixed(1)}, {ramp.z.toFixed(1)}</span><button aria-label={`Remove ${ramp.id}`} onClick={() => { removeRamp(ramp.id); setSaved(false); }} className="text-muted-foreground hover:text-negative"><Trash2 className="h-3 w-3" /></button></div>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
            <Button size="sm" variant="outline" onClick={resetLevel}>Reset level</Button>
            <Button size="sm" onClick={() => { save(); setSaved(true); }}><Save className="mr-1 h-3 w-3" />Save</Button>
            <Button className="col-span-2" size="sm" onClick={testLevel}>Test this level</Button>
          </div>
          {saved && <p className="mt-2 text-center text-[10px] text-positive">Saved in this browser. Select it later to load again.</p>}
        </aside>
      </div>}
    </>
  );
}
