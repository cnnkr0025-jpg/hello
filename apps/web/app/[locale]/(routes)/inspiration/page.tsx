import type { Locale } from "@/lib/i18n";

const copy = {
  ko: {
    heroBadge: "MOOD · PROMPT · SOUND",
    heroTitle: "영감 갤러리",
    heroSubtitle: "질감, 색감, 리듬이 어우러진 스타일 보드를 모아 바로 활용할 수 있는 프롬프트 아이디어와 함께 소개합니다.",
    heroHighlights: [
      "빛의 결을 살린 네온 무드",
      "부드럽게 번지는 파스텔 그래디언트",
      "차분한 로파이 사운드 레이어",
    ],
    moodboardHeading: "스타일 무드보드",
    moodboardDescription: "다음 씬을 위한 컬러 팔레트와 텍스처 큐레이션.",
    moodboards: [
      {
        title: "네온 드림 시티",
        description:
          "젖은 아스팔트 위에 반사되는 네온 간판과 유리 커튼월이 도시의 속도감을 강조합니다. 하이라이트 대비를 살려 강렬한 썸네일을 완성해보세요.",
        colors: ["#0f172a", "#1d4ed8", "#f472b6", "#22d3ee"],
        tags: ["사이버펑크", "야경", "반사광"],
      },
      {
        title: "파우더 파스텔 스튜디오",
        description:
          "매트한 파우더 텍스처와 부드러운 자연광이 어우러진 공간입니다. 제품 촬영이나 브랜딩 배경으로 활용하면 산뜻한 인상을 줄 수 있습니다.",
        colors: ["#fdf2f8", "#fbcfe8", "#bfdbfe", "#fef9c3"],
        tags: ["소프트", "브랜딩", "스튜디오"],
      },
      {
        title: "모노포그 아틀리에",
        description:
          "은은한 안개와 콘크리트 질감이 차분한 집중감을 선사합니다. 텍스트 오버레이가 잘 보이도록 음영과 대비를 조절해보세요.",
        colors: ["#111827", "#374151", "#9ca3af", "#e5e7eb"],
        tags: ["미니멀", "아틀리에", "안개"],
      },
    ],
    promptHeading: "프롬프트 레시피",
    promptDescription: "구조화된 키워드를 겹겹이 쌓아 모델을 원하는 방향으로 이끕니다.",
    promptLabel: "프롬프트",
    prompts: [
      {
        title: "유튜브 썸네일",
        prompt:
          "high-contrast cyberpunk skyline, rain-soaked street reflections, bold korean typography in neon pink, cinematic lighting, ultrawide, 4k",
        notes: "강한 대비와 네온 컬러를 명시해 아이캐치 효과를 높입니다.",
      },
      {
        title: "브랜드 룩북",
        prompt:
          "soft pastel studio with floating fabric, volumetric natural light, product on acrylic pedestal, medium format photography, dreamy mood, hasselblad",
        notes: "재질감과 조명 스타일을 구체적으로 지시하면 일관된 무드를 유지할 수 있습니다.",
      },
      {
        title: "로파이 트랙",
        prompt:
          "lofi chillhop, analog warmth, gentle vinyl crackle, midnight rooftop rain ambience, 90bpm, electric piano and nylon guitar duet",
        notes: "악기 구성을 명시해 사운드 레이어가 과도하게 섞이지 않도록 합니다.",
      },
    ],
    soundHeading: "사운드스케이프",
    soundDescription: "시각 요소에 텍스처가 있는 앰비언스를 더해 분위기를 완성하세요.",
    soundscapes: [
      {
        title: "Glass Aurora",
        mood: "차분하게 빛나는 신스 패드와 잔잔한 벨 사운드의 조화",
        gradient: "from-cyan-200/40 via-sky-500/20 to-indigo-500/40",
        wave: "穏やかに 번지는 신호가 새벽 공기를 채웁니다.",
      },
      {
        title: "Velvet Slowburn",
        mood: "저음 베이스와 재지한 브러시 드럼이 중심을 잡아줍니다",
        gradient: "from-amber-200/40 via-rose-500/20 to-emerald-400/30",
        wave: "서서히 고조되는 온기가 공간을 감싸는 듯한 느낌",
      },
      {
        title: "Night Swim",
        mood: "수면 위로 반짝이는 불빛과 잔잔한 서브베이스",
        gradient: "from-slate-800/60 via-blue-500/30 to-emerald-500/40",
        wave: "물결을 타고 번지는 잔향이 여운을 남깁니다.",
      },
    ],
    ctaTitle: "당신만의 스타일 조합을 만들어보세요",
    ctaDescription:
      "무드보드에서 마음에 드는 요소를 선택하고 프롬프트 레시피에 키워드를 더해보세요. 완성된 결과는 프로젝트에 바로 저장할 수 있습니다.",
    ctaAction: "대시보드로 이동",
  },
  en: {
    heroBadge: "Mood · Prompt · Sound",
    heroTitle: "Inspiration Gallery",
    heroSubtitle:
      "A curated collection of textures, tones, and rhythms paired with ready-to-use prompt recipes for your next creative brief.",
    heroHighlights: [
      "Neon-lit city atmospheres",
      "Feather-soft pastel gradients",
      "Calm lo-fi sound layers",
    ],
    moodboardHeading: "Style Moodboards",
    moodboardDescription: "Curated color palettes and textures for your next scene composition.",
    moodboards: [
      {
        title: "Neon Dream City",
        description:
          "Chrome towers and rain-polished asphalt reflecting signage create a kinetic city pulse. Lean into the highlights for a striking hero shot.",
        colors: ["#0f172a", "#1d4ed8", "#f472b6", "#22d3ee"],
        tags: ["cyberpunk", "night", "reflections"],
      },
      {
        title: "Powder Pastel Studio",
        description:
          "Matte powder textures with airy daylight for a gentle branding set. Perfect as a product showcase backdrop with a soft first impression.",
        colors: ["#fdf2f8", "#fbcfe8", "#bfdbfe", "#fef9c3"],
        tags: ["soft", "branding", "studio"],
      },
      {
        title: "Mono Fog Atelier",
        description:
          "Diffused mist and concrete grain invite mindful focus. Dial in the shadows so your overlay text remains crisp and legible.",
        colors: ["#111827", "#374151", "#9ca3af", "#e5e7eb"],
        tags: ["minimal", "atelier", "fog"],
      },
    ],
    promptHeading: "Prompt Recipes",
    promptDescription: "Layer structured keywords to steer models with precision.",
    promptLabel: "Prompt",
    prompts: [
      {
        title: "YouTube Thumbnail",
        prompt:
          "high-contrast cyberpunk skyline, rain-soaked street reflections, bold korean typography in neon pink, cinematic lighting, ultrawide, 4k",
        notes: "Spell out the contrast and neon palette to maximize stopping power.",
      },
      {
        title: "Brand Lookbook",
        prompt:
          "soft pastel studio with floating fabric, volumetric natural light, product on acrylic pedestal, medium format photography, dreamy mood, hasselblad",
        notes: "Specify material cues and lighting direction to keep the vibe consistent across pages.",
      },
      {
        title: "Lo-fi Track",
        prompt:
          "lofi chillhop, analog warmth, gentle vinyl crackle, midnight rooftop rain ambience, 90bpm, electric piano and nylon guitar duet",
        notes: "Listing instruments keeps the mix balanced without unexpected layers.",
      },
    ],
    soundHeading: "Soundscapes",
    soundDescription: "Pair visuals with textured ambience to complete the atmosphere.",
    soundscapes: [
      {
        title: "Glass Aurora",
        mood: "Shimmering synth pads wrapped in delicate bell textures",
        gradient: "from-cyan-200/40 via-sky-500/20 to-indigo-500/40",
        wave: "Signals bloom softly, filling the pre-dawn hush.",
      },
      {
        title: "Velvet Slowburn",
        mood: "Smoky bass swells anchored by brushed jazz drums",
        gradient: "from-amber-200/40 via-rose-500/20 to-emerald-400/30",
        wave: "Warmth rises gradually until it settles around you like velvet.",
      },
      {
        title: "Night Swim",
        mood: "Glittering surface lights drift over a deep sub-bass",
        gradient: "from-slate-800/60 via-blue-500/30 to-emerald-500/40",
        wave: "Echoes ripple outward, leaving a silver trail in their wake.",
      },
    ],
    ctaTitle: "Compose your signature mix",
    ctaDescription:
      "Blend favourite motifs from the boards, add custom keywords to the prompt recipes, and save the outcome straight into your next project.",
    ctaAction: "Go to dashboard",
  },
} satisfies Record<Locale, {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroHighlights: string[];
  moodboardHeading: string;
  moodboardDescription: string;
  moodboards: {
    title: string;
    description: string;
    colors: string[];
    tags: string[];
  }[];
  promptHeading: string;
  promptDescription: string;
  promptLabel: string;
  prompts: {
    title: string;
    prompt: string;
    notes: string;
  }[];
  soundHeading: string;
  soundDescription: string;
  soundscapes: {
    title: string;
    mood: string;
    gradient: string;
    wave: string;
  }[];
  ctaTitle: string;
  ctaDescription: string;
  ctaAction: string;
}>;

