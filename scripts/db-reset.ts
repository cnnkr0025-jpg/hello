import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting database...");
  await prisma.$executeRawUnsafe('TRUNCATE "Job", "Usage", "ApiKey", "WebhookEvent", "Project", "User" RESTART IDENTITY CASCADE');
  console.log("Reset complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
