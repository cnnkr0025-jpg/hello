"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge } from "@ai-stack/ui";
import { retryJob } from "@/lib/api";
import toast from "react-hot-toast";
import { RotateCcw, Share2 } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    type: string;
    status: string;
    provider: string;
    progress: number;
    resultUrls: string[];
    createdAt: string;
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const [pending, setPending] = useState(false);

  const handleRetry = async () => {
    setPending(true);
    try {
      await retryJob(job.id);
      toast.success("Retry requested");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to retry job");
    } finally {
      setPending(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/jobs/${job.id}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      toast.success("Share link copied");
    } catch (error) {
      toast.error("Clipboard not available");
    }
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{job.type}</CardTitle>
          <Badge variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"}>
            {job.status}
          </Badge>
        </div>
        <CardDescription>Provider: {job.provider}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">Progress: {job.progress}%</div>
        <div className="text-sm">Created: {new Date(job.createdAt).toLocaleString()}</div>
        {job.resultUrls.length > 0 && (
          <ul className="list-disc pl-4 text-sm space-y-1">
            {job.resultUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">
                  View result
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="space-x-2">
        <Button variant="outline" size="sm" onClick={handleRetry} disabled={pending}>
          <RotateCcw className="h-4 w-4 mr-2" /> Retry
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
      </CardFooter>
    </Card>
  );
};
