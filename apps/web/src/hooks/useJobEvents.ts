"use client";

import { useEffect } from "react";

export const useJobEvents = (jobId: string, onUpdate: (payload: any) => void) => {
  useEffect(() => {
    if (!jobId) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const eventSource = new EventSource(`${apiUrl}/api/jobs/${jobId}/events`, { withCredentials: true });
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error("Failed to parse SSE payload", error);
      }
    };
    eventSource.onerror = (error) => {
      console.warn("SSE error", error);
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, [jobId, onUpdate]);
};
