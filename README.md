# AI Orchestrator Monorepo

A pnpm + Turborepo monorepo delivering a full-stack multi-modal AI orchestration platform.
It bundles a Next.js 14 dashboard, a Fastify REST/tRPC-ready backend, and a BullMQ worker
for asynchronous OpenAI + Suno job execution with Prisma/PostgreSQL, Redis, NextAuth, and
payment/webhook integrations.

## Repository Layout

```
apps/
  web/       # Next.js 14 App Router frontend (Tailwind + shadcn/ui)
  api/       # Fastify REST API with OpenAPI (Scalar UI) docs
  worker/    # BullMQ queue worker for async provider execution
packages/
  core/      # Shared types, env schema, RBAC, rate-limit, i18n utilities
  providers/ # Provider adapters for OpenAI (gpt-5 & gpt-image-1) and Suno v3/v4
  ui/        # Reusable shadcn-style component library
prisma/      # Prisma schema + initial migration
scripts/     # Seed, DB reset, key rotation utilities
```

## Prerequisites

- Node.js 20.x (LTS) – use the installer or `nvm-windows`
- pnpm 8.15+ (`npm install -g pnpm`)
- PostgreSQL 14+/Neon (or change to SQLite via `SQLITE_URL`)
- Redis 6+/Upstash
- (Optional) Cloudflare R2 / S3-compatible storage for generated assets
- (Optional) Toss Payments + Stripe accounts for billing flows

