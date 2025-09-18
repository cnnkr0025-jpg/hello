# AI 코드 대결 플랫폼 Monorepo

본 레포지토리는 "AI 코드 대결 플랫폼"의 MVP를 2주 안에 구현하기 위한 풀스택 모노레포입니다. 방 생성 → 참가 → AI 출제 → 제한시간 내 풀이 → 샌드박스 채점 → AI 리포트 → ELO/포인트 반영 → 코드 공개 여부 선택 → 이의신청까지 이어지는 핵심 루프를 지원하며, 모든 정책·요구사항을 빠짐없이 반영합니다.

## 서비스 개요

- **가칭**: AI 코드 대결 플랫폼
- **모드**: 1v1 / 1v1v1 (지원 인원 2/3/4)
- **사용 언어(초기)**: Python, C++, Java
- **보상**: 포인트 → 기프티콘 등으로 교환 (현금 환전 불가)
- **핵심 루프**: 방 생성(난이도/모드 설정) → 참가(SSO) → AI 출제 → 제한시간 내 풀이 → 샌드박스 채점 → GPT-5 심판 리포트(장단점/판정) → ELO/포인트 반영 → 코드 공개 여부 선택 → (필요 시) 이의신청
- **관전 옵션**: 방 생성 시 👀 관전 허용 체크박스, 방 목록 필터/아이콘, 대결 중 코드 비공개, 종료 후 참가자 "공개하기" 선택 시 열람 가능

## 사용자 플로우

1. **메인 화면**: 히어로 문구 + CTA 버튼(프라이머리 "대결하기", 세컨더리 "관전하기")
2. **로그인/회원가입**: SNS 로그인(Google, GitHub, Kakao, Naver)만 허용
3. **방 목록**: 난이도 아이콘(Easy=🟢, Hard=🔴), 인원 {현재/제한}, 정렬/필터(난이도/인원/최신/관전 가능), 상태 배지(대기/진행/마감), 관전 여부
4. **방 생성**:
   - 필수: 방 이름(힌트 포함), 최대 인원 드롭다운(2/3/4), 난이도 라디오(E/M/H)
   - 옵션: 비공개(비번), 언어 선택(Py/C++/Java), 타임리밋(10/20/30분), 관전 허용 체크박스
   - 버튼: “생성” 강조, “취소” 보조
5. **대결 화면**: Monaco 에디터, 타이머, 붙여넣기 제어, 제출 → 샌드박스 채점 → GPT-5 심판
6. **결과 화면**: AI 해설 리포트, 승패/ELO/포인트 반영, 코드 공개 여부 선택, 이의신청 버튼
7. **마이페이지**: 최근 대결 기록, 승/패, ELO 변화, 포인트 잔액/교환, 구독/멤버십 관리

## 핵심 기능

- **AI 출제**: 난이도별 문제 생성, 히든 테스트케이스 포함, 그래프/DP 등 특수 문제(Pro 전용)
- **AI 검증기**: 문제 오류 검증 및 자동 재생성
- **AI 심판**: 샌드박스 채점 + 코드 품질/효율 평가 → 장단점 설명, 승패 판정
- **ELO & 포인트 이원화**: 실력(ELO)과 보상(포인트) 분리 관리
- **이의신청 시스템**: 운영자가 제출 로그/패턴/샌드박스 결과 확인 가능, SLA 내 응답

## 공정성 & 보안 정책

- 모든 제출 로그 + 키 입력 패턴 기록(항상 저장)
- AI 사용 탐지: 대용량 붙여넣기 발생 시 GPTZero 탐지 호출
- 붙여넣기 제어: 대용량 paste 차단·경고, 문제 복사 방지 시도 로깅
- 표절 방지: AST/토큰 분포/과거 제출물 대조
- 샌드박스: Docker/Firecracker 격리, 네트워크 차단, 리소스 제한
- 부정 적발 시 영구정지, 이의신청 경로 제공

## 요금제

