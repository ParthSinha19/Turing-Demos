import { createFileRoute } from "@tanstack/react-router";
import { DesignLabPage } from "@/design-lab/DesignLabPage";

export const Route = createFileRoute("/")({
  // The 3D workbench uses WebGL and browser storage, so it renders in the browser only.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Design Lab — Rover Lab" },
      { name: "description", content: "Build a Mars rover from real components and inspect it in 3D on the test site." },
      { property: "og:title", content: "Design Lab — Rover Lab" },
      { property: "og:description", content: "Build a Mars rover from real components and inspect it in 3D on the test site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DesignLabPage,
});
