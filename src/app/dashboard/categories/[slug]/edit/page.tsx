import { notFound, redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { CategoryForm } from "@/components/categories/category-form";

interface EditCategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/signin?from=/dashboard/categories/" + params.slug + "/edit");
  }

  try {
    const category = await api.category.getBySlug({ slug: params.slug });

    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <CategoryForm category={category} />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
} 