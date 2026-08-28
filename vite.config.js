import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // relative base so the built site works from a subpath (GitHub Pages) or a
  // plain file server without reconfiguring
  base: "./",
  build: { outDir: "dist" },
});
