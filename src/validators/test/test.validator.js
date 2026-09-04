import { z } from "zod";

export const testSchema = z.object({
  name: z.string().min(1),
});