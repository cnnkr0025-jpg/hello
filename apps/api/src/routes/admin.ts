import type { FastifyInstance } from "fastify";
import { prisma } from "../db";
import { listProviders } from "@ai/providers";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const role = (request.headers["x-role"] as string) ?? "USER";
    if (role !== "ADMIN") {
      reply.code(403).send({ error: "Forbidden" });
    }
  });

  app.get("/users", async () => {
    const users = await prisma.user.findMany({ take: 20 });
    return { users };
  });

  app.get("/usage", async () => {
    const usage = await prisma.usage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { usage };
  });

  app.get("/providers", async () => {
    const providers = listProviders();
    const apiKeys = await prisma.apiKey.findMany();
    return { providers, apiKeys };
  });
}
