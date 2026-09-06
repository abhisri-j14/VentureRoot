import {
  generateReportController,
} from "@/controllers/report.controller";

import {
  generateReportSchema,
} from "@/validators/report/report.validator";

import {
  authenticate,
} from "@/middlewares/auth.middleware";

import {
  successResponse,
} from "@/utils/api-response";

import {
  handleError,
} from "@/utils/error-handler";


export async function POST(request) {
  try {
    const { user } =
      await authenticate(request);

    const body =
      await request.json();

    const validatedData =
      generateReportSchema.parse(
        body
      );

    const response =
      await generateReportController(
        user,
        validatedData
      );

    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}