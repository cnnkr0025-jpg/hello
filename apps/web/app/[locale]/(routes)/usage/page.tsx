import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@ai/ui";

const usage = [
  {
    plan: "Free",
    daily: 120,
    dailyLimit: 200,
    monthly: 1200,
    monthlyLimit: 3000,
  },
  {
    plan: "Plus",
    daily: 600,
    dailyLimit: 2000,
    monthly: 4800,
    monthlyLimit: 15000,
  },
  {
    plan: "Pro",
    daily: 1800,
    dailyLimit: 5000,
    monthly: 18000,
    monthlyLimit: 50000,
  },
];

export default function UsagePage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">사용량 및 결제</h2>
        <p className="text-sm text-muted-foreground">플랜별 할당량과 초과 시 결제 옵션을 확인하세요.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {usage.map((item) => {
          const dailyPercent = Math.min(100, Math.round((item.daily / item.dailyLimit) * 100));
          const monthlyPercent = Math.min(100, Math.round((item.monthly / item.monthlyLimit) * 100));
          return (
            <Card key={item.plan}>
              <CardHeader>
                <CardTitle>{item.plan}</CardTitle>
                <CardDescription>일일 {item.dailyLimit.toLocaleString()} / 월 {item.monthlyLimit.toLocaleString()} 크레딧</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 font-semibold">오늘 사용량</p>
                  <Progress value={dailyPercent} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.daily.toLocaleString()} / {item.dailyLimit.toLocaleString()} 크레딧
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold">이번 달 사용량</p>
                  <Progress value={monthlyPercent} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.monthly.toLocaleString()} / {item.monthlyLimit.toLocaleString()} 크레딧
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
