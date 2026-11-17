import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, Settings, Check, Lock, X, Volume2, Zap, Clock, Wifi } from "lucide-react";
import { critterById, worlds, backgrounds } from "@/lib/critters";
import { CritterCard, Progress, Rivets, Stars, Gear, Ribbon } from "@/components/cw/parts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/components")({
  head: () => ({
    meta: [
      { title: "WonderPaws — UI Component Kit" },
      { name: "description", content: "Buttons, tabs, stars, panels, tiles and modals from the WonderPaws UI kit." },
      { property: "og:title", content: "WonderPaws — UI Component Kit" },
      { property: "og:description", content: "Buttons, tabs, stars, panels, tiles and modals from the WonderPaws UI kit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Kit,
});

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("cw-panel p-6 pt-8", className)}>
      <Rivets />
      <Ribbon className="absolute -top-5 left-5">{title}</Ribbon>
      {children}
    </section>
  );
}

function Kit() {
  const [tab, setTab] = useState(0);
  const [modal, setModal] = useState(false);
  const tabs = ["Factory", "Critters", "Rewards"];
  return (
    <main className="relative min-h-screen overflow-hidden pb-32">
      <img src={backgrounds.factory} alt="" className="fixed inset-0 h-full w-full object-cover opacity-40 blur-[6px]" />
      <div className="fixed inset-0 bg-ink/70" />
      <div className="relative mx-auto max-w-7xl px-8 pt-10">
        <div className="mb-10 flex items-center gap-4">
          <Gear size={56} className="anim-spin" color="var(--sun)" />
          <h2 className="cw-title-stroke text-6xl text-parchment" style={{ textShadow: "0 5px 0 var(--ink)" }}>UI Component Kit</h2>
        </div>

        <div className="grid grid-cols-12 items-start gap-x-6 gap-y-12">
          <Section title="Buttons" className="col-span-7">
            <div className="flex flex-wrap items-center gap-4">
              <button className="cw-btn text-2xl px-8 py-3"><Play className="h-6 w-6 fill-ink" /> Play</button>
              <button className="cw-btn cw-btn-teal text-lg">Secondary</button>
              <button className="cw-btn cw-btn-tomato text-lg">Danger</button>
              <button className="cw-btn cw-btn-ghost text-lg">Ghost</button>
              <button className="cw-btn cw-btn-ghost cw-round" aria-label="Settings"><Settings className="h-5 w-5" strokeWidth={2.8} /></button>
              <button className="cw-btn cw-btn-teal cw-round" aria-label="Sound"><Volume2 className="h-5 w-5" strokeWidth={2.8} /></button>
              <button className="cw-btn text-lg opacity-50 grayscale" disabled>Disabled</button>
            </div>
          </Section>

          <Section title="Tabs" className="col-span-5">
            <div className="inline-flex rounded-2xl border-[3px] border-ink bg-ink/85 p-1.5">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} className={cn("rounded-xl px-5 py-2 font-display text-lg transition", tab === i ? "bg-sun text-ink shadow-[inset_0_-4px_0_var(--sun-deep)]" : "text-parchment/70 hover:text-parchment")}>{t}</button>
              ))}
            </div>
            <div className="mt-4 flex gap-1">
              {tabs.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} className={cn("rounded-t-xl border-[3px] border-b-0 border-ink px-4 pb-1.5 pt-2 font-display transition", tab === i ? "bg-teal text-parchment" : "translate-y-1 bg-parchment-deep text-ink/70")}>{t}</button>
              ))}
            </div>
            <div className="h-2 rounded-b border-[3px] border-t-0 border-ink bg-teal" />
          </Section>

          <Section title="Progress & Stars" className="col-span-5">
            <div className="space-y-4">
              <Progress value={72} label="World progress" />
              <Progress value={30} label="Shift bonus" />
              <div className="flex items-center justify-between pt-2">
                <Stars value={3} size={34} /><Stars value={2} size={28} /><Stars value={0} size={22} />
              </div>
            </div>
          </Section>

          <Section title="Status" className="col-span-7">
            <div className="flex flex-wrap gap-3">
              {[
                { l: "Complete", i: Check, c: "var(--leaf)" },
                { l: "New!", i: Zap, c: "var(--sun)" },
                { l: "Locked", i: Lock, c: "var(--parchment-deep)" },
                { l: "02:15", i: Clock, c: "var(--ice)" },
                { l: "Offline", i: Wifi, c: "var(--tomato)" },
              ].map(({ l, i: I, c }) => (
                <span key={l} className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-ink px-3 py-1 font-display text-ink shadow-[0_3px_0_var(--ink)]" style={{ background: c }}><I className="h-4 w-4" strokeWidth={3} />{l}</span>
              ))}
              <span className="relative inline-grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-teal font-display text-parchment">
                7<span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-ink bg-tomato anim-pulse" />
              </span>
            </div>
          </Section>

          <div className="col-span-4"><CritterCard c={critterById.trex} /></div>
          <div className="col-span-4"><CritterCard c={critterById.unicorn} /></div>
          <Section title="Mission" className="col-span-4">
            <p className="font-display text-xl text-ink">Guide Rexford's eggs to the jungle nest.</p>
            <div className="mt-3"><Progress value={66} /></div>
            <div className="mt-3 flex items-center justify-between text-sm font-bold text-ink-soft"><span>2 / 3 sorted</span><Stars value={1} size={18} /></div>
          </Section>

          <Section title="World tiles" className="col-span-7">
            <div className="grid grid-cols-3 gap-4">
              {worlds.slice(0, 3).map((w, i) => (
                <div key={w.id} className="group relative h-36 overflow-hidden rounded-2xl border-[4px] border-ink shadow-[0_6px_0_var(--ink)]">
                  <img src={w.img} alt={w.name} className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
                  <div className="absolute bottom-2 left-3 font-display text-parchment" style={{ textShadow: "0 2px 0 var(--ink)" }}>{w.name}</div>
                  {i === 2 && <div className="absolute inset-0 grid place-items-center bg-ink/55"><Lock className="h-8 w-8 text-parchment" strokeWidth={2.5} /></div>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Level tiles" className="col-span-5">
            <div className="grid grid-cols-4 gap-4">
              {[3, 3, 2, 1, 0, -1, -1, -1].map((s, i) => {
                const locked = s < 0, current = i === 4;
                return (
                  <div key={i} className={cn("relative grid aspect-square place-items-center rounded-2xl border-[3px] border-ink font-display text-3xl shadow-[0_5px_0_var(--ink)]",
                    locked ? "bg-parchment-deep text-ink/40" : current ? "bg-sun text-ink anim-bob" : "bg-teal text-parchment")}
                    style={!locked ? { boxShadow: `inset 0 -5px 0 ${current ? "var(--sun-deep)" : "var(--teal-deep)"}, 0 5px 0 var(--ink)` } : undefined}>
                    {locked ? <Lock className="h-6 w-6" strokeWidth={3} /> : i + 1}
                    {s > 0 && <div className="absolute -bottom-3 scale-[.55]"><Stars value={s} size={22} /></div>}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="mt-10 text-center"><button className="cw-btn text-xl" onClick={() => setModal(true)}>Open modal</button></div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/70 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="cw-panel anim-rise relative w-[460px] px-8 pb-8 pt-20 text-center" onClick={(e) => e.stopPropagation()}>
            <Rivets />
            <img src={critterById.chicken.img} alt="" className="cw-char anim-hop absolute -top-28 left-1/2 h-48 -translate-x-1/2" />
            <button onClick={() => setModal(false)} className="cw-btn cw-btn-tomato cw-round absolute -right-4 -top-4" aria-label="Close"><X className="h-5 w-5" strokeWidth={3.5} /></button>
            <Ribbon>Shift Complete!</Ribbon>
            <div className="mt-5 flex justify-center"><Stars value={3} size={48} /></div>
            <p className="mt-4 text-lg text-ink-soft">Henrietta's chicks are all tucked in. Great work, Chief!</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="cw-btn cw-btn-ghost" onClick={() => setModal(false)}>Replay</button>
              <button className="cw-btn shine" onClick={() => setModal(false)}>Next <Play className="h-4 w-4 fill-ink" /></button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
