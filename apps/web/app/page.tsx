import Link from "next/link";
import { ArrowRight, Palette, ShieldCheck, Sparkles, Timer, Zap } from "lucide-react";
import { defaultLocale } from "@/lib/i18n";

const features = [
  {
    title: "모든 크리에이티브를 한 곳에서",
    description: "텍스트, 이미지, 음악까지 하나의 워크플로우에서 자연스럽게 이어지는 AI 제작 환경을 제공합니다.",
    icon: Sparkles,
  },
  {
    title: "프리셋 & 라이브러리",
    description: "브랜드 톤에 맞춘 프롬프트와 스타일 프리셋을 저장하고 팀원들과 손쉽게 공유하세요.",
    icon: Palette,
  },
  {
    title: "실시간 협업",
    description: "동료와 동시에 워크플로우를 편집하고 변화 과정을 히스토리로 관리할 수 있습니다.",
    icon: Zap,
  },
  {
    title: "정책 중심의 안전한 생성",
    description: "자동 정책 감지와 저작권 체크로 안심하고 콘텐츠를 배포하세요.",
    icon: ShieldCheck,
  },
  {
    title: "자동화된 전달",
    description: "마케팅 채널과 연동된 전달 자동화로 결과물을 즉시 배포할 수 있습니다.",
    icon: ArrowRight,
  },
  {
    title: "성능을 위한 최적화",
    description: "팀 사용량과 모델 성능을 대시보드에서 분석하고 최적의 비용 구조를 설계하세요.",
    icon: Timer,
  },
];

const milestones = [
  {
    title: "아이디어 입력",
    description: "간단한 설명과 목적만 입력하면, 맞춤 템플릿이 자동으로 추천됩니다.",
  },
  {
    title: "워크플로우 조합",
    description: "텍스트, 이미지, 사운드를 블록처럼 쌓아 원하는 결과물을 빠르게 설계하세요.",
  },
  {
    title: "검수 및 배포",
    description: "자동 검수 레포트를 확인하고 버튼 한 번으로 원하는 채널에 배포할 수 있습니다.",
  },
];

const testimonials = [
  {
    quote:
      "AI Creative Studio 덕분에 콘텐츠 제작 사이클이 절반 이하로 줄었습니다. 팀 간 협업이 정말 매끄러워요.",
    name: "김하늘",
    role: "크리에이티브 리드, Studio Nova",
  },
  {
    quote: "세밀한 제어와 정책 가이드라인이 큰 도움이 됩니다. 브랜드 톤을 유지한 채로 빠르게 실험할 수 있어요.",
    name: "Minji Park",
    role: "콘텐츠 전략가, Tomorrow Labs",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900" />
        <div className="absolute inset-x-0 top-[-25%] -z-10 flex justify-center blur-3xl">
          <div className="h-[32rem] w-[60rem] rounded-full bg-gradient-to-br from-sky-500/40 via-purple-500/30 to-violet-600/40" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-32 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            차세대 멀티모달 AI 스튜디오
          </span>
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              한 번의 아이디어로 텍스트, 이미지, 사운드를 완성하세요
            </h1>
            <p className="text-lg text-slate-200 md:text-xl">
              AI Creative Studio는 팀이 사랑하는 경험을 만들기 위해 설계된 올인원 제작 플랫폼입니다. 생성형 AI를 가장 자연스럽게 활용해 보세요.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Link
              href={`/${defaultLocale}/dashboard`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:scale-[1.02] hover:bg-slate-100"
            >
              대시보드 둘러보기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              워크플로우 살펴보기
            </a>
          </div>
          <div className="w-full max-w-4xl rounded-3xl border border-white/20 bg-white/5 p-6 text-left shadow-2xl shadow-sky-500/20 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Realtime Canvas</p>
                <h2 className="text-2xl font-semibold">브랜드 캠페인 생성</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Assist
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1">Live</span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-slate-100">브랜드 메시지</h3>
                <p className="mt-2 text-sm text-slate-300">
                  "다가오는 봄 캠페인을 위한 활기찬 톤을 유지하며, 지속 가능성을 강조해 주세요."
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-slate-100">비주얼 스타일</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  <li>• 파스텔 그라데이션 배경</li>
                  <li>• 자연광과 필름 그레인</li>
                  <li>• 손글씨 느낌의 타이포그래피</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-slate-100">결과 미리보기</h3>
                <p className="mt-2 text-sm text-slate-300">
                  캠페인 테마에 맞춘 이미지, SNS 캡션, 짧은 배경 음악이 동시에 준비됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">팀을 위한 스마트한 워크플로우</h2>
            <p className="mt-4 text-base text-muted-foreground">
              모든 제작 단계가 하나의 화면에서 연결됩니다. 더 빠르고 더 일관성 있게 캠페인을 완성하세요.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-500/10 transition group-hover:scale-150" />
                <feature.icon className="h-10 w-10 text-sky-600" />
                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_rgba(15,23,42,0.9))]" />
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
              Workflow
            </span>
            <h2 className="text-3xl font-semibold md:text-4xl">아이디어에서 배포까지 3단계</h2>
            <p className="text-base text-slate-200">
              크리에이티브 팀이 실제로 사용하는 프로세스를 기반으로 설계했습니다. 각 단계는 AI의 제안과 팀의 통제권이 균형을 이루도록 맞춰져 있습니다.
            </p>
          </div>
          <div className="flex-1 space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.title} className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="absolute -left-10 top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-transparent via-white/70 to-white md:block" />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    <p className="mt-2 text-sm text-slate-200">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">만족하는 팀들의 이야기</h2>
            <p className="mt-4 text-base text-muted-foreground">
              다양한 산업의 팀들이 AI Creative Studio로 새로운 가능성을 열고 있습니다.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-sm"
              >
                <blockquote className="text-base text-slate-700">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-6 text-sm font-medium text-slate-500">
                  {testimonial.name} · {testimonial.role}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 p-10 text-center text-white">
            <h3 className="text-2xl font-semibold">이제 새로운 캠페인을 시작해 볼까요?</h3>
            <p className="max-w-2xl text-sm text-white/90">
              무료 체험으로 팀에 가장 적합한 워크플로우를 구성해 보세요. 실시간 협업과 정책 검증이 기본으로 제공됩니다.
            </p>
            <Link
              href={`/${defaultLocale}/dashboard`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-black/10 transition hover:scale-105"
            >
              지금 바로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
