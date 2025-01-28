"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(300, "Description must be less than 300 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    description?: string | null;
  };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      router.push("/dashboard/categories");
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      router.push("/dashboard/categories");
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormData) {
    if (category) {
      updateCategory.mutate({
        id: category.id,
        data,
      });
    } else {
      createCategory.mutate(data);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Web Development" {...field} />
              </FormControl>
              <FormDescription>
                This is the name of your category.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Articles about web development technologies and best practices"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of what this category is about.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createCategory.isPending || updateCategory.isPending}
        >
          {(createCategory.isPending || updateCategory.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {category ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
} 