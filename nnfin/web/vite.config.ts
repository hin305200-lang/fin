import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));
const apiTarget = "http://127.0.0.1:4471";

// GitHub Pages cannot set these headers. python3 server.py can (slice 6).
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [react()],
  publicDir: "public",
  build: {
    sourcemap: false,
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    fs: { allow: [root, path.resolve(root, "..")] },
    proxy: {
      "/api": apiTarget,
      "/app.html": apiTarget,
      "/crm.html": apiTarget,
      "/crm": apiTarget,
      "/auth.js": apiTarget,
      "/auth.css": apiTarget,
      "/app.js": apiTarget,
      "/app.css": apiTarget,
      "/gate.js": apiTarget,
      "/tracker.js": apiTarget,
      "/banks.js": apiTarget,
      "/crm.js": apiTarget,
      "/crm.css": apiTarget,
      "/styles.css": apiTarget,
    },
  },
});
