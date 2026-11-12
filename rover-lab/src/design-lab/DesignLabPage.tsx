import { PanelLeft, PanelRight } from "lucide-react";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { CataloguePanel } from "@/components/panels/CataloguePanel";
import { StatsPanel } from "@/components/panels/StatsPanel";
import { ControlsHint, OverlayToggles, ViewToolbar } from "@/components/panels/ViewToolbar";
import { cn } from "@/lib/utils";
import { DesignLabScene } from "./DesignLabScene";
import { installDevHooks } from "./devHooks";
import { useSimulationStore } from "@/simulation/simulationStore";
import { SandboxPage } from "@/simulation/SandboxPage";
import { SANDBOX_WORLD } from "@/simulation/world";
import { MissionsPage } from "@/missions/MissionsPage";
import { CustomLevelsPage } from "@/levels/CustomLevelsPage";

function PanelToggle({ on, onClick, label, icon: Icon }: { on: boolean; onClick: () => void; label: string; icon: typeof PanelLeft }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 font-display text-[12px] font-semibold tracking-wide transition-colors",
        on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

export function DesignLabPage() {
  const section = useSimulationStore((s) => s.section);
  const setSection = useSimulationStore((s) => s.setSection);
  const [ready, setReady] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(true);
  const [showData, setShowData] = useState(true);
  useEffect(() => installDevHooks(), []);
  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      <TopBar
        section={section}
        onNavigate={(next) => setSection(next)}
        right={section === "design" ? (
          <>
            <PanelToggle on={showCatalogue} onClick={() => setShowCatalogue((v) => !v)} label="Catalogue" icon={PanelLeft} />
            <PanelToggle on={showData} onClick={() => setShowData((v) => !v)} label="Rover data" icon={PanelRight} />
          </>
        ) : undefined}
      />
      <main className="relative min-h-0 flex-1 overflow-hidden">
        {section === "design" && <>
          <div className="absolute inset-0" data-scene-ready={ready ? "true" : undefined}>
            <DesignLabScene onReady={() => setReady(true)} />
          </div>
          <div className="viewport-vignette pointer-events-none absolute inset-0" />
          {!ready && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="panel px-4 py-3 text-sm text-muted-foreground">
                <span className="label-caps mr-2">Loading</span>Preparing the test site…
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-3 top-3 bottom-[92px] flex justify-between gap-3">
            <div className={cn("h-full transition-opacity", showCatalogue ? "opacity-100" : "pointer-events-none opacity-0")}>
              {showCatalogue && <CataloguePanel />}
            </div>
            <div className={cn("h-full transition-opacity", showData ? "opacity-100" : "pointer-events-none opacity-0")}>
              {showData && <StatsPanel />}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 px-3">
            <ControlsHint />
            <ViewToolbar>
              <OverlayToggles />
            </ViewToolbar>
          </div>
        </>}
        {section === "sandbox" && <SandboxPage world={SANDBOX_WORLD} />}
        {section === "missions" && <MissionsPage />}
        {section === "levels" && <CustomLevelsPage />}
      </main>
    </div>
  );
}
