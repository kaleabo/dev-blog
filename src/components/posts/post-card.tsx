import Link from "next/link";
import { type Post } from "@prisma/client";

interface PostCardProps {
  post: Post & {
    author: {
      name: string | null;
      image: string | null;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative flex flex-col space-y-2">
      <Link
        href={`/posts/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
      />
      <h2 className="text-2xl font-bold">{post.title}</h2>
      {post.excerpt && (
        <p className="text-muted-foreground">{post.excerpt}</p>
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
        {post.category && (
          <>
            <span>•</span>
            <Link
              href={`/categories/${post.category.slug}`}
              className="relative z-20 hover:underline"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </div>
    </article>
  );
} 