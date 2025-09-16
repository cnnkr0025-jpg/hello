export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export const dictionaries: Record<Locale, Record<string, string>> = {
  ko: {
    dashboard: "대시보드",
    projects: "프로젝트",
    usage: "사용량",
    submitJob: "작업 제출",
    workflowBuilder: "워크플로우 빌더",
    presets: "프리셋",
    quotaExceeded: "할당량을 초과했습니다",
    policyWarning: "AI 생성물은 이용자의 책임입니다. 정책과 저작권을 준수해야 합니다.",
    acknowledge: "동의합니다",
    retry: "재실행",
    share: "공유",
    recentJobs: "최근 작업",
    workflowSummary: "프롬프트 → 모델 선택 → 파라미터 설정 → 제출",
    usageSummary: "플랜별 사용량",
  },
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    usage: "Usage",
    submitJob: "Submit Job",
    workflowBuilder: "Workflow Builder",
    presets: "Presets",
    quotaExceeded: "Quota exceeded",
    policyWarning: "Generated content must comply with policies and copyright laws.",
    acknowledge: "I acknowledge",
    retry: "Retry",
    share: "Share",
    recentJobs: "Recent Jobs",
    workflowSummary: "Prompt → Select Model → Configure Parameters → Submit",
    usageSummary: "Plan usage",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
