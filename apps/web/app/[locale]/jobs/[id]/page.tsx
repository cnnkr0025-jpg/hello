import Image from "next/image";
import { JobStatusWatcher } from "@/components/job-status";

async function fetchJob(id: string) {
  try {
    const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/jobs/${id}`, { next: { revalidate: 3 } });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch (error) {
    return {
      id,
      type: "text",
      status: "succeeded",
      prompt: "샘플 프롬프트",
      params: { tone: "friendly" },
      resultUrls: [],
      usage: { inputTokens: 300, outputTokens: 900, credits: 1 },
      createdAt: new Date().toISOString(),
    };
  }
}

export default async function JobDetailPage({ params }: { params: { locale: string; id: string } }) {
  const job = await fetchJob(params.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">작업 상세</h2>
        <p className="text-sm text-muted-foreground">원본 프롬프트와 결과물을 확인하세요.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <section className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">프롬프트</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.prompt}</p>
            {job.params && (
              <div className="mt-4">
                <h4 className="font-semibold">파라미터</h4>
                <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(job.params, null, 2)}</pre>
              </div>
            )}
          </section>
          <section className="rounded-lg border p-4">
            <h3 className="text-lg font-semibold">결과</h3>
            {job.type === "music" && job.resultUrls?.[0] && (
              <audio controls className="mt-3 w-full" src={job.resultUrls[0]} />
            )}
            {job.type === "image" && job.resultUrls && job.resultUrls.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {job.resultUrls.map((url: string) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg border">
                    <Image src={url} alt="생성 이미지" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {job.type === "text" && job.raw?.text && (
              <article className="prose prose-sm max-w-none">
                <p>{job.raw.text}</p>
              </article>
            )}
            {(!job.resultUrls || job.resultUrls.length === 0) && job.type !== "text" && (
              <p className="text-sm text-muted-foreground">결과가 준비되는 즉시 웹훅으로 업데이트됩니다.</p>
            )}
          </section>
        </div>
        <aside className="space-y-4">
          <JobStatusWatcher jobId={params.id} initialJob={job} />
          <section className="rounded-lg border p-4 text-sm">
            <h3 className="text-lg font-semibold">사용량</h3>
            <p>입력 토큰: {job.usage?.inputTokens ?? 0}</p>
            <p>출력 토큰: {job.usage?.outputTokens ?? 0}</p>
            <p>크레딧: {job.usage?.credits ?? 0}</p>
          </section>
          <section className="rounded-lg border p-4 text-sm">
            <h3 className="text-lg font-semibold">상태</h3>
            <p>상태: {job.status}</p>
            <p>생성일: {new Date(job.createdAt).toLocaleString()}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
