import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button } from "@ai-stack/ui";

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>Daily and monthly credit consumption by provider.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Daily credits used</div>
            <div className="text-3xl font-semibold">36 / 120</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Monthly credits used</div>
            <div className="text-3xl font-semibold">420 / 2500</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Need more capacity?</CardTitle>
          <CardDescription>Upgrade to Pro for priority Suno routing and higher burst limits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
