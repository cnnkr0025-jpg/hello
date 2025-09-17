'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import clsx from 'clsx';
import { Clock, Eye, Send, ShieldCheck } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const languageOptions = [
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
];

type MatchResponse = {
  match: {
    id: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    mode: 'duel' | 'triple';
    difficulty: 'easy' | 'medium' | 'hard';
    language: 'python' | 'cpp' | 'java';
    allowSpectate: boolean;
    timeLimitMinutes: number;
    startedAt?: string;
    endedAt?: string;
    participants: Array<{
      id: string;
      userId: string;
      placement?: number | null;
      result?: string | null;
      user: { nickname: string };
    }>;
    submissions: Array<{
      id: string;
      userId: string;
      lang: string;
      verdict: string;
      isPublic: boolean;
      code: string | null;
      createdAt: string;
    }>;
    problem?: {
      title: string;
      prompt: string;
      ioSpec: string;
      tags: string[];
      difficulty: string;
      publicTestcases: { cases: Array<{ input: string; output: string }> };
    };
    judgment?: {
      summary: string;
      explainMd: string;
      scoreCorrectness: number;
      scorePerf: number;
      scoreQuality: number;
    } | null;
  };
  isParticipant: boolean;
};

const statusBadge: Record<string, string> = {
  pending: 'bg-slate-700/50 text-slate-200',
  active: 'bg-emerald-500/20 text-emerald-200',
  completed: 'bg-sky-500/20 text-sky-200',
  cancelled: 'bg-rose-500/20 text-rose-200',
};

