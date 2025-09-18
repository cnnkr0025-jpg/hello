import { Difficulty, Tier, Problem } from "@prisma/client";
import { env } from "@ai/core";
import { prisma } from "../db";
import { createPublicId } from "../lib/id";

type ProblemOptions = {
  difficulty: Difficulty;
  tier: Tier;
  allowSpecial: boolean;
};

const basePrompts: Record<Difficulty, { title: string; prompt: string; io: string; tags: string[] }> = {
  easy: {
    title: "문자열 뒤집기",
    prompt: "문자열 S가 주어질 때 이를 뒤집은 결과를 출력하세요.",
    io: "입력: 문자열 S (1≤|S|≤1e5). 출력: 뒤집힌 문자열.",
    tags: ["string", "implementation"],
  },
  medium: {
    title: "최대 부분 수열 합",
    prompt: "정수 배열이 주어지면 연속 부분 수열 중 최대 합을 구하세요.",
    io: "입력: N과 정수 배열. 출력: 최대 합.",
    tags: ["dp", "array"],
  },
  hard: {
    title: "그래프 최단 경로",
    prompt: "가중치가 있는 방향 그래프에서 시작점으로부터 모든 정점까지의 최단 거리를 구하세요.",
    io: "입력: N,M 및 간선(u,v,w). 출력: 각 정점의 최단 거리.",
    tags: ["graph", "dijkstra"],
  },
};

const proSpecialTags = [
  { title: "고급 그래프 탐색", tag: "graph" },
  { title: "동적 계획법 마스터", tag: "dp" },
];

export async function generateProblem(options: ProblemOptions): Promise<Problem> {
  const { difficulty, tier, allowSpecial } = options;
  const base = basePrompts[difficulty];
  const tags = [...base.tags];

  if (tier === Tier.PRO && allowSpecial && env.PRO_SPECIAL_PROBLEM_ENABLED === "true") {
    const special = proSpecialTags[difficulty === "hard" ? 0 : 1];
    if (!tags.includes(special.tag)) tags.push(special.tag);
  }

  const id = createPublicId("prob");
  return prisma.problem.create({
    data: {
      id,
      title: base.title,
      prompt: base.prompt,
      ioSpec: base.io,
      tags,
      difficulty,
      publicTestcases: {
        cases: [
          { input: "3\n1 2 3", output: "6" },
          { input: "4\n-1 -2 -3 -4", output: "-1" },
        ],
      },
      hiddenTestcases: {
        cases: [
          { input: "6\n1 -5 2 2 2 -1", output: "5" },
        ],
      },
    },
  });
}
