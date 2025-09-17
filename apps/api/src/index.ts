import { buildServer } from "./server";
import { env } from "@ai-stack/core";
import { initTracing } from "./lib/tracing";

initTracing();

const start = async () => {
  const server = await buildServer();
  try {
    await server.listen({ port: 4000, host: "0.0.0.0" });
    server.log.info(`API server running on ${env.API_URL}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

start();
