import { FastifyRequest } from "fastify";
import { OAuthProvider, Tier } from "@prisma/client";
import { prisma } from "../db";
import { createPublicId } from "../lib/id";

const providerMap: Record<string, OAuthProvider> = {
  google: "google",
  github: "github",
  kakao: "kakao",
  naver: "naver",
};

export async function resolveAuthUser(request: FastifyRequest) {
  const oauthIdHeader = request.headers["x-user-id"];
  if (!oauthIdHeader || Array.isArray(oauthIdHeader)) {
    throw request.httpErrors.unauthorized("Missing x-user-id header");
  }
  const providerHeader = request.headers["x-user-provider"];
  const providerKey = Array.isArray(providerHeader) ? providerHeader[0] : providerHeader;
  const provider = providerKey && providerMap[providerKey.toLowerCase()] ? providerMap[providerKey.toLowerCase()] : OAuthProvider.google;

  const nicknameHeader = request.headers["x-user-nickname"];
  const nickname = Array.isArray(nicknameHeader)
    ? nicknameHeader[0]
    : nicknameHeader ?? `게스트-${oauthIdHeader.slice(-4)}`;
  const tierHeader = request.headers["x-user-tier"];
  const tierValue = Array.isArray(tierHeader) ? tierHeader[0] : tierHeader;
  const tier = tierValue && tierValue.toUpperCase() in Tier ? (tierValue.toUpperCase() as Tier) : Tier.FREE;

  return prisma.user.upsert({
    where: { oauthProvider_oauthId: { oauthProvider: provider, oauthId: oauthIdHeader } },
    update: {
      nickname,
      lastLoginAt: new Date(),
      tier,
    },
    create: {
      oauthProvider: provider,
      oauthId: oauthIdHeader,
      nickname,
      tier,
      email: `${oauthIdHeader}@demo.ai`,
      points: tier === Tier.PRO ? 500 : 200,
    },
  });
}

export function parseBooleanFlag(value?: string | string[]) {
  if (!value) return false;
  const raw = Array.isArray(value) ? value[0] : value;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function parseNumber(value: string | string[] | undefined, fallback: number) {
  if (!value) return fallback;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export { createPublicId };
