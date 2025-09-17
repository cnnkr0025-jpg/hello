import { config } from "dotenv";
import { z } from "zod";

config({ path: process.env.ENV_PATH || ".env" });

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    SQLITE_URL: z.string().optional(),
    REDIS_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(16),
    NEXTAUTH_URL: z.string().url(),
    OPENAI_API_KEY: z.string().min(1),
    SUNO_API_KEY: z.string().min(1),
    SUNO_BASE_URL: z.string().url().default("https://api.suno.ai"),
    SUNO_USE_MOCK: z.coerce.boolean().default(false),
    S3_ENDPOINT: z.string().url(),
    S3_ACCESS_KEY_ID: z.string().min(1),
    S3_SECRET_ACCESS_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    TOSS_SECRET_KEY: z.string().optional(),
    TOSS_CLIENT_KEY: z.string().optional(),
    TOSS_WEBHOOK_SECRET: z.string().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    SENTRY_DSN: z.string().optional(),
    ENCRYPTION_KEY: z.string().min(32, "ENCRYPTION_KEY must be 32 bytes"),
    JWT_SIGNING_KEY: z.string().min(32, "JWT_SIGNING_KEY must be 32 bytes"),
    EMAIL_SERVER: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_ID: z.string().optional(),
    GITHUB_SECRET: z.string().optional(),
    FRONTEND_URL: z.string().url(),
    API_URL: z.string().url(),
    WORKER_URL: z.string().url(),
    QUEUE_PREFIX: z.string().default("ai"),
    DEFAULT_LOCALE: z.enum(["ko", "en"]).default("ko"),
    AUTH_DISABLED: z.coerce.boolean().default(false),
    TEST_BYPASS_AUTH: z.coerce.boolean().default(false),
  })
  .superRefine((val, ctx) => {
    if (!val.STRIPE_SECRET_KEY && !val.TOSS_SECRET_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one payment provider key (Stripe or Toss) must be configured",
        path: ["STRIPE_SECRET_KEY"],
      });
    }
    return val;
  });

export type Env = z.infer<typeof EnvSchema>;

export const env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.format());
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
})();

export const isProd = env.NODE_ENV === "production";
