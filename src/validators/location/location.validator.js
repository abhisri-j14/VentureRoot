import { z } from "zod";


export const locationIdSchema = z
  .string()
  .uuid("Invalid location ID");


export const stateQuerySchema = z
  .object({})
  .strict();


export const districtQuerySchema = z
  .object({
    state_id: z
      .string()
      .uuid("Invalid state ID"),
  })
  .strict();


export const blockQuerySchema = z
  .object({
    district_id: z
      .string()
      .uuid("Invalid district ID"),
  })
  .strict();


export const villageQuerySchema = z
  .object({
    block_id: z
      .string()
      .uuid("Invalid block ID"),
  })
  .strict();


export const locationSearchQuerySchema = z
  .object({
    q: z
      .string()
      .trim()
      .min(1, "Search query must contain at least 1 character")
      .max(100, "Search query is too long"),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  })
  .strict();