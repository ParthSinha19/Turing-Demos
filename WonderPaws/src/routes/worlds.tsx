import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { worlds, critterById, type CritterId } from "@/lib/critters";
import { Motes, Rivets, Stars } from "@/components/cw/parts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "WonderPaws — Worlds" },
      { name: "description", content: "Five WonderPaws worlds: Meadows, Frozen Kingdom, Jurassic Jungle, Mythical Realms and the Grand Sanctuary." },
      { property: "og:title", content: "WonderPaws — Worlds" },
      { property: "og:description", content: "Five WonderPaws worlds, each with its own palette and atmosphere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Worlds,
});

const residents: Record<string, string[]> = {
  meadows: ["chicken", "cow", "rabbit"], frozen: ["penguin"], jurassic: ["trex"], mythical: ["unicorn"], sanctuary: ["cow", "penguin", "trex", "unicorn"],
};

function Worlds() {
  const [sel, setSel] = useState(0);
  const w = worlds[sel]!;
  const res = (residents[w.id] ?? []).map((id) => critterById[id as CritterId]);
  return (
    <main className="relative h-screen min-h-[760px] overflow-hidden">
      {worlds.map((x, i) => (
        <img key={x.id} src={x.img} alt="" className={cn("absolute inset-0 h-full w-full object-cover transition-all duration-1000", i === sel ? "scale-100 opacity-100" : "scale-110 opacity-0")} />
      ))}
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, oklch(0.15 0.04 250 / .85), transparent 55%), linear-gradient(0deg, oklch(0.15 0.04 250 / .9), transparent 40%)" }} />
      <Motes count={14} />

      <Link to="/" className="cw-btn cw-btn-ghost absolute left-10 top-6 z-10 text-sm"><ArrowLeft size={16} /> Back to menu</Link>

      <div key={w.id} className="anim-rise absolute left-10 top-12 max-w-lg">
        <div className="text-sm font-bold uppercase tracking-[0.3em]" style={{ color: w.accent }}>World {sel + 1} of 5</div>
        <h2 className="cw-title-stroke mt-2 text-7xl leading-[0.95]" style={{ color: "var(--parchment)", textShadow: "0 6px 0 var(--ink)" }}>{w.name}</h2>
        <p className="mt-3 font-display text-2xl text-parchment/90">{w.tagline}</p>
        <p className="mt-2 text-parchment/75">{w.mood}</p>
        <div className="mt-4 flex gap-2">
          {w.palette.map((c) => <span key={c} className="h-9 w-9 rounded-full border-[3px] border-ink shadow-[0_3px_0_var(--ink)]" style={{ background: c }} />)}
        </div>
        <div className="mt-6 flex items-end">
          {res.map((c, i) => <img key={c.id} src={c.img} alt={c.name} className="cw-char anim-bob -ml-6 h-40 object-contain first:ml-0" style={{ animationDelay: `${-i * .6}s` }} />)}
        </div>
      </div>

      {/* tile rail */}
      <div className="absolute inset-x-0 bottom-24 flex justify-center gap-4 px-6">
        {worlds.map((x, i) => {
          const locked = i === 4;
          return (
            <button key={x.id} onClick={() => setSel(i)}
              className={cn("group relative h-44 w-56 overflow-hidden rounded-2xl border-[4px] border-ink text-left transition duration-300",
                i === sel ? "-translate-y-3 ring-4 ring-sun" : "hover:-translate-y-1.5")}
              style={{ boxShadow: "0 8px 0 var(--ink), 0 20px 30px -8px oklch(0 0 0 / .6)" }}>
              <img src={x.img} alt={x.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              {locked && i !== sel && <div className="absolute inset-0 grid place-items-center bg-ink/50"><Lock className="h-10 w-10 text-parchment drop-shadow-[0_3px_0_var(--ink)]" strokeWidth={2.5} /></div>}
              <div className="absolute inset-x-3 bottom-2">
                <div className="font-display text-lg leading-tight text-parchment" style={{ textShadow: "0 2px 0 var(--ink)" }}>{x.name}</div>
                <div className="mt-1 scale-75 origin-left"><Stars value={locked ? 0 : 3 - (i % 3)} size={20} /></div>
              </div>
              <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-ink font-display text-ink" style={{ background: x.accent }}>{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="cw-panel absolute right-10 top-12 w-64 p-4">
        <Rivets />
        <div className="font-display text-ink">Art notes</div>
        <p className="mt-1 text-sm text-ink-soft">Each world keeps the same tilt-shift diorama lens and soft lighting; only palette, materials and sky change.</p>
      </div>
    </main>
  );
}
