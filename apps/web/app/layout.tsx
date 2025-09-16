import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AI Creative Studio",
  description: "Unified dashboard for text, image, and music generation",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-background text-foreground">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
