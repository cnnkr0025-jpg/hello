import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db";
import { enqueueJob } from "../queue";
import { createQueuedJob } from "../services/job-service";

const jobSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  params: z.record(z.any()).optional(),
  provider: z.string().default("openai"),
  projectId: z.string().default("demo-project"),
});

export async function jobRoutes(app: FastifyInstance) {
  const bannedWords = ["불법", "금지", "혐오", "violence"];

  app.get("/", async (request, reply) => {
    const userId = (request.headers["x-user-id"] as string) ?? "demo-user";
    const jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    reply.send({ jobs });
  });

  app.post("/text", {
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute",
        keyGenerator: (request: any) => `${request.ip}:text:${request.headers["x-user-id"] ?? "anon"}`,
      },
    },
  }, async (request, reply) => {
    const body = jobSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const userId = (request.headers["x-user-id"] as string) ?? "demo-user";
    if (bannedWords.some((word) => body.data.prompt.includes(word))) {
      return reply.status(400).send({ error: "Prompt contains restricted language" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && user.quota <= 0) {
      return reply.status(429).send({ error: "Quota exceeded" });
    }
    const job = await createQueuedJob({
      type: "text",
      provider: body.data.provider,
      prompt: body.data.prompt,
      params: body.data.params,
      userId,
      projectId: body.data.projectId,
    });

    await enqueueJob({ id: job.id, type: "text", provider: job.provider, prompt: job.prompt, params: job.params, userId, projectId: job.projectId });

    reply.code(201).send(job);
  });

  app.post("/image", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
        keyGenerator: (request: any) => `${request.ip}:image:${request.headers["x-user-id"] ?? "anon"}`,
      },
    },
  }, async (request, reply) => {
    const body = jobSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    const userId = (request.headers["x-user-id"] as string) ?? "demo-user";
    if (bannedWords.some((word) => body.data.prompt.includes(word))) {
      return reply.status(400).send({ error: "Prompt contains restricted language" });
    }
    const job = await createQueuedJob({
      type: "image",
      provider: body.data.provider,
      prompt: body.data.prompt,
      params: body.data.params,
      userId,
      projectId: body.data.projectId,
    });
    await enqueueJob({ id: job.id, type: "image", provider: job.provider, prompt: job.prompt, params: job.params, userId, projectId: job.projectId });
    reply.code(201).send(job);
  });

  app.post("/music", {
    config: {
      rateLimit: {
        max: 6,
        timeWindow: "1 minute",
        keyGenerator: (request: any) => `${request.ip}:music:${request.headers["x-user-id"] ?? "anon"}`,
      },
    },
  }, async (request, reply) => {
    const body = jobSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    const userId = (request.headers["x-user-id"] as string) ?? "demo-user";
    if (bannedWords.some((word) => body.data.prompt.includes(word))) {
      return reply.status(400).send({ error: "Prompt contains restricted language" });
    }
    const job = await createQueuedJob({
      type: "music",
      provider: "suno",
      prompt: body.data.prompt,
      params: body.data.params,
      userId,
      projectId: body.data.projectId,
    });
    await enqueueJob({ id: job.id, type: "music", provider: job.provider, prompt: job.prompt, params: job.params, userId, projectId: job.projectId });
    reply.code(201).send(job);
  });

  app.get("/:id", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return reply.status(404).send({ error: "Job not found" });
    }
    reply.send(job);
  });

  app.post("/:id/retry", async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const job = await prisma.job.update({
      where: { id: params.id },
      data: { status: "queued", progress: 0 },
    });
    await enqueueJob({
      id: job.id,
      type: job.type as string,
      provider: job.provider,
      prompt: job.prompt,
      params: job.params,
      userId: job.userId,
      projectId: job.projectId,
    });
    reply.send(job);
  });
}
