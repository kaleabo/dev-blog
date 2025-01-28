import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name is too long"),
  description: z.string().max(300, "Description must be less than 300 characters").optional(),
});

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const existingTag = await ctx.db.tag.findUnique({
        where: { slug },
      });

      if (existingTag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A tag with this name already exists",
        });
      }

      return ctx.db.tag.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { slug: input.slug },
        include: {
          posts: {
            where: { published: true },
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return tag;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createTagSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      const slug =
        input.data.name !== tag.name
          ? input.data.name
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
          : tag.slug;

      if (slug !== tag.slug) {
        const existingTag = await ctx.db.tag.findUnique({
          where: { slug },
        });

        if (existingTag) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A tag with this name already exists",
          });
        }
      }

      return ctx.db.tag.update({
        where: { id: input.id },
        data: {
          name: input.data.name,
          slug,
          description: input.data.description,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.db.tag.findUnique({
        where: { id: input.id },
      });

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        });
      }

      return ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),
}); 