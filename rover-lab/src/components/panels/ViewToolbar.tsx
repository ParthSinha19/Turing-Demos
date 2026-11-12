import { Box, Eye, Gauge, Layers, Move3d } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUALITY, type QualityLevel } from "@/scene/quality";
import { useLabStore, type CameraView } from "@/state/labStore";

const VIEWS: { id: CameraView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "rear", label: "Rear" },
  { id: "top", label: "Top" },
  { id: "underside", label: "Underside" },
];

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T | null; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center rounded-md bg-muted/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-[5px] px-2.5 py-1 font-display text-[12px] font-semibold tracking-wide transition-colors",
            value === o.id ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ViewToolbar({ children }: { children?: React.ReactNode }) {
  const view = useLabStore((s) => s.view);
  const requestView = useLabStore((s) => s.requestView);
  const quality = useLabStore((s) => s.quality);
  const setQuality = useLabStore((s) => s.setQuality);
  const isPreset = VIEWS.some((v) => v.id === view);
  return (
    <div className="panel pointer-events-auto flex flex-wrap items-center gap-3 px-2.5 py-2">
      <div className="flex items-center gap-2">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <Segmented label="Camera view" value={isPreset ? view : null} options={VIEWS} onChange={requestView} />
      </div>
      {children}
      <div className="flex items-center gap-2">
        <Gauge className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <Segmented<QualityLevel>
          label="Graphics quality"
          value={quality}
          options={(Object.keys(QUALITY) as QualityLevel[]).map((q) => ({ id: q, label: QUALITY[q].label }))}
          onChange={setQuality}
        />
      </div>
    </div>
  );
}

const OVERLAYS = [
  { id: "mounts", label: "Mount points" },
  { id: "coverage", label: "Sensor range" },
  { id: "collision", label: "Collision" },
] as const;

export function OverlayToggles() {
  const overlays = useLabStore((s) => s.overlays);
  const toggle = useLabStore((s) => s.toggleOverlay);
  return (
    <div className="flex items-center gap-2">
      <Layers className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <div className="flex items-center rounded-md bg-muted/70 p-0.5" role="group" aria-label="Overlays">
        {OVERLAYS.map((o) => (
          <button
            key={o.id}
            aria-pressed={overlays[o.id]}
            onClick={() => toggle(o.id)}
            className={cn(
              "rounded-[5px] px-2.5 py-1 font-display text-[12px] font-semibold tracking-wide transition-colors",
              overlays[o.id] ? "bg-signal-dim text-signal" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ControlsHint() {
  return (
    <div className="pointer-events-none flex items-center gap-3 rounded-md bg-panel px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
      <span className="flex items-center gap-1.5"><Move3d className="h-3.5 w-3.5" aria-hidden />Drag to orbit</span>
      <span>Scroll to zoom</span>
      <span className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5" aria-hidden />Right-drag or two fingers to pan</span>
    </div>
  );
}
