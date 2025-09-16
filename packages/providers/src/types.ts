export type TaskType = "text" | "image" | "music";

export interface CommonInput {
  taskType: TaskType;
  prompt: string;
  params?: Record<string, unknown>;
  userId: string;
  projectId: string;
}

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  credits?: number;
  cost?: number;
}

export interface CommonJob {
  jobId: string;
  status: "queued" | "processing" | "succeeded" | "failed";
  resultUrls: string[];
  usage: Usage;
  raw?: unknown;
}

export interface ProviderAdapter {
  createJob(input: CommonInput): Promise<CommonJob>;
  getJob(id: string): Promise<CommonJob>;
  cancelJob?(id: string): Promise<void>;
  name: string;
  taskType: TaskType;
}
