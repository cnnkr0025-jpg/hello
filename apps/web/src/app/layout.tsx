import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";

const locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "ko";

export const metadata: Metadata = {
  title: "AI Orchestrator",
  description: "Unified dashboard for text, image, and music generation workflows",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={locale}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
