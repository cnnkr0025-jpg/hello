export type PlanId = "free" | "plus" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyCredits: number;
  dailyCredits: number;
  description: string;
  features: string[];
}

export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyCredits: 3000,
    dailyCredits: 200,
    description: "Try the platform with generous free quotas",
    features: ["Basic text/image/music jobs", "Community presets", "Email login"],
  },
  plus: {
    id: "plus",
    name: "Plus",
    monthlyCredits: 15000,
    dailyCredits: 2000,
    description: "For creators running frequent experiments",
    features: ["Priority queue", "Team projects", "Preset sharing", "Toss/Stripe billing"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyCredits: 50000,
    dailyCredits: 5000,
    description: "Studios and startups shipping production AI features",
    features: ["SLA support", "Unlimited projects", "Advanced rate limits", "Audit logs"],
  },
};

export function getPlan(id: PlanId | string | null | undefined): Plan {
  if (!id) return plans.free;
  const normalized = id.toLowerCase();
  if (normalized in plans) {
    return plans[normalized as PlanId];
  }
  return plans.free;
}
