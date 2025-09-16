import { prisma } from "../src/db";
import { encrypt } from "@ai/core";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.ai" },
    update: {},
    create: {
      id: "admin",
      email: "admin@demo.ai",
      role: "ADMIN",
      plan: "pro",
      quota: 50000,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Demo Project",
    },
  });

  const keys = [
    {
      provider: "openai",
      keyAlias: "default",
      encryptedKey: JSON.stringify(encrypt("sk-demo-openai")),
    },
    {
      provider: "suno",
      keyAlias: "music",
      encryptedKey: JSON.stringify(encrypt("sk-demo-suno")),
    },
  ];

  for (const key of keys) {
    await prisma.apiKey.upsert({
      where: { keyAlias_projectId: { keyAlias: key.keyAlias, projectId: project.id } },
      update: key,
      create: { ...key, projectId: project.id },
    });
  }

  const jobs = await prisma.job.findMany({ take: 5 });
  if (jobs.length === 0) {
    await prisma.job.createMany({
      data: [
        {
          id: "seed-text",
          type: "text",
          provider: "openai",
          prompt: "블로그 요약",
          params: {},
          status: "succeeded",
          progress: 100,
          resultUrls: [],
          usage: { inputTokens: 300, outputTokens: 900, credits: 1 },
          raw: { text: "샘플 결과" },
          userId: admin.id,
          projectId: project.id,
        },
        {
          id: "seed-image",
          type: "image",
          provider: "openai",
          prompt: "썸네일 생성",
          params: {},
          status: "processing",
          progress: 60,
          resultUrls: ["https://placehold.co/1024x576/png"],
          usage: { credits: 1 },
          raw: { note: "이미지 생성 진행 중" },
          userId: admin.id,
          projectId: project.id,
        },
      ],
    });
  }

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
