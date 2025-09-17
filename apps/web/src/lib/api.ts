const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface JobCard {
  id: string;
  type: string;
  status: string;
  provider: string;
  progress: number;
  resultUrls: string[];
  createdAt: string;
}

export const getRecentJobs = () => request<JobCard[]>("/api/jobs?limit=6");

export const retryJob = (id: string) =>
  request(`/api/jobs/${id}/retry`, {
    method: "POST",
  });

export const createJob = (type: "text" | "image" | "music", payload: any) =>
  request(`/api/jobs/${type}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getJobDetail = (id: string) => request(`/api/jobs/${id}`);
