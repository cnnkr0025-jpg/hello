import { Suspense } from "react";
import { JobCard } from "@/components/job-card";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { PolicyBanner } from "@/components/policy-banner";

async function fetchJobs() {
  try {
    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/jobs?limit=6`, { next: { revalidate: 5 } });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.jobs ?? [];
  } catch (error) {
    return [
      {
        id: "demo-text",
        type: "text",
        status: "succeeded",
        progress: 100,
        prompt: "샘플 블로그 요약",
        provider: "openai",
        resultUrls: [],
        createdAt: new Date().toISOString(),
        locale: "ko",
      },
      {
        id: "demo-image",
        type: "image",
        status: "processing",
        progress: 60,
        prompt: "썸네일 이미지",
        provider: "openai",
        resultUrls: ["https://placehold.co/600x400/png"],
        createdAt: new Date().toISOString(),
        locale: "ko",
      },
      {
        id: "demo-music",
        type: "music",
        status: "queued",
        progress: 10,
        prompt: "로파이 트랙",
        provider: "suno",
        resultUrls: [],
        createdAt: new Date().toISOString(),
        locale: "ko",
      },
    ];
  }
}

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const jobs = await fetchJobs();
  const locale = params.locale ?? "ko";

  return (
    <div className="space-y-6">
      <PolicyBanner />
      <Suspense fallback={<div>Loading workflow builder...</div>}>
        <WorkflowBuilder />
      </Suspense>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">최근 작업</h2>
          <a href={`/${locale}/usage`} className="text-sm text-primary">
            사용량 보기
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job: any) => (
            <JobCard key={job.id} job={{ ...job, locale }} />
          ))}
        </div>
      </section>
    </div>
  );
}
