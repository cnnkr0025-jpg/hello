"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Textarea, Tabs, TabsList, TabsTrigger, TabsContent, Checkbox } from "@ai-stack/ui";
import { createJob } from "@/lib/api";
import toast from "react-hot-toast";
import { presets } from "@/data/presets";
import { Play } from "lucide-react";

const taskTabs = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "music", label: "Music" },
] as const;

export const WorkflowBuilder = () => {
  const [taskType, setTaskType] = useState<"text" | "image" | "music">("text");
  const [prompt, setPrompt] = useState("");
  const [params, setParams] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [complianceChecked, setComplianceChecked] = useState(false);

  const filteredPresets = useMemo(() => presets.filter((preset) => preset.type === taskType), [taskType]);

  const handlePreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    setTaskType(preset.type as typeof taskType);
    setPrompt(preset.prompt);
    setParams(preset.params);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complianceChecked) {
      toast.error("Please acknowledge the policy warning");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        prompt,
        params,
        projectId: crypto.randomUUID(),
        userId: crypto.randomUUID(),
      };
      await createJob(taskType, payload);
      toast.success("Job submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Builder</CardTitle>
        <CardDescription>Prompt → Model → Parameters → Submit</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Preset</label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="rounded-lg border p-3 text-left hover:border-primary"
                  onClick={() => handlePreset(preset.id)}
                >
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          <Tabs value={taskType} onValueChange={(value) => setTaskType(value as typeof taskType)}>
            <TabsList>
              {taskTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="text" className="space-y-3">
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your writing task" />
              <Input
                placeholder="Temperature (0-1)"
                value={params.temperature?.toString() ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, temperature: Number(e.target.value) }))}
              />
              <Input
                placeholder="Max tokens"
                value={params.maxTokens?.toString() ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, maxTokens: Number(e.target.value) }))}
              />
            </TabsContent>
            <TabsContent value="image" className="space-y-3">
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the visual you want" />
              <Input
                placeholder="Size e.g. 1024x1024"
                value={(params.size as string) ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, size: e.target.value }))}
              />
            </TabsContent>
            <TabsContent value="music" className="space-y-3">
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the vibe" />
              <Input
                placeholder="BPM"
                value={params.bpm?.toString() ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, bpm: Number(e.target.value) }))}
              />
              <Input
                placeholder="Duration (seconds)"
                value={params.duration?.toString() ?? ""}
                onChange={(e) => setParams((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              />
            </TabsContent>
          </Tabs>

          <label className="flex items-center space-x-2 text-sm">
            <Checkbox checked={complianceChecked} onCheckedChange={(checked) => setComplianceChecked(Boolean(checked))} />
            <span>저작권 및 정책 준수는 사용자 책임이며, 위 내용을 이해하고 동의합니다.</span>
          </label>

          <Button type="submit" disabled={loading}>
            <Play className="mr-2 h-4 w-4" /> Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
