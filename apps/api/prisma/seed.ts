import {
  Tier,
  Difficulty,
  RoomMode,
  Language,
  ParticipantRole,
  ParticipantStatus,
  Verdict,
  MatchStatus,
  AppealType,
  AppealStatus,
} from "@prisma/client";
import { prisma } from "../src/db";

async function seedPlanFeatures() {
  const features: Array<{ tier: Tier; feature: string; enabled: boolean }> = [
    { tier: Tier.FREE, feature: "daily_matches", enabled: true },
    { tier: Tier.FREE, feature: "advanced_review", enabled: false },
    { tier: Tier.BASIC, feature: "daily_matches", enabled: true },
    { tier: Tier.BASIC, feature: "advanced_review", enabled: true },
    { tier: Tier.BASIC, feature: "ads_removed", enabled: true },
    { tier: Tier.PRO, feature: "daily_matches", enabled: true },
    { tier: Tier.PRO, feature: "advanced_review", enabled: true },
    { tier: Tier.PRO, feature: "special_problem_graph", enabled: true },
    { tier: Tier.PRO, feature: "special_problem_dp", enabled: true },
    { tier: Tier.PRO, feature: "room_cap_extended", enabled: true },
  ];

  for (const feature of features) {
    await prisma.planFeatureToggle.upsert({
      where: { tier_feature: { tier: feature.tier, feature: feature.feature } },
      update: { enabled: feature.enabled },
      create: feature,
    });
  }
}

