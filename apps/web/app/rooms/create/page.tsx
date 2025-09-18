'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import clsx from 'clsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

const timeLimits = [10, 20, 30];

export default function CreateRoomPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    hint: '',
    maxPlayers: 2,
    mode: 'duel',
    difficulty: 'easy',
    isPrivate: false,
    password: '',
    allowSpectate: true,
    timeLimit: 20,
    languages: ['python'],
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
          'x-user-tier': 'PRO',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || '방 생성에 실패했습니다.');
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/rooms/${data.room.id}`);
    },
  });

  const toggleLanguage = (value: string) => {
    setForm((prev) => {
      const exists = prev.languages.includes(value);
      return {
        ...prev,
        languages: exists ? prev.languages.filter((lang) => lang !== value) : [...prev.languages, value],
      };
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold text-white">방 생성</h1>
      <p className="mt-2 text-sm text-slate-300">필수 항목을 입력하고 방 옵션을 설정하세요. Pro 이용자는 특수 문제 출제를 활성화할 수 있습니다.</p>

      <form
        className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          createRoom.mutate();
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            방 이름
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              placeholder="예: AI 한판 승부"
              className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            힌트
            <input
              value={form.hint}
              onChange={(event) => setForm((prev) => ({ ...prev, hint: event.target.value }))}
              placeholder="참가자에게 보여줄 한 줄 소개"
              className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            최대 인원 (2/3/4)
            <select
              value={form.maxPlayers}
              onChange={(event) => setForm((prev) => ({ ...prev, maxPlayers: Number(event.target.value) }))}
              className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
            >
              {[2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count}명
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            모드
            <select
              value={form.mode}
              onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value }))}
              className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
            >
              <option value="duel">1v1</option>
              <option value="triple">1v1v1</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            난이도
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, difficulty: level }))}
                  className={clsx('flex-1 rounded-md border px-3 py-2 text-sm', {
                    'border-sky-400 bg-sky-500/20 text-sky-100': form.difficulty === level,
                    'border-white/20 bg-slate-900/60 text-slate-200': form.difficulty !== level,
                  })}
                >
                  {level === 'easy' ? 'Easy 🟢' : level === 'medium' ? 'Medium 🟡' : 'Hard 🔴'}
                </button>
              ))}
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            타임리밋
            <div className="flex gap-2">
              {timeLimits.map((limit) => (
                <button
                  key={limit}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, timeLimit: limit }))}
                  className={clsx('flex-1 rounded-md border px-3 py-2 text-sm', {
                    'border-sky-400 bg-sky-500/20 text-sky-100': form.timeLimit === limit,
                    'border-white/20 bg-slate-900/60 text-slate-200': form.timeLimit !== limit,
                  })}
                >
                  {limit}분
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-200">사용 언어</p>
          <div className="flex flex-wrap gap-3">
            {languages.map((language) => (
              <label key={language.value} className="inline-flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={form.languages.includes(language.value)}
                  onChange={() => toggleLanguage(language.value)}
                  className="h-4 w-4 rounded border-white/30 bg-slate-900"
                />
                {language.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.isPrivate}
              onChange={(event) => setForm((prev) => ({ ...prev, isPrivate: event.target.checked }))}
              className="h-4 w-4 rounded border-white/30 bg-slate-900"
            />
            비공개 방 (비밀번호 필요)
          </label>
          {form.isPrivate ? (
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              비밀번호
              <input
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                minLength={4}
                maxLength={32}
                required
                className="rounded-md border border-white/20 bg-slate-900/60 px-3 py-2"
              />
            </label>
          ) : null}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={form.allowSpectate}
            onChange={(event) => setForm((prev) => ({ ...prev, allowSpectate: event.target.checked }))}
            className="h-4 w-4 rounded border-white/30 bg-slate-900"
          />
          관전 허용 (👀 표시)
        </label>

        {createRoom.isError ? (
          <p className="text-sm text-rose-300">{(createRoom.error as Error).message}</p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createRoom.isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 disabled:opacity-50"
          >
            {createRoom.isLoading ? '생성 중...' : '생성'}
          </button>
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
