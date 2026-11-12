import { Copy, Info, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getComponent } from "@/rover/catalogue";
import { computeRoverLayout } from "@/rover/layout";
import { computePhysicsProfile } from "@/rover/physicsProfile";
import { computeStats, type RoverStats } from "@/rover/stats";
import { useLabStore } from "@/state/labStore";
import { useRoverStore } from "@/state/roverStore";
import { Segmented } from "./ViewToolbar";
import { fmt, signed } from "./format";
import { STAT_GROUPS, type StatDef } from "./statDefinitions";

function StatRow({ def, stats }: { def: StatDef; stats: RoverStats }) {
  const value = def.value(stats);
  const prev = useRef(value);
  const [delta, setDelta] = useState<{ d: number; key: number } | null>(null);
  useEffect(() => {
    const d = value - prev.current;
    prev.current = value;
    if (Math.abs(d) < Math.pow(10, -def.digits) / 2) return;
    setDelta({ d, key: Date.now() });
    const t = setTimeout(() => setDelta(null), 3500);
    return () => clearTimeout(t);
  }, [value, def.digits]);
  const good = delta && def.better !== "neutral" ? (def.better === "higher" ? delta.d > 0 : delta.d < 0) : null;
  const extra = def.id === "slope" ? `limited by ${stats.slopeLimitedBy}` : null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-[3px]" data-stat={def.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="flex items-center gap-1 text-left text-[12px] text-muted-foreground hover:text-foreground">
            {def.label}
            <Info className="h-3 w-3 opacity-50" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">{def.explain}</TooltipContent>
      </Tooltip>
      <div className="flex items-baseline gap-1.5">
        {delta && (
          <span key={delta.key} className={cn("readout animate-fade-up text-[10.5px]", good === null ? "text-muted-foreground" : good ? "text-positive" : "text-negative")}>
            {signed(delta.d, def.digits)}
          </span>
        )}
        {extra && <span className="text-[10px] text-muted-foreground">{extra}</span>}
        <span className="readout text-[13px] text-foreground" data-value>{fmt(value, def.digits)}</span>
        <span className="readout w-8 text-[10.5px] text-muted-foreground">{def.unit}</span>
      </div>
    </div>
  );
}

function PowerBar({ stats }: { stats: RoverStats }) {
  const p = stats.power;
  const parts = [
    { label: "Motors", v: p.driveW, cls: "bg-chart-1" },
    { label: "Computer", v: p.avionicsW, cls: "bg-chart-5" },
    { label: "Sensors", v: p.sensorsW, cls: "bg-chart-4" },
    { label: "Tools", v: p.attachmentsW, cls: "bg-chart-2" },
  ];
  return (
    <div className="mt-1.5">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        {parts.map((x) => <div key={x.label} className={x.cls} style={{ width: `${(x.v / p.totalW) * 100}%` }} />)}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-2.5 text-[10.5px] text-muted-foreground">
        {parts.map((x) => (
          <span key={x.label} className="flex items-center gap-1"><span className={cn("h-1.5 w-1.5 rounded-full", x.cls)} />{x.label} <span className="readout">{fmt(x.v)} W</span></span>
        ))}
      </div>
    </div>
  );
}

