import { env } from "@ai-stack/core";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: env.API_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: env.DEFAULT_LOCALE,
  },
  transpilePackages: ["@ai-stack/ui", "@ai-stack/core"],
};

export default nextConfig;
