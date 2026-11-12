import { Check, CircleDot, Cog, Package, Radar, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CATALOGUE, CATEGORY_INFO, getComponent, type Category, type ComponentSpec } from "@/rover/catalogue";
import { applyComponent, canInstall, isInstalled, type RoverConfiguration } from "@/rover/configuration";
import { computeStats, type RoverStats } from "@/rover/stats";
import { useLabStore } from "@/state/labStore";
import { useRoverStore } from "@/state/roverStore";
import { fmt, kmh, signed } from "./format";

const ICONS: Record<Category, typeof Package> = { chassis: Package, wheels: CircleDot, motors: Cog, sensors: Radar, attachments: Wrench };
const ORDER: Category[] = ["chassis", "wheels", "motors", "sensors", "attachments"];

function specLine(c: ComponentSpec): string {
  switch (c.category) {
    case "chassis": return `${fmt(c.lengthM, 2)} × ${fmt(c.widthM, 2)} m · ${fmt(c.batteryWh)} Wh · ${c.payloadSlots} payload slot${c.payloadSlots > 1 ? "s" : ""} · ${fmt(c.massKg)} kg`;
    case "wheels": return `Ø ${fmt(c.radiusM * 2, 2)} m · ${fmt(c.widthM, 2)} m wide · grip ${fmt(c.grip, 2)} · ${fmt(c.massKg, 1)} kg ×6`;
    case "motors": return `${fmt(c.torqueNm, 1)} N·m · ${fmt(c.wheelRpm)} rpm · ${fmt(c.powerW)} W · ${fmt(c.massKg, 1)} kg ×6`;
    case "sensors": return `Range ${fmt(c.rangeM)} m · view ${fmt(c.fovDeg)}° · ${fmt(c.powerW)} W · ${fmt(c.massKg, 1)} kg`;
    case "attachments": return `${fmt(c.massKg)} kg · ${fmt(c.powerW)} W${c.batteryWh ? ` · +${fmt(c.batteryWh)} Wh` : ""}${c.clearanceLossM ? ` · −${fmt(c.clearanceLossM, 2)} m clearance` : ""}`;
  }
}

const DELTA_FIELDS: { label: string; unit: string; digits: number; get: (s: RoverStats) => number; better: "higher" | "lower" }[] = [
  { label: "Mass", unit: "kg", digits: 1, get: (s) => s.massKg, better: "lower" },
  { label: "Clearance", unit: "m", digits: 2, get: (s) => s.groundClearanceM, better: "higher" },
  { label: "Speed", unit: "km/h", digits: 1, get: (s) => kmh(s.maxSpeedMs), better: "higher" },
  { label: "Climb", unit: "°", digits: 0, get: (s) => s.maxSlopeDeg, better: "higher" },
  { label: "Step", unit: "m", digits: 2, get: (s) => s.stepHeightM, better: "higher" },
  { label: "Range", unit: "km", digits: 1, get: (s) => s.rangeKm, better: "higher" },
];

function DeltaPreview({ current, next }: { current: RoverStats; next: RoverStats }) {
  const rows = DELTA_FIELDS.map((f) => ({ ...f, d: f.get(next) - f.get(current) })).filter((r) => Math.abs(r.d) >= Math.pow(10, -r.digits) / 2);
  if (rows.length === 0) return <p className="text-[11px] text-muted-foreground">No change to the main figures.</p>;
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {rows.map((r) => {
        const good = r.better === "higher" ? r.d > 0 : r.d < 0;
        return (
          <span key={r.label} className="readout text-[11px]">
            <span className="text-muted-foreground">{r.label} </span>
            <span className={good ? "text-positive" : "text-negative"}>{signed(r.d, r.digits)} {r.unit}</span>
          </span>
        );
      })}
    </div>
  );
}

