import Link from "next/link";
import { ArrowRight, Eye, ShieldCheck, Timer, Trophy, Users } from "lucide-react";

const pricing = [
  {
    plan: "Free",
    price: "무료",
    description: "대결·관전 체험, 일일 대결 횟수 제한",
    perks: ["일일 대결 횟수 제한 (설정 가능)", "관전 모드 이용", "광고 노출"],
  },
  {
    plan: "Basic",
    price: "월 4,900원",
    description: "심화 리뷰 요청 및 광고 제거 옵션",
    perks: ["심화 리뷰 요청 (GPT-5)", "대결 횟수 상향", "광고 제거 옵션"],
  },
  {
    plan: "Pro",
    price: "월 9,900원",
    description: "특수 문제 출제 및 무제한 방 생성",
    perks: ["그래프/DP 등 특수 문제", "대안 알고리즘 + 후속 문제 추천", "방 생성 한도 하루 1,000개"],
  },
];

const fairness = [
  {
    title: "샌드박스 격리",
    description: "Docker/Firecracker 기반 실행으로 네트워크를 차단하고 리소스를 제한합니다.",
  },
  {
    title: "AI 사용 탐지",
    description: "대용량 붙여넣기 발생 시 GPTZero 분석과 표절 검사(AST/토큰 분포)를 실시합니다.",
  },
  {
    title: "키 입력 로그",
    description: "모든 제출의 키 입력 패턴과 붙여넣기 이력을 저장하고 OpenSearch로 검색할 수 있습니다.",
  },
];

