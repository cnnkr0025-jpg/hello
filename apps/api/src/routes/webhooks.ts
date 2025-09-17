import type { FastifyPluginAsync } from "fastify";
import { JobService } from "../services/job-service";
import { PaymentService } from "../services/payment-service";

export const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  const service = new JobService(fastify);
  const payments = new PaymentService(fastify);

  fastify.post("/webhooks/suno", async (request, reply) => {
    const body = request.body as any;
    if (!body?.jobId) {
      reply.code(400).send({ message: "Missing jobId" });
      return;
    }
    await service.updateJobResult(body.jobId, {
      status: body.status ?? "completed",
      progress: 100,
      resultUrls: body.resultUrls ?? [],
      usage: body.usage ?? {},
      raw: body,
    });
    reply.send({ ok: true });
  });

  fastify.post("/webhooks/payments", async (request, reply) => {
    const event = request.body as any;
    await fastify.prisma.webhookEvent.create({
      data: {
        provider: event.provider ?? "unknown",
        externalJobId: event.id ?? "n/a",
        payload: event,
        handledAt: new Date(),
      },
    });
    await payments.handleWebhook(event);
    reply.send({ ok: true });
  });
};
