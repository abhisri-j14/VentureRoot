import env from "@/config/env";

export async function GET() {
  return Response.json({
    success: true,
    message: `${env.appName} is healthy`,
    data: {
      status: "UP",
    },
  });
}