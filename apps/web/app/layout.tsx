import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: "AI 코드 대결 플랫폼",
  description:
    "방 생성 → 참가 → AI 출제 → 샌드박스 채점 → AI 리포트 → ELO/포인트 반영까지 완전한 대결 경험을 제공하는 플랫폼",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 bg-slate-950">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
