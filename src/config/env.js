import { z } from "zod";


console.log("ENV TEST:", {
  NODE_ENV: process.env.NODE_ENV,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  API_PREFIX: process.env.API_PREFIX,
});

console.log("CWD:", process.cwd());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  APP_NAME: z.string().min(1),

  APP_URL: z.string().url(),

  API_PREFIX: z.string().startsWith("/"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("!! Invalid environment variables:");

  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment configuration");
}

const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,

  appName: parsedEnv.data.APP_NAME,

  appUrl: parsedEnv.data.APP_URL,

  apiPrefix: parsedEnv.data.API_PREFIX,
};

export default env;