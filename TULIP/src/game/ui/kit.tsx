import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  Apple, Armchair, BatteryLow, Bike, BookOpen, Brain, Bus, Cake, Car, Carrot, Cat, CloudRain, Cpu, Dog, DoorClosed,
  Ear, Eye, Fish, Flower2, Footprints, Gamepad2, Gift, Glasses, Hand, HeartHandshake, IceCreamCone, Key, Laugh,
  Lightbulb, LockKeyhole, MapPin, Music, PlugZap, Power, Sandwich, Shirt, Smile, Snowflake, Sofa, Sparkles, Speaker,
  Sun, ToyBrick, TrafficCone, TreePine, Umbrella, Utensils, Volleyball, Volume2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sfx } from "../audio";

function Tomato(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}>
      <ellipse cx="12" cy="14" rx="8.5" ry="7" />
      <path d="M12 7c-1.5-2-4-2-5-1.5M12 7c1.5-2 4-2 5-1.5M12 7V4M12 7c-2 .5-3 2-3 2M12 7c2 .5 3 2 3 2" />
    </svg>
  );
}

function TrafficLight(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
      <rect x="7" y="2" width="10" height="20" rx="3" />
      <circle cx="12" cy="7" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="17" r="2" />
    </svg>
  );
}

type I = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
export const ICONS: Record<string, [I, string]> = {
  apple: [Apple, "bg-destructive"],
  tomato: [Tomato as I, "bg-petal"],
  football: [Volleyball, "bg-ink"],
  dog: [Dog, "bg-sun"],
  cat: [Cat, "bg-sun"],
  fish: [Fish, "bg-primary"],
  car: [Car, "bg-primary"],
  bus: [Bus, "bg-sun"],
  bike: [Bike, "bg-primary"],
  flower: [Flower2, "bg-petal"],
  tree: [TreePine, "bg-success"],
  chair: [Armchair, "bg-accent"],
  sofa: [Sofa, "bg-accent"],
  carrot: [Carrot, "bg-sun"],
  blocks: [ToyBrick, "bg-petal"],
  game: [Gamepad2, "bg-ink"],
  umbrella: [Umbrella, "bg-primary"],
  sun: [Sun, "bg-sun"],
  rain: [CloudRain, "bg-primary"],
  glasses: [Glasses, "bg-ink"],
  light: [TrafficLight as I, "bg-destructive"],
  cone: [TrafficCone, "bg-sun"],
  stop: [Hand, "bg-destructive"],
  go: [Footprints, "bg-success"],
  key: [Key, "bg-sun"],
  lock: [LockKeyhole, "bg-ink"],
  door: [DoorClosed, "bg-accent"],
  battery: [BatteryLow, "bg-destructive"],
  charger: [PlugZap, "bg-success"],
  cake: [Cake, "bg-petal"],
  gift: [Gift, "bg-petal"],
  eye: [Eye, "bg-primary"],
  ear: [Ear, "bg-sun"],
  brain: [Brain, "bg-petal"],
  speaker: [Speaker, "bg-ink"],
  feet: [Footprints, "bg-success"],
  power: [Power, "bg-primary"],
  zap: [Zap, "bg-sun"],
  cpu: [Cpu, "bg-primary"],
  sparkles: [Sparkles, "bg-sun"],
  pin: [MapPin, "bg-petal"],
  snow: [Snowflake, "bg-primary"],
  icecream: [IceCreamCone, "bg-petal"],
  food: [Utensils, "bg-destructive"],
  sandwich: [Sandwich, "bg-sun"],
  music: [Music, "bg-sun"],
  book: [BookOpen, "bg-accent"],
  smile: [Smile, "bg-sun"],
  laugh: [Laugh, "bg-petal"],
  help: [HeartHandshake, "bg-primary"],
  hand: [Hand, "bg-sun"],
  volume: [Volume2, "bg-primary"],
  shirt: [Shirt, "bg-primary"],
  idea: [Lightbulb, "bg-sun"],
};

/** Glossy round token used for every object illustration. */
export function Token({ name, size = 64, className }: { name: string; size?: number; className?: string }) {
  const [Icon, bg] = ICONS[name] ?? [Sparkles, "bg-sun"];
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full text-primary-foreground", bg, className)}
      style={{ width: size, height: size, boxShadow: "inset 0 -6px 0 rgba(0,0,0,.15), inset 0 6px 10px rgba(255,255,255,.45), 0 6px 14px -6px rgba(0,0,0,.4)" }}
    >
      <Icon size={size * 0.5} strokeWidth={2.4} />
      <span className="absolute left-[22%] top-[14%] h-[18%] w-[26%] rounded-full bg-card/60 blur-[1px]" />
    </span>
  );
}

export function Btn({ children, onClick, variant = "primary", className, disabled, ...rest }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "sun" | "soft" | "petal"; className?: string; disabled?: boolean; [k: string]: unknown }) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    sun: "bg-sun text-ink",
    petal: "bg-petal text-primary-foreground",
    soft: "bg-card text-ink border-2 border-border",
  }[variant];
  return (
    <button
      {...rest}
      disabled={disabled}
      onClick={() => {
        sfx.click();
        onClick?.();
      }}
      className={cn("chunky font-display inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-xl font-bold disabled:opacity-40", v, className)}
    >
      {children}
    </button>
  );
}

/** A big picture choice card. */
export function Choice({ icon, label, onClick, state, id, className }: { icon?: string | undefined; label: string; onClick: () => void; state?: "right" | "wrong" | null; id?: string; className?: string }) {
  return (
    <button
      data-choice={id}
      onClick={() => {
        sfx.click();
        onClick();
      }}
      className={cn(
        "chunky pop-in flex items-center gap-4 rounded-3xl border-4 bg-card p-4 text-left font-display text-xl font-bold text-ink transition-colors",
        state === "right" ? "border-success bg-success/15" : state === "wrong" ? "shake border-destructive/60" : "border-transparent hover:border-primary/50",
        className,
      )}
    >
      {icon && <Token name={icon} size={56} />}
      <span className="leading-tight">{label}</span>
    </button>
  );
}

export function Confetti({ n = 80 }: { n?: number }) {
  const colors = ["var(--petal)", "var(--sun)", "var(--primary)", "var(--success)"];
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {Array.from({ length: n }).map((_, i) => (
        <span
          key={i}
          className="absolute -top-6 block h-3 w-2 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % 4],
            animation: `confettiFall ${2.5 + (i % 7) * 0.3}s linear ${(i % 10) * 0.12}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
