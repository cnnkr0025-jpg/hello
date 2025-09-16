import fetch from "node-fetch";
import { env } from "@ai/core";
import type { CommonInput, CommonJob } from "../types";
import { BaseAdapter } from "./base";

const chatEndpoint = "https://api.openai.com/v1/chat/completions";
const imageEndpoint = "https://api.openai.com/v1/images/";

export class OpenAIAdapter extends BaseAdapter {
  name = "openai" as const;
  taskType: "text" | "image";

  constructor(taskType: "text" | "image") {
    super();
    this.taskType = taskType;
  }

  async createJob(input: CommonInput): Promise<CommonJob> {
    if (process.env.MOCK_OPENAI === "true" || env.NODE_ENV === "test") {
      return {
        jobId: `${this.name}-${Date.now()}`,
        status: "succeeded",
        resultUrls: this.taskType === "text" ? [] : ["https://placehold.co/1024x1024/png"],
        usage: { inputTokens: 42, outputTokens: 128, credits: 1 },
        raw: { mock: true, input },
      };
    }

    if (this.taskType === "text") {
      const response = await fetch(chatEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5",
          messages: [
            { role: "system", content: "You are a helpful AI assistant." },
            { role: "user", content: input.prompt },
          ],
          response_format: input.params?.response_format,
          tools: input.params?.tools,
          metadata: {
            projectId: input.projectId,
            userId: input.userId,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI chat failed: ${error}`);
      }

      const json = (await response.json()) as any;
      const text = json.choices?.[0]?.message?.content ?? "";
      return {
        jobId: json.id ?? `${this.name}-${Date.now()}`,
        status: "succeeded",
        resultUrls: [],
        usage: {
          inputTokens: json.usage?.prompt_tokens,
          outputTokens: json.usage?.completion_tokens,
          credits: json.usage?.total_tokens,
        },
        raw: { ...json, text },
      };
    }

    const mode = input.params?.editImageUrl ? "edits" : input.params?.baseImageUrl ? "variations" : "generations";
    const endpoint = `${imageEndpoint}${mode}`;
    const form: Record<string, unknown> = {
      model: "gpt-image-1",
      prompt: input.prompt,
      size: input.params?.size ?? "1024x1024",
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI image failed: ${error}`);
    }

    const json = (await response.json()) as any;
    const urls = (json.data ?? []).map((item: any) => item.url).filter(Boolean);
    return {
      jobId: json.id ?? `${this.name}-${Date.now()}`,
      status: "succeeded",
      resultUrls: urls,
      usage: { credits: urls.length },
      raw: json,
    };
  }

  async getJob(id: string): Promise<CommonJob> {
    return {
      jobId: id,
      status: "succeeded",
      resultUrls: [],
      usage: {},
      raw: { note: "OpenAI API does not provide polling endpoint for chat jobs" },
    };
  }
}
