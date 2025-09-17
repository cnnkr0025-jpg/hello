import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import type { CommonJob, CommonJobInput } from "@ai-stack/core";
import { CommonJobSchema } from "@ai-stack/core";

const jobStore = new Map<string, CommonJob>();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIAdapter {
  provider = "openai";

  async createJob(input: CommonJobInput): Promise<CommonJob> {
    const jobId = randomUUID();
    let job: CommonJob = {
      jobId,
      provider: this.provider,
      status: "processing",
      resultUrls: [],
      usage: {},
      progress: 10,
    };
    jobStore.set(jobId, job);

    try {
      if (input.taskType === "text") {
        const completion = await client.chat.completions.create({
          model: "gpt-5",
          messages: [
            { role: "system", content: input.params?.systemPrompt ?? "You are a helpful assistant." },
            { role: "user", content: input.prompt },
          ],
          temperature: Number(input.params?.temperature ?? 0.7),
          max_tokens: Number(input.params?.maxTokens ?? 800),
          tools: input.params?.tools,
        });
        job = CommonJobSchema.parse({
          jobId,
          provider: this.provider,
          status: "completed",
          resultUrls: [],
          usage: {
            inputTokens: completion.usage?.prompt_tokens ?? 0,
            outputTokens: completion.usage?.completion_tokens ?? 0,
            credits: completion.usage?.total_tokens ?? 0,
          },
          progress: 100,
          raw: completion,
        });
      } else if (input.taskType === "image") {
        const response = await client.images.generate({
          model: "gpt-image-1",
          prompt: input.prompt,
          size: (input.params?.size as string) ?? "1024x1024",
        });
        const urls = response.data
          .map((item) => item.url)
          .filter((url): url is string => Boolean(url));
        job = CommonJobSchema.parse({
          jobId,
          provider: this.provider,
          status: "completed",
          resultUrls: urls,
          usage: {
            credits: urls.length,
          },
          progress: 100,
          raw: response,
        });
      } else {
        throw new Error(`Unsupported task type for OpenAI: ${input.taskType}`);
      }
    } catch (error) {
      job = CommonJobSchema.parse({
        jobId,
        provider: this.provider,
        status: "failed",
        resultUrls: [],
        usage: {},
        progress: 100,
        raw: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }

    jobStore.set(jobId, job);
    return job;
  }

  async getJob(id: string): Promise<CommonJob> {
    const job = jobStore.get(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }
    return job;
  }
}

export const openAIAdapter = new OpenAIAdapter();
