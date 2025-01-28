import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type Post } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  excerpt: z.string().max(300, "Excerpt must be less than 300 characters").optional(),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      // Check if slug already exists
      const existingPost = await ctx.db.post.findUnique({
        where: { slug },
      });

      if (existingPost) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A post with this title already exists",
        });
      }

      return ctx.db.post.create({
        data: {
          title: input.title,
          slug,
          content: input.content,
          excerpt: input.excerpt,
          published: input.published,
          authorId: ctx.session.user.id,
          publishedAt: input.published ? new Date() : null,
          categoryId: input.categoryId,
          tags: input.tags
            ? {
                connect: input.tags.map((id) => ({ id })),
              }
            : undefined,
        },
      });
    }),

  getUserPosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        tags: true,
      },
    });
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { authorId: ctx.session.user.id },
      include: {
        category: true,
        tags: true,
      },
    });

    return post;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          category: true,
          tags: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      return post;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
          category: true,
          tags: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createPostSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          tags: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      const slug =
        input.data.title !== post.title
          ? input.data.title
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
          : post.slug;

      if (slug !== post.slug) {
        const existingPost = await ctx.db.post.findUnique({
          where: { slug },
        });

        if (existingPost) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A post with this title already exists",
          });
        }
      }

      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          title: input.data.title,
          slug,
          content: input.data.content,
          excerpt: input.data.excerpt,
          published: input.data.published,
          publishedAt: input.data.published && !post.publishedAt ? new Date() : post.publishedAt,
          categoryId: input.data.categoryId,
          tags: input.data.tags
            ? {
                set: input.data.tags.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          category: true,
          tags: true,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      await ctx.db.post.delete({
        where: { id: input.id },
      });

      return post;
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
