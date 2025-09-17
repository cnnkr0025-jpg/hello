# 배포 플레이북

본 가이드는 Vercel(프론트), Fly.io/EC2/Cloud Run(백엔드/샌드박스) 조합으로 AI 코드 대결 플랫폼을 운영하기 위한 단계별 전략을 다룹니다.

## 1. 환경 변수 구성

- OAuth: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`, `KAKAO_CLIENT_ID/SECRET`, `NAVER_CLIENT_ID/SECRET`.
- GPT-5: `OPENAI_API_KEY` (mock 사용 시 `MOCK_GPT5=true`).
- GPTZero: `GPTZERO_API_KEY`.
- Redis/DB: `REDIS_URL`, `DATABASE_URL`.
- 플랜 제한: `FREE_MATCH_LIMIT`, `BASIC_MATCH_LIMIT`, `PRO_ROOM_LIMIT`(=1000), `BASIC_REVIEW_ENABLED=true`.
- 샌드박스: `SANDBOX_DOCKER_IMAGE_PY`, `SANDBOX_DOCKER_IMAGE_CPP`, `SANDBOX_DOCKER_IMAGE_JAVA`.
- 스토리지: `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`.
- 로그: `OPENSEARCH_URL`, `OPENSEARCH_API_KEY`.

## 2. 인프라 계층

1. **Vercel**
   - `NEXT_PUBLIC_API_URL`, OAuth redirect URL 설정.
   - Preview 환경에서 mock 샌드박스(Worker 비활성)와 ReadOnly DB 사용.

2. **API 서버(Fly.io)**
   - Dockerfile → Fastify 서버 컨테이너.
   - `fly deploy --config fly.api.toml`.
   - Secrets: `fly secrets set ...`.
   - Horizontal scale with `fly scale count 2` (WebSocket sticky session은 Redis pub/sub으로 해결).

3. **샌드박스 워커(Firecracker)**
   - Fly Machines or AWS EC2 Nitro 기반.
   - Docker 이미지 캐시: `ghcr.io/ai-code-battle/runtime-python`, `runtime-cpp`, `runtime-java`.
   - `pnpm --filter @ai/worker build` 후 `docker push` → `fly deploy --config fly.worker.toml`.

4. **데이터베이스(PostgreSQL)**
   - Neon/Render/PlanetScale Postgres. Prisma Migrate CI에서 실행.
   - PITR(7일) 활성화, Logical replication(향후 분석용) 설정.

5. **Redis**
   - Upstash(초기) → AWS ElastiCache 전환 시 클러스터 모드.
   - Rate limit, BullMQ queue, WebSocket pub/sub 공유.

6. **S3 & OpenSearch**
   - Cloudflare R2 버킷(리전: APAC).
   - OpenSearch Service(도메인): submission-log, paste-events, appeals.

## 3. CI/CD 파이프라인

- GitHub Actions Workflow (`.github/workflows/ci.yml`)
  1. `pnpm install` + 캐시.
  2. `pnpm lint` (tsc --noEmit).
  3. `pnpm test` (Vitest + Playwright, mock 샌드박스 사용).
  4. `pnpm build`.
  5. Vercel preview deploy (`vercel pull --yes && vercel deploy --prod` for main).
  6. Fly.io deploy (API/Worker) — main branch 머지 시 자동.

## 4. 모니터링 & 알림

- Fastify + Pino → Loki/Grafana.
- OpenTelemetry traces → Tempo/Datadog.
- Sentry (web/api) → 오류 추적.
- Slack/Discord Webhook: 부정행위 탐지, 샌드박스 실패, SLA 임박 알림.

## 5. 운영 절차

1. **MVP 론칭 전**
   - D1~D14 로드맵 체크리스트 완수.
   - Alpha 테스터(10~50명) 초대, 피드백 수집.
2. **정식 서비스**
   - 요금제 플랜 활성화 (Free/Basic/Pro).
   - 포인트 → 기프티콘 교환 절차 문서화 (미성년자 보호, 월 상한).
   - SLA: 이의신청 X일 이내 1차 답변, 운영자 대시보드에서 타이머 확인.
3. **확장 단계**
   - 시즌 랭킹/업적, 관전 채팅, 연습 모드, 아바타 상점 백로그 우선순위화.
   - 샌드박스 워커 오토스케일, GPU 필요 시 그래프 문제용 특수 노드 도입.

