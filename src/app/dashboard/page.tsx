import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { PostList } from "@/components/posts/post-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/dashboard");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link href="/posts/new">Create New Post</Link>
          </Button>
        </div>
        <PostList />
      </div>
    </div>
  );
} 