import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env";
import { db } from "@/server/db";
import { getServerSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "MODERATOR";
      language: "ENGLISH" | "AMHARIC" | "AFAAN_OROMOO";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN" | "MODERATOR";
    language: "ENGLISH" | "AMHARIC" | "AFAAN_OROMOO";
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
        language: user.language,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.language = user.language;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};

export const getServerAuthSession = async () => {
  const session = await getServerSession(authOptions);
  return session;
}; 