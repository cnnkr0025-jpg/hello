import type { ReactNode } from "react";
import { locales, type Locale, getDictionary, defaultLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  params,
  children,
}: {
  params: { locale: string };
  children: ReactNode;
}) {
  const locale = locales.includes(params.locale as Locale) ? (params.locale as Locale) : null;
  if (!locale) {
    notFound();
  }

  const dictionary = getDictionary(locale ?? defaultLocale);

  return (
    <div data-locale={locale} className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Creative Studio</h1>
            <p className="text-muted-foreground">{dictionary.workflowSummary}</p>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <a href={`/${locale}/dashboard`}>{dictionary.dashboard}</a>
            <a href={`/${locale}/projects`}>{dictionary.projects}</a>
            <a href={`/${locale}/usage`}>{dictionary.usage}</a>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Creative Studio. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
