import Link from "next/link";
import { Command } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function VerifyRequest() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Command className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            A sign in link has been sent to your email address.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "px-8 text-center text-sm text-muted-foreground"
          )}
        >
          Return to sign in
        </Link>
      </div>
    </div>
  );
} 