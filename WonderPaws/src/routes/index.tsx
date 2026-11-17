import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, Trophy, PawPrint, Play, Volume2 } from "lucide-react";
import { backgrounds, critterById } from "@/lib/critters";
import { Motes } from "@/components/cw/parts";
import { Logo } from "@/components/cw/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WonderPaws — The Great Animal Factory" },
      { name: "description", content: "Build clever programs, sort extraordinary animals and grow the greatest sanctuary in the world." },
      { property: "og:title", content: "WonderPaws — The Great Animal Factory" },
      { property: "og:description", content: "Build clever programs, sort extraordinary animals and grow the greatest sanctuary in the world." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MainMenu,
});

function MainMenu() {
  const hen = critterById.chicken, cow = critterById.cow, rabbit = critterById.rabbit, penguin = critterById.penguin;
  return (
    <main className="relative h-screen min-h-[720px] w-full overflow-hidden">
      <img src={backgrounds.menu} alt="" className="absolute inset-0 h-full w-full scale-105 object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.3 0.08 280 / .25), transparent 35%, transparent 60%, oklch(0.15 0.04 250 / .7))" }} />
      <div className="cw-vignette absolute inset-0" />
      <Motes count={22} />

      {/* top bar */}
      <div className="absolute left-6 right-6 top-5 flex items-center justify-between">
        <div className="cw-panel-dark flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-ink" style={{ background: "var(--sun)" }}>
            <img src={rabbit.img} alt="" className="h-14 w-14 translate-y-2 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-parchment">Factory Chief</div>
            <div className="text-xs font-semibold text-parchment/70">Badge: Bright Spark</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="cw-btn cw-btn-ghost cw-round" aria-label="Sound"><Volume2 className="h-5 w-5" strokeWidth={2.8} /></button>
          <button className="cw-btn cw-btn-ghost cw-round" aria-label="Settings"><Settings className="h-5 w-5" strokeWidth={2.8} /></button>
        </div>
      </div>

      {/* title */}
      <div className="anim-rise absolute left-1/2 top-[11%] -translate-x-1/2">
        <Logo />
      </div>

      {/* characters */}
      <img src={cow.img} alt="Bessie the cow" className="cw-char anim-sway absolute bottom-0 left-[3%] h-[52%]" style={{ animationDelay: "-1s" }} />
      <img src={hen.img} alt="Henrietta and Pip" className="cw-char anim-bob absolute bottom-[2%] left-[22%] h-[36%]" />
      <img src={penguin.img} alt="Admiral Waddle" className="cw-char anim-sway absolute bottom-0 right-[3%] h-[48%] -scale-x-100" />
      <img src={rabbit.img} alt="Juniper the rabbit" className="cw-char anim-hop absolute bottom-[6%] right-[24%] h-[34%]" />

      {/* menu */}
      <div className="anim-rise absolute left-1/2 top-[52%] flex -translate-x-1/2 flex-col items-center gap-5" style={{ animationDelay: ".2s" }}>
        <Link to="/interface" className="cw-btn shine px-14 py-4 text-4xl">
          <Play className="h-8 w-8 fill-ink" strokeWidth={2.5} /> PLAY
        </Link>
        <div className="flex gap-3">
          <Link to="/characters" className="cw-btn cw-btn-teal text-lg"><PawPrint className="h-5 w-5" /> Critters</Link>
          <Link to="/worlds" className="cw-btn cw-btn-teal text-lg"><Trophy className="h-5 w-5" /> Worlds</Link>
        </div>
      </div>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-widest text-parchment/60">BUILD CLEVER PROGRAMS · GROW YOUR SANCTUARY</div>
    </main>
  );
}
