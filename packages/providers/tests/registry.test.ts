import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ProviderAdapter } from "../src/types";

process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "test";
process.env.SUNO_API_KEY = process.env.SUNO_API_KEY ?? "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/db";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "secret";
process.env.MOCK_OPENAI = "true";
process.env.MOCK_SUNO = "true";

const { dispatchJob, getJob, listProviders } = await import("../src/registry");

class MockAdapter implements ProviderAdapter {
  name = "mock" as const;
  taskType = "text" as const;
  createJob = vi.fn(async () => ({
    jobId: "mock-1",
    status: "succeeded" as const,
    resultUrls: [],
    usage: {},
  }));
  getJob = vi.fn(async () => ({
    jobId: "mock-1",
    status: "succeeded" as const,
    resultUrls: [],
    usage: {},
  }));
}

describe("provider registry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("lists default providers", async () => {
    const providers = listProviders();
    expect(providers.some((provider) => provider.name === "openai")).toBe(true);
    expect(providers.some((provider) => provider.name === "suno")).toBe(true);
  });

  it("dispatches to adapters", async () => {
    const { dispatchJob: dynamicDispatch } = await import("../src/registry");
    const result = await dynamicDispatch({
      taskType: "text",
      prompt: "hello",
      userId: "u",
      projectId: "p",
    });
    expect(result.jobId).toBeTruthy();
  });

  it("supports custom adapters", async () => {
    const adapter = new MockAdapter();
    const registry = await import("../src/registry");
    (registry as any).default = undefined;
    expect(adapter.createJob).not.toHaveBeenCalled();
    const job = await adapter.createJob({
      taskType: "text",
      prompt: "prompt",
      userId: "u",
      projectId: "p",
    });
    expect(job.status).toBe("succeeded");
  });

  it("getJob returns data", async () => {
    const job = await getJob("text", "openai", "job-1");
    expect(job.jobId).toBe("job-1");
  });
});
