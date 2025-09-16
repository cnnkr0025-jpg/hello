"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@ai/ui";

export function PolicyBanner() {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
      <AlertTriangle className="mt-0.5 h-5 w-5" />
      <div className="space-y-2">
        <p>AI 생성물은 이용자 책임이며 Suno/OpenAI 이용약관과 저작권 법령을 준수해야 합니다.</p>
        <Button size="sm" variant="outline" onClick={() => setAccepted(true)}>
          동의합니다
        </Button>
      </div>
    </div>
  );
}