async function main() {
  await seedPlanFeatures();

  const host = await prisma.user.upsert({
    where: { oauthProvider_oauthId: { oauthProvider: "google", oauthId: "demo-google" } },
    update: { nickname: "호스트", tier: Tier.PRO, elo: 1420, points: 520 },
    create: {
      oauthProvider: "google",
      oauthId: "demo-google",
      nickname: "호스트",
      tier: Tier.PRO,
      elo: 1420,
      points: 520,
      email: "host@example.com",
    },
  });

  const challenger = await prisma.user.upsert({
    where: { oauthProvider_oauthId: { oauthProvider: "github", oauthId: "demo-github" } },
    update: { nickname: "챌린저", tier: Tier.BASIC, elo: 1375, points: 260 },
    create: {
      oauthProvider: "github",
      oauthId: "demo-github",
      nickname: "챌린저",
      tier: Tier.BASIC,
      elo: 1375,
      points: 260,
      email: "challenger@example.com",
    },
  });

  const spectator = await prisma.user.upsert({
    where: { oauthProvider_oauthId: { oauthProvider: "kakao", oauthId: "demo-kakao" } },
    update: { nickname: "관전자", tier: Tier.FREE, elo: 1200 },
    create: {
      oauthProvider: "kakao",
      oauthId: "demo-kakao",
      nickname: "관전자",
      tier: Tier.FREE,
      elo: 1200,
      points: 0,
      email: "spectator@example.com",
    },
  });

  const room = await prisma.room.upsert({
    where: { id: "demo-room" },
    update: {},
    create: {
      id: "demo-room",
      name: "AI 한판 승부",
      hint: "DP 연습을 위한 힌트 포함",
      mode: RoomMode.duel,
      difficulty: Difficulty.medium,
      maxPlayers: 2,
      isPrivate: false,
      allowSpectate: true,
      languageOptions: [Language.python, Language.cpp],
      timeLimitMinutes: 20,
      creatorId: host.id,
    },
  });

  const hostRoomParticipant = await prisma.roomParticipant.upsert({
    where: { roomId_userId: { roomId: room.id, userId: host.id } },
    update: {},
    create: {
      roomId: room.id,
      userId: host.id,
      role: ParticipantRole.HOST,
      status: ParticipantStatus.joined,
      isReady: true,
    },
  });

  const challengerRoomParticipant = await prisma.roomParticipant.upsert({
    where: { roomId_userId: { roomId: room.id, userId: challenger.id } },
    update: {},
    create: {
      roomId: room.id,
      userId: challenger.id,
      role: ParticipantRole.PLAYER,
      status: ParticipantStatus.joined,
      isReady: true,
    },
  });

  await prisma.spectatorSession.create({
    data: {
      roomId: room.id,
      userId: spectator.id,
      startedAt: new Date(),
    },
  });

  const problem = await prisma.problem.upsert({
    where: { id: "demo-problem" },
    update: {},
    create: {
      id: "demo-problem",
      title: "최대 부분 수열 합",
      prompt: "정수 배열이 주어졌을 때, 연속된 부분 수열의 최대 합을 구하라.",
      ioSpec: "입력: N (1≤N≤200000) 과 정수 배열. 출력: 최대 합.",
      tags: ["dp", "array"],
      difficulty: Difficulty.medium,
      publicTestcases: {
        cases: [
          { input: "5\n1 -2 3 5 -1", output: "8" },
          { input: "3\n-1 -2 -3", output: "-1" },
        ],
      },
      hiddenTestcases: {
        cases: [
          { input: "6\n1 -5 2 2 2 -1", output: "5" },
        ],
      },
    },
  });

  const match = await prisma.match.upsert({
    where: { id: "demo-match" },
    update: {},
    create: {
      id: "demo-match",
      roomId: room.id,
      problemId: problem.id,
      mode: room.mode,
      difficulty: room.difficulty,
      language: Language.python,
      allowSpectate: true,
      status: MatchStatus.completed,
      timeLimitMinutes: room.timeLimitMinutes,
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      endedAt: new Date(),
    },
  });

  const hostParticipant = await prisma.matchParticipant.upsert({
    where: { matchId_userId: { matchId: match.id, userId: host.id } },
    update: { placement: 1, eloAfter: 1445, pointsAwarded: 40, result: Verdict.passed },
    create: {
      matchId: match.id,
      userId: host.id,
      roomParticipantId: hostRoomParticipant.id,
      placement: 1,
      eloBefore: host.elo,
      eloAfter: 1445,
      pointsAwarded: 40,
      result: Verdict.passed,
    },
  });

  const challengerParticipant = await prisma.matchParticipant.upsert({
    where: { matchId_userId: { matchId: match.id, userId: challenger.id } },
    update: { placement: 2, eloAfter: 1350, pointsAwarded: 10, result: Verdict.failed },
    create: {
      matchId: match.id,
      userId: challenger.id,
      roomParticipantId: challengerRoomParticipant.id,
      placement: 2,
      eloBefore: challenger.elo,
      eloAfter: 1350,
      pointsAwarded: 10,
      result: Verdict.failed,
    },
  });

  const winningSubmission = await prisma.submission.upsert({
    where: { id: "demo-submission-win" },
    update: {},
    create: {
      id: "demo-submission-win",
      matchId: match.id,
      userId: host.id,
      matchParticipantId: hostParticipant.id,
      lang: Language.python,
      code: "def solve():\n    ...",
      verdict: Verdict.passed,
      execStats: { runtimeMs: 42, memoryMb: 64 },
      similarity: 0.12,
      aiUseScore: 0.08,
      plagiarismScore: 0.05,
      isPublic: true,
    },
  });

  await prisma.keystrokeLog.upsert({
    where: { submissionId: winningSubmission.id },
    update: {},
    create: {
      submissionId: winningSubmission.id,
      timeline: { events: [{ t: 0, type: "type", value: "def" }] },
    },
  });

  await prisma.pasteEvent.create({
    data: {
      submissionId: winningSubmission.id,
      matchId: match.id,
      userId: host.id,
      byteSize: 120,
      blocked: false,
      gptZeroScore: 0.05,
      source: "editor",
    },
  });

  const losingSubmission = await prisma.submission.upsert({
    where: { id: "demo-submission-loss" },
    update: {},
    create: {
      id: "demo-submission-loss",
      matchId: match.id,
      userId: challenger.id,
      matchParticipantId: challengerParticipant.id,
      lang: Language.cpp,
      code: "int main(){return 0;}",
      verdict: Verdict.failed,
      execStats: { runtimeMs: 120, memoryMb: 80 },
      similarity: 0.52,
      aiUseScore: 0.42,
      plagiarismScore: 0.33,
      isPublic: false,
    },
  });

  await prisma.judgment.upsert({
    where: { matchId: match.id },
    update: {},
    create: {
      matchId: match.id,
      summary: "호스트 승리",
      explainMd: "- 장점: 선형 시간 DP 구현\n- 단점: 경계 조건에 대한 주석 부족",
      scoreCorrectness: 95,
      scorePerf: 90,
      scoreQuality: 85,
    },
  });

  await prisma.transaction.createMany({
    data: [
      { userId: host.id, deltaPoints: 40, reason: "match_win", refId: match.id },
      { userId: challenger.id, deltaPoints: 10, reason: "participation", refId: match.id },
    ],
    skipDuplicates: true,
  });

  await prisma.appeal.upsert({
    where: { id: "demo-appeal" },
    update: {},
    create: {
      id: "demo-appeal",
      userId: challenger.id,
      matchId: match.id,
      type: AppealType.score,
      text: "채점 로그를 다시 확인해 주세요.",
      status: AppealStatus.reviewing,
      resolutionNote: "재채점 예정",
    },
  });

  console.log("Seed completed for AI 코드 대결 플랫폼");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
