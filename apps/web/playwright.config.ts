import { defineConfig, devices } from "@playwright/test";

process.env.TEST_BYPASS_AUTH = "true";
process.env.AUTH_DISABLED = "true";

export default defineConfig({
  testDir: "../../tests/playwright",
  timeout: 120000,
  retries: 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm --filter @ai-stack/web dev --port 3000",
    url: "http://localhost:3000",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
