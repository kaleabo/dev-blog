import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { CategoryList } from "@/components/categories/category-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function CategoriesPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/dashboard/categories");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Button asChild>
            <Link href="/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Link>
          </Button>
        </div>
        <CategoryList />
      </div>
    </div>
  );
} 