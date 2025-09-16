import { prisma } from "../db";
import type { Prisma } from "@prisma/client";

export type JobInput = {
  type: "text" | "image" | "music";
  provider: string;
  prompt: string;
  params?: Record<string, any>;
  userId: string;
  projectId: string;
};

export async function createQueuedJob(input: JobInput) {
  const data: Prisma.JobCreateInput = {
    type: input.type,
    provider: input.provider,
    prompt: input.prompt,
    params: input.params ?? {},
    status: "queued",
    progress: 0,
    user: {
      connectOrCreate: {
        where: { id: input.userId },
        create: {
          id: input.userId,
          email: `${input.userId}@demo.ai`,
          role: "USER",
          plan: "free",
          quota: 3000,
        },
      },
    },
    project: {
      connectOrCreate: {
        where: { id: input.projectId },
        create: {
          id: input.projectId,
          name: "Demo Project",
        },
      },
    },
  };
  return prisma.job.create({ data });
}

export async function updateJobStatus(
  id: string,
  data: Partial<Pick<Prisma.JobUpdateInput, "status" | "progress" | "resultUrls" | "usage">>
) {
  return prisma.job.update({
    where: { id },
    data,
  });
}
