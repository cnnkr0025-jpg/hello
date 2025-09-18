# AI 코드 대결 플랫폼 아키텍처 설계

본 문서는 "AI 코드 대결 플랫폼"의 요구사항 전체를 충족하는 백엔드/프론트/인프라 아키텍처를 정의합니다. 방 생성 → 참가(SSO) → AI 출제 → 제한시간 내 풀이 → 샌드박스 채점 → GPT-5 심판 리포트 → ELO/포인트 반영 → 코드 공개 여부 선택 → 이의신청의 핵심 루프와, 관전/보안/요금제 정책을 모두 반영합니다.

## 도메인 개요

- **모드**: 1v1, 1v1v1 (최대 4인 방) — `Room.mode`는 `duel`/`triple`, `Room.maxPlayers`는 2/3/4를 지원합니다.
- **언어**: Python / C++ / Java — `Match.language`와 `Submission.lang` enum으로 고정 지원.
- **보상 구조**: 승패는 ELO(`User.elo`)로, 보상은 포인트(`User.points`)로 관리하며 기프티콘 등으로 교환 가능(현금 불가). 교환/변경은 `transactions` 로그로 추적합니다.
- **관전**: `Room.allowSpectate`와 `SpectatorSession`으로 관리하며, 👀 아이콘과 필터(`GET /api/rooms?spectate=true`) 제공. 대결 중 코드 비공개, 종료 후 참가자 `POST /api/matches/:id/publish-code` 요청 시 공개됩니다.
- **이의신청**: `Appeal` 엔터티가 사용자의 이의제기를 받아들이고 운영자 SLA(X일 내 1차 답변)를 트래킹합니다.

## 시스템 구성

```
apps/
  api/        # Fastify REST API + WebSocket 게이트웨이 + OpenAPI 문서
  web/        # Next.js 14 App Router + Tailwind + React Query + Monaco 에디터 UI
  worker/     # BullMQ 기반 judge-submissions 워커 (샌드박스 + GPT-5 호출)
packages/
  core/       # 환경 변수, 암호화, RBAC, ELO 계산기
  providers/  # GPT-5, GPTZero, Problem generator 어댑터 (Mock 포함)
  ui/         # shadcn/ui 기반 공용 UI 컴포넌트
```

### 데이터 플로우

1. **SSO 로그인**: Google/GitHub/Kakao/Naver OAuth → NextAuth → API JWT 발급 → `users` upsert(`oauth_provider`, `nickname`, `tier`).
2. **방 생성**: `POST /api/rooms` → Prisma → `Room`, `RoomParticipant(HOST)` 저장. 난이도(E/M/H), 타임리밋(10/20/30분), 언어 선택, 관전 허용, 비공개 비밀번호 옵션 처리.
3. **참가/관전**: `POST /api/rooms/:id/join` 또는 `POST /api/rooms/:id/spectate`. Redis를 이용해 동시성 체크/레이트리밋. 관전 허용 방만 SSE/WebSocket 구독 허용.
4. **AI 출제**: `POST /api/matches/:id/spawn-problem` → `Problem` 생성. `providers` 패키지의 GPT-5 기반 생성기 사용(난이도·특수 문제 Pro 전용, 히든 케이스 포함). `AI 검증기`가 오류 발생 시 자동 재생성.
5. **대결 진행**: Next.js 페이지에서 Monaco 에디터 + 타이머(`WebSocket roomTick`) + 붙여넣기 제어(`PasteGuard` hook). 붙여넣기 이벤트는 `PasteEvent`로 API 전송, 5KB 이상이면 GPTZero 검사 큐에 등록.
6. **제출/채점**: `POST /api/matches/:id/submissions` → `Submission`(verdict=`pending`) 저장 → `judge-submissions` 큐 enqueue. 워커는 Docker/Firecracker 샌드박스로 코드 실행, 히든 테스트 포함. 결과/exec stats/AST 분석 → GPT-5 심판 호출 → `Judgment`와 `Submission` 업데이트. 동시에 표절 탐지(AST/토큰 분포/과거 제출물 대조) 수행.
7. **결과 처리**: 모든 참가자 제출 완료 또는 타이머 종료 시 `Match`를 `completed`로 마킹, `ELO`(`packages/core/elo.ts`) 계산, `Transactions`로 포인트 변동 저장. Basic/Pro 요금제는 심화 리뷰/특수 문제 기능을 호출.
8. **코드 공개**: 참가자가 `POST /api/submissions/:id/publish` 호출 시 `Submission.isPublic` 토글, 관전자/다른 참가자에게 노출.
9. **이의신청**: `POST /api/appeals` → 운영자 대시보드(`apps/web/app/(admin)/appeals`)에서 처리. 로그/샌드박스 기록/S3 저장 본문 확인 가능.

