import type { FastifyInstance } from "fastify";
import { buildRateLimits, type Plan } from "@ai-stack/core";
import { getProviderForTask } from "@ai-stack/providers";
import { jobEvents } from "../lib/job-events";
import { z } from "zod";

export const CreateJobSchema = z.object({
  prompt: z.string().min(1),
  params: z.record(z.any()).default({}),
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
});

const JOB_QUEUE_JOB_NAME = "process";

export class JobService {
  constructor(private readonly fastify: FastifyInstance) {}

  private async ensureQuota(userId: string, plan: Plan, provider: string) {
    const rules = buildRateLimits(plan, userId, provider);
    for (const rule of rules) {
      const count = await this.fastify.redis.incr(rule.key);
      if (count === 1) {
        await this.fastify.redis.expire(rule.key, rule.windowSeconds);
      }
      if (count > rule.limit) {
        throw new Error(`Quota exceeded for ${rule.key}`);
      }
    }
  }

  async createJob(type: "text" | "image" | "music", payload: z.infer<typeof CreateJobSchema>) {
    const data = CreateJobSchema.parse(payload);
    const user = await this.fastify.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const provider = getProviderForTask({
      taskType: type,
      prompt: data.prompt,
      params: data.params,
      userId: data.userId,
      projectId: data.projectId,
    }).provider;

    await this.ensureQuota(data.userId, user.plan as Plan, provider);

    const job = await this.fastify.prisma.job.create({
      data: {
        type,
        provider,
        prompt: data.prompt,
        params: data.params as any,
        status: "queued",
        progress: 0,
        resultUrls: [],
        usage: {},
        userId: data.userId,
        projectId: data.projectId,
      },
    });

    await this.fastify.queues.jobQueue.add(
      JOB_QUEUE_JOB_NAME,
      {
        jobId: job.id,
        type,
        provider,
        prompt: data.prompt,
        params: data.params,
        userId: data.userId,
        projectId: data.projectId,
      },
      {
        removeOnComplete: true,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      }
    );

    jobEvents.emitUpdate(job.id, { status: job.status, progress: job.progress });

    return job;
  }

  async getJob(id: string) {
    const job = await this.fastify.prisma.job.findUnique({ where: { id } });
    if (!job) {
      throw new Error("Job not found");
    }
    return job;
  }

  async listJobs(limit = 10) {
    return this.fastify.prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async retryJob(id: string) {
    const job = await this.getJob(id);
    await this.fastify.queues.jobQueue.add(JOB_QUEUE_JOB_NAME, {
      jobId: job.id,
      type: job.type,
      provider: job.provider,
      prompt: job.prompt,
      params: job.params,
      userId: job.userId,
      projectId: job.projectId,
    });
    await this.fastify.prisma.job.update({
      where: { id: job.id },
      data: {
        status: "queued",
        progress: 0,
      },
    });
    jobEvents.emitUpdate(job.id, { status: "queued", progress: 0 });
    return job;
  }

  async updateJobResult(jobId: string, payload: Partial<{ status: string; progress: number; resultUrls: string[]; usage: any; raw: any }>) {
    const job = await this.fastify.prisma.job.update({
      where: { id: jobId },
      data: {
        status: payload.status,
        progress: payload.progress ?? undefined,
        resultUrls: payload.resultUrls as any,
        usage: payload.usage as any,
        raw: payload.raw,
      },
    });
    jobEvents.emitUpdate(job.id, {
      status: job.status,
      progress: job.progress,
      resultUrls: job.resultUrls,
    });
    return job;
  }
}
