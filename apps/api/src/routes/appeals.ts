import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../db";
import { resolveAuthUser } from "./utils";
import { AppealType } from "@prisma/client";

const appealBody = z.object({
  matchId: z.string(),
  type: z.nativeEnum(AppealType),
  text: z.string().min(10, "이의신청 내용을 구체적으로 작성해 주세요."),
});

export const appealRoutes: FastifyPluginAsync = async (instance) => {
  instance.post("/", async (request, reply) => {
    const user = await resolveAuthUser(request);
    const body = appealBody.parse(request.body);

    const participation = await prisma.matchParticipant.findFirst({
      where: { matchId: body.matchId, userId: user.id },
    });
    if (!participation) {
      throw request.httpErrors.forbidden("대결에 참가한 사용자만 이의신청을 등록할 수 있습니다.");
    }

    const appeal = await prisma.appeal.create({
      data: {
        userId: user.id,
        matchId: body.matchId,
        type: body.type,
        text: body.text,
      },
    });

    reply.code(201);
    return { appeal };
  });

  instance.get("/mine", async (request) => {
    const user = await resolveAuthUser(request);
    const appeals = await prisma.appeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { appeals };
  });
};
