import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// base "./" makes every asset URL relative, so the build works from any
// GitHub Pages path (https://user.github.io/<repo>/) without knowing the repo name.
// Override with VITE_BASE=/my-repo/ if you prefer an absolute path.
export default defineConfig({
  base: process.env.VITE_BASE ?? "./",
  plugins: [react()],
  test: { environment: "node" },
});
