# AI Creative Studio Monorepo

AI Creative Studio is a production-ready monorepo that showcases an end-to-end workflow for generating text, images, and music using OpenAI and Suno. It features a Next.js 14 dashboard, a Fastify REST API with automatic OpenAPI docs, BullMQ queue workers, PostgreSQL/Prisma data layer, Redis rate limiting, and full CI automation.

## Repository Layout

```
.
├── apps
│   ├── api       # Fastify REST API + OpenAPI docs + Prisma migrations
│   ├── web       # Next.js 14 App Router frontend with Tailwind & shadcn/ui
│   └── worker    # BullMQ worker that executes model jobs asynchronously
├── packages
│   ├── core      # Shared env config, RBAC, crypto helpers
│   ├── providers # Provider adapters for OpenAI & Suno (Strategy pattern)
│   └── ui        # Shared UI primitives (shadcn/ui powered)
├── prisma        # Managed inside apps/api/prisma
├── scripts       # Cross-platform Node helpers (dev, build, seed, etc.)
├── .http         # Thunder Client / REST client samples
└── .github       # GitHub Actions CI workflow
```

## Key Features

- **Frontend**: Next.js 14 App Router, Tailwind, shadcn/ui, lucide-react, SWR + SSE job watcher, preset-driven workflow builder, quota warnings, i18n (ko/en), usage & billing dashboard, project/key management, policy acknowledgement banner, and error handling for banned prompts & quota limits.
- **Backend**: Fastify REST API, Redis-backed rate limiting (per-user/IP & per-model tiers), BullMQ queue orchestration, Prisma ORM, encrypted API keys, webhook receivers (Suno + Toss/Stripe), SSE streams for job updates, OpenTelemetry + Pino logging, automatic OpenAPI docs (`/api/docs`), admin endpoints with RBAC, dead-letter queue with notifications.
- **Worker**: BullMQ worker with retry/backoff, dead-letter queue publishing, OpenAI/Suno provider dispatch, usage tracking, and Prisma updates.
- **Providers**: Strategy pattern adapters for OpenAI GPT-5 chat & gpt-image-1, Suno v4 tracks (polling + webhook), mock toggles for offline/test usage.
- **Security**: Strict Zod validation, encrypted secrets (AES-256-GCM), key rotation script, quota enforcement, banned-word detection, JWT-based NextAuth with Prisma adapter, RBAC helper utilities.
- **Payments**: Toss & Stripe webhook stubs, plan/quota definitions (Free/Plus/Pro), usage reporting, upgrade prompts.
- **Observability**: Pino structured logging, optional OTLP exporter, Sentry DSN placeholder, CI artifact packaging.
- **DX**: pnpm + turbo monorepo, `pnpm dev` one-command multi-app dev, seed script creating admin/demo data, Thunder Client & .http samples, Playwright + Vitest tests, GitHub Actions pipeline shipping ready-to-deploy ZIP.

## Prerequisites

- **Windows 10/11** (WSL not required). Use PowerShell 7+ or Git Bash.
- **Node.js 20** and **pnpm 8.15+** (`corepack enable` recommended).
- **PostgreSQL 14+** *(or SQLite for quick local demo)*.
- **Redis 7+** (Upstash-compatible).
- Optional: **Docker Desktop** (for quick Postgres/Redis), **Stripe CLI**, **Toss Payments test account**, **Cloudflare R2/S3-compatible storage**.

## Environment Variables

Copy `.env.example` to `.env` at the repository root and adjust values:

```powershell
Copy-Item .env.example .env
```

Key variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string or `file:./dev.db` for SQLite. |
| `REDIS_URL` | Redis/Upstash connection string. |
| `OPENAI_API_KEY` / `SUNO_API_KEY` | API keys (set `MOCK_OPENAI=true`, `MOCK_SUNO=true` for sandboxing). |
| `NEXTAUTH_SECRET` | Random string for NextAuth JWT encryption. |
| `NEXTAUTH_URL` | Base URL of the web app (e.g., `http://localhost:3000`). |
| `FRONTEND_URL` / `API_URL` / `NEXT_PUBLIC_API_URL` | Internal and public URLs for web/API. |
| `TOSS_*`, `STRIPE_*` | Payment gateway credentials + webhook secrets. |
| `S3_*` | Cloudflare R2 or S3 compatible storage credentials for signed URL uploads. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Optional OTLP collector URL for OpenTelemetry traces. |
| `ENCRYPTION_KEY` | 32+ char key for AES-256-GCM encryption at rest. |

