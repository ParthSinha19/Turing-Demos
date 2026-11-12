
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages deployment
// Override with VITE_BASE_PATH (e.g. "/" for local preview).
const base = process.env["VITE_BASE_PATH"] ?? "/Turing-Demos/rover-lab/";

const config = defineConfig({
  nitro: false,
  tanstackStart: {
    router: {
      basepath: base.replace(/\/$/, ""),
    },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
        crawlLinks: false,
      },
    },
  },
  vite: {
    base,
  },
});

// Prevent TanStack devtools from injecting attributes into
// React Three Fiber elements.
export default async (env: Parameters<typeof config>[0]) => {
  const c = await config(env);

  const strip = (list: unknown): unknown[] =>
    (Array.isArray(list) ? list.flat(Infinity) : [list]).filter(
      (p) =>
        !(
          p &&
          typeof p === "object" &&
          "name" in p &&
          String((p as { name: string }).name).startsWith(
            "@tanstack/devtools",
          )
        ),
    );

  c.plugins = strip(c.plugins) as NonNullable<typeof c.plugins>;

  return c;
};
