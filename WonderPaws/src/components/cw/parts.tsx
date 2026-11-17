import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { critterById } from "@/lib/critters";
import { animalVisuals } from "@/game/animals";
import type { Critter } from "@/lib/critters";
import type { Animal } from "@/game/types";
import type { ReactNode } from "react";

export function Rivets() {
  const pos = ["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"];
  return (
    <>
      {pos.map((p) => (
        <span key={p} aria-hidden className={cn("pointer-events-none absolute h-2.5 w-2.5 rounded-full", p)}
          style={{ background: "radial-gradient(circle at 35% 30%, var(--glow), var(--copper) 45%, var(--copper-deep))", boxShadow: "0 1px 1px oklch(0 0 0 / .4)" }} />
      ))}
    </>
  );
}

export function Stars({ value, max = 3, size = 28 }: { value: number; max?: number; size?: number }) {
  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const on = i < value;
        const mid = max === 3 && i === 1;
        return (
          <Star key={i} width={mid ? size * 1.25 : size} height={mid ? size * 1.25 : size}
            className={cn("transition", on ? "fill-sun text-ink" : "fill-ink/25 text-ink/40")} strokeWidth={2.2}
            style={on ? { filter: "drop-shadow(0 3px 0 var(--sun-deep))" } : undefined} />
        );
      })}
    </div>
  );
}

export function Meter({ value, max = 5, color = "var(--teal)" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="h-2.5 flex-1 rounded-full border border-ink/40"
          style={{ background: i < value ? color : "oklch(0.24 0.04 250 / 0.1)", boxShadow: i < value ? "inset 0 -2px 0 oklch(0 0 0 / .2)" : undefined }} />
      ))}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label && <div className="mb-1 flex justify-between font-display text-sm text-ink"><span>{label}</span><span>{value}%</span></div>}
      <div className="h-5 overflow-hidden rounded-full border-[3px] border-ink bg-ink/80 p-0.5">
        <div className="shine h-full rounded-full" style={{ width: `${value}%`, background: "linear-gradient(180deg, oklch(0.82 0.17 140), var(--leaf) 50%, oklch(0.55 0.15 145))", boxShadow: "inset 0 2px 0 oklch(1 0 0 / .4)" }} />
      </div>
    </div>
  );
}

export function Ribbon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="cw-plate px-6 py-1.5 font-display text-lg tracking-wide">{children}</div>
    </div>
  );
}

export function CritterCard({ c, compact }: { c: Critter; compact?: boolean }) {
  return (
    <div className="cw-panel p-4">
      <Rivets />
      <div className="flex gap-3">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border-[3px] border-ink"
          style={{ background: `radial-gradient(circle at 50% 35%, var(--glow), ${c.tint})` }}>
          <img src={c.img} alt={c.name} className="cw-char h-[115%] w-[115%] translate-y-2 object-contain" loading="lazy" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl leading-tight text-ink">{c.name}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-copper-deep">{c.species}</div>
          {!compact && <p className="mt-1 text-sm leading-snug text-ink-soft">{c.bio}</p>}
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {c.stats.map((s) => (
          <div key={s.label} className="grid grid-cols-[3.5rem_1fr] items-center gap-2 text-xs font-bold text-ink-soft">
            {s.label}<Meter value={s.value} color={c.tint} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders any game animal using its base archetype sprite, with a per-species tint and
 * badge (see `animalVisuals`) layered on top so reused sprites (e.g. every Arctic mammal
 * sharing the rabbit or cow art) stay visually distinguishable. Falls back to the plain
 * sprite for species that are already a true match for their assetKey (no entry needed).
 */
export function AnimalSprite({ animal, className, badgeSize = 18, showBadge = true, grayscaleUndiscovered = false }: { animal: Animal; className?: string; badgeSize?: number; showBadge?: boolean; grayscaleUndiscovered?: boolean }) {
  const critter = critterById[animal.assetKey];
  const visual = animalVisuals[animal.id];
  return (
    <span className="relative inline-block h-full w-full">
      <img
        src={critter.img}
        alt={animal.displayName}
        className={cn(className, grayscaleUndiscovered && "grayscale opacity-35")}
        style={visual?.filter ? { filter: visual.filter } : undefined}
        loading="lazy"
      />
      {showBadge && visual?.badge && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 grid place-items-center rounded-full border-2 border-ink bg-white leading-none"
          style={{ height: badgeSize, width: badgeSize, fontSize: badgeSize * 0.6, boxShadow: "0 2px 0 var(--ink)" }}
        >
          {visual.badge}
        </span>
      )}
    </span>
  );
}

/** Decorative spinning gear in SVG. */
export function Gear({ size = 80, className, color = "var(--copper)" }: { size?: number; className?: string; color?: string }) {
  const teeth = 10;
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} className={className} aria-hidden>
      <g fill={color} stroke="var(--ink)" strokeWidth="3">
        <path d={Array.from({ length: teeth }).map((_, i) => {
          const a = (i / teeth) * Math.PI * 2, w = Math.PI / teeth / 1.6;
          const p = (r: number, t: number) => `${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`;
          return `${i ? "L" : "M"}${p(36, a - w * 1.4)} L${p(46, a - w)} L${p(46, a + w)} L${p(36, a + w * 1.4)}`;
        }).join(" ") + "Z"} />
        <circle r="14" fill="var(--parchment-deep)" />
        <circle r="5" fill="var(--ink)" stroke="none" />
      </g>
    </svg>
  );
}

/** Floating dust motes / sparkles for atmosphere. */
export function Motes({ count = 18, color = "var(--glow)" }: { count?: number; color?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const s = 3 + ((i * 7) % 5);
        return (
          <span key={i} className="absolute rounded-full"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 85}%`, width: s, height: s, background: color, boxShadow: `0 0 10px ${color}`,
              animation: `twinkle ${2.5 + (i % 4)}s ease-in-out ${(i % 6) * 0.4}s infinite` }} />
        );
      })}
    </div>
  );
}
