import fp from "fastify-plugin";
import { Queue, QueueEvents } from "bullmq";
import { env, JOB_QUEUE_NAME, DEAD_LETTER_QUEUE_NAME } from "@ai-stack/core";

type BullQueue = Queue;
type BullQueueEvents = QueueEvents;

export default fp(async (fastify) => {
  const connection = {
    connection: {
      url: env.REDIS_URL,
    },
    prefix: env.QUEUE_PREFIX,
  };

  const jobQueue = new Queue(JOB_QUEUE_NAME, connection);
  const deadLetterQueue = new Queue(DEAD_LETTER_QUEUE_NAME, connection);
  const jobEvents = new QueueEvents(JOB_QUEUE_NAME, connection);

  fastify.decorate("queues", {
    jobQueue,
    deadLetterQueue,
    jobEvents,
  });

  fastify.addHook("onClose", async () => {
    await Promise.all([jobQueue.close(), deadLetterQueue.close(), jobEvents.close()]);
  });
});

declare module "fastify" {
  interface FastifyInstance {
    queues: {
      jobQueue: BullQueue;
      deadLetterQueue: BullQueue;
      jobEvents: BullQueueEvents;
    };
  }
}