| 플랜 | 가격 | 주요 기능 |
| --- | --- | --- |
| Free | 무료 | 대결·관전 체험, 일일 대결 횟수 제한(수치 미정) |
| Basic | 월 4,900원 | “심화 리뷰 요청” 기능: 대결 종료 후 GPT가 시간복잡도/최적화 아이디어 제공, 대결 횟수 상향, 광고 제거 옵션 |
| Pro | 월 9,900원 | 특수 문제 출제(그래프/DP 등), AI 해설 심화(대안 알고리즘 + 맞춤 후속 문제 추천), 방 생성 한도 하루 1,000개(사실상 무제한), Basic 기능 포함 |

## UI/UX 가이드

- **메인**: CTA 강조(“대결하기”=Primary, “관전하기”=Secondary), sticky header, 모바일 햄버거 메뉴 + 하단 고정 CTA
- **마이페이지**: 로그인 후 프로필 아이콘 드롭다운, 사이드바 그룹(계정 관리/구독·멤버십/기타), 인사말, 최근 대결 기록(승/패/ELO 변화), 포인트 잔액/교환 버튼
- **방 목록**: 난이도 색상/아이콘(Easy=🟢, Hard=🔴), 인원 {현재}/{제한}, 정렬/필터(난이도/인원 수/최신순/관전 가능만), 상태 배지(대기/진행/마감), 모바일 카드뷰
- **방 생성**: 필수/옵션 필드 및 버튼 레이아웃 명시, 관전 허용 체크박스
- **대결 UI**: Monaco 에디터, 타이머, 붙여넣기 제어, 제출 플로우, 결과 페이지의 코드 공개/이의신청 구성

## 데이터 모델

Prisma schema는 다음 엔터티를 포함합니다.

- `users(id, oauth_provider, nickname, tier, elo, points, strikes, created_at, updated_at)`
- `rooms(id, mode, difficulty, is_private, password?, allow_spectate, max_players, status, creator_id, created_at)`
- `matches(id, room_id, mode, difficulty, started_at, ended_at, time_limit_minutes, allow_spectate)`
- `problems(id, prompt, io_spec, tags, difficulty, testcases_blob, version)`
- `submissions(id, match_id, user_id, lang, code, verdict, exec_stats, similarity, ai_use_score, created_at)`
- `judgments(id, match_id, summary, explain_md, score_correctness, score_perf, score_quality, created_at)`
- `transactions(id, user_id, delta_points, reason, ref_id, created_at)`
- `appeals(id, user_id, match_id, type, text, status, resolution_note, created_at)`
- `keystroke_logs(id, submission_id, timeline_blob, created_at)`
- 추가로 `room_participants`, `match_participants`, `spectator_sessions`, `paste_events` 등 플랫폼 운용을 위한 관계형 테이블을 제공합니다.

## 기술 스택

- **프론트엔드**: Next.js(App Router) + Tailwind CSS + shadcn/ui + React Query + Monaco Editor
- **백엔드**: Node.js(Fastify 기반) + Prisma + PostgreSQL + Redis + WebSocket
- **채점 서버**: Docker/Firecracker 기반 샌드박스, BullMQ 큐
- **스토리지/로그**: S3 호환 스토리지 + OpenSearch(제출 로그/관전 기록 색인)
- **인증**: OAuth(Google, GitHub, Kakao, Naver)
- **배포**: Vercel(프론트), Fly.io/EC2/Cloud Run(백엔드 및 샌드박스/워커)

## 비용 구조 & 손익 분석

- **GPT-5**: 약 $0.00825 / 대결
- **Docker 인프라**: 월 $10~30 (규모↑ 시 $100~300)
- **GPTZero**: 대용량 붙여넣기 시만 호출, 월 $0~45 (최대 $135)

| 유저 수 | 총 대결 | 최선 비용 | 최악 비용 | 수익(1인 $1) | 최선 손익 | 최악 손익 |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 100 | $10.83 | $76.65 | $10 | −$0.83 | −$66.65 |
| 50 | 500 | $14.13 | $83.25 | $50 | +$35.87 | −$33.25 |
| 100 | 1,000 | $18.25 | $91.5 | $100 | +$81.75 | +$8.5 |
| 10,000 | 100,000 | $925 | $2,085 | $10,000 | +$9,075 | +$7,915 |

