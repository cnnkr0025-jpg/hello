import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../db", () => {
  return {
    prisma: {
      job: {
        create: vi.fn(async (args) => ({ id: "job-1", ...args.data })),
        update: vi.fn(async (args) => ({ id: args.where.id, ...args.data })),
      },
    },
  };
});

const { createQueuedJob, updateJobStatus } = await import("./job-service");
const { prisma } = await import("../db");

describe("job service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates job with nested relations", async () => {
    const job = await createQueuedJob({
      type: "text",
      provider: "openai",
      prompt: "hello",
      userId: "user-1",
      projectId: "project-1",
    });
    expect(job.prompt).toBe("hello");
    expect((prisma.job.create as any).mock.calls[0][0].data.status).toBe("queued");
  });

  it("updates job status", async () => {
    const result = await updateJobStatus("job-1", { status: "succeeded" });
    expect(result.status).toBe("succeeded");
  });
});
