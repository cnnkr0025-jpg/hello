import { createDecipheriv, createCipheriv, randomBytes, scryptSync } from "crypto";
import { env } from "../env";

const algorithm = "aes-256-gcm";
const key = scryptSync(env.ENCRYPTION_KEY, "ai-studio", 32);

export function encrypt(text: string): { ciphertext: string; iv: string; authTag: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

export function decrypt({ ciphertext, iv, authTag }: { ciphertext: string; iv: string; authTag: string }): string {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
