import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@ai/ui";
import { PlusCircle } from "lucide-react";

const demoProjects = [
  {
    id: "demo",
    name: "Demo Studio",
    quota: "5,000 / 15,000 credits",
    apiKeys: [
      { alias: "production", lastRotated: "2024-02-01" },
      { alias: "preview", lastRotated: "2024-03-12" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Team",
    quota: "12,000 / 50,000 credits",
    apiKeys: [{ alias: "edge-worker", lastRotated: "2024-04-05" }],
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">프로젝트</h2>
          <p className="text-sm text-muted-foreground">팀별 키 발급과 공유 프리셋을 한 곳에서 관리하세요.</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" /> 프로젝트 생성
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {demoProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>사용량: {project.quota}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">API Keys</p>
                <ul className="mt-2 space-y-2">
                  {project.apiKeys.map((key) => (
                    <li key={key.alias} className="flex items-center justify-between rounded-md border p-2">
                      <span>{key.alias}</span>
                      <span className="text-xs text-muted-foreground">회전일: {key.lastRotated}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold">공유 프리셋</p>
                <p className="text-xs text-muted-foreground">팀 구성원과 함께 사용할 템플릿을 추가하세요.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
