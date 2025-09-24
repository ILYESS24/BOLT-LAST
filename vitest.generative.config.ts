import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.generative.test.{ts,tsx}"],
    globals: true,
    // Configuration spécifique pour les tests génératifs
    testTimeout: 30000, // 30 secondes pour les tests génératifs
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Augmenter le nombre de cas de test pour les tests génératifs
    env: {
      FC_CHECK_TIMEOUT: "30000",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
