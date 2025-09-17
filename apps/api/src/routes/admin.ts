import { FastifyPluginAsync } from "fastify";
import { prisma } from "../db";
import { AppealStatus } from "@prisma/client";

function ensureAdmin(request: any) {
  const adminFlag = request.headers["x-admin"];
  if (!adminFlag || (Array.isArray(adminFlag) ? adminFlag[0] : adminFlag) !== "true") {
    throw request.httpErrors.forbidden("관리자 전용 엔드포인트입니다.");
  }
}

export const adminRoutes: FastifyPluginAsync = async (instance) => {
  instance.get("/appeals/pending", async (request) => {
    ensureAdmin(request);
    const appeals = await prisma.appeal.findMany({
      where: { status: AppealStatus.pending },
      orderBy: { createdAt: "asc" },
      include: { user: true, match: true },
      take: 20,
    });
    return { appeals };
  });

  instance.get("/submissions/flagged", async (request) => {
    ensureAdmin(request);
    const submissions = await prisma.submission.findMany({
      where: {
        OR: [
          { aiUseScore: { gte: 0.7 } },
          { similarity: { gte: 0.75 } },
          { plagiarismScore: { gte: 0.6 } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: true, match: true },
    });
    return { submissions };
  });

  instance.get<{ Params: { id: string } }>("/submissions/:id/logs", async (request) => {
    ensureAdmin(request);
    const submission = await prisma.submission.findUnique({
      where: { id: request.params.id },
      include: { keystrokeLog: true, pasteEvents: true },
    });
    if (!submission) {
      throw request.httpErrors.notFound("제출을 찾을 수 없습니다.");
    }
    return { submission };
  });
};
