import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { PostCard } from "@/components/posts/post-card";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  try {
    const category = await api.category.getBySlug({ slug: params.slug });

    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {category.posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  author: {
                    name: post.author.name ?? "Anonymous",
                    image: post.author.image,
                  },
                }}
              />
            ))}
          </div>

          {category.posts.length === 0 && (
            <div className="text-center">
              <p className="text-muted-foreground">No posts in this category.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 