### Switching to SQLite

Set:

```env
DATABASE_URL="file:./dev.db"
```

Then run:

```powershell
pnpm --filter @ai/api prisma db push --schema apps/api/prisma/sqlite.schema.prisma
```

The generated client works for SQLite and can be swapped back to PostgreSQL without code changes.

## Installation

```powershell
pnpm install
```

This command generates `pnpm-lock.yaml` and installs dependencies for all workspaces.

## Development Workflow

1. **Start services (Windows)**
   - PostgreSQL: use Docker Desktop or install locally. Example with Docker:
     ```powershell
     docker run --name ai-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:15
     ```
   - Redis: Upstash cloud or Docker:
     ```powershell
     docker run --name ai-redis -p 6379:6379 -d redis:7
     ```

2. **Run migrations & seed**
   ```powershell
   pnpm db:push          # Prisma schema sync
   pnpm seed             # scripts/seed.mjs -> creates admin/demo data
   ```

3. **Launch all apps**
   ```powershell
   pnpm dev
   ```
   - Web: http://localhost:3000 (Next.js with live reload)
   - API: http://localhost:4000 (Fastify REST API + Swagger UI at `/api/docs`)
   - Worker: BullMQ processor (auto-started via Turbo pipeline)

4. **Key rotation**
   ```powershell
   pnpm key:rotate       # rotates API keys with AES-256-GCM
   ```

5. **Reset database**
   ```powershell
   pnpm db:reset
   pnpm seed
   ```

### Scripts Summary

| Command | Description |
| --- | --- |
| `pnpm dev` | Turbo-run dev servers for web/api/worker with shared logs. |
| `pnpm build` | Production builds for all apps (Next.js build, tsc, etc.). |
| `pnpm lint` | Type-checking via `tsc --noEmit`. |
| `pnpm test` | Runs Vitest unit tests + Playwright E2E (Chromium). |
| `pnpm seed` | Executes Prisma seed (admin/demo data, API keys, jobs). |
| `pnpm key:rotate` | Rotates encrypted API keys. |
| `pnpm ci` | Shortcut for lint → test → build (mirrors GitHub Actions). |
| `pnpm --filter @ai/web test` | Run Playwright tests only (requires `npx playwright install`). |

## Frontend Highlights

- Dashboard with preset workflow builder (`프롬프트 → 모델 → 파라미터 → 제출`), SSE job monitor, quota warnings, banned word feedback, share/retry buttons.
- Project management page listing API keys with rotation timestamps and preset sharing guidance.
- Usage & billing page visualizing plan allocations (daily/monthly) with progress bars and upgrade CTA.
- Job detail view with audio player, image previews, text results, SSE-powered status widget, usage breakdown, and error fallback messaging.
- Built-in presets (6 total):
  - Text: *YouTube Script Draft (Korean)*, *Product Description SEO*
  - Image: *YouTube Thumbnail – Bold Typography*, *Logo Variations – Minimal*
  - Music: *Lo-fi Chill 90BPM*, *Ambient Drone 50–70 BPM*
- Policy banner requiring acknowledgement of Suno/OpenAI TOS & copyright responsibility.
- i18n dictionaries for Korean/English (extend in `apps/web/lib/i18n.ts`).

## Backend API