## 데이터베이스 스키마

Prisma 스키마(`apps/api/prisma/schema.prisma`)는 요구된 모든 테이블을 정의합니다.

- `User`: OAuth 프로필, 닉네임, `tier(FREE/BASIC/PRO)`, `elo`, `points`, `strikes` 포함.
- `Room`: 난이도(`easy/medium/hard`), 모드(`duel/triple`), `maxPlayers`, `status(waiting/ongoing/finished)`, 비공개 비밀번호, 관전 허용.
- `RoomParticipant`: 참가자/관전자를 추적하며 role(HOST/PLAYER/SPECTATOR)과 ready 상태 보유.
- `Match`: `roomId`, `problemId`, `mode`, `difficulty`, `timeLimitMinutes`, `allowSpectate`, `status`, `startedAt/endedAt`.
- `MatchParticipant`: 실시간 ELO/포인트 변화를 기록하고 최종 성적(`placement`)을 저장.
- `Problem`: 프롬프트, 입출력 사양, 태그 배열, 난이도, 히든 테스트 blob, 버전.
- `Submission`: 언어(enum), 코드, verdict(`pending/passed/failed/disqualified`), 실행 통계, 표절 similarity, AI 사용 점수, 공개 여부, 제출 시각.
- `Judgment`: GPT-5 요약, 장단점 Markdown(`explainMd`), correctness/perf/quality 점수.
- `Transaction`: 포인트 증감, 사유(`match_win`, `review_request`, `reward_redeem` 등) 기록.
- `Appeal`: 이의신청 유형(`score`, `cheating`, `system`), 설명 텍스트, 상태(`pending/reviewing/resolved/rejected`), 운영자 노트.
- `KeystrokeLog`: 키 입력 타임라인 blob(JSON Lines), 제출과 연결.
- `PasteEvent`: 붙여넣기 감시, `byteSize`, `blocked`, `gptZeroScore` 저장.
- `SpectatorSession`: 관전 세션(사용자, 방, 시작/종료) 기록.
- `PlanFeatureToggle`: 요금제별 기능 접근 여부(MVP Basic/Pro) 정의.

## 서비스 계층

- `AuthService`: OAuth 콜백 처리, Tier 적용, strikes 관리.
- `RoomService`: 방 생성, 비공개 비번 검증, 참가/관전, 정렬·필터, ready 체크, WebSocket broadcast.
- `ProblemService`: 난이도/언어 기반 문제 생성, AI 검증 반복, 특수 문제(Pro) 활성화.
- `SandboxService`: Docker/Firecracker 템플릿 관리, 언어별 실행 이미지, 리소스 제한(CPU, 메모리, wall time) 적용.
- `JudgingService`: 큐 enqueue, 실행 결과 파싱, 히든 테스트 비교, GPT-5 리포트 생성, 점수 계산.
- `FairplayService`: 표절/붙여넣기/AI 사용 탐지(GPTZero API), KeyStroke 로그 수집, 영구 저장, strikes 증가 및 영구정지.
- `RankingService`: ELO 업데이트, 포인트 차등 지급, 시즌 리더보드(백로그) 준비.
- `BillingService`: 플랜별 제한(일일 대결 횟수, 방 생성 한도 1,000개, 광고 제거), 기프티콘 교환, 토스/Stripe 연동.
- `AppealService`: 이의신청 수집, SLA 타이머, 운영자 대시보드 노출.

## API & 실시간 채널

