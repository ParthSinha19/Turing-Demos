import chicken from "@/assets/char-chicken.png";
import penguin from "@/assets/char-penguin.png";
import cow from "@/assets/char-cow.png";
import rabbit from "@/assets/char-rabbit.png";
import trex from "@/assets/char-trex.png";
import unicorn from "@/assets/char-unicorn.png";
import meadows from "@/assets/world-meadows.jpg";
import frozen from "@/assets/world-frozen.jpg";
import jurassic from "@/assets/world-jurassic.jpg";
import mythical from "@/assets/world-mythical.jpg";
import sanctuary from "@/assets/world-sanctuary.jpg";
import menuBg from "@/assets/bg-menu.jpg";
import factoryBg from "@/assets/bg-factory.jpg";

export const backgrounds = { menu: menuBg, factory: factoryBg };

export type Critter = {
  id: string;
  name: string;
  species: string;
  img: string;
  trait: string;
  bio: string;
  world: string;
  /** CSS colour (token var) used for the character's signature tint */
  tint: string;
  stats: { label: string; value: number }[];
};

export const critters: Critter[] = [
  { id: "chicken", name: "Henrietta & Pip", species: "Hen & chick", img: chicken, trait: "Cheerful foreman", world: "Domestic Meadows", tint: "var(--sun)", bio: "Runs the morning shift with a wave and a cluck. Pip follows everywhere.", stats: [{ label: "Speed", value: 3 }, { label: "Cheer", value: 5 }, { label: "Size", value: 2 }] },
  { id: "penguin", name: "Admiral Waddle & Puff", species: "Emperor penguin & chick", img: penguin, trait: "Calm & dependable", world: "Frozen Kingdom", tint: "var(--ice)", bio: "Never loses his scarf, never loses his cool. Puff is still learning to slide.", stats: [{ label: "Speed", value: 2 }, { label: "Cheer", value: 4 }, { label: "Size", value: 3 }] },
  { id: "cow", name: "Bessie Bolt", species: "Dairy cow", img: cow, trait: "Master mechanic", world: "Domestic Meadows", tint: "var(--tomato)", bio: "Fixes any machine with one wrench and a hum. Her bell rings when she's proud.", stats: [{ label: "Speed", value: 1 }, { label: "Cheer", value: 4 }, { label: "Size", value: 5 }] },
  { id: "rabbit", name: "Juniper Jump", species: "Rabbit", img: rabbit, trait: "Speedy test pilot", world: "Domestic Meadows", tint: "var(--copper)", bio: "Goggles on, ears flying. First to try every new conveyor belt.", stats: [{ label: "Speed", value: 5 }, { label: "Cheer", value: 5 }, { label: "Size", value: 1 }] },
  { id: "trex", name: "Rexford", species: "Tyrannosaurus", img: trex, trait: "Gentle giant", world: "Jurassic Jungle", tint: "var(--leaf)", bio: "Big grin, tiny arms, safety helmet always on. Loves a good stomp.", stats: [{ label: "Speed", value: 3 }, { label: "Cheer", value: 4 }, { label: "Size", value: 5 }] },
  { id: "unicorn", name: "Lumi", species: "Unicorn", img: unicorn, trait: "Dreamy inventor", world: "Mythical Realms", tint: "var(--plum)", bio: "Her horn glows when she has an idea — which is most of the time.", stats: [{ label: "Speed", value: 4 }, { label: "Cheer", value: 5 }, { label: "Size", value: 2 }] },
];

export type CritterId = "chicken" | "penguin" | "cow" | "rabbit" | "trex" | "unicorn";
export const critterById = Object.fromEntries(critters.map((c) => [c.id, c])) as Record<CritterId, Critter>;

export type World = { id: string; name: string; tagline: string; img: string; accent: string; palette: string[]; mood: string };

export const worlds: World[] = [
  { id: "meadows", name: "Domestic Meadows", tagline: "Golden fields & red barns", img: meadows, accent: "var(--leaf)", palette: ["oklch(0.72 0.15 135)", "oklch(0.85 0.15 90)", "oklch(0.55 0.17 30)", "oklch(0.8 0.08 230)"], mood: "Warm morning sun, soft greens, honey light." },
  { id: "frozen", name: "Frozen Kingdom", tagline: "Glaciers under the aurora", img: frozen, accent: "var(--ice)", palette: ["oklch(0.9 0.05 220)", "oklch(0.6 0.12 240)", "oklch(0.75 0.15 180)", "oklch(0.75 0.12 330)"], mood: "Twilight cyan, crystal blue, aurora glow." },
  { id: "jurassic", name: "Jurassic Jungle", tagline: "Ferns, falls & a sleepy volcano", img: jurassic, accent: "var(--copper)", palette: ["oklch(0.5 0.12 140)", "oklch(0.72 0.15 70)", "oklch(0.6 0.19 40)", "oklch(0.7 0.09 185)"], mood: "Humid amber haze, deep greens, lava sparks." },
  { id: "mythical", name: "Mythical Realms", tagline: "Floating isles of crystal", img: mythical, accent: "var(--plum)", palette: ["oklch(0.6 0.16 305)", "oklch(0.78 0.13 340)", "oklch(0.8 0.1 190)", "oklch(0.9 0.06 90)"], mood: "Violet dusk, rainbow falls, starlit sparkle." },
  { id: "sanctuary", name: "Grand Sanctuary", tagline: "Every world, one home", img: sanctuary, accent: "var(--sun)", palette: ["oklch(0.82 0.15 80)", "oklch(0.7 0.15 140)", "oklch(0.85 0.07 220)", "oklch(0.65 0.15 310)"], mood: "Sunset gold binding all four palettes." },
];
