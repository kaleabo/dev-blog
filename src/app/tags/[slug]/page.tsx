import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { db } from "@/server/db";
import { PostCard } from "@/components/posts/post-card";

interface TagPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const tag = await db.tag.findUnique({
    where: { slug: params.slug },
  });

  if (!tag) {
    return {
      title: "Tag Not Found",
    };
  }

  return {
    title: `${tag.name} - Ethiopian Dev Blog`,
    description: tag.description ?? `Posts tagged with ${tag.name}`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await db.tag.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: {
          published: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">#{tag.name}</h1>
          {tag.description && (
            <p className="text-xl text-muted-foreground">{tag.description}</p>
          )}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tag.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {tag.posts.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">No posts found with this tag.</p>
          </div>
        )}
      </div>
    </div>
  );
}