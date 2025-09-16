"use client";

import { useMemo } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Badge, Progress } from "@ai/ui";
import { Download, RefreshCw, Share2, Music, ImageIcon, MessageSquare } from "lucide-react";
import Link from "next/link";

export interface JobCardProps {
  job: {
    id: string;
    type: "text" | "image" | "music";
    status: string;
    progress: number;
    prompt: string;
    provider: string;
    resultUrls: string[];
    createdAt: string;
    locale?: string;
  };
  onRetry?: (id: string) => void;
}

const iconMap = {
  text: MessageSquare,
  image: ImageIcon,
  music: Music,
};

export function JobCard({ job, onRetry }: JobCardProps) {
  const Icon = iconMap[job.type];
  const formattedDate = useMemo(() => new Date(job.createdAt).toLocaleString(), [job.createdAt]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={job.status === "failed" ? "outline" : "default"}>{job.status.toUpperCase()}</Badge>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          <span>{job.prompt.slice(0, 64)}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">{job.provider}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <Progress value={job.progress} />
        {job.resultUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.resultUrls.map((url) => (
              <Button key={url} asChild variant="outline" size="sm" className="gap-2">
                <a href={url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  파일 열기
                </a>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${job.locale ?? "ko"}/jobs/${job.id}`}>상세보기</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
            공유
          </Button>
          <Button variant="outline" size="sm" onClick={() => onRetry?.(job.id)}>
            <RefreshCw className="h-4 w-4" />
            재실행
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
