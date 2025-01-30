import Link from "next/link";
import { type Category } from "@prisma/client";

interface CategoryCardProps {
  category: Category & {
    _count: {
      posts: number;
    };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex flex-col space-y-2 rounded-lg border p-5 hover:bg-muted/50"
    >
      <h3 className="font-semibold tracking-tight">{category.name}</h3>
      {category.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {category._count.posts} {category._count.posts === 1 ? "post" : "posts"}
      </p>
    </Link>
  );
} 