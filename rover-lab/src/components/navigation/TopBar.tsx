import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { AppSection } from "@/simulation/simulationStore";

const SECTIONS: { id: AppSection; label: string }[] = [
  { id: "design", label: "Design Lab" },
  { id: "sandbox", label: "Sandbox" },
  { id: "missions", label: "Missions" },
  { id: "levels", label: "Custom Levels" },
];

export function TopBar({ right, section, onNavigate }: { right?: ReactNode; section: AppSection; onNavigate: (section: AppSection) => void }) {
  return (
    <header className="pointer-events-auto relative z-40 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-panel-strong px-3 backdrop-blur md:gap-6 md:px-4">
      <div className="flex shrink-0 items-center gap-2.5">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-signal" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="6" cy="17" r="3" /><circle cx="18" cy="17" r="3" /><path d="M6 14 L10 8 H16 L18 14" /><path d="M13 8 V4 H16" />
        </svg>
        <span className="font-display text-xs font-bold tracking-[0.15em] text-foreground md:text-sm">ROVER LAB</span>
      </div>
      <nav className="flex h-full min-w-0 items-stretch overflow-x-auto" aria-label="Sections">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={section === item.id ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center px-2 font-display text-[11px] font-semibold tracking-wide transition-colors md:px-3 md:text-[13px]",
              section === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {section === item.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-signal md:inset-x-3" />}
          </button>
        ))}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-3">{right}</div>
    </header>
  );
}
