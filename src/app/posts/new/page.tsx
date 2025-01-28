import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { CreatePostForm } from "@/components/posts/create-post-form";

export default async function NewPostPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/posts/new");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <CreatePostForm />
      </div>
    </div>
  );
} 