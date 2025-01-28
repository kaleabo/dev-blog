import Link from "next/link";
import { Command } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function AuthError() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Command className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            There was an error during the authentication process. Please try again.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className={cn(
            buttonVariants({ variant: "default" }),
            "px-8"
          )}
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
} 