import type { RateLimitRule, Plan } from "./types";
import { getPlanConfig } from "./plans";

export const buildRateLimits = (plan: Plan, userId: string, model: string): RateLimitRule[] => {
  const config = getPlanConfig(plan);
  return [
    {
      key: `user:${userId}:model:${model}:minute`,
      limit: config.burstLimit,
      windowSeconds: 60,
    },
    {
      key: `user:${userId}:day`,
      limit: config.dailyCredits,
      windowSeconds: 60 * 60 * 24,
    },
    {
      key: `user:${userId}:month`,
      limit: config.monthlyCredits,
      windowSeconds: 60 * 60 * 24 * 30,
    },
  ];
};
