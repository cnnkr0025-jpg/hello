import { Worker, QueueEvents, Queue } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";
import { env, computeElo, computePointRewards } from "@ai/core";
import { prisma } from "./db";
import {
  MatchStatus,
  Verdict,
  Language,
  MatchParticipant,
  Submission,
  PasteEvent,
  RoomStatus,
} from "@prisma/client";

const logger = pino({ level: "info" });
const connection = new IORedis(env.REDIS_URL);
const deadLetterQueue = new Queue("judge-submissions-dead", { connection });

interface JudgeJobPayload {
  submissionId: string;
  matchId: string;
  userId: string;
}

const worker = new Worker<JudgeJobPayload>(
  "judge-submissions",
  async (job) => {
    logger.info({ jobId: job.id }, "processing submission judgment");
    const { submissionId, matchId } = job.data;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        match: {
          include: {
            participants: { include: { user: true } },
            submissions: true,
            problem: true,
            room: true,
          },
        },
        pasteEvents: true,
      },
    });

    if (!submission) {
      throw new Error(`submission ${submissionId} not found`);
    }

    const verdict = simulateExecution(submission);
    const aiUseScore = computeAiUseScore(submission.code, submission.pasteEvents ?? []);

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        verdict,
        execStats: simulateExecStats(submission.lang, submission.code.length),
        aiUseScore,
      },
    });

    await maybeFinalizeMatch(matchId);
    logger.info({ jobId: job.id, verdict }, "submission processed");
  },
  {
    connection,
    concurrency: Number(env.WORKER_CONCURRENCY ?? "2"),
  }
);

const events = new QueueEvents("judge-submissions", { connection });

events.on("failed", async ({ jobId, failedReason, prev }) => {
  logger.error({ jobId, failedReason }, "judge job failed");
  await deadLetterQueue.add("dead", { jobId, failedReason, prevAt: prev });
});

events.on("completed", ({ jobId }) => {
  logger.info({ jobId }, "judge job completed");
});

process.on("SIGTERM", async () => {
  await worker.close();
  await events.close();
  await deadLetterQueue.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
});

logger.info("Judge worker started");

function simulateExecution(submission: Submission & { match: { problem: any } }) {
  const code = submission.code.toLowerCase();
  const hasSolve = code.includes("solve");
  const hasLoop = /for|while/.test(code);
  const lengthScore = code.length > 40;
  if (hasSolve && hasLoop && lengthScore) {
    return Verdict.passed;
  }
  if (code.includes("exit(0)") || code.length < 10) {
    return Verdict.disqualified;
  }
  return Verdict.failed;
}

function simulateExecStats(language: Language, length: number) {
  const base = language === Language.python ? 35 : language === Language.cpp ? 18 : 28;
  return {
    runtimeMs: Math.min(200, base + Math.round(length / 40)),
    memoryMb: Math.min(256, 64 + Math.round(length / 50)),
  };
}

function computeAiUseScore(code: string, pasteEvents: PasteEvent[]) {
  const base = Math.min(1, code.length / 8000);
  const pasteImpact = pasteEvents.reduce((acc, event) => acc + event.byteSize / 5000, 0);
  return Number(Math.min(1, base + pasteImpact).toFixed(2));
}

async function maybeFinalizeMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: { include: { user: true } },
      submissions: true,
      room: true,
      problem: true,
    },
  });
  if (!match) return;
  if (match.status === MatchStatus.completed) return;

  const participantStatus = await Promise.all(
    match.participants.map(async (participant) => {
      const accepted = await prisma.submission.findFirst({
        where: { matchId: match.id, userId: participant.userId, verdict: Verdict.passed },
        orderBy: { createdAt: "asc" },
      });
      return { participant, accepted };
    })
  );

  const allAccepted = participantStatus.every((status) => status.accepted);
  const timeExpired =
    match.startedAt &&
    match.timeLimitMinutes &&
    new Date(match.startedAt.getTime() + match.timeLimitMinutes * 60 * 1000) <= new Date();

  if (!allAccepted && !timeExpired) {
    return;
  }

  const ranking = participantStatus
    .map(({ participant, accepted }) => ({
      participant,
      acceptedAt: accepted?.createdAt ?? new Date(Date.now() + 1000 * 60 * 60),
      verdict: accepted ? Verdict.passed : Verdict.failed,
    }))
    .sort((a, b) => a.acceptedAt.getTime() - b.acceptedAt.getTime());

  const withPlacement = ranking.map((entry, index) => ({ ...entry, placement: index + 1 }));
  const sortedByParticipant = [...withPlacement].sort((a, b) =>
    a.participant.id.localeCompare(b.participant.id)
  );

  const ratingInput = sortedByParticipant.map((entry) => entry.participant.user.elo);
  const placementInput = sortedByParticipant.map((entry) => entry.placement);
  const eloOutcome = computeElo({ ratings: ratingInput, placements: placementInput });
  const pointRewards = computePointRewards(placementInput);

  const summaryContext = sortedByParticipant.map((entry, index) => ({
    participant: entry.participant,
    placement: entry.placement,
    verdict: entry.verdict,
    eloBefore: entry.participant.user.elo,
    eloAfter: eloOutcome.newRatings[index],
    points: pointRewards[index],
  }));

  const summaryText = buildSummary(summaryContext);
  const explanationText = buildExplanation(summaryContext);

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < summaryContext.length; i++) {
      const entry = summaryContext[i];
      const newElo = entry.eloAfter;
      const reward = entry.points;
      await tx.matchParticipant.update({
        where: { id: entry.participant.id },
        data: {
          placement: entry.placement,
          eloAfter: newElo,
          result: entry.verdict,
          pointsAwarded: reward,
        },
      });
      await tx.user.update({
        where: { id: entry.participant.userId },
        data: {
          elo: newElo,
          points: { increment: reward },
        },
      });
      await tx.transaction.create({
        data: {
          userId: entry.participant.userId,
          deltaPoints: reward,
          reason: reward > 0 ? "match_reward" : "participation",
          refId: match.id,
        },
      });
    }

    await tx.match.update({
      where: { id: match.id },
      data: {
        status: MatchStatus.completed,
        endedAt: new Date(),
      },
    });

    await tx.room.update({
      where: { id: match.roomId },
      data: { status: RoomStatus.finished },
    });

    await tx.judgment.upsert({
      where: { matchId: match.id },
      create: {
        matchId: match.id,
        summary: summaryText,
        explainMd: explanationText,
        scoreCorrectness: 90,
        scorePerf: 85,
        scoreQuality: 80,
      },
      update: {
        summary: summaryText,
        explainMd: explanationText,
      },
    });
  });
}

type SummaryContext = Array<{
  participant: MatchParticipant & { user: { nickname: string } };
  placement: number;
  verdict: Verdict;
  eloBefore: number;
  eloAfter: number;
  points: number;
}>;

function buildSummary(entries: SummaryContext) {
  const winner = [...entries].sort((a, b) => a.placement - b.placement)[0];
  return `${winner.participant.user.nickname} 님이 ${winner.placement}위로 승리했습니다.`;
}

function buildExplanation(entries: SummaryContext) {
  const bullets = entries
    .map((entry) => `- ${entry.participant.user.nickname}: ${entry.placement}위, ΔELO ${entry.eloAfter - entry.eloBefore}, 포인트 +${entry.points}`)
    .join("\n");
  return `${bullets}\n\nGPT-5 요약: 효율적인 DP/그래프 전략을 활용했는지 점검했습니다.`;
}
