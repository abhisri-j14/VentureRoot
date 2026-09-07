import { z } from "zod";

export const businessFormSchema = z.object({
  categoryId: z.string().min(1, "Business category is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  block: z.string().optional(),
  village: z.string().optional(),
  availableMargin: z.number().min(5000, "Minimum available margin is ₹5,000"),
  existingResources: z.string().optional(),
  expectedRevenue: z.number().min(0, "Revenue cannot be negative"),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;
