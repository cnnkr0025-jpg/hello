import fetch from "node-fetch";
import { env } from "@ai/core";
import type { CommonInput, CommonJob } from "../types";
import { BaseAdapter } from "./base";

const SUNO_BASE = process.env.SUNO_BASE_URL ?? "https://api.suno.ai";

export class SunoAdapter extends BaseAdapter {
  name = "suno" as const;
  taskType: "music" = "music";

  async createJob(input: CommonInput): Promise<CommonJob> {
    if (process.env.MOCK_SUNO === "true" || env.NODE_ENV === "test") {
      return {
        jobId: `${this.name}-${Date.now()}`,
        status: "queued",
        resultUrls: [],
        usage: { credits: 1 },
        raw: { mock: true, input },
      };
    }

    const response = await fetch(`${SUNO_BASE}/api/v4/tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: input.prompt,
        style: input.params?.style ?? "lofi",
        metadata: {
          projectId: input.projectId,
          userId: input.userId,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno track creation failed: ${error}`);
    }

    const json = (await response.json()) as any;
    const jobId = json.jobId ?? json.id ?? `${this.name}-${Date.now()}`;
    return {
      jobId,
      status: "queued",
      resultUrls: [],
      usage: { credits: 1 },
      raw: json,
    };
  }

  async getJob(id: string): Promise<CommonJob> {
    if (process.env.MOCK_SUNO === "true" || env.NODE_ENV === "test") {
      return {
        jobId: id,
        status: "succeeded",
        resultUrls: [
          "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Komiku/Its_time_for_adventure/Komiku_-_12_-_Battle_of_Pogs.mp3",
        ],
        usage: { credits: 1 },
        raw: { mock: true },
      };
    }

    const response = await fetch(`${SUNO_BASE}/api/v4/tracks/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.SUNO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno get job failed: ${error}`);
    }

    const json = (await response.json()) as any;
    const downloadUrl = json.audio_url ?? json.files?.[0]?.url ?? null;
    return {
      jobId: id,
      status: json.status ?? "processing",
      resultUrls: downloadUrl ? [downloadUrl] : [],
      usage: { credits: 1 },
      raw: json,
    };
  }
}
