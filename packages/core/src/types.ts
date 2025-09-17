import { z } from "zod";

export const TaskTypeEnum = z.enum(["text", "image", "music"]);

export const CommonJobInputSchema = z.object({
  taskType: TaskTypeEnum,
  prompt: z.string().min(1),
  params: z.record(z.string(), z.any()).default({}),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  metadata: z
    .object({
      locale: z.string().optional(),
      presetId: z.string().optional(),
    })
    .default({}),
});

export type CommonJobInput = z.infer<typeof CommonJobInputSchema>;

export const JobStatusEnum = z.enum([
  "queued",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);

export const CommonJobSchema = z.object({
  jobId: z.string(),
  status: JobStatusEnum,
  provider: z.string(),
  resultUrls: z.array(z.string().url()).default([]),
  usage: z
    .object({
      inputTokens: z.number().nonnegative().optional(),
      outputTokens: z.number().nonnegative().optional(),
      credits: z.number().nonnegative().optional(),
      cost: z.number().nonnegative().optional(),
    })
    .default({}),
  progress: z.number().min(0).max(100).default(0),
  raw: z.any().optional(),
});

export type CommonJob = z.infer<typeof CommonJobSchema>;

export interface ProviderAdapter {
  createJob(input: CommonJobInput): Promise<CommonJob>;
  getJob(id: string): Promise<CommonJob>;
  cancelJob?(id: string): Promise<void>;
}

export const PlanEnum = z.enum(["FREE", "PLUS", "PRO"]);
export type Plan = z.infer<typeof PlanEnum>;

export const RoleEnum = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

export interface QuotaConfig {
  dailyCredits: number;
  monthlyCredits: number;
  burstLimit: number;
}

export interface PlanConfig extends QuotaConfig {
  name: Plan;
  description: string;
  price: number;
}

export interface RateLimitRule {
  key: string;
  limit: number;
  windowSeconds: number;
}

export const JOB_QUEUE_NAME = "ai-orchestrator-jobs";
export const DEAD_LETTER_QUEUE_NAME = "ai-orchestrator-dead-letter";
export const SSE_EVENT_NAME = "job-update";
