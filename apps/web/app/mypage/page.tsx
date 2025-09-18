'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Coins, LogOut, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type UserResponse = {
  profile: {
    id: string;
    nickname: string;
    tier: 'FREE' | 'BASIC' | 'PRO';
    elo: number;
    points: number;
    strikes: number;
    createdAt: string;
  };
  recentMatches: Array<{
    matchId: string;
    roomName: string;
    result: string | null;
    placement: number | null;
    eloBefore: number;
    eloAfter: number | null;
    pointsAwarded: number;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    deltaPoints: number;
    reason: string;
    createdAt: string;
  }>;
  appeals: Array<{
    id: string;
    matchId: string;
    status: string;
    createdAt: string;
  }>;
};

export default function MyPage() {
  const userQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
          'x-user-tier': 'PRO',
        },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error('마이페이지 정보를 불러오지 못했습니다.');
      }
      return (await res.json()) as UserResponse;
    },
  });

  const profile = userQuery.data?.profile;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row">
      <aside className="w-full md:w-64">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
          <div>
            <p className="text-xs uppercase text-slate-400">계정 관리</p>
            <ul className="mt-2 space-y-2">
              <li>닉네임 변경</li>
              <li>비밀번호 관리</li>
              <li>SNS 연동</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">구독/멤버십</p>
            <ul className="mt-2 space-y-2">
              <li>플랜 변경</li>
              <li>결제 내역</li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">기타</p>
            <ul className="mt-2 space-y-2">
              <li>공지사항</li>
              <li>고객센터</li>
              <li className="inline-flex items-center gap-2 text-rose-300">
                <LogOut className="h-4 w-4" /> 로그아웃
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <section className="flex-1 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          {profile ? (
            <div className="space-y-3 text-slate-200">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-semibold text-slate-950">
                  <User className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-2xl font-semibold">{profile.nickname}님 환영합니다</h1>
                  <p className="text-sm text-slate-300">플랜: {profile.tier} · 가입일 {new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-200 md:grid-cols-3">
                <div className="rounded-md bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">ELO</p>
                  <p className="text-lg font-semibold text-white">{profile.elo}</p>
                </div>
                <div className="rounded-md bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">포인트</p>
                  <p className="text-lg font-semibold text-white">{profile.points}p</p>
                  <Link href="/rewards" className="mt-2 inline-flex items-center gap-2 text-xs text-sky-300">
                    <Coins className="h-4 w-4" /> 교환하기
                  </Link>
                </div>
                <div className="rounded-md bg-slate-900/60 p-3">
                  <p className="text-xs text-slate-400">Strikes</p>
                  <p className="text-lg font-semibold text-white">{profile.strikes}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300">마이페이지 정보를 불러오는 중...</p>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">최근 대결 기록</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-200">
            {userQuery.data?.recentMatches.map((match) => (
              <div key={match.matchId} className="rounded-md bg-slate-900/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{match.roomName}</span>
                  <span className="text-xs text-slate-400">{new Date(match.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  결과: {match.result ?? '진행 중'} · 순위: {match.placement ?? '-'} · ΔELO: {(match.eloAfter ?? match.eloBefore) - match.eloBefore}
                </p>
                <p className="mt-1 text-xs text-slate-400">포인트: +{match.pointsAwarded}</p>
              </div>
            ))}
            {userQuery.data?.recentMatches.length === 0 ? (
              <p className="text-sm text-slate-400">아직 대결 기록이 없습니다.</p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">포인트 변동</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              {userQuery.data?.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between rounded-md bg-slate-900/60 px-3 py-2">
                  <span>{tx.reason}</span>
                  <span className={tx.deltaPoints >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    {tx.deltaPoints >= 0 ? '+' : ''}
                    {tx.deltaPoints}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">이의신청</h2>
            <ul className="mt-3 space-y-2 text-xs text-slate-200">
              {userQuery.data?.appeals.map((appeal) => (
                <li key={appeal.id} className="flex items-center justify-between rounded-md bg-slate-900/60 px-3 py-2">
                  <span>매치 {appeal.matchId}</span>
                  <span>{appeal.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
