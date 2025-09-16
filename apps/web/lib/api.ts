import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";

async function fetcher(url: string) {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export function useJobs() {
  return useSWR("/api/jobs", fetcher, { refreshInterval: 5000 });
}

export function useJob(id: string | null) {
  return useSWR(id ? `/api/jobs/${id}` : null, fetcher, { refreshInterval: 3000 });
}

export function useCreateJob(type: "text" | "image" | "music") {
  return useSWRMutation(`/api/jobs/${type}`, async (url, { arg }: { arg: { prompt: string; params?: Record<string, unknown> } }) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arg),
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  });
}
