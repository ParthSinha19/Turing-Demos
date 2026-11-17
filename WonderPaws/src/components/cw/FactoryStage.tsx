import { backgrounds, critterById, worlds, type CritterId } from "@/lib/critters";
import { animalVisuals } from "@/game/animals";
import type { Animal } from "@/game/types";
import { Gear, Motes } from "./parts";

type FactoryRoute = { id: string; name: string; animal: Pick<Animal, "id" | "assetKey">; destination: string; passed: boolean };
/** A rider can be a bare archetype id (showcase pages, no tint/badge) or a real game Animal (gets its own tint + badge). */
type FactoryRider = CritterId | Pick<Animal, "id" | "assetKey" | "displayName">;

/** Per-world ambient treatment layered over the shared factory floor so the environment reads as "this world" rather than always the same generic hall. */
const worldAmbience: Record<string, { overlay: string; motesColor: string }> = {
  meadows: { overlay: "linear-gradient(180deg, transparent 55%, oklch(0.55 0.12 70 / .12))", motesColor: "var(--sun)" },
  frozen: { overlay: "linear-gradient(180deg, oklch(0.85 0.08 220 / .3), oklch(0.6 0.1 240 / .28) 55%, oklch(0.75 0.15 180 / .22))", motesColor: "var(--ice)" },
  jurassic: { overlay: "linear-gradient(180deg, oklch(0.6 0.14 70 / .2), transparent 45%, oklch(0.4 0.1 150 / .25))", motesColor: "var(--copper)" },
  mythical: { overlay: "linear-gradient(180deg, oklch(0.55 0.18 305 / .28), transparent 50%, oklch(0.75 0.13 340 / .2))", motesColor: "var(--plum)" },
  sanctuary: { overlay: "linear-gradient(180deg, oklch(0.8 0.15 80 / .22), transparent 50%, oklch(0.7 0.15 140 / .18))", motesColor: "var(--sun)" },
};

function riderSprite(rider: FactoryRider): { img: string; name: string; filter?: string; badge?: string } {
  if (typeof rider === "string") {
    const critter = critterById[rider];
    return { img: critter.img, name: critter.name };
  }
  const critter = critterById[rider.assetKey];
  const visual = animalVisuals[rider.id];
  return {
    img: critter.img,
    name: rider.displayName ?? critter.name,
    ...(visual?.filter ? { filter: visual.filter } : {}),
    ...(visual?.badge ? { badge: visual.badge } : {}),
  };
}

export function FactoryStage({ riders = ["chicken", "rabbit", "penguin", "unicorn"], routes = [], worldId = "meadows" }: { riders?: FactoryRider[]; routes?: FactoryRoute[]; worldId?: string }) {
  // Frozen Kingdom gets its ice-and-aurora backdrop, Jurassic its humid green haze, and so on — the
  // conveyor floor itself (belt, chutes, gears) stays consistent, but the room behind it now changes
  // with the world instead of always showing the same generic factory, whichever level you're in.
  const worldArt = worlds.find((item) => item.id === worldId);
  const ambience = worldAmbience[worldId] ?? worldAmbience["meadows"]!;
  const backgroundImg = worldId !== "meadows" && worldArt ? worldArt.img : backgrounds.factory;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img key={backgroundImg} src={backgroundImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {/* world-tinted atmosphere so Arctic/Jungle/Mythical/Sanctuary read as distinct rooms, not re-skins of the same hall */}
      <div className="pointer-events-none absolute inset-0" style={{ background: ambience.overlay }} />
      {/* light shafts */}
      <div className="anim-pulse pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: "linear-gradient(115deg, transparent 20%, oklch(0.95 0.1 85 / .25) 28%, transparent 36%, transparent 48%, oklch(0.95 0.1 85 / .2) 55%, transparent 62%)" }} />
      <Motes count={26} color={ambience.motesColor} />
      {/* foreground belt with riding critters */}
      <div className="absolute inset-x-0 bottom-[9%] h-[22%]">
        {riders.map((rider, i) => {
          const sprite = riderSprite(rider);
          const key = typeof rider === "string" ? `${rider}-${i}` : rider.id;
          return (
            <div key={key} className="absolute bottom-[42%] left-0 h-full w-full"
              style={{ animation: `ride 22s linear ${-i * 5.5}s infinite` }}>
              <span className="relative inline-block h-[150%] -translate-y-[10%]">
                <img src={sprite.img} alt={sprite.name} className="cw-char anim-bob h-full object-contain" style={{ animationDelay: `${-i * .7}s`, filter: sprite.filter }} />
                {sprite.badge && (
                  <span aria-hidden className="absolute -right-1 top-0 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-white text-sm leading-none" style={{ boxShadow: "0 2px 0 var(--ink)" }}>{sprite.badge}</span>
                )}
              </span>
            </div>
          );
        })}
        <div className="absolute inset-x-0 bottom-[30%] h-[18%] border-y-[4px] border-ink cw-belt" style={{ boxShadow: "0 10px 0 var(--teal-deep), 0 14px 0 var(--ink), 0 30px 40px oklch(0 0 0 / .5)" }} />
        <div className="absolute inset-x-0 bottom-[12%] flex justify-around">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-10 w-3 rounded-b border-2 border-ink" style={{ background: "var(--teal-deep)" }} />
          ))}
        </div>
      </div>
      {routes.length > 0 && (
        <div className="absolute inset-x-4 bottom-[34%] z-10 flex flex-wrap justify-center gap-2">
          {routes.map((route, index) => {
            const critter = critterById[route.animal.assetKey];
            const visual = animalVisuals[route.animal.id];
            return (
              <div key={route.id} className={`anim-rise flex items-center gap-2 rounded-xl border-[2px] border-ink px-2 py-1 shadow-lg ${route.passed ? "bg-leaf text-ink" : "bg-tomato text-white"}`} style={{ animationDelay: `${index * 90}ms` }}>
                <img src={critter.img} alt="" className="h-7 w-7 object-contain" style={{ filter: visual?.filter }} />
                <span className="max-w-24 truncate text-[10px] font-extrabold">{route.name}: {route.destination}</span>
              </div>
            );
          })}
        </div>
      )}
      {/* gears */}
      <Gear size={150} className="anim-spin absolute -left-10 bottom-[2%] opacity-95" />
      <Gear size={90} className="anim-spin-rev absolute left-20 bottom-[1%]" color="var(--teal)" />
      <Gear size={130} className="anim-spin-rev absolute -right-8 bottom-[4%]" color="var(--sun-deep)" />
      <div className="cw-vignette pointer-events-none absolute inset-0" />
    </div>
  );
}
