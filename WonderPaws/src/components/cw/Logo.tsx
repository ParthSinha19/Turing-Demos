import { Gear } from "./parts";

export function Logo({ size = "lg" }: { size?: "lg" | "sm" }) {
  const big = size === "lg";
  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <div className="relative flex items-center">
        <Gear size={big ? 96 : 44} className="anim-spin -mr-4 drop-shadow-[0_4px_0_var(--ink)]" color="var(--teal)" />
        <h1 className={`cw-title-stroke relative leading-none ${big ? "text-[7.5rem]" : "text-5xl"}`}
          style={{ color: "var(--sun)", textShadow: "0 8px 0 var(--ink), 0 18px 30px oklch(0 0 0 / .45)" }}>
          Wonder<span style={{ color: "var(--tomato)" }}>Paws</span>
        </h1>
      </div>
      {big && (
        <div className="cw-plate -mt-2 rotate-[-2deg] px-6 py-1 font-display text-xl tracking-[0.2em]">
          THE GREAT ANIMAL FACTORY
        </div>
      )}
    </div>
  );
}