> **Windows tips**
>
> - Install PostgreSQL and Redis via [winget](https://learn.microsoft.com/windows/package-manager/winget/) or Docker Desktop.
> - Ensure `psql` and `redis-cli` are on PATH and services are running before seeding.
> - Run PowerShell as Administrator when first creating the database: `createdb ai_orchestrator`.

## Quick Start (Windows)

```powershell
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm generate

# 3. Create environment configuration
Copy-Item .env.example .env
# edit .env with your keys (see "Environment" below)

# 4. Apply schema (optional when using Prisma migrate)
#   pnpm exec prisma migrate deploy

# 5. Seed demo data (admin user, demo project, 5 sample jobs)
pnpm seed

# 6. Launch the entire stack (web + api + worker)
pnpm dev
```

Navigate to:

- Frontend: http://localhost:3000
- API (REST + OpenAPI docs): http://localhost:4000/api/docs
- Worker logs: shown in the terminal session

## Environment Variables

Edit `.env` (copied from `.env.example`). Important keys:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL URL (`SQLITE_URL` optional fallback) |
| `REDIS_URL` | Redis connection string for BullMQ + rate limit |
| `NEXTAUTH_SECRET` | 32+ char secret for NextAuth JWT |
| `OPENAI_API_KEY` | OpenAI API key (GPT-5 & gpt-image-1) |
| `SUNO_API_KEY` / `SUNO_BASE_URL` / `SUNO_USE_MOCK` | Suno v3/v4 credentials and optional mock toggle |
| `S3_*` | S3/R2 bucket credentials for result uploads |
| `STRIPE_*` / `TOSS_*` | Payment provider secrets and webhooks |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry OTLP collector (optional) |
| `ENCRYPTION_KEY` | 32 byte key for AES-256 key rotation script |
| `JWT_SIGNING_KEY` | Admin API token for RBAC/CLI tooling |
| `AUTH_DISABLED` / `TEST_BYPASS_AUTH` | Optional switches for local testing |

> **Key rotation**
>
> Rotate encrypted API keys with `pnpm exec tsx scripts/key-rotate.ts`. The script
> re-encrypts stored keys with the current `ENCRYPTION_KEY` and stamps `rotatedAt`.

## Development Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run web, api, worker concurrently (Vite-style hot reload) |
| `pnpm build` | Production build for all packages (Next/Vercel & worker bundles) |
| `pnpm lint` | ESLint on apps + packages |
| `pnpm test:unit` | Vitest suite (core utilities, provider adapters, web components) |
| `pnpm test:e2e` | Playwright E2E (auto-starts Next.js, stubs APIs) |
| `pnpm seed` | Seed admin account + demo jobs |
| `pnpm db:reset` | Truncate all Prisma tables (PostgreSQL) |
| `pnpm generate` | Prisma client generation |

### Testing details

- **Vitest**: provider adapters are fully mocked (OpenAI + Suno) to ensure deterministic unit tests.
- **Playwright**: runs a happy-path flow (`signin bypass → workflow submit → job detail preview`).
  Network calls to the Fastify API are stubbed to keep the suite hermetic. Start with `pnpm test:e2e`.

## API Overview

- `POST /api/jobs/{text|image|music}` — enqueue a job (validated via Zod, persisted via Prisma)
- `GET  /api/jobs/:id` — fetch job status/result metadata
- `POST /api/jobs/:id/retry` — requeue a failed job
- `GET  /api/jobs/:id/events` — Server-Sent Events stream emitting queue progress updates
- `POST /api/webhooks/suno` — Suno completion webhook handler
- `POST /api/webhooks/payments` — Toss/Stripe webhook handler (updates plan + usage)
- `GET  /api/admin/{users|usage|providers}` — Admin RBAC endpoints (require `x-admin-token`)

OpenAPI documentation with Scalar UI is exposed at **`/api/docs`**.
Sample REST clients are provided in `docs/api.http` (VS Code REST Client) and `docs/thunder-client.json`.

## Queue & Worker Pipeline

1. Fastify route validates payload, enforces per-user/model Redis quotas (burst + daily/monthly) and inserts a `Job` row.
2. Job is enqueued on BullMQ (`ai-orchestrator-jobs`). Dead-letter queue captures failures.
3. Worker (`apps/worker`) pulls jobs, marks them `processing`, calls the appropriate provider adapter, stores results + usage, and updates progress.
4. Queue events propagate back to the API, which emits Server-Sent Events consumed by the Next.js dashboard.

## Frontend Features

- Tailwind + shadcn/ui component library (`packages/ui`)
- Dashboard cards for recent text/image/music jobs with retry/share actions
- Workflow builder (prompt → model selection → parameters → submit) including policy acknowledgement checkbox
- Preset library (6 examples: text, image, music) with one-click population
- Project quota panel, usage overview page, and plan upsell CTA
- Job detail view with audio player/image preview and live progress via SSE
- NextAuth (Email/Google/GitHub/Credentials) + RBAC guards (USER/ADMIN)
- i18n seed (ko/en) via `@ai-stack/core`

## Provider Integrations

- **OpenAI**: GPT-5 chat completions (function calls supported) and GPT-Image-1 generation.
- **Suno**: v3/v4 music creation with polling + webhook support. Local development can enable the mock adapter (`SUNO_USE_MOCK=true`).
- Providers follow a strategy adapter contract:
  ```ts
  interface ProviderAdapter {
    createJob(input: CommonJobInput): Promise<CommonJob>;
    getJob(id: string): Promise<CommonJob>;
    cancelJob?(id: string): Promise<void>;
  }
  ```

## Payments & Webhooks

The payment service handles plan upgrades (Free → Plus → Pro) and usage-based charges. Toss Payments and Stripe events are persisted via `WebhookEvent` and routed through `PaymentService` to adjust plan/usage. Extend the stubs with real SDK calls when credentials are available.

## Deployment Guide

- **Frontend (Next.js)**: Deploy to Vercel. Configure environment variables (`NEXTAUTH_URL`, API URLs, provider keys). Enable Edge runtime if needed.
- **API + Worker**: Use Render or Fly.io (Node 20). Deploy `apps/api` and `apps/worker` separately, pointing to shared Neon PostgreSQL + Upstash Redis instances.
- **Storage**: Upload generated assets to Cloudflare R2 or AWS S3 using credentials from `.env`.
- **Observability**: Point `OTEL_EXPORTER_OTLP_ENDPOINT` to an OTLP collector (e.g. Grafana Tempo, Honeycomb). Optionally add `SENTRY_DSN` for error tracking.

### Deploy checklist

1. Provision Neon (PostgreSQL) and run `pnpm generate` + `pnpm exec prisma migrate deploy`.
2. Provision Upstash Redis (copy `REDIS_URL`).
3. Set environment variables on Vercel/Render/Fly (mirroring `.env` keys).
4. Enable HTTPS origins for CORS in `FRONTEND_URL` / `API_URL`.
5. Configure Toss/Stripe webhooks to target `/api/webhooks/payments`.
6. Rotate API keys using `scripts/key-rotate.ts` after uploading provider credentials.

## Data Model (Prisma)

- **User**: id, email, role (USER/ADMIN), plan (FREE/PLUS/PRO), quota JSON
- **Project**: multi-tenant projects with optional `teamId`, API keys, jobs, usage
- **Job**: request metadata + provider, prompt/params, status, progress, result URLs, usage, relations
- **Usage**: token/credit tracking for billing dashboards
- **ApiKey**: encrypted provider keys (`encryptedKey`, `rotatedAt`)
- **WebhookEvent**: persisted external webhooks (payments, Suno callbacks)

## Tooling & DX

- `pnpm dev` boots frontend, backend, and worker with shared env
- `scripts/seed.ts` seeds admin/demo data
- `scripts/db-reset.ts` truncates tables for a clean slate
- `scripts/key-rotate.ts` rotates stored API keys with AES-256-GCM
- `.env` schema validated via Zod (`packages/core/src/env.ts`) for meaningful startup errors
- GitHub Actions (`.github/workflows/ci.yml`) runs lint, unit tests, Playwright E2E, and publishes zip artefacts (configure upload step if needed)

## Packaging a Release ZIP

1. Run `pnpm install && pnpm build` on a clean workspace.
2. Optional: `pnpm prune --prod` to slim dependencies.
3. Create an archive from the repo root (Windows PowerShell):
   ```powershell
   Compress-Archive -Path * -DestinationPath ai-orchestrator.zip -Force
   ```
4. The archive contains everything required to deploy (apps, packages, prisma, scripts).

## Troubleshooting

- **Quota exceeded**: Redis keys follow `user:{userId}:model:{model}:minute|day|month`. Flush with `redis-cli FLUSHALL` during development.
- **Suno unavailable**: Set `SUNO_USE_MOCK=true` to enable the built-in mock adapter.
- **Email provider not configured**: the Credentials provider automatically activates when no OAuth/Magic Link credentials are set (useful for demos/tests).
- **Key rotation errors**: ensure `ENCRYPTION_KEY` is exactly 32 bytes; regenerate via `node -e "console.log(require('crypto').randomBytes(32).toString('utf8'))"`.

Happy building! 🚀