| 기능 | REST 엔드포인트 | WebSocket/SSE |
| --- | --- | --- |
| 방 목록/필터 | `GET /api/rooms` (쿼리: difficulty, status, spectate, sort) | `rooms:list` 갱신 이벤트 |
| 방 생성 | `POST /api/rooms` | `rooms:created` 브로드캐스트 |
| 참가/관전 | `POST /api/rooms/:id/join`, `POST /api/rooms/:id/spectate` | `rooms:participants`, `rooms:spectators` |
| 대결 시작 | `POST /api/rooms/:id/start` | `match:tick`, `match:state` |
| 문제 수령 | `GET /api/matches/:id/problem` | - |
| 제출 | `POST /api/matches/:id/submissions` | `match:submission` 알림 |
| 심판 리포트 | `GET /api/matches/:id/judgment` | `match:judgment` |
| 코드 공개 | `POST /api/submissions/:id/publish` | `match:code-public` |
| 이의신청 | `POST /api/appeals` | `appeals:status`(운영자) |
| 포인트/멤버십 | `GET /api/users/me`, `POST /api/membership/upgrade` | `user:points` |

## 공정성 & 보안 세부사항

- **로그 수집**: `PasteGuard`와 `KeystrokeRecorder`가 클라이언트 이벤트를 배치 전송 → OpenSearch 인덱싱.
- **AI 탐지**: 붙여넣기 크기 5KB 이상 → `GPTZero` API 호출 → `aiUseScore` 저장. 점수 임계치 초과 시 `strikes` 증가 및 운영자 경고.
- **표절 방지**: AST 파싱(언어별), 토큰 분포 비교, 과거 제출과 유사도(`similarity`) 기록.
- **샌드박스**: 언어별 Docker 이미지(파이썬, clang, OpenJDK). Firecracker VM으로 실행, 네트워크 차단, 제한(2 CPU, 512MB, 3s).
- **부정 제재**: 규정 명문화, 영구정지 시 Appeals 경로 제공. 모든 조치는 `strikes`/`transactions`와 연동.

## 요금제 가드

- **Free**: 일일 대결 횟수 제한(환경변수 `FREE_MATCH_LIMIT`), 관전 허용, 광고 노출.
- **Basic**: `심화 리뷰 요청` API(`POST /api/matches/:id/request-review`) 활성화, 광고 제거 옵션.
- **Pro**: 특수 문제 출제(`ProblemService`에서 그래프/DP 태그 허용), AI 해설 심화(대안 알고리즘 + 후속 문제 추천), 방 생성 한도 하루 1,000개.

## 배포 토폴로지

- **Vercel**: Next.js 앱 호스팅, Env에 OAuth 키/NEXT_PUBLIC_API_URL 설정.
- **Fly.io or Cloud Run**: Fastify API + WebSocket 서버, Horizontal scaling with Redis session store.
- **샌드박스 워커**: Fly Machines/Fargate에 Firecracker 런타임 배포, Docker 이미지 캐시.
- **데이터베이스**: PostgreSQL (Neon/Planetscale Postgres), Prisma Migrate 자동화.
- **Redis**: Upstash/Redis Enterprise, BullMQ 큐 + 레이트 리밋 + 소켓 세션 공유.
- **S3 호환**: Cloudflare R2 저장소, 코드/로그/리포트 업로드, 서명 URL.
- **OpenSearch**: 로그 및 메타데이터 검색, 이의신청 조사 지원.
- **CI/CD**: GitHub Actions → pnpm lint/test/build → Terraform/Flightplan으로 인프라 배포.

## 모니터링 & 알림

- Pino + OpenTelemetry → Grafana Cloud/Datadog.
- Sentry DSN 설정, 샌드박스 실패/부정행위 감지 시 Slack/Discord Webhook 알림.
- 이의신청 SLA 미준수 시 Opsgenie 알림.

## 백로그 반영

아직 구현되지 않은 리플레이, 시즌 랭킹, 관전 채팅, 연습 모드, 아바타·테마 상점은 설계 시 확장 가능한 이벤트 스키마를 도입하여 추후 `ReplayEvent`, `Achievement`, `SocialNotification` 테이블로 확장 가능합니다.

