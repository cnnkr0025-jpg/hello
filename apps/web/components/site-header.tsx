'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/rooms', label: '대결하기' },
  { href: '/rooms?spectate=true', label: '관전하기' },
  { href: '/pricing', label: '요금제' },
  { href: '/mypage', label: '마이페이지' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-slate-950">
            AI
          </span>
          <span>AI 코드 대결 플랫폼</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-sky-300 ${pathname.startsWith(item.href.replace(/\?.*/, '')) ? 'text-sky-400' : 'text-slate-200'}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/rooms"
            className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:shadow-sky-400/50"
          >
            지금 대결하기
          </Link>
        </nav>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-white/20 p-2 text-white md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-white/5 bg-slate-950/95 px-4 pb-6 md:hidden">
          <div className="flex flex-col gap-3 pt-3 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 hover:bg-slate-800/70"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/rooms"
              className="rounded-full bg-sky-500 px-4 py-2 text-center text-sm font-semibold text-slate-950 shadow"
              onClick={() => setOpen(false)}
            >
              지금 대결하기
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
