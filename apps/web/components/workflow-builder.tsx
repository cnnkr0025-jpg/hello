"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ai/ui";
import { useCreateJob } from "@/lib/api";
import { Loader2 } from "lucide-react";

const presets = [
  {
    id: "youtube-script",
    type: "text" as const,
    title: "YouTube Script Draft (Korean)",
    prompt: "제목과 간단한 설명을 기반으로 5분 분량의 한국어 YouTube 스크립트를 작성하세요.",
  },
  {
    id: "product-description",
    type: "text" as const,
    title: "Product Description SEO",
    prompt: "입력된 제품 정보를 바탕으로 SEO 친화적인 상품 설명을 작성하세요.",
  },
  {
    id: "yt-thumbnail",
    type: "image" as const,
    title: "YouTube Thumbnail – Bold Typography",
    prompt: "밝고 대담한 타이포그래피를 사용한 YouTube 썸네일 디자인",
  },
  {
    id: "logo-variations",
    type: "image" as const,
    title: "Logo Variations – Minimal",
    prompt: "미니멀한 로고 변형 3가지를 제안하세요.",
  },
  {
    id: "lofi",
    type: "music" as const,
    title: "Lo-fi Chill 90BPM",
    prompt: "90 BPM의 편안한 로파이 힙합 트랙",
  },
  {
    id: "ambient",
    type: "music" as const,
    title: "Ambient Drone 50–70 BPM",
    prompt: "50-70 BPM 사이의 드론 분위기 앰비언트 사운드",
  },
];

export function WorkflowBuilder() {
  const [prompt, setPrompt] = useState(presets[0]);
  const { trigger, isMutating } = useCreateJob(prompt.type);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    try {
      const result = await trigger({ prompt: prompt.prompt });
      setMessage(`Job ${result.id ?? result.jobId} submitted!`);
    } catch (error: any) {
      setMessage(error.message ?? "Failed to create job");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>워크플로우 빌더</CardTitle>
        <CardDescription>프롬프트와 모델을 선택하고 즉시 실행하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setPrompt(preset)}
              className={`rounded-lg border p-4 text-left transition ${prompt.id === preset.id ? "border-primary bg-primary/10" : "hover:border-primary"}`}
            >
              <p className="font-semibold">{preset.title}</p>
              <p className="text-xs text-muted-foreground">{preset.prompt}</p>
            </button>
          ))}
        </div>
        <textarea
          className="min-h-[120px] w-full rounded-md border bg-background p-3"
          value={prompt.prompt}
          onChange={(event) => setPrompt((prev) => ({ ...prev, prompt: event.target.value }))}
        />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleSubmit} disabled={isMutating} className="min-w-[160px]">
          {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : "제출"}
        </Button>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </CardFooter>
    </Card>
  );
}
