import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { MarkdownPreview } from "@/components/posts/markdown-preview";

interface PostPageProps {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await api.post.getBySlug({ slug: params.slug });

    if (!post || (post.published === false)) {
      notFound();
    }

    return (
      <div className="container mx-auto py-10">
        <article className="prose dark:prose-invert mx-auto">
          <h1 className="mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author.image && (
                <img
                  src={post.author.image}
                  alt={post.author.name ?? "Author"}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span>{post.author.name}</span>
            </div>
            <span>•</span>
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
          <div className="mt-8">
            <MarkdownPreview content={post.content} />
          </div>
        </article>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 