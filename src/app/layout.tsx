import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";
import { getServerAuthSession } from "@/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Ethiopian Dev Blog",
  description: "A community platform for Ethiopian developers",
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
      <body className={`font-sans ${inter.variable}`}>
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
