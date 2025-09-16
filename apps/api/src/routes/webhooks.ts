import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../db";

const sunoSchema = z.object({
  jobId: z.string(),
  status: z.enum(["queued", "processing", "succeeded", "failed"]),
  resultUrls: z.array(z.string().url()).optional(),
  usage: z
    .object({
      credits: z.number().optional(),
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
    })
    .optional(),
});

const paymentSchema = z.object({
  provider: z.enum(["toss", "stripe"]),
  event: z.string(),
  data: z.any(),
});

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/suno", async (request, reply) => {
    const body = sunoSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    const job = await prisma.job.update({
      where: { id: body.data.jobId },
      data: {
        status: body.data.status,
        progress: body.data.status === "succeeded" ? 100 : 50,
        resultUrls: body.data.resultUrls ?? [],
        usage: body.data.usage ?? {},
        raw: body.data,
      },
    });
    await prisma.webhookEvent.create({
      data: {
        provider: "suno",
        externalJobId: body.data.jobId,
        payload: body.data as any,
        handledAt: new Date(),
      },
    });
    reply.send({ ok: true, job });
  });

  app.post("/payments", async (request, reply) => {
    const body = paymentSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }
    await prisma.webhookEvent.create({
      data: {
        provider: body.data.provider,
        externalJobId: body.data.event,
        payload: body.data.data,
        handledAt: new Date(),
      },
    });
    reply.send({ received: true });
  });
}
