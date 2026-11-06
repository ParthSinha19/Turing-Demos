import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TULIP — The Little Robot Who Wanted to Be Human" },
      { name: "description", content: "A 3D adventure for ages 7–9: teach TULIP the robot to decide, code, see, listen and talk." },
      { property: "og:title", content: "TULIP — The Little Robot Who Wanted to Be Human" },
      { property: "og:description", content: "Train a friendly robot through seven missions and get him to the Welcome Festival." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});
