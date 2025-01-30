import Link from "next/link";
import { type Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { type Post, type Category } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { PostCard } from "@/components/posts/post-card";
import { CategoryCard } from "@/components/categories/category-card";

export const metadata: Metadata = {
  title: "Ethiopian Dev Blog - A Community of Ethiopian Developers",
  description: "Share knowledge, learn, and connect with Ethiopian developers.",
};

type PostWithRelations = Post & {
  author: {
    name: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
};

type CategoryWithCount = Category & {
  _count: {
    posts: number;
  };
};

export default async function HomePage() {
  const [featuredPosts, latestPosts, categories] = await Promise.all([
    db.post.findMany({
      where: {
        published: true,
        featured: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 6,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-primary/20 via-background to-background px-4 py-24 text-center md:px-6">
        <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Ethiopian Dev Blog
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Share knowledge, learn, and connect with Ethiopian developers. Join our
            community and start writing today.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/posts">
                Read Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/posts/new">Start Writing</Link>
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto flex-1 space-y-16 px-4 py-16 md:px-6">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Featured Posts
                </h2>
                <p className="text-muted-foreground">
                  Hand-picked articles from our community.
                </p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/posts?featured=true">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Posts */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Latest Posts
              </h2>
              <p className="text-muted-foreground">
                Fresh content from our writers.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/posts">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Browse by Category
              </h2>
              <p className="text-muted-foreground">
                Find posts that match your interests.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/categories">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
