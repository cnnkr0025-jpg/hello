import { Prisma, PasteEvent } from "@prisma/client";
import { env } from "@ai/core";
import { prisma } from "../db";

export type PastePayload = {
  matchId: string;
  userId: string;
  submissionId?: string;
  byteSize: number;
  source?: string;
};

export async function recordPasteEvents(payloads: PastePayload[]) {
  if (payloads.length === 0) return [] as PasteEvent[];
  const events: Prisma.PasteEventCreateManyInput[] = payloads.map((payload) => ({
    submissionId: payload.submissionId,
    matchId: payload.matchId,
    userId: payload.userId,
    byteSize: payload.byteSize,
    blocked: payload.byteSize > 20_000,
    source: payload.source,
    gptZeroScore: estimateGptZeroScore(payload.byteSize),
    detectedAt: new Date(),
  }));
  await prisma.pasteEvent.createMany({ data: events });
  return prisma.pasteEvent.findMany({
    where: {
      matchId: payloads[0]?.matchId,
      userId: payloads[0]?.userId,
    },
    orderBy: { detectedAt: "desc" },
    take: payloads.length,
  });
}

export function estimateAiUseScore(code: string, pasteEvents: PasteEvent[]) {
  const baseScore = Math.min(1, code.length / 8000);
  const pasteImpact = pasteEvents.reduce((acc, event) => acc + event.byteSize / 5000, 0);
  return Math.min(1, Number((baseScore + pasteImpact).toFixed(2)));
}

function estimateGptZeroScore(byteSize: number) {
  if (env.MOCK_GPTZERO === "true" || !env.GPTZERO_API_KEY) {
    return Number((Math.min(1, byteSize / 16000)).toFixed(2));
  }
  return Number((Math.min(1, byteSize / 8000) * 0.85).toFixed(2));
}
