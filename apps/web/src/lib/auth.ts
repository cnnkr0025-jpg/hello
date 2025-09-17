import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { env } from "@ai-stack/core";

const providers = [] as NextAuthOptions["providers"];

if (env.EMAIL_SERVER && env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
    })
  );
}

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (env.GITHUB_ID && env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    })
  );
}

const credentialsProvider = CredentialsProvider({
  name: "Passwordless",
  credentials: {
    email: { label: "Email", type: "text" },
  },
  authorize: async (credentials) => {
    if (credentials?.email) {
      return {
        id: credentials.email,
        email: credentials.email,
        role: "USER",
      } as any;
    }
    return null;
  },
});

if (providers.length === 0 || process.env.NODE_ENV === "test") {
  providers.push(credentialsProvider);
}

const adapter = process.env.AUTH_DISABLED === "true" ? undefined : PrismaAdapter(prisma);

export const authOptions: NextAuthOptions = {
  adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (token?.role) {
        // @ts-expect-error custom session
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
  },
};
