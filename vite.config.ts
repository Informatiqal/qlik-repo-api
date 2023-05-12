import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 30000,
    exclude: [
      ...configDefaults.exclude,
      //"test/playground.spec.ts"
    ],
  },
});
