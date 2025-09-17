import type { FastifyInstance } from "fastify";
interface SubscriptionPayload {
  userId: string;
  plan: "FREE" | "PLUS" | "PRO";
  paymentProvider: "toss" | "stripe";
  externalId?: string;
}

export class PaymentService {
  constructor(private readonly fastify: FastifyInstance) {}

  async createSubscription(payload: SubscriptionPayload) {
    this.fastify.log.info({ payload }, "Creating subscription");
    await this.fastify.prisma.user.update({
      where: { id: payload.userId },
      data: { plan: payload.plan },
    });
    return { ok: true };
  }

  async recordUsageCharge(userId: string, credits: number, amount: number) {
    this.fastify.log.info({ userId, credits, amount }, "Recording usage charge");
    await this.fastify.prisma.usage.create({
      data: {
        userId,
        projectId: "seed-project",
        model: "usage-topup",
        inputTokens: 0,
        outputTokens: 0,
        credits,
        cost: amount,
      },
    });
  }

  async handleWebhook(event: any) {
    this.fastify.log.info({ event }, "Handling payment webhook");
    if (event.type === "subscription.updated") {
      await this.createSubscription({
        userId: event.metadata.userId,
        plan: event.metadata.plan,
        paymentProvider: event.provider ?? "stripe",
        externalId: event.id,
      });
    }
    if (event.type === "usage.charge") {
      await this.recordUsageCharge(event.metadata.userId, event.metadata.credits, event.amount);
    }
  }
}