const roadmap = [
  { range: "D1~2", task: "DB 스키마, API, 소켓 설계, SSO 연동" },
  { range: "D3~5", task: "방 생성/참가/목록(정렬·필터·관전)" },
  { range: "D6~7", task: "샌드박스 채점, 히든 케이스 검증" },
  { range: "D8~9", task: "AI 리포트 1차, ELO/포인트 반영, 코드 공개하기" },
  { range: "D10", task: "이의신청, 로그 열람" },
  { range: "D11~12", task: "요금제 가드, Pro 특수문제, Basic 심화 리뷰" },
  { range: "D13~14", task: "알파 테스트(10~50명), 버그픽스, 운영패널" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_70%)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 md:flex-row md:items-center">
          <div className="flex-1 space-y-6 text-slate-100">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase">
              AI 코드 대결 플랫폼
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              방 생성에서 이의신청까지, AI가 심판하는 실전 코드 대결
            </h1>
            <p className="text-base text-slate-300 md:text-lg">
              방 생성 → 참가(SSO) → AI 출제 → 제한시간 내 풀이 → 샌드박스 채점 → GPT-5 심판 리포트 → ELO/포인트 반영 → 코드 공개 여부 선택 → 이의신청까지 완전한 루프를 제공합니다.
            </p>
            <div className="flex flex-col gap-4 md:flex-row">
              <Link
                href="/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:shadow-sky-400/50"
              >
                대결하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rooms?spectate=true"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:border-sky-300 hover:text-sky-200"
              >
                관전하기
                <Eye className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">모드</p>
                <p className="mt-2">1v1 / 1v1v1 (최대 인원 2/3/4)</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">언어</p>
                <p className="mt-2">Python · C++ · Java</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">보상</p>
                <p className="mt-2">포인트 → 기프티콘 교환 (현금 환전 불가)</p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-3 py-1 text-sky-100">
                <ShieldCheck className="h-4 w-4" /> 공정성 모니터링
              </span>
              <span className="inline-flex items-center gap-2 text-slate-200">
                <Timer className="h-4 w-4" /> 타임 리밋 20분
              </span>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
                <span>Docker/Firecracker 샌드박스</span>
                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-200">네트워크 차단</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
                <span>GPTZero 기반 AI 사용 탐지</span>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">붙여넣기 감시</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
                <span>표절 방지 (AST/토큰 분포)</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">로그 저장</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
                <span>이의신청 SLA</span>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200">X일 이내 1차 답변</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 md:flex-row">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">핵심 루프 & 사용자 흐름</h2>
            <p className="text-slate-300">
              메인 화면의 히어로 CTA에서 방 생성/관전으로 진입하고, SNS 로그인(Google/GitHub/Kakao/Naver)만 허용하여 간편하게 참가합니다.
              방 목록은 난이도 아이콘(🟢/🟡/🔴), 인원 {"{현재}/{제한}"}, 정렬·필터, 관전 가능 👀 표시를 제공합니다.
              방 생성 시 필수/옵션 필드(비공개 비번, 언어 선택, 타임리밋 10/20/30, 관전 허용)를 구성했습니다.
            </p>
            <div className="grid gap-4 text-sm text-slate-200 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Users className="mb-2 h-5 w-5 text-sky-400" />
                <p className="font-semibold">SSO 참가</p>
                <p className="mt-1 text-slate-300">Google/GitHub/Kakao/Naver로 로그인하고 닉네임/멤버십을 관리합니다.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Trophy className="mb-2 h-5 w-5 text-amber-400" />
                <p className="font-semibold">ELO & 포인트 분리</p>
                <p className="mt-1 text-slate-300">실력은 ELO, 보상은 포인트로 관리하고 기프티콘으로 교환합니다.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mb-2 h-5 w-5 text-emerald-400" />
                <p className="font-semibold">이의신청 시스템</p>
                <p className="mt-1 text-slate-300">운영자가 제출 로그/패턴을 열람하고 SLA 내에 답변합니다.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">모드 & UI 구성</h3>
            <ul className="space-y-3 text-sm text-slate-200">
              <li>• 대결 화면: Monaco 에디터, 타이머, 붙여넣기 제어, 제출 → 샌드박스 → GPT-5 심판</li>
              <li>• 결과: AI 해설 리포트, 승패/ELO/포인트 반영, 코드 공개, 이의신청</li>
              <li>• 마이페이지: 계정/구독/기타 사이드바, 최근 대결 기록과 포인트 교환 버튼</li>
              <li>• 모바일: 햄버거 메뉴 + 하단 고정 CTA “대결하기”</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">요금제</h2>
          <p className="mt-2 text-sm text-slate-300">Free / Basic / Pro 3단계 요금제를 제공하며, 환전은 불가능하고 기프티콘 교환만 허용합니다.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {pricing.map((item) => (
              <div key={item.plan} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{item.plan}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.description}</p>
                <p className="mt-4 text-2xl font-bold text-sky-400">{item.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  {item.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">공정성과 보안</h2>
          <p className="mt-2 text-sm text-slate-300">모든 제출 로그와 키 입력 패턴을 저장하고, 부정 행위 적발 시 영구 정지와 이의신청 경로를 제공합니다.</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {fairness.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">2주 MVP 로드맵</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {roadmap.map((step) => (
              <div key={step.range} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="font-semibold text-sky-300">{step.range}</p>
                <p className="mt-2 text-slate-300">{step.task}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:flex-row md:items-center">
          <div className="flex-1 space-y-3 text-slate-200">
            <h2 className="text-2xl font-semibold text-white md:text-3xl">백로그와 확장성</h2>
            <p>리플레이, 시즌 랭킹/업적, 관전 채팅, 연습 모드, 아바타·테마 상점 등 백로그 기능을 추가할 수 있는 이벤트 스키마를 설계했습니다.</p>
          </div>
          <div className="flex-1 space-y-2 text-sm text-slate-300">
            <p>• 리플레이(제출 타임라인 시각화)</p>
            <p>• 시즌 랭킹 / 업적 뱃지</p>
            <p>• 관전 채팅 / 하이라이트 공유 / 팔로우 알림</p>
            <p>• 연습 모드 / 커리큘럼 추천</p>
            <p>• 아바타·테마 상점 (비금전 보상)</p>
          </div>
        </div>
      </section>
    </div>
  );
}
