import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TagNotFound() {
  return (
    <div className="container mx-auto flex min-h-[600px] max-w-4xl flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold">Tag Not Found</h1>
          <p className="text-xl text-muted-foreground">
            The tag you're looking for doesn't exist.
          </p>
        </div>
        <Button asChild>
          <Link href="/tags">Browse All Tags</Link>
        </Button>
      </div>
    </div>
  );
} 