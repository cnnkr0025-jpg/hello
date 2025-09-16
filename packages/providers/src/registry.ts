import type { CommonInput, CommonJob, ProviderAdapter, TaskType } from "./types";
import { OpenAIAdapter } from "./adapters/openai";
import { SunoAdapter } from "./adapters/suno";

const adapters: ProviderAdapter[] = [
  new OpenAIAdapter("text"),
  new OpenAIAdapter("image"),
  new SunoAdapter(),
];

const adapterMap = new Map<string, ProviderAdapter>();
adapters.forEach((adapter) => {
  adapterMap.set(`${adapter.name}:${adapter.taskType}`, adapter);
});

export interface DispatchOptions {
  preferredProvider?: string;
}

export async function dispatchJob(input: CommonInput, options: DispatchOptions = {}): Promise<CommonJob> {
  const key = `${options.preferredProvider ?? "openai"}:${input.taskType}`;
  const adapter = adapterMap.get(key);
  if (!adapter) {
    throw new Error(`No provider found for ${key}`);
  }
  return adapter.createJob(input);
}

export async function getJob(taskType: TaskType, provider: string, id: string): Promise<CommonJob> {
  const key = `${provider}:${taskType}`;
  const adapter = adapterMap.get(key);
  if (!adapter) {
    throw new Error(`No provider found for ${key}`);
  }
  return adapter.getJob(id);
}

export function listProviders() {
  return adapters.map((adapter) => ({ name: adapter.name, taskType: adapter.taskType }));
}
