import { test, expect } from "@playwright/test";

const recentJobs = [
  {
    id: "job-1",
    type: "text",
    provider: "openai",
    status: "completed",
    progress: 100,
    resultUrls: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "job-2",
    type: "image",
    provider: "openai",
    status: "completed",
    progress: 100,
    resultUrls: ["https://placehold.co/300x200"],
    createdAt: new Date().toISOString(),
  },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    class MockEventSource {
      onmessage: ((this: MockEventSource, ev: MessageEvent) => any) | null = null;
      constructor() {}
      close() {}
      addEventListener() {}
      removeEventListener() {}
    }
    // @ts-ignore
    window.EventSource = MockEventSource;
  });

  await page.route("**/api/jobs?limit=6", async (route) => {
    await route.fulfill({ json: recentJobs });
  });

  await page.route("**/api/jobs/text", async (route) => {
    await route.fulfill({
      json: {
        id: "job-new",
        type: "text",
        provider: "openai",
        status: "queued",
        progress: 0,
        resultUrls: [],
        createdAt: new Date().toISOString(),
      },
      status: 201,
    });
  });

  await page.route("**/api/jobs/job-2", async (route) => {
    await route.fulfill({
      json: {
        id: "job-2",
        type: "image",
        provider: "openai",
        prompt: "Demo prompt",
        params: { size: "1024x1024" },
        status: "completed",
        progress: 100,
        resultUrls: ["https://placehold.co/300x200"],
        usage: { credits: 1 },
        raw: { demo: true },
      },
    });
  });
});

test("user can submit job and view details", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AI Orchestrator Dashboard" })).toBeVisible();
  await page.getByPlaceholder("Describe your writing task").fill("Create a video script about AI music.");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Recent Jobs")).toBeVisible();

  await page.goto("/jobs/job-2");
  await expect(page.getByText("Result Preview")).toBeVisible();
  await expect(page.locator("img")).toHaveAttribute("src", /placehold/);
});