function isSupportedLocale(value: string): value is Locale {
  return value in copy;
}

export default function InspirationPage({ params }: { params: { locale: string } }) {
  const locale = isSupportedLocale(params.locale) ? params.locale : "ko";
  const dictionary = copy[locale];

  return (
    <div className="space-y-10 pb-10">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-background to-background p-10 shadow-sm">
        <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />
        <div className="absolute -right-28 bottom-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 text-center">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-primary">
            {dictionary.heroBadge}
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">{dictionary.heroTitle}</h1>
          <p className="text-base text-muted-foreground sm:text-lg">{dictionary.heroSubtitle}</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            {dictionary.heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-background/80 px-4 py-2 backdrop-blur"
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                {highlight}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{dictionary.moodboardHeading}</h2>
            <p className="text-sm text-muted-foreground">{dictionary.moodboardDescription}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {dictionary.moodboards.map((board) => (
            <article
              key={board.title}
              className="group relative overflow-hidden rounded-3xl border bg-card/50 p-6 shadow-sm backdrop-blur"
            >
              <div className="absolute -right-12 top-10 h-36 w-36 rounded-full bg-muted/40 transition duration-500 group-hover:scale-110 group-hover:bg-primary/30" />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{board.title}</h3>
                  <div className="flex gap-1">
                    {board.colors.map((color) => (
                      <span
                        key={color}
                        className="h-8 w-8 rounded-full border border-white/30 shadow-sm"
                        style={{ backgroundColor: color }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{board.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {board.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-muted-foreground/20 bg-muted/40 px-3 py-1"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{dictionary.promptHeading}</h2>
            <p className="text-sm text-muted-foreground">{dictionary.promptDescription}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {dictionary.prompts.map((preset) => (
            <article key={preset.title} className="rounded-3xl border bg-card/60 p-6 shadow-sm backdrop-blur">
              <h3 className="text-lg font-semibold">{preset.title}</h3>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{dictionary.promptLabel}</p>
              <p className="mt-1 rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
                {preset.prompt}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{preset.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{dictionary.soundHeading}</h2>
            <p className="text-sm text-muted-foreground">{dictionary.soundDescription}</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {dictionary.soundscapes.map((sound) => (
            <article
              key={sound.title}
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${sound.gradient} p-6 text-white shadow-lg`}
            >
              <div className="absolute inset-0 bg-black/30 backdrop-blur" aria-hidden />
              <div className="relative flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{sound.title}</h3>
                  <p className="text-sm text-white/70">{sound.mood}</p>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{sound.wave}</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-3/4 rounded-full bg-white/80" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border bg-card/60 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 text-center sm:gap-6">
          <h2 className="text-2xl font-semibold">{dictionary.ctaTitle}</h2>
          <p className="text-sm text-muted-foreground">{dictionary.ctaDescription}</p>
          <div className="flex justify-center">
            <a
              href={`/${locale}/dashboard`}
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {dictionary.ctaAction}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
