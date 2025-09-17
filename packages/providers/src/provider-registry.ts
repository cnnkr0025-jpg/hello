import type { ProviderAdapter, CommonJobInput } from "@ai-stack/core";
import { openAIAdapter } from "./adapters/openai";
import { sunoAdapter } from "./adapters/suno";

export type ProviderKey = "openai" | "suno";

const providers: Record<ProviderKey, ProviderAdapter> = {
  openai: openAIAdapter,
  suno: sunoAdapter,
};

export const getProviderForTask = (input: CommonJobInput): ProviderAdapter => {
  if (input.taskType === "music") {
    return providers.suno;
  }
  return providers.openai;
};

export const getProvider = (key: ProviderKey): ProviderAdapter => {
  const provider = providers[key];
  if (!provider) {
    throw new Error(`Provider ${key} not found`);
  }
  return provider;
};
