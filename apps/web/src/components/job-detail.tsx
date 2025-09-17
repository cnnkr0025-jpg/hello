"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@ai-stack/ui";
import { useJobEvents } from "@/hooks/useJobEvents";
import { retryJob } from "@/lib/api";
import toast from "react-hot-toast";

interface JobDetailProps {
  job: any;
}

export const JobDetail = ({ job }: JobDetailProps) => {
  const [current, setCurrent] = useState(job);

  useJobEvents(job.id, (payload) => {
    setCurrent((prev: any) => ({ ...prev, ...payload }));
  });

  const handleRetry = async () => {
    try {
      await retryJob(job.id);
      toast.success("Retry requested");
    } catch (error) {
      toast.error("Failed to retry job");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{current.prompt?.slice(0, 60) ?? "Job"}</span>
            <Badge variant={current.status === "completed" ? "default" : current.status === "failed" ? "destructive" : "secondary"}>
              {current.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-medium uppercase text-muted-foreground">Prompt</div>
            <p className="text-sm whitespace-pre-wrap">{current.prompt}</p>
          </div>
          <div>
            <div className="text-xs font-medium uppercase text-muted-foreground">Parameters</div>
            <pre className="text-xs bg-muted/50 rounded-lg p-3">{JSON.stringify(current.params, null, 2)}</pre>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Progress: {current.progress}%</div>
            <Button size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {current.type === "music" && current.resultUrls?.length ? (
            current.resultUrls.map((url: string) => <audio key={url} controls src={url} className="w-full" />)
          ) : current.type === "image" && current.resultUrls?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {current.resultUrls.map((url: string) => (
                <img key={url} src={url} alt="Result" className="w-full rounded-lg border" />
              ))}
            </div>
          ) : (
            <pre className="text-sm bg-muted/40 rounded-lg p-3 overflow-x-auto">{JSON.stringify(current.raw, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