👉 **결론**: 100명 이상부터 안정적 흑자, 대규모일수록 고마진 구조.

## 정책 & 법적 고려

- 미성년자 보호: 환전 불가, 기프티콘 등으로 한정 / 월 교환 상한 필요
- 개인정보 처리: 제출 로그·키 입력 패턴 저장 고지 + 동의 필수
- 이의신청 처리 SLA: X일 이내 1차 답변(추후 확정)
- 부정행위 정의 및 제재 수위 명문화, 영구 정지 포함

## MVP 로드맵 (2주)

- **D1~2**: DB 스키마, API, 소켓 설계, SSO 연동
- **D3~5**: 방 생성/참가/목록(정렬·필터·관전)
- **D6~7**: 샌드박스 채점, 히든 케이스 검증
- **D8~9**: AI 리포트 1차, ELO/포인트 반영, 코드 공개하기
- **D10**: 이의신청, 로그 열람
- **D11~12**: 요금제 가드(Basic/Pro), Pro 특수문제, Basic 심화 리뷰
- **D13~14**: 알파 테스트(10~50명), 버그픽스, 운영 패널 구축

## 백로그

- 리플레이(제출 타임라인 시각화)
- 시즌 랭킹 / 업적 뱃지
- 관전 채팅 / 하이라이트 공유 / 팔로우 알림
- 연습 모드 / 커리큘럼 추천
- 아바타·테마 상점 (비금전 보상)

## 아키텍처 개요

- **모노레포 구조**: `apps/web`(Next.js), `apps/api`(Fastify), `apps/worker`(BullMQ 샌드박스 워커), `packages/*`(공용 라이브러리)
- **API 설계**: REST + WebSocket(Spectator/Timer), OAuth SSO, Prisma 기반 Repository, OpenAPI 문서 자동화
- **큐잉**: `judge-submissions` 큐에 샌드박스 채점, GPT-5 리포트, GPTZero 탐지 작업을 파이프라인화
- **스토리지**: 코드/로그는 S3 호환 스토리지, 검색은 OpenSearch 인덱스, 장기 보관은 Glacier 호환
- **관전/리플레이**: SSE/WebSocket으로 실시간 상태 전달, 관전 허용 방만 구독 가능, 종료 후 참가자 동의 시 코드 공개
- **보안**: Docker/Firecracker 기반 샌드박스, 네트워크 차단, 리소스 제한, 표절 탐지(AST, 토큰 분포, 과거 제출물 비교)
- **요금제 가드**: Redis 기반 rate limit + 포인트/플랜 체크, Basic/Pro 한정 기능 토글, 일일 대결 횟수 제한

## 배포 전략

- **프론트엔드**: Vercel(Preview/Production), 환경 변수로 API URL/SSO 설정
- **백엔드 API**: Fly.io(초기) → 트래픽 증가 시 AWS EC2 AutoScaling or Cloud Run, 로드밸런서 + HTTPS
- **샌드박스 워커**: Firecracker 호스팅 가능한 전용 노드(Fly Machines / EC2), Docker-in-Docker 금지, 이미지 캐시 전략
- **데이터베이스**: Managed PostgreSQL (Neon/RDS), Prisma Migrate로 버전 관리
- **Redis**: Upstash 또는 ElastiCache, 세션/큐/레이트리밋 공유
- **S3/로그**: Cloudflare R2 + OpenSearch 도입, Log retention 정책 1년
- **CI/CD**: GitHub Actions → pnpm lint/test/build → Vercel Preview & Fly.io deploy

## 개발 환경

```bash
pnpm install
cp .env.example .env
pnpm db:push   # Prisma 스키마 동기화
pnpm seed      # 기본 유저/방/문제 시드
pnpm dev       # web(3000) + api(4000) + worker 실행
```

자세한 라우팅, UI 와이어프레임, 배포 플레이북은 `docs/` 디렉터리를 참고하세요.
