import { z } from "zod";

export const profileSchema = z.object({
  // Basic Profile
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required").optional().or(z.literal("")),

  // Location
  location: z.object({
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    block: z.string().optional().or(z.literal("")),
    village: z.string().optional().or(z.literal("")),
  }),

  // Financial Background
  financial: z.object({
    availableCapital: z.number().min(0, "Capital cannot be negative"),
    income: z.number().min(0, "Income cannot be negative"),
  }),

  // Experience
  experience: z.object({
    businessExperience: z.enum(["None", "0-2 years", "3-5 years", "5+ years"]),
    skills: z.array(z.string()).optional(),
    education: z.string().optional(),
  }),
});

export type ProfileData = z.infer<typeof profileSchema>;
