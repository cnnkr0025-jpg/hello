import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../db";
import { resolveAuthUser, createPublicId } from "./utils";
import { Language, MatchStatus, Verdict, Tier, ParticipantRole } from "@prisma/client";
import { recordPasteEvents, estimateAiUseScore } from "../services/fairplay-service";
import { enqueueJudgeJob } from "../queue";

const submissionBody = z.object({
  code: z.string().min(1, "코드를 입력해 주세요."),
  lang: z.nativeEnum(Language),
  keystrokes: z.any().optional(),
  pasteEvents: z
    .array(
      z.object({
        byteSize: z.number().int().positive(),
        source: z.string().optional(),
      })
    )
    .optional(),
});

export const matchRoutes: FastifyPluginAsync = async (instance) => {
  instance.get<{ Params: { id: string } }>("/:id", async (request) => {
    const user = await resolveAuthUser(request);
    const match = await prisma.match.findUnique({
      where: { id: request.params.id },
      include: {
        participants: { include: { user: true } },
        submissions: { include: { user: true } },
        problem: true,
        room: true,
        judgment: true,
      },
    });
    if (!match) throw request.httpErrors.notFound("매치를 찾을 수 없습니다.");

    const sanitizedSubmissions = match.submissions.map((submission) => {
      const canViewCode = submission.isPublic || submission.userId === user.id;
      return {
        ...submission,
        code: canViewCode ? submission.code : null,
      };
    });

    return {
      match: {
        ...match,
        submissions: sanitizedSubmissions,
      },
      isParticipant: match.participants.some((participant) => participant.userId === user.id),
    };
  });

  instance.get<{ Params: { id: string } }>("/:id/problem", async (request) => {
    const user = await resolveAuthUser(request);
    const match = await prisma.match.findUnique({
      where: { id: request.params.id },
      include: { problem: true, room: true, participants: true },
    });
    if (!match || !match.problem) throw request.httpErrors.notFound("문제를 찾을 수 없습니다.");
    if (match.status === MatchStatus.cancelled) {
      throw request.httpErrors.badRequest("취소된 매치입니다.");
    }
    const isParticipant = match.participants.some((participant) => participant.userId === user.id);
    if (!isParticipant && !match.allowSpectate) {
      throw request.httpErrors.forbidden("관전이 허용되지 않았습니다.");
    }

    return {
      problem: {
        title: match.problem.title,
        prompt: match.problem.prompt,
        ioSpec: match.problem.ioSpec,
        difficulty: match.problem.difficulty,
        tags: match.problem.tags,
        publicTestcases: match.problem.publicTestcases,
      },
    };
  });

  instance.post<{ Params: { id: string } }>("/:id/submissions", async (request, reply) => {
    const user = await resolveAuthUser(request);
    const body = submissionBody.parse(request.body);
    const match = await prisma.match.findUnique({
      where: { id: request.params.id },
      include: {
        participants: true,
        room: true,
      },
    });
    if (!match) throw request.httpErrors.notFound("매치를 찾을 수 없습니다.");
    if (![MatchStatus.active, MatchStatus.pending].includes(match.status)) {
      throw request.httpErrors.badRequest("현재 제출할 수 없습니다.");
    }

    let participant = match.participants.find((p) => p.userId === user.id);
    if (!participant) {
      const roomMember = await prisma.roomParticipant.findFirst({
        where: { roomId: match.roomId, userId: user.id },
      });
      if (!roomMember || roomMember.role === ParticipantRole.SPECTATOR) {
        throw request.httpErrors.forbidden("참가자만 제출할 수 있습니다.");
      }
      const userProfile = await prisma.user.findUnique({ where: { id: user.id } });
      participant = await prisma.matchParticipant.create({
        data: {
          matchId: match.id,
          userId: user.id,
          roomParticipantId: roomMember.id,
          eloBefore: userProfile?.elo ?? 1200,
        },
      });
    }

    const submission = await prisma.submission.create({
      data: {
        id: createPublicId("sub"),
        matchId: match.id,
        userId: user.id,
        matchParticipantId: participant.id,
        lang: body.lang,
        code: body.code,
        verdict: Verdict.pending,
      },
    });

    if (body.keystrokes) {
      await prisma.keystrokeLog.upsert({
        where: { submissionId: submission.id },
        update: { timeline: body.keystrokes },
        create: {
          submissionId: submission.id,
          timeline: body.keystrokes,
        },
      });
    }

    const pasteEvents = await recordPasteEvents(
      (body.pasteEvents ?? []).map((event) => ({
        matchId: match.id,
        userId: user.id,
        submissionId: submission.id,
        byteSize: event.byteSize,
        source: event.source,
      }))
    );

    const aiUseScore = estimateAiUseScore(body.code, pasteEvents);

    await prisma.submission.update({
      where: { id: submission.id },
      data: { aiUseScore },
    });

    await enqueueJudgeJob({ submissionId: submission.id, matchId: match.id, userId: user.id });

    reply.code(201);
    return { submissionId: submission.id, aiUseScore, pasteEvents };
  });

  instance.post<{ Params: { submissionId: string } }>("/submissions/:submissionId/publish", async (request) => {
    const user = await resolveAuthUser(request);
    const submission = await prisma.submission.findUnique({ where: { id: request.params.submissionId } });
    if (!submission) throw request.httpErrors.notFound("제출을 찾을 수 없습니다.");
    if (submission.userId !== user.id) {
      throw request.httpErrors.forbidden("본인 제출만 공개할 수 있습니다.");
    }
    const updated = await prisma.submission.update({
      where: { id: submission.id },
      data: { isPublic: !submission.isPublic },
    });
    return { submission: updated };
  });

  instance.post<{ Params: { id: string } }>("/:id/request-review", async (request) => {
    const user = await resolveAuthUser(request);
    if (![Tier.BASIC, Tier.PRO].includes(user.tier)) {
      throw request.httpErrors.forbidden("Basic 이상 플랜에서만 심화 리뷰를 요청할 수 있습니다.");
    }
    const match = await prisma.match.findUnique({ where: { id: request.params.id } });
    if (!match) throw request.httpErrors.notFound("매치를 찾을 수 없습니다.");

    await prisma.transaction.create({
      data: {
        userId: user.id,
        deltaPoints: -15,
        reason: "advanced_review",
        refId: match.id,
      },
    });

    return { ok: true, message: "GPT-5 심화 리뷰가 곧 제공됩니다." };
  });

  instance.get<{ Params: { id: string } }>("/:id/judgment", async (request) => {
    await resolveAuthUser(request);
    const judgment = await prisma.judgment.findUnique({ where: { matchId: request.params.id } });
    if (!judgment) {
      throw request.httpErrors.notFound("아직 AI 리포트가 생성되지 않았습니다.");
    }
    return { judgment };
  });
};
