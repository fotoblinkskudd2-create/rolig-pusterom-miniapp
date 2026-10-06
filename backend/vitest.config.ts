import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Alle tester deler én testdatabase.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
    include: ["test/**/*.test.ts"],
  },
});
