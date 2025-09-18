'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, RefreshCw, Users } from 'lucide-react';
import clsx from 'clsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Room = {
  id: string;
  name: string;
  hint?: string | null;
  mode: 'duel' | 'triple';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'waiting' | 'ongoing' | 'finished';
  allowSpectate: boolean;
  maxPlayers: number;
  currentPlayers: number;
  languages: string[];
  icon: string;
  latestMatchStatus?: string | null;
  createdAt: string;
};

type RoomsResponse = {
  rooms: Room[];
};

const difficultyLabels: Record<Room['difficulty'], string> = {
  easy: 'Easy 🟢',
  medium: 'Medium 🟡',
  hard: 'Hard 🔴',
};

const statusLabels: Record<Room['status'], string> = {
  waiting: '대기',
  ongoing: '진행 중',
  finished: '마감',
};

function useRooms(filters: Record<string, string | undefined>) {
  const queryKey = useMemo(() => ['rooms', filters], [filters]);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const res = await fetch(`${API_URL}/api/rooms?${params.toString()}`, {
        headers: {
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
        },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error('방 목록을 불러오지 못했습니다.');
      }
      const data = (await res.json()) as RoomsResponse;
      return data.rooms;
    },
  });
}

export default function RoomsClient({ initialFilters }: { initialFilters: Record<string, string | undefined> }) {
  const [filters, setFilters] = useState(() => ({
    difficulty: initialFilters.difficulty,
    status: initialFilters.status,
    spectate: initialFilters.spectate,
    sort: initialFilters.sort ?? 'latest',
  }));
  const { data, isLoading, refetch } = useRooms(filters);

  const handleFilterChange = (key: string, value?: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">실시간 대결 방</h1>
          <p className="mt-2 text-sm text-slate-300">
            난이도별로 정렬하고 관전 가능한 방만 필터링할 수 있습니다. 비공개 방은 비밀번호 입력 후 참가할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/rooms/create"
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30"
          >
            방 생성하기
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white"
          >
            <RefreshCw className={clsx('h-4 w-4', { 'animate-spin': isLoading })} /> 새로고침
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase">
            <Filter className="h-4 w-4" /> 필터
          </span>
          <select
            value={filters.difficulty ?? ''}
            onChange={(event) => handleFilterChange('difficulty', event.target.value || undefined)}
            className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
          >
            <option value="">난이도 전체</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select
            value={filters.status ?? ''}
            onChange={(event) => handleFilterChange('status', event.target.value || undefined)}
            className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
          >
            <option value="">상태 전체</option>
            <option value="waiting">대기</option>
            <option value="ongoing">진행중</option>
            <option value="finished">마감</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/30 bg-slate-900"
              checked={filters.spectate === 'true'}
              onChange={(event) => handleFilterChange('spectate', event.target.checked ? 'true' : undefined)}
            />
            관전 가능한 방만 보기
          </label>
          <select
            value={filters.sort}
            onChange={(event) => handleFilterChange('sort', event.target.value)}
            className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
          >
            <option value="latest">최신순</option>
            <option value="players">참가자 많은 순</option>
            <option value="difficulty">난이도 높은 순</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-300">방 목록을 불러오는 중...</div>
      ) : (
        <>
          <div className="hidden rounded-3xl border border-white/10 bg-white/5 text-sm text-slate-200 md:block">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-400">
                  <th className="px-4 py-3">방 이름</th>
                  <th className="px-4 py-3">난이도</th>
                  <th className="px-4 py-3">인원</th>
                  <th className="px-4 py-3">모드</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">관전</th>
                  <th className="px-4 py-3">언어</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((room) => (
                  <tr key={room.id} className="border-b border-white/5 hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <Link href={`/rooms/${room.id}`} className="font-semibold text-white hover:text-sky-300">
                        {room.name}
                      </Link>
                      <p className="text-xs text-slate-400">{room.hint}</p>
                    </td>
                    <td className="px-4 py-3">{difficultyLabels[room.difficulty]}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" /> {room.currentPlayers}/{room.maxPlayers}
                      </span>
                    </td>
                    <td className="px-4 py-3">{room.mode === 'duel' ? '1v1' : '1v1v1'}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', {
                        'bg-emerald-500/20 text-emerald-200': room.status === 'waiting',
                        'bg-amber-500/20 text-amber-200': room.status === 'ongoing',
                        'bg-slate-700/60 text-slate-300': room.status === 'finished',
                      })}>
                        {statusLabels[room.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{room.allowSpectate ? '👀' : '—'}</td>
                    <td className="px-4 py-3">{room.languages.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {data?.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-white">{room.name}</p>
                  <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', {
                    'bg-emerald-500/20 text-emerald-200': room.status === 'waiting',
                    'bg-amber-500/20 text-amber-200': room.status === 'ongoing',
                    'bg-slate-700/60 text-slate-300': room.status === 'finished',
                  })}>
                    {statusLabels[room.status]}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{room.hint}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                  <span>{difficultyLabels[room.difficulty]}</span>
                  <span>{room.mode === 'duel' ? '1v1' : '1v1v1'}</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" /> {room.currentPlayers}/{room.maxPlayers}
                  </span>
                  <span>{room.allowSpectate ? '👀' : '비공개'}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
