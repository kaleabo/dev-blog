import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  description: z.string().max(300, "Description must be less than 300 characters").optional(),
});

export const categoryRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

      const existingCategory = await ctx.db.category.findUnique({
        where: { slug },
      });

      if (existingCategory) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A category with this name already exists",
        });
      }

      return ctx.db.category.create({
        data: {
          name: input.name,
          slug,
          description: input.description,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
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

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return category;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createCategorySchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const slug =
        input.data.name !== category.name
          ? input.data.name
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
          : category.slug;

      if (slug !== category.slug) {
        const existingCategory = await ctx.db.category.findUnique({
          where: { slug },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this name already exists",
          });
        }
      }

      return ctx.db.category.update({
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
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return ctx.db.category.delete({
        where: { id: input.id },
      });
    }),
}); 