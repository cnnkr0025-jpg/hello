import { randomUUID } from "node:crypto";
import type { CommonJob, CommonJobInput } from "@ai-stack/core";
import { CommonJobSchema } from "@ai-stack/core";

const jobStore = new Map<string, CommonJob>();

const SUNO_BASE_URL = process.env.SUNO_BASE_URL ?? "https://api.suno.ai";
const USE_MOCK = process.env.SUNO_USE_MOCK === "true";

interface SunoCreateResponse {
  id: string;
  status: string;
  audio_url?: string;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mockCreate(prompt: string) {
  await wait(500);
  const id = randomUUID();
  return {
    id,
    status: "completed",
    audio_url: `https://example.com/suno/${id}.mp3`,
  } satisfies SunoCreateResponse;
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${SUNO_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SUNO_API_KEY}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Suno API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export class SunoAdapter {
  provider = "suno";

  async createJob(input: CommonJobInput): Promise<CommonJob> {
    if (input.taskType !== "music") {
      throw new Error("Suno adapter only handles music tasks");
    }

    const jobId = randomUUID();
    jobStore.set(jobId, {
      jobId,
      provider: this.provider,
      status: "queued",
      resultUrls: [],
      usage: {},
      progress: 5,
    });

    try {
      const body = {
        prompt: input.prompt,
        style: input.params?.style ?? "lofi",
        bpm: input.params?.bpm ?? 90,
        duration: input.params?.duration ?? 120,
      };

      const response: SunoCreateResponse = USE_MOCK
        ? await mockCreate(input.prompt)
        : await request<SunoCreateResponse>("/v3/tracks", {
            method: "POST",
            body: JSON.stringify(body),
          });

      const completedJob: CommonJob = CommonJobSchema.parse({
        jobId,
        provider: this.provider,
        status: response.status === "completed" ? "completed" : "processing",
        resultUrls: response.audio_url ? [response.audio_url] : [],
        usage: {
          credits: 1,
        },
        progress: response.status === "completed" ? 100 : 50,
        raw: response,
      });

      jobStore.set(jobId, completedJob);
      return completedJob;
    } catch (error) {
      const failedJob: CommonJob = CommonJobSchema.parse({
        jobId,
        provider: this.provider,
        status: "failed",
        resultUrls: [],
        usage: {},
        progress: 100,
        raw: { message: error instanceof Error ? error.message : "Unknown error" },
      });
      jobStore.set(jobId, failedJob);
      return failedJob;
    }
  }

  async getJob(id: string): Promise<CommonJob> {
    const job = jobStore.get(id);
    if (!job) {
      throw new Error(`Suno job ${id} not found`);
    }

    if (!USE_MOCK && job.status !== "completed") {
      try {
        const status = await request<SunoCreateResponse>(`/v3/tracks/${id}`, {
          method: "GET",
        });
        const updated: CommonJob = CommonJobSchema.parse({
          ...job,
          status: status.status === "completed" ? "completed" : "processing",
          resultUrls: status.audio_url ? [status.audio_url] : job.resultUrls,
          progress: status.status === "completed" ? 100 : 50,
          raw: status,
        });
        jobStore.set(id, updated);
        return updated;
      } catch (error) {
        return job;
      }
    }

    return job;
  }
}

export const sunoAdapter = new SunoAdapter();
