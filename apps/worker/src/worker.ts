import { Worker, QueueEvents, Queue } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";
import { env } from "@ai/core";
import { dispatchJob } from "@ai/providers";
import { prisma } from "./db";

const logger = pino({ level: "info" });
const connection = new IORedis(env.REDIS_URL);

const deadLetterQueue = new Queue("generation-jobs-dead", { connection });

const worker = new Worker(
  "generation-jobs",
  async (job) => {
    const payload = job.data as {
      id: string;
      type: "text" | "image" | "music";
      provider: string;
      prompt: string;
      params?: Record<string, any>;
      userId: string;
      projectId: string;
    };

    logger.info({ jobId: payload.id }, "Processing job");
    await prisma.job.update({
      where: { id: payload.id },
      data: { status: "processing", progress: 10 },
    });

    try {
      const result = await dispatchJob(
        {
          taskType: payload.type,
          prompt: payload.prompt,
          params: payload.params,
          userId: payload.userId,
          projectId: payload.projectId,
        },
        { preferredProvider: payload.provider }
      );

      await prisma.job.update({
        where: { id: payload.id },
        data: {
          status: result.status,
          progress: result.status === "succeeded" ? 100 : 50,
          resultUrls: result.resultUrls,
          usage: result.usage,
          raw: result.raw ?? {},
        },
      });

      await prisma.usage.create({
        data: {
          userId: payload.userId,
          projectId: payload.projectId,
          model: `${payload.provider}:${payload.type}`,
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          credits: result.usage.credits ?? 0,
          cost: result.usage.cost ?? 0,
        },
      });

      return result;
    } catch (error) {
      logger.error(error, "Job failed");
      await prisma.job.update({
        where: { id: payload.id },
        data: { status: "failed", progress: 100 },
      });
      throw error;
    }
  },
  {
    connection,
    concurrency: Number(env.WORKER_CONCURRENCY ?? "2"),
  }
);

const events = new QueueEvents("generation-jobs", { connection });

events.on("failed", async ({ jobId, failedReason, prev }) => {
  logger.error({ jobId, failedReason }, "Job moved to failed state");
  await deadLetterQueue.add("dead", { jobId, failedReason, prevAt: prev });
});

events.on("waiting", ({ jobId }) => {
  logger.info({ jobId }, "Job waiting");
});

process.on("SIGTERM", async () => {
  await worker.close();
  await events.close();
  await deadLetterQueue.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
});

logger.info("Worker started");
