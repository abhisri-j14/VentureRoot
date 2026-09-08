import {
  getReportsController,
} from "@/controllers/report.controller";

import {
  reportQuerySchema,
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


export async function GET(request) {
  try {
    const { user } =
      await authenticate(request);

    const { searchParams } =
      new URL(request.url);

    const query =
      Object.fromEntries(
        searchParams.entries()
      );

    const validatedQuery =
      reportQuerySchema.parse(
        query
      );

    const response =
      await getReportsController(
        user,
        validatedQuery
      );

    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}