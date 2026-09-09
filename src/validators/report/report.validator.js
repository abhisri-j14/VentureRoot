import { z } from "zod";


export const reportIdSchema = z
  .string()
  .trim()
  .min(1, "Report ID is required");


export const generateReportSchema = z
  .object({
    businessId: z
      .string()
      .uuid("Invalid business ID"),

    type: z.enum([
      "FEASIBILITY",
      "FINANCIAL",
      "BUSINESS_PLAN",
      "COMPREHENSIVE",
    ]),
  })
  .strict();


export const reportQuerySchema = z
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
        "GENERATING",
        "READY",
        "FAILED",
      ])
      .optional(),

    type: z
      .enum([
        "FEASIBILITY",
        "FINANCIAL",
        "BUSINESS_PLAN",
        "COMPREHENSIVE",
      ])
      .optional(),

    businessId: z
      .string()
      .uuid("Invalid business ID")
      .optional(),

    sortBy: z
      .enum([
        "createdAt",
        "updatedAt",
        "generatedAt",
        "title",
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