import type { FastifyPluginAsync } from "fastify";

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(async (instance) => {
    instance.addHook("preHandler", instance.authenticate);

    instance.get("/admin/users", async () => {
      return instance.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          plan: true,
          quota: true,
        },
      });
    });

    instance.get("/admin/usage", async () => {
      const usage = await instance.prisma.usage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return usage;
    });

    instance.get("/admin/providers", async () => {
      const keys = await instance.prisma.apiKey.findMany({
        select: {
          id: true,
          provider: true,
          keyAlias: true,
          rotatedAt: true,
          createdAt: true,
        },
      });
      return keys;
    });
  });
};
