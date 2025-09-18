import { Queue, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import { env } from "@ai/core";

export type JudgeJobPayload = {
  submissionId: string;
  matchId: string;
  userId: string;
};

const connection = new IORedis(env.REDIS_URL);

export const judgeQueue = new Queue<JudgeJobPayload>("judge-submissions", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const deadLetterQueue = new Queue("judge-submissions-dead", { connection });

new QueueScheduler("judge-submissions", { connection }).waitUntilReady();

export async function enqueueJudgeJob(payload: JudgeJobPayload) {
  const job = await judgeQueue.add("judge", payload, { jobId: payload.submissionId });
  return job.id;
}