function ComponentCard({ spec, config, stats }: { spec: ComponentSpec; config: RoverConfiguration; stats: RoverStats }) {
  const install = useRoverStore((s) => s.install);
  const setHovered = useLabStore((s) => s.setHovered);
  const [hover, setHover] = useState(false);
  const installed = isInstalled(config, spec.id);
  const multi = CATEGORY_INFO[spec.category].multi;
  const check = canInstall(config, spec.id);
  const blocked = !installed && !check.ok;
  const preview = useMemo(() => (hover && !(installed && !multi) ? computeStats(applyComponent(config, spec.id).config) : null), [hover, installed, multi, config, spec.id]);

  const onClick = () => {
    if (blocked || (installed && !multi)) return;
    const before = computeStats(config);
    const res = install(spec.id);
    const after = computeStats(res.config);
    const removedNow = installed && multi;
    const parts: string[] = [];
    if (Math.abs(after.massKg - before.massKg) > 0.05) parts.push(`mass ${fmt(before.massKg, 1)} → ${fmt(after.massKg, 1)} kg`);
    if (Math.abs(after.groundClearanceM - before.groundClearanceM) > 0.005) parts.push(`clearance ${fmt(before.groundClearanceM, 2)} → ${fmt(after.groundClearanceM, 2)} m`);
    if (Math.abs(after.maxSlopeDeg - before.maxSlopeDeg) > 0.5) parts.push(`climb ${fmt(before.maxSlopeDeg)}° → ${fmt(after.maxSlopeDeg)}°`);
    toast(removedNow ? `Removed ${spec.name}` : `Installed ${spec.name}`, {
      description: [parts.length ? `${parts.join(" · ")}.` : "", res.removed.length ? `Removed ${res.removed.map((r) => r.name).join(", ")}: no free payload slot.` : ""].filter(Boolean).join(" "),
    });
  };

  const action = installed ? (multi ? "Remove" : "Installed") : blocked ? "No slot" : "Install";
  return (
    <li>
      <div
        role="group"
        aria-label={spec.name}
        onMouseEnter={() => { setHover(true); setHovered(spec.id); }}
        onMouseLeave={() => { setHover(false); setHovered(null); }}
        className={cn(
          "rounded-md border p-2.5 transition-colors",
          installed ? "border-signal/40 bg-signal-dim" : "border-hairline bg-muted/40 hover:border-border hover:bg-muted/70",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {installed && <Check className="h-3.5 w-3.5 shrink-0 text-signal" aria-hidden />}
              <h3 className="font-display text-[13px] font-semibold tracking-wide text-foreground">{spec.name}</h3>
            </div>
            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{spec.summary}</p>
          </div>
          <button
            onClick={onClick}
            disabled={blocked || (installed && !multi)}
            aria-label={`${action} ${spec.name}`}
            className={cn(
              "shrink-0 rounded px-2 py-1 font-display text-[11px] font-semibold uppercase tracking-wider transition-colors",
              installed && !multi && "cursor-default text-signal",
              installed && multi && "border border-border text-foreground hover:border-negative hover:text-negative",
              !installed && !blocked && "bg-primary text-primary-foreground hover:bg-primary/85",
              blocked && "cursor-not-allowed border border-hairline text-muted-foreground",
            )}
          >
            {action}
          </button>
        </div>
        <p className="readout mt-1.5 text-[11px] text-foreground/80">{specLine(spec)}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 text-[11px]">
          {spec.pros.map((p) => <span key={p} className="text-positive/90">+ {p}</span>)}
          {spec.cons.map((c) => <span key={c} className="text-caution/90">− {c}</span>)}
        </div>
        {blocked && !check.ok && <p className="mt-1.5 text-[11px] leading-snug text-caution">{check.reason}</p>}
        {preview && (
          <div className="mt-2 border-t border-hairline pt-1.5 animate-fade-up">
            <div className="label-caps mb-0.5 text-[10px]">{installed ? "If removed" : "If installed"}</div>
            <DeltaPreview current={stats} next={preview} />
          </div>
        )}
      </div>
    </li>
  );
}

export function CataloguePanel() {
  const config = useRoverStore((s) => s.config);
  const requestView = useLabStore((s) => s.requestView);
  const [category, setCategory] = useState<Category>("wheels");
  const stats = useMemo(() => computeStats(config), [config]);
  const items = CATALOGUE.filter((c) => c.category === category);
  const info = CATEGORY_INFO[category];
  const slotNote = category === "attachments" ? `${stats.payloadUsed} of ${stats.payloadSlots} payload slots used` : category === "sensors" ? `${config.sensors.length} installed` : `Installed: ${getComponent(config[category as "chassis" | "wheels" | "motors"]).name}`;

  return (
    <section className="panel pointer-events-auto flex h-full w-[320px] flex-col overflow-hidden" aria-label="Component catalogue">
      <div className="border-b border-hairline px-3 pt-3 pb-2">
        <h2 className="label-caps">Component catalogue</h2>
        <div role="tablist" aria-label="Categories" className="mt-2 grid grid-cols-5 gap-1">
          {ORDER.map((c) => {
            const Icon = ICONS[c];
            const active = c === category;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => { setCategory(c); requestView(c); }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md py-1.5 font-display text-[10px] font-semibold tracking-wide transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-signal")} aria-hidden />
                {CATEGORY_INFO[c].label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[12px] leading-snug text-muted-foreground">{info.blurb}</p>
        <p className="readout mt-1 text-[11px] text-signal">{slotNote}</p>
      </div>
      <ul className="scroll-thin flex-1 space-y-2 overflow-y-auto px-3 pt-1 pb-3">
        {items.map((spec) => <ComponentCard key={spec.id} spec={spec} config={config} stats={stats} />)}
      </ul>
    </section>
  );
}
