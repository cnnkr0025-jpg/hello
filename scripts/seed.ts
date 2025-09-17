import { PrismaClient, JobStatus, JobType, Plan, Role } from "@prisma/client";
import { PLAN_CONFIG } from "@ai-stack/core";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const adminEmail = "admin@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      role: Role.ADMIN,
      plan: Plan.PRO,
      quota: PLAN_CONFIG.PRO,
    },
  });

  const projectId = "seed-project";

  await prisma.project.upsert({
    where: { id: projectId },
    update: {},
    create: {
      id: projectId,
      name: "Demo Project",
      userId: admin.id,
      teamId: "team-demo",
    },
  });

  await prisma.apiKey.upsert({
    where: { id: "demo-key" },
    update: {},
    create: {
      id: "demo-key",
      projectId,
      provider: "openai",
      keyAlias: "demo-openai",
      encryptedKey: "encrypted-placeholder",
    },
  });

  const sampleJobs = [
    { type: JobType.text, provider: "openai", status: JobStatus.completed, progress: 100 },
    { type: JobType.image, provider: "openai", status: JobStatus.completed, progress: 100 },
    { type: JobType.music, provider: "suno", status: JobStatus.processing, progress: 60 },
    { type: JobType.text, provider: "openai", status: JobStatus.failed, progress: 100 },
    { type: JobType.image, provider: "openai", status: JobStatus.queued, progress: 0 },
  ];

  for (const job of sampleJobs) {
    await prisma.job.upsert({
      where: { id: `${job.type}-${job.status}` },
      update: {},
      create: {
        id: `${job.type}-${job.status}`,
        type: job.type,
        provider: job.provider,
        prompt: `Sample prompt for ${job.type}`,
        params: { temperature: 0.7 },
        status: job.status,
        progress: job.progress,
        resultUrls: job.type === JobType.image ? ["https://placehold.co/600x400"] : [],
        usage: { credits: 1 },
        userId: admin.id,
        projectId,
      },
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
