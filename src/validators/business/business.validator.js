import { z } from "zod";


const optionalString = z
  .string()
  .trim()
  .nullish()
  .transform((val) => (val && val.length > 0 ? val : undefined));

const locationFieldsSchema = z.object({
  state: z
    .string()
    .trim()
    .min(1, "State is required"),

  district: z
    .string()
    .trim()
    .min(1, "District is required"),

  block: optionalString,

  village: optionalString,
});


export const createBusinessSchema = z
  .object({
    categoryId: z
      .string()
      .trim()
      .min(1, "Business category is required"),

    name: optionalString,

    description: optionalString,

    state:
      locationFieldsSchema.shape.state,

    district:
      locationFieldsSchema.shape.district,

    block:
      locationFieldsSchema.shape.block,

    village:
      locationFieldsSchema.shape.village,

    availableMargin: z.coerce
      .number()
      .nonnegative(
        "Available margin cannot be negative"
      ),

    existingResources: optionalString,

    expectedRevenue: z.coerce
      .number()
      .nonnegative(
        "Expected revenue cannot be negative"
      ),
  })
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