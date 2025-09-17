import pino from "pino";
import { env } from "@ai-stack/core";

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});
