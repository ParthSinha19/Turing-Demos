import { createFileRoute } from "@tanstack/react-router";
import { FactoryStage } from "@/components/cw/FactoryStage";

export const Route = createFileRoute("/factory")({
  head: () => ({
    meta: [
      { title: "WonderPaws — Factory Environment" },
      { name: "description", content: "Environment art for the WonderPaws animal-sorting factory floor." },
      { property: "og:title", content: "WonderPaws — Factory Environment" },
      { property: "og:description", content: "Environment art for the WonderPaws animal-sorting factory floor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FactoryScene,
});

function FactoryScene() {
  return (
    <main className="relative h-screen min-h-[720px] overflow-hidden">
      <FactoryStage riders={["chicken", "rabbit", "penguin", "unicorn", "trex"]} />
      <div className="absolute left-8 top-8 max-w-md">
        <div className="cw-plate inline-block px-5 py-1 font-display text-lg">SORTING HALL · SHIFT 1</div>
        <h2 className="mt-3 text-6xl text-parchment text-shadow-ink cw-title-stroke">The Factory Floor</h2>
        <p className="mt-3 max-w-sm rounded-xl bg-ink/60 p-3 text-parchment/90 backdrop-blur-sm">
          Painted tin machines, copper plumbing and warm timber — a miniature workshop lit by afternoon sun.
        </p>
      </div>
    </main>
  );
}
