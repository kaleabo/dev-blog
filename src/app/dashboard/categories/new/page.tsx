import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { CategoryForm } from "@/components/categories/category-form";

export default async function NewCategoryPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/dashboard/categories/new");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">New Category</h1>
        <CategoryForm />
      </div>
    </div>
  );
} 