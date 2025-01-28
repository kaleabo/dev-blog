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

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePostForm() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      published: false,
    },
  });

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been created",
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
    createPost.mutate(data);
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
              <FormLabel>Publish immediately</FormLabel>
              <FormDescription>
                If unchecked, the post will be saved as a draft.
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
          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Post
          </Button>
        </div>
      </form>
    </Form>
  );
} 