import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { EditPostForm } from "@/components/posts/edit-post-form";

interface EditPostPageProps {
  params: {
    slug: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/posts/" + params.slug + "/edit");
  }

  try {
    const post = await api.post.getBySlug.query({ slug: params.slug });

    if (post.authorId !== session.user.id) {
      redirect("/dashboard");
    }

    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <EditPostForm post={post} />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 