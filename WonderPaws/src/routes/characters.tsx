import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { critters } from "@/lib/critters";
import { Meter, Motes, Rivets } from "@/components/cw/parts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/characters")({
  head: () => ({
    meta: [
      { title: "WonderPaws — Character Showcase" },
      { name: "description", content: "Meet the WonderPaws crew: hen, penguin, cow, rabbit, T-Rex and unicorn." },
      { property: "og:title", content: "WonderPaws — Character Showcase" },
      { property: "og:description", content: "Meet the WonderPaws crew: hen, penguin, cow, rabbit, T-Rex and unicorn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Characters,
});

const poses = [
  { id: "idle", label: "Idle", cls: "anim-bob" },
  { id: "happy", label: "Happy", cls: "anim-hop" },
  { id: "curious", label: "Curious", cls: "anim-sway" },
  { id: "turn", label: "Turn", cls: "-scale-x-100" },
];

function Characters() {
  const [sel, setSel] = useState(critters[0]!.id);
  const [pose, setPose] = useState("idle");
  const c = critters.find((x) => x.id === sel)!;
  const poseCls = poses.find((p) => p.id === pose)!.cls;

  return (
    <main className="relative min-h-screen overflow-hidden pb-28">
      {/* stage backdrop */}
      <div className="absolute inset-0 transition-colors duration-700" style={{ background: `radial-gradient(60% 55% at 38% 45%, color-mix(in oklab, ${c.tint} 55%, var(--glow)), color-mix(in oklab, ${c.tint} 30%, var(--ink)) 60%, var(--ink))` }} />
      <div className="absolute inset-x-0 bottom-0 h-[38%] cw-wood" style={{ maskImage: "linear-gradient(transparent, black 30%)" }} />
      <Motes count={16} />

      <div className="relative mx-auto max-w-7xl px-8 pt-6">
        <Link to="/" className="cw-btn cw-btn-ghost text-sm"><ArrowLeft size={16} /> Back to menu</Link>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-[1.25fr_1fr] gap-8 px-8 pt-4">
        {/* stage */}
        <section className="relative h-[620px]">
          <div className="cw-plate absolute left-0 top-0 px-5 py-1 font-display text-lg">THE CREW</div>
          {/* spotlight + pedestal */}
          <div className="absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2" style={{ background: "linear-gradient(180deg, oklch(1 0.05 90 / .35), transparent 80%)", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }} />
          <div className="absolute bottom-6 left-1/2 h-24 w-[62%] -translate-x-1/2 rounded-[50%] border-[4px] border-ink"
            style={{ background: "radial-gradient(ellipse at 50% 30%, var(--copper), var(--copper-deep))", boxShadow: "0 12px 0 var(--ink), 0 30px 40px oklch(0 0 0 / .5)" }} />
          <div className="absolute bottom-14 left-1/2 h-10 w-[45%] -translate-x-1/2 rounded-[50%] bg-ink/40 blur-md" />
          <div className={cn("absolute bottom-16 left-1/2 h-[520px] w-[520px] -translate-x-1/2")}>
            <div className={cn("h-full w-full", poseCls)}>
              <img key={c.id} src={c.img} alt={c.name} className="cw-char anim-rise h-full w-full object-contain" />
            </div>
          </div>
        </section>

        {/* info */}
        <section className="flex flex-col gap-5 pt-6">
          <div className="cw-panel p-6">
            <Rivets />
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-copper-deep">{c.species} · {c.world}</div>
            <h2 className="mt-1 text-5xl leading-none text-ink">{c.name}</h2>
            <div className="mt-2 inline-block rounded-full border-2 border-ink px-3 py-0.5 text-sm font-bold text-ink" style={{ background: c.tint }}>{c.trait}</div>
            <p className="mt-3 text-lg leading-snug text-ink-soft">{c.bio}</p>
            <div className="mt-4 space-y-2">
              {c.stats.map((s) => (
                <div key={s.label} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 font-display text-ink">{s.label}<Meter value={s.value} color={c.tint} /></div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              {poses.map((p) => (
                <button key={p.id} onClick={() => setPose(p.id)} className={cn("cw-btn px-4 py-1.5 text-base", pose === p.id ? "" : "cw-btn-ghost")}>{p.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {critters.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)}
                className={cn("group relative h-32 overflow-hidden rounded-2xl border-[3px] border-ink transition", sel === x.id ? "-translate-y-1 ring-4 ring-sun" : "opacity-85 hover:-translate-y-1")}
                style={{ background: `radial-gradient(circle at 50% 30%, var(--glow), ${x.tint})`, boxShadow: "0 6px 0 var(--ink)" }}>
                <img src={x.img} alt={x.name} className="cw-char absolute inset-x-0 -bottom-4 mx-auto h-36 object-contain transition group-hover:scale-110" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-0.5 text-center font-display text-sm text-parchment">{x.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
