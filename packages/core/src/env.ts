import { config } from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  SUNO_API_KEY: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),
  JWT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  KAKAO_CLIENT_ID: z.string().optional(),
  KAKAO_CLIENT_SECRET: z.string().optional(),
  NAVER_CLIENT_ID: z.string().optional(),
  NAVER_CLIENT_SECRET: z.string().optional(),
  GPTZERO_API_KEY: z.string().optional(),
  PROBLEM_GEN_MODEL: z.string().default("gpt-5-problem"),
  MOCK_GPT5: z.string().optional(),
  MOCK_GPTZERO: z.string().optional(),
  MOCK_SUNO: z.string().optional(),
  FREE_MATCH_LIMIT: z.string().default("3"),
  BASIC_MATCH_LIMIT: z.string().default("10"),
  PRO_ROOM_LIMIT: z.string().default("1000"),
  BASIC_REVIEW_ENABLED: z.string().default("true"),
  PRO_SPECIAL_PROBLEM_ENABLED: z.string().default("true"),
  SANDBOX_DOCKER_IMAGE_PY: z.string().default("ghcr.io/ai-code-battle/runtime-python:latest"),
  SANDBOX_DOCKER_IMAGE_CPP: z.string().default("ghcr.io/ai-code-battle/runtime-cpp:latest"),
  SANDBOX_DOCKER_IMAGE_JAVA: z.string().default("ghcr.io/ai-code-battle/runtime-java:latest"),
  TOSS_SECRET_KEY: z.string().optional(),
  TOSS_CLIENT_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  REWARD_CATALOG_S3_PREFIX: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  OPENSEARCH_URL: z.string().optional(),
  OPENSEARCH_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  API_URL: z.string().default("http://localhost:4000"),
  WORKER_CONCURRENCY: z.string().default("2"),
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters long")
    .default("0123456789abcdef0123456789abcdef"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(overrides?: Record<string, string | undefined>): Env {
  if (cached && !overrides) {
    return cached;
  }

  config();
  const parsed = envSchema.safeParse({
    ...process.env,
    ...overrides,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid environment variables: ${message}`);
  }

  if (!overrides) {
    cached = parsed.data;
  }

  return parsed.data;
}

export const env = loadEnv();
