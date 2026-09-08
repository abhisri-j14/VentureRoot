import { z } from "zod";


const locationFieldsSchema = z.object({
  state: z
    .string()
    .trim()
    .min(1, "State is required"),

  district: z
    .string()
    .trim()
    .min(1, "District is required"),

  block: z
    .string()
    .trim()
    .min(1)
    .optional(),

  village: z
    .string()
    .trim()
    .min(1)
    .optional(),
});


export const createBusinessSchema = z
  .object({
    categoryId: z
      .string()
      .uuid("Invalid category ID"),

    name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional(),

    description: z
      .string()
      .trim()
      .min(1)
      .optional(),

    state:
      locationFieldsSchema.shape.state,

    district:
      locationFieldsSchema.shape.district,

    block:
      locationFieldsSchema.shape.block,

    village:
      locationFieldsSchema.shape.village,

    availableMargin: z
      .number()
      .nonnegative(
        "Available margin cannot be negative"
      ),

    existingResources: z
      .string()
      .trim()
      .optional(),

    expectedRevenue: z
      .number()
      .nonnegative(
        "Expected revenue cannot be negative"
      ),
  })
  .strict()
  .refine(
    (data) => {
      return !data.village || data.block;
    },
    {
      message:
        "Block is required when village is provided",
      path: ["block"],
    }
  );


export const updateBusinessSchema =
  createBusinessSchema;


export const businessIdSchema = z
  .string()
  .uuid("Invalid business ID");


export const businessQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    status: z
      .enum([
        "DRAFT",
        "ANALYZING",
        "READY",
      ])
      .optional(),

    categoryId: z
      .string()
      .uuid("Invalid category ID")
      .optional(),

    search: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),

    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "availableMargin",
        "expectedRevenue",
        "name",
      ])
      .default("createdAt"),

    sortOrder: z
      .enum([
        "asc",
        "desc",
      ])
      .default("desc"),
  })
  .strict();