function EngineeringTab({ stats }: { stats: RoverStats }) {
  return (
    <div className="space-y-3">
      {STAT_GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="label-caps mb-0.5">{g.title}</h3>
          {g.stats.map((s) => <StatRow key={s.id} def={s} stats={stats} />)}
          {g.title === "Energy" && <PowerBar stats={stats} />}
        </div>
      ))}
      <div>
        <h3 className="label-caps mb-1">Sensors</h3>
        {stats.sensors.length === 0 ? (
          <p className="text-[12px] text-caution">No sensors: the rover cannot detect obstacles.</p>
        ) : (
          <ul className="space-y-0.5">
            {stats.sensors.map((s) => (
              <li key={s.id} className="flex justify-between text-[12px]"><span className="text-foreground">{s.name}</span><span className="readout text-[11px] text-muted-foreground">{fmt(s.rangeM)} m · {fmt(s.fovDeg)}°</span></li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="label-caps mb-1">Payload <span className="readout ml-1 text-signal normal-case tracking-normal">{stats.payloadUsed}/{stats.payloadSlots} slots</span></h3>
        {stats.attachments.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">No attachments installed.</p>
        ) : (
          <ul className="space-y-0.5">
            {stats.attachments.map((a) => (
              <li key={a.id} className="flex justify-between text-[12px]"><span className="text-foreground">{a.name}</span><span className="text-[11px] text-muted-foreground">{a.capability}</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const v3 = (v: readonly number[]) => v.map((n) => fmt(n, 2)).join(", ");

function PhysicsTab() {
  const config = useRoverStore((s) => s.config);
  const articulation = useLabStore((s) => s.articulation);
  const setArticulation = useLabStore((s) => s.setArticulation);
  const overlays = useLabStore((s) => s.overlays);
  const toggleOverlay = useLabStore((s) => s.toggleOverlay);
  const profile = useMemo(() => computePhysicsProfile(config, computeRoverLayout(config)), [config]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      toast("Physics profile copied", { description: "This is exactly what the physics engine will receive." });
    } catch {
      toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
    }
  };
  return (
    <div className="space-y-3 text-[12px]">
      <p className="leading-snug text-muted-foreground">
        Every part feeds this profile. In the Sandbox, the physics engine will read only these numbers and move the same joints shown here.
      </p>
      <label className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-2">
        <span>
          <span className="block font-display font-semibold tracking-wide text-foreground">Articulation test</span>
          <span className="text-[11px] text-muted-foreground">Moves rockers, bogies, steering and wheels</span>
        </span>
        <Switch checked={articulation} onCheckedChange={setArticulation} aria-label="Articulation test" />
      </label>
      <label className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-2">
        <span>
          <span className="block font-display font-semibold tracking-wide text-foreground">Collision shapes</span>
          <span className="text-[11px] text-muted-foreground">Boxes and wheels the physics will collide with</span>
        </span>
        <Switch checked={overlays.collision} onCheckedChange={() => toggleOverlay("collision")} aria-label="Show collision shapes" />
      </label>

      <dl className="readout grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
        <dt className="text-muted-foreground">mass</dt><dd className="text-right">{fmt(profile.massKg, 1)} kg</dd>
        <dt className="text-muted-foreground">gravity</dt><dd className="text-right">{fmt(profile.gravity, 2)} m/s²</dd>
        <dt className="text-muted-foreground">centre of mass</dt><dd className="text-right">{v3(profile.centerOfMass)}</dd>
        <dt className="text-muted-foreground">clearance</dt><dd className="text-right">{fmt(profile.groundClearance, 2)} m</dd>
        <dt className="text-muted-foreground">colliders</dt><dd className="text-right">{profile.colliders.map((c) => c.id.replace("attach-", "")).join(", ")}</dd>
        <dt className="text-muted-foreground">drive</dt><dd className="text-right">differential · L {profile.drive.left.join(" ")} · R {profile.drive.right.join(" ")}</dd>
        <dt className="text-muted-foreground">battery</dt><dd className="text-right">{fmt(profile.power.batteryWh)} Wh · idle {fmt(profile.power.idleW)} W</dd>
      </dl>

      <div>
        <h3 className="label-caps mb-1">Wheels</h3>
        <table className="readout w-full text-[10.5px]">
          <thead className="text-muted-foreground"><tr><th className="text-left font-normal">id</th><th className="text-right font-normal">hub x, y, z (m)</th><th className="text-right font-normal">r</th><th className="text-right font-normal">μ</th><th className="text-right font-normal">τ N·m</th></tr></thead>
          <tbody>
            {profile.wheels.map((w) => (
              <tr key={w.id}><td>{w.id}{w.steerable ? "*" : ""}</td><td className="text-right">{v3(w.position)}</td><td className="text-right">{fmt(w.radius, 2)}</td><td className="text-right">{fmt(w.friction, 2)}</td><td className="text-right">{fmt(w.maxTorqueNm, 1)}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-0.5 text-[10.5px] text-muted-foreground">* steerable · max wheel speed {fmt(profile.wheels[0]!.maxAngularVelocity, 2)} rad/s</p>
      </div>

      <div>
        <h3 className="label-caps mb-1">Sensors</h3>
        {profile.sensors.length === 0 ? <p className="text-muted-foreground">None installed.</p> : (
          <table className="readout w-full text-[10.5px]">
            <tbody>
              {profile.sensors.map((s) => (
                <tr key={s.id}><td>{s.kind}{s.id.endsWith(".left") ? " L" : s.id.endsWith(".right") ? " R" : ""}</td><td className="text-right">{v3(s.position)}</td><td className="text-right">{fmt(s.rangeM)} m</td><td className="text-right">{fmt(s.fovDeg)}°</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button onClick={copy} className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border py-1.5 font-display text-[11px] font-semibold uppercase tracking-wider text-foreground hover:bg-muted">
        <Copy className="h-3.5 w-3.5" aria-hidden />Copy physics profile (JSON)
      </button>
    </div>
  );
}

export function StatsPanel() {
  const config = useRoverStore((s) => s.config);
  const reset = useRoverStore((s) => s.reset);
  const stats = useMemo(() => computeStats(config), [config]);
  const [tab, setTab] = useState<"engineering" | "physics">("engineering");
  const designation = `${getComponent(config.chassis).name} · ${getComponent(config.wheels).name.replace(" wheels", "")} wheels · ${getComponent(config.motors).name.replace(" motors", "")} motors`;
  return (
    <TooltipProvider delayDuration={120}>
      <section className="panel pointer-events-auto flex h-full w-[318px] flex-col overflow-hidden" aria-label="Engineering data">
        <div className="border-b border-hairline px-3 pt-3 pb-2.5">
          <div className="flex items-center justify-between">
            <h2 className="label-caps">Rover data</h2>
            <Segmented label="Data view" value={tab} onChange={setTab} options={[{ id: "engineering", label: "Engineering" }, { id: "physics", label: "Physics link" }]} />
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-foreground/85">{designation}</p>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-3 py-2.5">
          {tab === "engineering" ? <EngineeringTab stats={stats} /> : <PhysicsTab />}
        </div>
        <div className="border-t border-hairline px-3 py-2">
          <button
            onClick={() => { reset(); toast("Rover reset to the standard design"); }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />Reset to standard design
          </button>
        </div>
      </section>
    </TooltipProvider>
  );
}
