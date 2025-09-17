import fp from "fastify-plugin";
import Redis from "ioredis";
import { env } from "@ai-stack/core";

type RedisClient = Redis;

export default fp(async (fastify) => {
  const client = new Redis(env.REDIS_URL);
  fastify.decorate("redis", client);
  fastify.addHook("onClose", async () => {
    await client.quit();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    redis: RedisClient;
  }
}
