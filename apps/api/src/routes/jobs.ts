import type { FastifyPluginAsync } from "fastify";
import { JobService, CreateJobSchema } from "../services/job-service";
import { jobEvents } from "../lib/job-events";
import { SSE_EVENT_NAME } from "@ai-stack/core";

export const jobRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new JobService(fastify);

  fastify.get("/jobs", async (request, reply) => {
    const limit = Number((request.query as any)?.limit ?? 10);
    const jobs = await service.listJobs(limit);
    return jobs.map((job) => ({
      id: job.id,
      type: job.type,
      provider: job.provider,
      status: job.status,
      progress: job.progress,
      resultUrls: job.resultUrls,
      createdAt: job.createdAt,
    }));
  });

  fastify.get<{ Params: { id: string } }>("/jobs/:id", async (request, reply) => {
    try {
      const job = await service.getJob(request.params.id);
      return job;
    } catch (error) {
      reply.code(404).send({ message: "Job not found" });
    }
  });

  fastify.get<{ Params: { id: string } }>("/jobs/:id/events", async (request, reply) => {
    try {
      const job = await service.getJob(request.params.id);
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");

      reply.sse({
        id: Date.now().toString(),
        event: SSE_EVENT_NAME,
        data: { status: job.status, progress: job.progress },
      });

      const send = (payload: any) => {
        reply.sse({
          id: Date.now().toString(),
          event: SSE_EVENT_NAME,
          data: payload,
        });
      };

      const unsubscribe = jobEvents.onUpdate(request.params.id, send);

      request.raw.on("close", () => {
        unsubscribe();
      });
    } catch (error) {
      reply.code(404).send({ message: "Job not found" });
    }
  });

  fastify.post("/jobs/:type", async (request, reply) => {
    const type = (request.params as any).type as "text" | "image" | "music";
    if (!["text", "image", "music"].includes(type)) {
      reply.code(400).send({ message: "Invalid job type" });
      return;
    }
    const parsed = CreateJobSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      reply.code(400).send({ message: parsed.error.issues[0]?.message ?? "Invalid payload" });
      return;
    }
    try {
      const job = await service.createJob(type, parsed.data);
      reply.code(201).send(job);
    } catch (error) {
      reply.code(400).send({ message: error instanceof Error ? error.message : "Failed to create job" });
    }
  });

  fastify.post<{ Params: { id: string } }>("/jobs/:id/retry", async (request, reply) => {
    try {
      await service.retryJob(request.params.id);
      reply.send({ ok: true });
    } catch (error) {
      reply.code(400).send({ message: error instanceof Error ? error.message : "Failed to retry" });
    }
  });
};
