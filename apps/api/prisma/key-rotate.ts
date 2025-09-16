import { prisma } from "../src/db";
import { encrypt } from "@ai/core";

async function main() {
  const apiKeys = await prisma.apiKey.findMany();
  for (const key of apiKeys) {
    const rotated = encrypt(`rotated-${key.keyAlias}-${Date.now()}`);
    await prisma.apiKey.update({
      where: { id: key.id },
      data: {
        encryptedKey: JSON.stringify(rotated),
        rotatedAt: new Date(),
      },
    });
    console.log(`Rotated key ${key.keyAlias}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
