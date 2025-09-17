export type Locale = "ko" | "en";

export const translations: Record<Locale, Record<string, string>> = {
  ko: {
    dashboard: "대시보드",
    recentJobs: "최근 작업",
    retry: "재실행",
    share: "공유",
    presets: "프리셋",
    workflowBuilder: "워크플로우 빌더",
    submit: "제출",
    complianceNotice: "저작권 및 정책 준수는 사용자 책임입니다.",
    acceptCompliance: "위 내용을 이해하고 동의합니다.",
  },
  en: {
    dashboard: "Dashboard",
    recentJobs: "Recent Jobs",
    retry: "Retry",
    share: "Share",
    presets: "Presets",
    workflowBuilder: "Workflow Builder",
    submit: "Submit",
    complianceNotice: "Users are solely responsible for copyright and policy compliance.",
    acceptCompliance: "I understand and accept.",
  },
};

export const t = (locale: Locale, key: string) => {
  return translations[locale]?.[key] ?? key;
};
