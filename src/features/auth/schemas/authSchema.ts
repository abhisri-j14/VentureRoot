import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required").min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    termsAccepted: z.literal(true, {
      message: "You must accept the terms and conditions"
    }),
    location: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
