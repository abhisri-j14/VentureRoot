import { z } from "zod";

const locationSchema = z.object({
  state: z.string().trim().min(1),
  district: z.string().trim().min(1),

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

const financialSchema = z.object({
  availableCapital: z
    .number()
    .nonnegative(),

  income: z
    .number()
    .nonnegative(),
});

const experienceSchema = z.object({
  businessExperience: z.enum([
    "None",
    "0-2 years",
    "3-5 years",
    "5+ years",
  ]),

  skills: z
    .array(
      z.string().trim().min(1)
    )
    .optional(),

  education: z
    .string()
    .trim()
    .min(1)
    .optional(),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1)
    .max(201),

  phone: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .optional(),

  location: locationSchema,

  financial: financialSchema,

  experience: experienceSchema,
}).strict();