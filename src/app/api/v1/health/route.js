import env from "@/config/env";
import { APP_CONSTANTS } from "@/constants/app.constants";

export async function GET() {
  return Response.json({
    success: true,
    message: `${env.appName} is healthy`,
    data: {
      status: "UP",
      environment: env.nodeEnv,
      apiVersion: APP_CONSTANTS.API.VERSION,
    },
  });
}