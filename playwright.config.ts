import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://localhost:4173/", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Cloud sessions ship an older Chromium than this Playwright version expects.
        launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
      },
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
