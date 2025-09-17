import { PrismaClient } from "@prisma/client";
import { randomBytes, createCipheriv } from "node:crypto";

const prisma = new PrismaClient();
const key = process.env.ENCRYPTION_KEY;

if (!key || key.length < 32) {
  throw new Error("ENCRYPTION_KEY must be at least 32 characters");
}

const secretKey = Buffer.from(key.slice(0, 32));

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

async function rotate() {
  console.log("Rotating API keys...");
  const keys = await prisma.apiKey.findMany();
  for (const apiKey of keys) {
    const rotated = encrypt(`rotated-${apiKey.provider}-${Date.now()}`);
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        encryptedKey: rotated,
        rotatedAt: new Date(),
      },
    });
    console.log(`Rotated key ${apiKey.keyAlias}`);
  }
  console.log("Rotation complete");
}

rotate()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
