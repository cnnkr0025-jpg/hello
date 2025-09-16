import "@total-typescript/ts-reset";
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifySSE from "fastify-sse-v2";
import { env } from "@ai/core";
import { jobRoutes } from "./routes/jobs";
import { adminRoutes } from "./routes/admin";
import { webhookRoutes } from "./routes/webhooks";
import { prisma } from "./db";
import { startTelemetry, shutdownTelemetry } from "./telemetry";

export async function buildServer() {
  const server: FastifyInstance = Fastify({
    logger: {
      transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
      level: "info",
    },
  });

  await server.register(cors, {
    origin: [env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  });
  await server.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: "1 minute",
    keyGenerator: (req) => `${req.ip}:${req.headers["x-user-id"] ?? "anonymous"}`,
  });
  await server.register(sensible);
  await server.register(fastifySSE);
  await server.register(swagger, {
    openapi: {
      info: {
        title: "AI Creative Studio API",
        version: "0.1.0",
      },
    },
  });
  await server.register(swaggerUI, {
    routePrefix: "/api/docs",
  });

  server.register(async (instance) => {
    instance.register(jobRoutes, { prefix: "/api/jobs" });
    instance.register(webhookRoutes, { prefix: "/api/webhooks" });
    instance.register(adminRoutes, { prefix: "/api/admin" });
  });

  server.get("/health", async () => ({ status: "ok" }));

  server.get("/api/jobs/:id/stream", async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.sse({ data: JSON.stringify({ status: "listening" }) });
    const interval = setInterval(async () => {
      const job = await prisma.job.findUnique({ where: { id } });
      if (job) {
        reply.sse({ data: JSON.stringify(job) });
        if (job.status === "succeeded" || job.status === "failed") {
          clearInterval(interval);
          reply.raw.end();
        }
      }
    }, 3000);
    reply.raw.on("close", () => clearInterval(interval));
  });

  return server;
}

export async function start() {
  await startTelemetry();
  const server = await buildServer();
  try {
    await server.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 4000) });
    server.log.info(`API listening on ${process.env.PORT ?? 4000}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }

  const close = async () => {
    await shutdownTelemetry();
    await server.close();
    process.exit(0);
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
