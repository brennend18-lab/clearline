/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base for statically hosted builds (set STATIC_BASE=1), so the app
  // works when served from a nested path rather than a domain root.
  base: process.env.STATIC_BASE === "1" ? "./" : "/",
  plugins: [react()],
  server: {
    port: 3123,
    strictPort: true,
  },
  test: {
    // jsdom so component tests can exercise the real forms; node built-ins
    // (used by the content-safety scan) still work under vitest.
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
