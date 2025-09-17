import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sse from "@fastify/sse-v2";
import OpenAPI from "@scalar/fastify-openapi";
import { env } from "@ai-stack/core";
import prismaPlugin from "./plugins/prisma";
import queuePlugin from "./plugins/queue";
import redisPlugin from "./plugins/redis";
import { jobRoutes } from "./routes/jobs";
import { webhookRoutes } from "./routes/webhooks";
import { adminRoutes } from "./routes/admin";
import { logger } from "./lib/logger";
import { jobEvents } from "./lib/job-events";

export const buildServer = async () => {
  const fastify = Fastify({
    logger,
  });

  await fastify.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    allowList: ["127.0.0.1"],
  });

  await fastify.register(sse);
  await fastify.register(prismaPlugin);
  await fastify.register(queuePlugin);
  await fastify.register(redisPlugin);

  fastify.queues.jobEvents.on("progress", async ({ jobId, data }) => {
    const job = await fastify.prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      jobEvents.emitUpdate(jobId, { status: job.status, progress: typeof data === "number" ? data : job.progress });
    }
  });

  fastify.queues.jobEvents.on("completed", async ({ jobId, returnvalue }) => {
    const job = await fastify.prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      jobEvents.emitUpdate(jobId, {
        status: "completed",
        progress: 100,
        resultUrls: job.resultUrls,
        usage: job.usage,
      });
    }
  });

  fastify.queues.jobEvents.on("failed", async ({ jobId, failedReason }) => {
    const job = await fastify.prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      jobEvents.emitUpdate(jobId, {
        status: "failed",
        progress: 100,
        error: failedReason,
      });
    }
  });

  await fastify.register(OpenAPI, {
    routePrefix: "/api/docs",
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "AI Orchestrator API",
        version: "1.0.0",
        description: "REST endpoints for job orchestration, webhooks, and admin insights.",
      },
      servers: [
        {
          url: env.API_URL,
        },
      ],
    },
  });

  fastify.decorate("authenticate", async (request: any, reply: any) => {
    const token = request.headers["x-admin-token"];
    if (token !== env.JWT_SIGNING_KEY) {
      reply.code(401).send({ message: "Unauthorized" });
    }
  });

  await fastify.register(jobRoutes, { prefix: "/api" });
  await fastify.register(webhookRoutes, { prefix: "/api" });
  await fastify.register(adminRoutes, { prefix: "/api" });

  return fastify;
};

declare module "fastify" {
  interface FastifyInstance {
    authenticate: any;
  }
}
