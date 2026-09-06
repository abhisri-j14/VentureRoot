import { z } from "zod";


const businessIdSchema = z
  .string()
  .uuid("Invalid business ID");


const userContextSchema = z
  .record(
    z.string(),
    z.unknown()
  )
  .refine(
    (context) => {
      try {
        return (
          JSON.stringify(context).length <=
          10_000
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Context is too large",
    }
  );


export const advisorChatSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(
        1,
        "Message is required"
      )
      .max(
        5000,
        "Message is too long"
      ),

    businessId:
      businessIdSchema.optional(),

    context:
      userContextSchema.optional(),
  })
  .strict();


export const analyzeBusinessSchema =
  z
    .object({
      businessId:
        businessIdSchema,
    })
    .strict();


export const recommendBusinessSchema =
  z
    .object({
      businessId:
        businessIdSchema,
    })
    .strict();