export default function MatchPage() {
  const params = useParams();
  const matchId = params?.id as string;
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java'>('python');
  const [code, setCode] = useState('');
  const [keystrokes, setKeystrokes] = useState<Array<{ t: number; value: string }>>([]);
  const [pasteEvents, setPasteEvents] = useState<Array<{ byteSize: number; source: string }>>([]);

  const matchQuery = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/matches/${matchId}`, {
        headers: {
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
        },
        cache: 'no-store',
      });
      if (!res.ok) {
        throw new Error('매치 정보를 불러오지 못했습니다.');
      }
      return (await res.json()) as MatchResponse;
    },
    enabled: Boolean(matchId),
    refetchInterval: 4000,
  });

  useEffect(() => {
    if (matchQuery.data?.match.language) {
      setLanguage(matchQuery.data.match.language);
    }
  }, [matchQuery.data?.match.language]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/matches/${matchId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
        },
        body: JSON.stringify({
          lang: language,
          code,
          keystrokes,
          pasteEvents,
        }),
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || '제출에 실패했습니다.');
      }
      return res.json();
    },
    onSuccess: () => {
      setKeystrokes([]);
      setPasteEvents([]);
      matchQuery.refetch();
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/api/matches/${matchId}/request-review`, {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-google',
          'x-user-provider': 'google',
          'x-user-tier': 'BASIC',
        },
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || '심화 리뷰 요청에 실패했습니다.');
      }
      return res.json();
    },
  });

  const match = matchQuery.data?.match;
  const isParticipant = matchQuery.data?.isParticipant ?? false;

  const startedAt = useMemo(() => (match?.startedAt ? new Date(match.startedAt) : undefined), [match?.startedAt]);
  const deadline = useMemo(() => {
    if (!startedAt || !match?.timeLimitMinutes) return undefined;
    return new Date(startedAt.getTime() + match.timeLimitMinutes * 60000);
  }, [startedAt, match?.timeLimitMinutes]);
  const timeRemaining = useMemo(() => {
    if (!deadline) return null;
    const diff = deadline.getTime() - Date.now();
    if (diff <= 0) return '00:00';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [deadline, matchQuery.data?.match.status]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      {match ? (
        <>
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Link href="/rooms" className="text-xs uppercase text-slate-400 hover:text-sky-300">
                방 목록으로 돌아가기
              </Link>
              <h1 className="text-3xl font-semibold text-white">{match.problem?.title ?? '문제 로딩 중'}</h1>
              <p className="text-sm text-slate-300">난이도: {match.difficulty} · 모드: {match.mode === 'duel' ? '1v1' : '1v1v1'} · 언어: {languageOptions.find((opt) => opt.value === match.language)?.label}</p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                {match.problem?.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-900/70 px-3 py-1">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-sm text-slate-200">
              <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', statusBadge[match.status])}>{match.status}</span>
              <span className="inline-flex items-center gap-2 text-slate-200">
                <Clock className="h-4 w-4" /> {timeRemaining ?? '—'} 남음
              </span>
              <span className="inline-flex items-center gap-2 text-slate-200">
                <Eye className="h-4 w-4" /> {match.allowSpectate ? '관전 허용' : '관전 불가'}
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">문제 설명</h2>
              <p className="whitespace-pre-wrap text-sm text-slate-200">{match.problem?.prompt}</p>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">입출력</h3>
                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-300">{match.problem?.ioSpec}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-200">공개 테스트케이스</h3>
                {match.problem?.publicTestcases?.cases.map((testcase, index) => (
                  <div key={index} className="rounded-md bg-slate-900/70 p-3 text-xs text-slate-300">
                    <p className="font-semibold text-slate-200">입력</p>
                    <pre className="whitespace-pre-wrap text-slate-300">{testcase.input}</pre>
                    <p className="mt-2 font-semibold text-slate-200">출력</p>
                    <pre className="whitespace-pre-wrap text-slate-300">{testcase.output}</pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  {languageOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLanguage(option.value as typeof language)}
                      className={clsx('rounded-full px-3 py-1 text-xs font-semibold', {
                        'bg-sky-500/30 text-sky-100': language === option.value,
                        'bg-slate-900/60 text-slate-300': language !== option.value,
                      })}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => reviewMutation.mutate()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs text-slate-200"
                >
                  <ShieldCheck className="h-4 w-4" /> 심화 리뷰 요청
                </button>
              </div>
              <div className="h-[360px] overflow-hidden rounded-2xl border border-white/10">
                <MonacoEditor
                  language={language === 'python' ? 'python' : language === 'cpp' ? 'cpp' : 'java'}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value ?? '')}
                  options={{ minimap: { enabled: false } }}
                  onMount={(editor) => {
                    editor.onDidType((text) => {
                      setKeystrokes((prev) => [...prev, { t: Date.now(), value: text }]);
                    });
                    editor.onDidPaste((event) => {
                      const size = event.rangeLength ?? event.text.length;
                      setPasteEvents((prev) => [...prev, { byteSize: size, source: 'editor' }]);
                    });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => submitMutation.mutate()}
                disabled={!code || submitMutation.isLoading || !isParticipant}
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> {submitMutation.isLoading ? '제출 중...' : '코드 제출'}
              </button>
              {!isParticipant ? (
                <p className="text-xs text-amber-300">관전자이거나 참가자가 아니므로 제출할 수 없습니다.</p>
              ) : null}
              {submitMutation.isError ? (
                <p className="text-xs text-rose-300">{(submitMutation.error as Error).message}</p>
              ) : null}
              {reviewMutation.isError ? (
                <p className="text-xs text-rose-300">{(reviewMutation.error as Error).message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">참가자 현황</h2>
              <ul className="space-y-2 text-sm text-slate-200">
                {match.participants.map((participant) => (
                  <li key={participant.id} className="flex items-center justify-between rounded-md bg-slate-900/60 px-3 py-2">
                    <span>{participant.user.nickname}</span>
                    <span className="text-xs text-slate-300">{participant.result ?? '대기'}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">최근 제출</h2>
              <ul className="space-y-2 text-xs text-slate-200">
                {match.submissions.map((submission) => (
                  <li key={submission.id} className="rounded-md bg-slate-900/60 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span>{submission.lang.toUpperCase()}</span>
                      <span>{new Date(submission.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-1 text-slate-300">{submission.verdict}</p>
                    {submission.code ? (
                      <pre className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap text-slate-400">{submission.code}</pre>
                    ) : (
                      <p className="mt-1 text-slate-500">코드 비공개</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {match.judgment ? (
            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">AI 리포트</h2>
              <p className="text-sm text-slate-200">{match.judgment.summary}</p>
              <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-3">
                <div className="rounded-md bg-slate-900/60 p-3">
                  정확도: {match.judgment.scoreCorrectness}/100
                </div>
                <div className="rounded-md bg-slate-900/60 p-3">
                  성능: {match.judgment.scorePerf}/100
                </div>
                <div className="rounded-md bg-slate-900/60 p-3">
                  코드 품질: {match.judgment.scoreQuality}/100
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-slate-300">{match.judgment.explainMd}</pre>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              <ShieldCheck className="mb-2 h-5 w-5 text-sky-400" />
              AI 리포트가 준비되면 여기에서 확인할 수 있습니다.
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-200">매치 정보를 불러오는 중...</div>
      )}
    </div>
  );
}
