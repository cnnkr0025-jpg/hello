import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../db";
import type { Prisma } from "@prisma/client";
import { resolveAuthUser, parseBooleanFlag, createPublicId } from "./utils";
import {
  Difficulty,
  RoomMode,
  RoomStatus,
  Language,
  ParticipantRole,
  ParticipantStatus,
  Tier,
  MatchStatus,
} from "@prisma/client";
import { env } from "@ai/core";
import { generateProblem } from "../services/problem-service";

const createRoomBody = z.object({
  name: z.string().min(3).max(60),
  hint: z.string().max(160).optional(),
  maxPlayers: z.number().int().min(2).max(4),
  mode: z.nativeEnum(RoomMode),
  difficulty: z.nativeEnum(Difficulty),
  allowSpectate: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
  password: z.string().min(4).max(32).optional(),
  timeLimit: z.number().int().refine((value) => [10, 20, 30].includes(value), {
    message: "타임리밋은 10/20/30분만 선택 가능합니다.",
  }),
  languages: z.array(z.nativeEnum(Language)).min(1),
});

const listRoomsQuery = z.object({
  difficulty: z.nativeEnum(Difficulty).optional(),
  mode: z.nativeEnum(RoomMode).optional(),
  status: z.nativeEnum(RoomStatus).optional(),
  spectate: z.string().optional(),
  sort: z.enum(["latest", "players", "difficulty"]).default("latest"),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const startMatchBody = z.object({
  language: z.nativeEnum(Language),
  allowSpectate: z.boolean().optional(),
  enableSpecialProblem: z.boolean().optional(),
});

export const roomRoutes: FastifyPluginAsync = async (instance) => {
  instance.get("/", async (request) => {
    const query = listRoomsQuery.parse(request.query);
    const filters: any = {};
    if (query.difficulty) filters.difficulty = query.difficulty;
    if (query.mode) filters.mode = query.mode;
    if (query.status) filters.status = query.status;
    if (query.spectate) filters.allowSpectate = parseBooleanFlag(query.spectate);

    const orderBy: Prisma.RoomOrderByWithRelationInput[] = [];
    if (query.sort === "players") {
      orderBy.push({ participants: { _count: "desc" } });
      orderBy.push({ createdAt: "desc" });
    } else if (query.sort === "difficulty") {
      orderBy.push({ difficulty: "desc" });
      orderBy.push({ createdAt: "desc" });
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    const rooms = await prisma.room.findMany({
      where: filters,
      take: query.limit,
      orderBy,
      include: {
        participants: { include: { user: true } },
        matches: { select: { id: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return {
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        hint: room.hint,
        mode: room.mode,
        difficulty: room.difficulty,
        status: room.status,
        allowSpectate: room.allowSpectate,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.participants.filter((p) => p.role !== ParticipantRole.SPECTATOR && p.status === ParticipantStatus.joined).length,
        languages: room.languageOptions,
        icon: room.difficulty === Difficulty.easy ? "🟢" : room.difficulty === Difficulty.hard ? "🔴" : "🟡",
        latestMatchStatus: room.matches[0]?.status ?? null,
        createdAt: room.createdAt,
      })),
    };
  });

  instance.post("/", async (request, reply) => {
    const body = createRoomBody.parse(request.body);
    const user = await resolveAuthUser(request);

    if (body.mode === RoomMode.triple && body.maxPlayers < 3) {
      throw request.httpErrors.badRequest("1v1v1 모드는 최소 3인 이상이어야 합니다.");
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const createdToday = await prisma.room.count({
      where: {
        creatorId: user.id,
        createdAt: { gte: todayStart },
      },
    });

    const planLimits: Record<Tier, number> = {
      FREE: 3,
      BASIC: 10,
      PRO: Number(env.PRO_ROOM_LIMIT ?? "1000"),
    };

    if (createdToday >= planLimits[user.tier]) {
      throw request.httpErrors.forbidden("오늘 생성 가능한 방 수를 초과했습니다.");
    }

    const room = await prisma.room.create({
      data: {
        id: createPublicId("room"),
        name: body.name,
        hint: body.hint,
        mode: body.mode,
        difficulty: body.difficulty,
        maxPlayers: body.maxPlayers,
        isPrivate: body.isPrivate,
        password: body.isPrivate ? body.password : null,
        allowSpectate: body.allowSpectate,
        languageOptions: body.languages,
        timeLimitMinutes: body.timeLimit,
        creatorId: user.id,
        participants: {
          create: {
            userId: user.id,
            role: ParticipantRole.HOST,
            status: ParticipantStatus.joined,
            isReady: true,
          },
        },
      },
      include: { participants: true },
    });

    reply.code(201);
    return { room };
  });

  instance.post<{ Params: { id: string } }>("/:id/join", async (request, reply) => {
    const user = await resolveAuthUser(request);
    const body = z
      .object({ password: z.string().optional(), role: z.enum(["PLAYER", "SPECTATOR"]).default("PLAYER") })
      .parse(request.body ?? {});
    const room = await prisma.room.findUnique({
      where: { id: request.params.id },
      include: { participants: true },
    });
    if (!room) throw request.httpErrors.notFound("방을 찾을 수 없습니다.");

    if (room.isPrivate && room.password && room.password !== body.password) {
      throw request.httpErrors.unauthorized("비공개 방 비밀번호가 일치하지 않습니다.");
    }

    const existing = room.participants.find((p) => p.userId === user.id);

    if (body.role === "PLAYER") {
      const playerCount = room.participants.filter(
        (participant) => participant.role !== ParticipantRole.SPECTATOR && participant.status === ParticipantStatus.joined
      ).length;
      if (!existing && playerCount >= room.maxPlayers) {
        throw request.httpErrors.badRequest("참가 정원이 가득 찼습니다.");
      }
    }

    const participant = await prisma.roomParticipant.upsert({
      where: { roomId_userId: { roomId: room.id, userId: user.id } },
      update: {
        status: ParticipantStatus.joined,
        role: body.role === "PLAYER" ? ParticipantRole.PLAYER : ParticipantRole.SPECTATOR,
        isReady: body.role === "PLAYER",
        leftAt: null,
      },
      create: {
        roomId: room.id,
        userId: user.id,
        role: body.role === "PLAYER" ? ParticipantRole.PLAYER : ParticipantRole.SPECTATOR,
        status: ParticipantStatus.joined,
        isReady: body.role === "PLAYER",
      },
    });

    reply.code(existing ? 200 : 201);
    return { participant };
  });

  instance.post<{ Params: { id: string } }>("/:id/spectate", async (request) => {
    const user = await resolveAuthUser(request);
    const room = await prisma.room.findUnique({ where: { id: request.params.id } });
    if (!room) throw request.httpErrors.notFound("방을 찾을 수 없습니다.");
    if (!room.allowSpectate) {
      throw request.httpErrors.forbidden("관전이 허용되지 않은 방입니다.");
    }

    const session = await prisma.spectatorSession.create({
      data: {
        roomId: room.id,
        userId: user.id,
      },
    });

    return { session };
  });

  instance.post<{ Params: { id: string } }>("/:id/start", async (request) => {
    const user = await resolveAuthUser(request);
    const room = await prisma.room.findUnique({
      where: { id: request.params.id },
      include: {
        participants: { include: { user: true } },
        matches: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!room) throw request.httpErrors.notFound("방을 찾을 수 없습니다.");
    if (room.creatorId !== user.id) {
      throw request.httpErrors.forbidden("방 생성자만 대결을 시작할 수 있습니다.");
    }
    if (room.status !== RoomStatus.waiting) {
      throw request.httpErrors.badRequest("이미 대결이 시작되었습니다.");
    }
    const readyPlayers = room.participants.filter(
      (participant) => participant.role !== ParticipantRole.SPECTATOR && participant.status === ParticipantStatus.joined
    );
    if (readyPlayers.length < 2) {
      throw request.httpErrors.badRequest("대결을 시작하려면 최소 두 명의 참가자가 필요합니다.");
    }

    const body = startMatchBody.parse(request.body ?? {});
    if (!room.languageOptions.includes(body.language)) {
      throw request.httpErrors.badRequest("선택한 언어가 방에서 허용되지 않습니다.");
    }

    const problem = await generateProblem({
      difficulty: room.difficulty,
      tier: user.tier,
      allowSpecial: Boolean(body.enableSpecialProblem),
    });

    const match = await prisma.match.create({
      data: {
        id: createPublicId("match"),
        roomId: room.id,
        problemId: problem.id,
        mode: room.mode,
        difficulty: room.difficulty,
        language: body.language,
        allowSpectate: body.allowSpectate ?? room.allowSpectate,
        status: MatchStatus.active,
        timeLimitMinutes: room.timeLimitMinutes,
        startedAt: new Date(),
        participants: {
          createMany: {
            data: readyPlayers.map((participant) => ({
              userId: participant.userId,
              roomParticipantId: participant.id,
              eloBefore: participant.user?.elo ?? 1200,
            })),
          },
        },
      },
      include: { participants: true, problem: true },
    });

    await prisma.room.update({
      where: { id: room.id },
      data: { status: RoomStatus.ongoing },
    });

    return { match };
  });

  instance.get<{ Params: { id: string } }>("/:id", async (request) => {
    const user = await resolveAuthUser(request);
    const room = await prisma.room.findUnique({
      where: { id: request.params.id },
      include: {
        participants: { include: { user: true } },
        matches: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!room) throw request.httpErrors.notFound("방을 찾을 수 없습니다.");

    const isParticipant = room.participants.some((participant) => participant.userId === user.id);

    return {
      room,
      canSpectate: room.allowSpectate,
      isParticipant,
    };
  });
};
