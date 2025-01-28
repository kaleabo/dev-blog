import "@/styles/globals.css";
import "@/styles/mdx-editor.css";

import { headers } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";
import { getServerAuthSession } from "@/server/auth";

export const metadata: Metadata = {
  title: "Ethiopian Dev Blog",
  description: "A blog platform for Ethiopian developers",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable}`}>
        <SessionProvider session={session}>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
