import { prisma } from "../src/db";

async function main() {
  await prisma.webhookEvent.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.usage.deleteMany();
  await prisma.job.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log("Database cleared");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
