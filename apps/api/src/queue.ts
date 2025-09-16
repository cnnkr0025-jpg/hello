import { Queue, QueueScheduler } from "bullmq";
import { env } from "@ai/core";
import IORedis from "ioredis";

const connection = new IORedis(env.REDIS_URL);

export const jobQueue = new Queue("generation-jobs", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const deadLetterQueue = new Queue("generation-jobs-dead", { connection });

new QueueScheduler("generation-jobs", { connection }).waitUntilReady();

export async function enqueueJob(payload: Record<string, any>) {
  const job = await jobQueue.add("generate", payload, {
    jobId: payload.id,
  });
  return job.id;
}
