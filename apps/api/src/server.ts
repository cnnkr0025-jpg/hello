import "@total-typescript/ts-reset";
import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifySSE from "fastify-sse-v2";
import { env } from "@ai/core";
import { roomRoutes } from "./routes/rooms";
import { matchRoutes } from "./routes/matches";
import { userRoutes } from "./routes/users";
import { appealRoutes } from "./routes/appeals";
import { adminRoutes } from "./routes/admin";
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
    max: 120,
    timeWindow: "1 minute",
    keyGenerator: (req) => `${req.ip}:${req.headers["x-user-id"] ?? "guest"}`,
  });
  await server.register(sensible);
  await server.register(fastifySSE);
  await server.register(swagger, {
    openapi: {
      info: {
        title: "AI 코드 대결 플랫폼 API",
        version: "0.1.0",
        description:
          "AI 코드 대결 플랫폼의 방 생성, 대결, 채점, 공정성 모니터링 API 문서입니다. SSO 헤더(x-user-id/x-user-provider)를 사용해 인증합니다.",
      },
    },
  });
  await server.register(swaggerUI, {
    routePrefix: "/api/docs",
  });

  server.register(async (instance) => {
    instance.register(roomRoutes, { prefix: "/api/rooms" });
    instance.register(matchRoutes, { prefix: "/api/matches" });
    instance.register(userRoutes, { prefix: "/api/users" });
    instance.register(appealRoutes, { prefix: "/api/appeals" });
    instance.register(adminRoutes, { prefix: "/api/admin" });
  });

  server.get("/health", async () => ({ status: "ok" }));

  server.get("/api/matches/:id/stream", async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.sse({ data: JSON.stringify({ status: "listening" }) });
    const interval = setInterval(async () => {
      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          participants: { include: { user: true } },
          submissions: {
            where: { verdict: { not: "pending" } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          judgment: true,
        },
      });
      if (match) {
        reply.sse({
          data: JSON.stringify({
            status: match.status,
            endedAt: match.endedAt,
            submissions: match.submissions,
            judgment: match.judgment,
          }),
        });
        if (match.status === "completed" || match.status === "cancelled") {
          clearInterval(interval);
          reply.raw.end();
        }
      }
    }, 4000);
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
