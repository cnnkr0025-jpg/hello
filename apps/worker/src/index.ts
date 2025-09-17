import { Worker, QueueScheduler, Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { env, JOB_QUEUE_NAME, DEAD_LETTER_QUEUE_NAME } from "@ai-stack/core";
import { getProvider } from "@ai-stack/providers";
import pino from "pino";

const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });

const connection = {
  connection: {
    url: env.REDIS_URL,
  },
  prefix: env.QUEUE_PREFIX,
};

const prisma = new PrismaClient();
const scheduler = new QueueScheduler(JOB_QUEUE_NAME, connection);
scheduler.waitUntilReady().then(() => logger.info("Queue scheduler ready"));
const deadLetterQueue = new Queue(DEAD_LETTER_QUEUE_NAME, connection);

const worker = new Worker(
  JOB_QUEUE_NAME,
  async (job) => {
    logger.info({ jobId: job.id, data: job.data }, "Processing job");
    const { jobId, provider: providerKey, type, prompt, params, userId, projectId } = job.data as any;
    try {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "processing",
          progress: 20,
        },
      });
      await job.updateProgress(20);

      const provider = getProvider(providerKey as any);
      const result = await provider.createJob({
        taskType: type,
        prompt,
        params,
        userId,
        projectId,
      });

      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: result.status,
          progress: result.progress,
          resultUrls: result.resultUrls as any,
          usage: result.usage as any,
          raw: result.raw as any,
        },
      });

      await prisma.usage.create({
        data: {
          userId,
          projectId,
          model: providerKey,
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          credits: result.usage.credits ?? 0,
          cost: result.usage.cost ?? 0,
        },
      });

      await job.updateProgress(result.progress);
      return result;
    } catch (error) {
      logger.error({ err: error }, "Job failed");
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "failed",
          progress: 100,
          raw: { message: error instanceof Error ? error.message : "Unknown error" },
        },
      });
      throw error;
    }
  },
  connection
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed");
});

worker.on("failed", async (job, err) => {
  logger.error({ jobId: job?.id, err }, "Job failed");
  if (job) {
    await deadLetterQueue.add("failed", job.data, { removeOnComplete: true });
  }
});

worker.on("error", (err) => {
  logger.error({ err }, "Worker error");
});

const shutdown = async () => {
  logger.info("Shutting down worker");
  await worker.close();
  await scheduler.close();
  await deadLetterQueue.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
