import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
        },
      });
    }),

  getUserPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      where: {
        authorId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { authorId: ctx.session.user.id },
    });

    return post ?? null;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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
