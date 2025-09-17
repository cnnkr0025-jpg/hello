"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@ai-stack/ui";

interface ProjectQuota {
  projectId: string;
  name: string;
  dailyCredits: number;
  monthlyCredits: number;
}

export const ProjectPanel = () => {
  const [quota, setQuota] = useState<ProjectQuota[]>([]);

  useEffect(() => {
    setQuota([
      { projectId: "seed-project", name: "Demo Project", dailyCredits: 120, monthlyCredits: 2500 },
    ]);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Quotas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quota.map((project) => (
          <div key={project.projectId} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-semibold">{project.name}</div>
              <div className="text-xs text-muted-foreground">ID: {project.projectId}</div>
            </div>
            <div className="text-right">
              <Badge variant="secondary">Daily {project.dailyCredits}</Badge>
              <div className="text-xs text-muted-foreground">Monthly {project.monthlyCredits}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
