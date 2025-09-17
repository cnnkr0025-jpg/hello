import { Suspense } from "react";
import { getRecentJobs } from "@/lib/api";
import { JobCard } from "@/components/job-card";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { ProjectPanel } from "@/components/project-panel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "@ai-stack/ui";
import { presets } from "@/data/presets";
import { t, type Locale } from "@ai-stack/core";

const locale: Locale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) ?? "ko";

async function RecentJobs() {
  const jobs = await getRecentJobs();
  if (!jobs.length) {
    return <p className="text-sm text-muted-foreground">{t(locale, "recentJobs")}: 0</p>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t(locale, "dashboard")}</h1>
          <p className="text-muted-foreground">Monitor, retry, and collaborate on multi-modal AI jobs.</p>
        </div>
        <Badge variant="secondary">Plan: Plus</Badge>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <WorkflowBuilder />
        <div className="space-y-4">
          <ProjectPanel />
          <Card>
            <CardHeader>
              <CardTitle>{t(locale, "presets")}</CardTitle>
              <CardDescription>Share across projects to standardise workflows.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {presets.map((preset) => (
                <div key={preset.id} className="rounded-lg border p-3">
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{preset.type}</div>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">{t(locale, "recentJobs")}</h2>
          <p className="text-sm text-muted-foreground">Track status, retry failed runs, and copy share links.</p>
        </div>
        <Suspense fallback={<p>Loading jobs...</p>}>
          <RecentJobs />
        </Suspense>
      </section>
    </div>
  );
}
