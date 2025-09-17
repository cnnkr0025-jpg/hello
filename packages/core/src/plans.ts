import type { PlanConfig, Plan } from "./types";

export const PLAN_CONFIG: Record<Plan, PlanConfig> = {
  FREE: {
    name: "FREE",
    description: "Starter plan with limited daily credits.",
    price: 0,
    dailyCredits: 20,
    monthlyCredits: 400,
    burstLimit: 5,
  },
  PLUS: {
    name: "PLUS",
    description: "For creators running small teams.",
    price: 29,
    dailyCredits: 120,
    monthlyCredits: 2500,
    burstLimit: 20,
  },
  PRO: {
    name: "PRO",
    description: "Best for agencies and pro studios.",
    price: 99,
    dailyCredits: 600,
    monthlyCredits: 12000,
    burstLimit: 60,
  },
};

export const getPlanConfig = (plan: Plan) => PLAN_CONFIG[plan];
