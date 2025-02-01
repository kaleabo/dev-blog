import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession } from "next-auth";
import type { AuthConfig } from "@auth/core";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "@/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
export type { Session } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "MODERATOR";
      language: "ENGLISH" | "AMHARIC" | "AFAAN_OROMOO";
    } & DefaultSession["user"]
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }: { session: DefaultSession; user: any }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
        language: user.language,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request", 
    error: "/auth/error",
  },
} satisfies AuthConfig;
