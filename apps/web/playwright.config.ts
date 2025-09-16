import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @ai/web dev",
    cwd: "../../",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    port: 3000,
  },
});
