export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-slate-200">
      <h1 className="text-3xl font-semibold text-white">요금제 안내</h1>
      <p className="mt-2 text-sm text-slate-300">Free / Basic / Pro 3단계 플랜으로 AI 코드 대결 플랫폼을 이용할 수 있습니다.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Free</h2>
          <p className="text-sm text-slate-300">무료 · 대결·관전 체험</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>• 일일 대결 횟수 제한</li>
            <li>• 관전 허용</li>
            <li>• 광고 노출</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Basic</h2>
          <p className="text-sm text-slate-300">월 4,900원 · 심화 리뷰 요청</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>• GPT-5 심화 리뷰 (시간복잡도/최적화)</li>
            <li>• 대결 횟수 상향</li>
            <li>• 광고 제거 옵션</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Pro</h2>
          <p className="text-sm text-slate-300">월 9,900원 · 특수 문제 출제</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>• 그래프/DP 등 특수 문제</li>
            <li>• 대안 알고리즘 + 후속 문제 추천</li>
            <li>• 방 생성 한도 하루 1,000개</li>
          </ul>
        </div>
      </div>
      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
        <p>환전은 불가능하며 포인트는 기프티콘 등으로만 교환 가능합니다. 미성년자 보호를 위해 월 교환 상한을 설정합니다.</p>
      </div>
    </div>
  );
}