Base URL: `http://localhost:4000`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/jobs/text` | Queue a GPT-5 text job (quota + banned word checks). |
| `POST` | `/api/jobs/image` | Queue a gpt-image-1 image job. |
| `POST` | `/api/jobs/music` | Queue a Suno music track generation. |
| `GET` | `/api/jobs/:id` | Retrieve job status, usage, results. |
| `POST` | `/api/jobs/:id/retry` | Requeue a failed/completed job. |
| `GET` | `/api/jobs/:id/stream` | Server-Sent Events stream for live status. |
| `GET` | `/api/jobs` | List recent jobs for the authenticated user. |
| `POST` | `/api/webhooks/suno` | Suno completion webhook (updates job, logs event). |
| `POST` | `/api/webhooks/payments` | Toss/Stripe webhook listener. |
| `GET` | `/api/admin/users` | Admin-only user list. |
| `GET` | `/api/admin/usage` | Aggregated usage records. |
| `GET` | `/api/admin/providers` | Provider registry + stored API keys.

OpenAPI documentation is served at **`/api/docs`** via Scalar UI. Use the bundled Thunder Client collection or `.http/jobs.http` for quick testing.

### Rate Limiting

- Global Redis limiter keyed by `IP:userId`.
- Per-model throttling (`text` max 20/min, `image` max 10/min, `music` max 6/min).
- Responses return descriptive JSON errors (`Quota exceeded`, `Prompt contains restricted language`).

### Queue & Worker

- Jobs saved to Prisma with `queued` status, then enqueued to `generation-jobs` (BullMQ).
- Worker updates status to `processing`, dispatches provider adapters, saves usage + raw payload.
- Dead-letter queue `generation-jobs-dead` receives failures for admin review.
- Webhooks from Suno/Toss/Stripe recorded in `WebhookEvent` table.
- SSE endpoint polls Prisma every 3 seconds until job resolves.

### Provider Abstraction

`packages/providers` implements the strategy pattern:

```ts
interface ProviderAdapter {
  name: string;
  taskType: "text" | "image" | "music";
  createJob(input: CommonInput): Promise<CommonJob>;
  getJob(id: string): Promise<CommonJob>;
}
```

- **OpenAIAdapter** (text/image) integrates GPT-5 chat, function calling hooks, and `gpt-image-1` for generations/edits/variations.
- **SunoAdapter** (music) submits v4 track jobs, polls status, or accepts webhook payloads; includes mocks for unsupported endpoints.
- Toggle mocks using `MOCK_OPENAI=true` / `MOCK_SUNO=true` (default in `.env.example`).

## Database Schema (Prisma)

Models: `User`, `Project`, `Job`, `Usage`, `ApiKey`, `WebhookEvent`. See `apps/api/prisma/schema.prisma` for detailed relations, enums (`Role`, `Plan`, `JobType`, `JobStatus`), indexes, and unique constraints.

- Encrypted API keys stored as AES-256-GCM JSON payloads.
- Job records store prompt, params, usage, raw provider payload, progress, and result URLs.
- Usage records log per-model token/credit consumption with timestamps for billing.

Run migrations:

```powershell
pnpm --filter @ai/api prisma:generate
pnpm --filter @ai/api prisma:migrate
```

## Testing

- **Vitest** unit tests for provider registry (`packages/providers/tests/registry.test.ts`) and API job service (`apps/api/src/services/job-service.test.ts`) with mocked adapters/Prisma.
- **Playwright** E2E (`apps/web/tests/e2e.spec.ts`) covering login page render, dashboard presets, and submission UX. Install browsers once via `npx playwright install` (CI caches).

Execute full test suite:

```powershell
pnpm test
```

## CI/CD & Packaging

GitHub Actions (`.github/workflows/ci.yml`) performs lint → test → build → ZIP packaging. The workflow uploads `ai-studio.zip` containing `/apps`, `/packages`, `/scripts`, `.http`, README, and configuration files. The ZIP is ready for direct deployment or sharing.

## Deployment Guides

### Frontend (Vercel)

1. Import the repo into Vercel.
2. Set environment variables (use `.env.example`).
3. Configure build command `pnpm --filter @ai/web build` and output `.next`.
4. Enable Edge runtime if using Suno webhooks (optional).
5. Point custom domain and configure NextAuth `NEXTAUTH_URL` accordingly.

### Backend API (Render / Fly.io)

- **Render**: Deploy a Node service pointing to `apps/api`, build command `pnpm --filter @ai/api build`, start command `node apps/api/dist/server.js`. Provision Redis (Upstash) and Postgres (Render/Neon). Add environment variables.
- **Fly.io**: Use `fly launch` with Dockerfile referencing `apps/api`. Scale to multiple regions with Redis hosted on Upstash. Ensure `PORT` env set to `8080` (Fly default) and pass to Fastify.

### Worker (Render background job / Fly.io worker)

Deploy as a separate service using `pnpm --filter @ai/worker build` and start `node apps/worker/dist/worker.js`. Shares the same `.env` (Redis, Postgres, provider keys).

### Managed Services

- **Redis**: Upstash free tier works out-of-the-box (set `REDIS_URL`).
- **Postgres**: Neon or Supabase recommended. Update `DATABASE_URL` / `DIRECT_URL`.
- **Storage**: Cloudflare R2, AWS S3, or MinIO. Use `S3_*` env values and refer to README section “File uploads” below.
- **Telemetry**: Point `OTEL_EXPORTER_OTLP_ENDPOINT` to Honeycomb/Tempo collector. Otherwise console spans are emitted.
- **Sentry**: Set `SENTRY_DSN` and wrap Fastify/Next with the official SDK (hooks ready via env).

## File Uploads & Signed URLs

While generation results currently store external URLs, you can push to S3/R2 using the following pattern:

1. Configure `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`.
2. Generate presigned PUT URLs in the API (Fastify route) using AWS SDK v3.
3. Upload generated assets from the worker, then store the signed GET URL in `Job.resultUrls`.
4. README includes Cloudflare R2 configuration references.

## Payments & Billing

- Plans defined in `packages/core/src/config/plans.ts` (Free/Plus/Pro) with daily/monthly credit limits.
- Toss & Stripe webhooks handled at `/api/webhooks/payments`. Extend to validate signatures and update `Usage`/`User.plan` fields.
- Frontend usage page nudges upgrade when daily/monthly bars exceed thresholds.
- Quota enforcement placeholder: `User.quota` decreases on each job; `Quota exceeded` error triggers UI alert.

## Key Rotation

Run `pnpm key:rotate` to re-encrypt API keys with a fresh secret (AES-256-GCM). The script stamps `rotatedAt` for auditing. Documented in README and seed data includes sample keys.

## Mock & Testing Modes

- Set `MOCK_OPENAI=true` / `MOCK_SUNO=true` to bypass network calls and use deterministic placeholder data.
- `pnpm test` runs with mocks automatically (see Vitest setup). Useful for offline Windows development.

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| Fastify fails to start | Ensure `DATABASE_URL`, `REDIS_URL`, and `OPENAI_API_KEY` are set. Prisma throws descriptive errors. |
| Quota exceeded instantly | Run `pnpm seed` to reset quotas (`User.quota = 50000` for admin). |
| Playwright missing browsers | Run `npx playwright install` once on Windows. |
| Worker can’t connect to Redis | Check firewall or Upstash TLS (use `rediss://` URLs). |
| Suno webhook 400 | Ensure payload matches `sunoSchema` (jobId, status, resultUrls). |

