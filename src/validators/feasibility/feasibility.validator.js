import { z } from "zod";


export const feasibilityBusinessIdSchema = z
  .string()
  .uuid("Invalid business ID");