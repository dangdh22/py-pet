import { defineConfig, devices } from "@playwright/test";

// Cloud sessions ship an older Chromium than this Playwright version expects.
const launchOptions = { executablePath: process.env.PW_CHROMIUM_PATH || undefined };

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://localhost:4173/", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      testIgnore: "subpath.spec.ts",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      // The same build served under /py-pet/, like a GitHub Pages project site.
      name: "subpath",
      testMatch: "subpath.spec.ts",
      use: { ...devices["Desktop Chrome"], launchOptions, baseURL: "http://localhost:4174/py-pet/" },
    },
  ],
  webServer: [
    {
      command: "npm run build && npm run preview",
      url: "http://localhost:4173/",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // Serves dist/ from the build above; it reads files per request, so start order does not matter.
      command: "node tools/serve_subpath.mjs",
      port: 4174,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
