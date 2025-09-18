import { FastifyPluginAsync } from "fastify";
import { prisma } from "../db";
import { resolveAuthUser } from "./utils";

export const userRoutes: FastifyPluginAsync = async (instance) => {
  instance.get("/me", async (request) => {
    const user = await resolveAuthUser(request);

    const recentMatches = await prisma.matchParticipant.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        match: { include: { room: true } },
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const appeals = await prisma.appeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      profile: user,
      recentMatches: recentMatches.map((entry) => ({
        matchId: entry.matchId,
        roomName: entry.match.room.name,
        result: entry.result,
        placement: entry.placement,
        eloBefore: entry.eloBefore,
        eloAfter: entry.eloAfter,
        pointsAwarded: entry.pointsAwarded,
        createdAt: entry.createdAt,
      })),
      transactions,
      appeals,
    };
  });
};
