"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const fetcher = (path: string) => fetch(`${API_URL}${path}`).then((res) => res.json());

interface JobStatusWatcherProps {
  jobId: string;
  initialJob: any;
}

export function JobStatusWatcher({ jobId, initialJob }: JobStatusWatcherProps) {
  const { data, mutate } = useSWR(`/api/jobs/${jobId}`, fetcher, {
    fallbackData: initialJob,
    refreshInterval: 5000,
  });
  const [status, setStatus] = useState(data?.status ?? "queued");

  useEffect(() => {
    if (data?.status) {
      setStatus(data.status);
    }
  }, [data?.status]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const source = new EventSource(`${apiUrl}/api/jobs/${jobId}/stream`);
    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setStatus(payload.status ?? payload.data?.status ?? status);
        if (payload.id) {
          mutate(payload, false);
        }
      } catch (error) {
        console.error("Failed to parse SSE payload", error);
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => {
      source.close();
    };
  }, [jobId, mutate]);

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">실시간 상태</span>
        <span className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</span>
      </div>
      <p className="mt-2 text-muted-foreground">{status}</p>
    </div>
  );
}
