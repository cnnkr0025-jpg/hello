import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("openai", () => {
  class Chat {
    completions = {
      create: vi.fn(async () => ({
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        choices: [
          {
            message: { role: "assistant", content: "Hello" },
          },
        ],
      })),
    };
  }

  class Images {
    generate = vi.fn(async () => ({
      data: [
        { url: "https://example.com/img.png" },
      ],
    }));
  }

  return {
    default: class {
      chat = new Chat();
      images = new Images();
      constructor() {}
    },
  };
});

import { openAIAdapter, sunoAdapter } from "..";

beforeEach(() => {
  process.env.SUNO_USE_MOCK = "true";
});

describe("openai adapter", () => {
  it("creates text job", async () => {
    const job = await openAIAdapter.createJob({
      taskType: "text",
      prompt: "Hello",
      params: {},
      userId: crypto.randomUUID(),
      projectId: crypto.randomUUID(),
    });
    expect(job.status).toBe("completed");
    expect(job.usage.inputTokens).toBe(10);
  });
});

describe("suno adapter", () => {
  it("uses mock to create job", async () => {
    const job = await sunoAdapter.createJob({
      taskType: "music",
      prompt: "Calm music",
      params: { bpm: 90 },
      userId: crypto.randomUUID(),
      projectId: crypto.randomUUID(),
    });
    expect(["completed", "processing"]).toContain(job.status);
  });
});