## Deployment Checklist

- [ ] Configure Vercel environment variables (`NEXT_PUBLIC_API_URL`, `NEXTAUTH_URL`, OAuth secrets).
- [ ] Deploy API & worker (Render/Fly) with shared `.env`.
- [ ] Provision Redis (Upstash) and Postgres (Neon/Render) and update connection strings.
- [ ] Configure Toss & Stripe webhook endpoints pointing to `/api/webhooks/payments`.
- [ ] Set Cloudflare R2/S3 credentials if storing generated assets.
- [ ] Rotate secrets regularly using `pnpm key:rotate` and update `.env`.
- [ ] Enable OTLP exporter for production tracing, Sentry DSN for error monitoring.

## Packaging as ZIP

Running the CI workflow or the manual command below produces a deployable ZIP (`ai-studio.zip`) that contains all apps, packages, scripts, and environment templates:

```powershell
pnpm build
zip -r ai-studio.zip apps packages scripts .http README.md .env.example pnpm-workspace.yaml turbo.json tsconfig.base.json
```

The ZIP unpacks to a ready-to-run monorepo on Windows 10/11 with the same structure documented above.

## Additional Resources

- Thunder Client collection: `.http/thunder-collection_ai-studio.json`
- REST client snippets: `.http/jobs.http`
- Seed data: `apps/api/prisma/seed.ts`
- Key rotation: `apps/api/prisma/key-rotate.ts`
- Database reset: `apps/api/prisma/reset.ts`

Happy building! 🎨🎵🤖
