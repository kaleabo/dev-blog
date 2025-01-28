"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  tablePlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  toolbarPlugin,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  UndoRedo,
} from "@mdxeditor/editor";

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
import { MarkdownPreview } from "./markdown-preview";
import { CategoryTagSelect } from "./category-tag-select";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    excerpt?: string | null;
    content: string;
    published: boolean;
    categoryId?: string | null;
    tags: { id: string }[];
  };
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      excerpt: post.excerpt ?? "",
      content: post.content,
      published: post.published,
      categoryId: post.categoryId ?? undefined,
      tags: post.tags.map((tag) => tag.id),
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been updated",
      });
      router.push("/dashboard");
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
    updatePost.mutate({
      id: post.id,
      data,
    });
  }

  const content = form.watch("content");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My awesome post" {...field} />
              </FormControl>
              <FormDescription>
                This will be the main title of your post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your post"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be shown in post previews and search results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                {isPreview ? (
                  <MarkdownPreview content={content} />
                ) : (
                  <div className="relative min-h-[500px] w-full rounded-md border">
                    <MDXEditor
                      markdown={field.value}
                      onChange={field.onChange}
                      placeholder="Write your post content here..."
                      contentEditableClassName="prose dark:prose-invert max-w-none px-4 py-2"
                      plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),
                        markdownShortcutPlugin(),
                        tablePlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        imagePlugin(),
                        toolbarPlugin({
                          toolbarContents: () => (
                            <>
                              <UndoRedo />
                              <BlockTypeSelect />
                              <BoldItalicUnderlineToggles />
                              <CreateLink />
                              <InsertImage />
                              <InsertTable />
                              <InsertThematicBreak />
                              <ListsToggle />
                            </>
                          ),
                        }),
                      ]}
                    />
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category & Tags</FormLabel>
                <FormControl>
                  <CategoryTagSelect
                    selectedCategoryId={field.value}
                    selectedTagIds={form.watch("tags")}
                    onCategoryChange={field.onChange}
                    onTagsChange={(tags) => form.setValue("tags", tags)}
                  />
                </FormControl>
                <FormDescription>
                  Categorize your post and add relevant tags.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Published</FormLabel>
              <FormDescription>
                Make this post visible to everyone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button type="submit" disabled={updatePost.isPending}>
            {updatePost.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Post
          </Button>
        </div>
      </form>
    </Form>
  );
} 