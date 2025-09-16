"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@ai/ui";

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    getProviders().then((value) => setProviders(value));
  }, []);

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border p-8 shadow">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-2 text-sm text-muted-foreground">이메일 또는 소셜 계정으로 로그인하세요.</p>
      <div className="mt-6 space-y-3">
        {providers &&
          Object.values(providers).map((provider) => (
            <Button key={provider.id} className="w-full" onClick={() => signIn(provider.id)}>
              {provider.name}로 계속하기
            </Button>
          ))}
      </div>
    </div>
  );
}
