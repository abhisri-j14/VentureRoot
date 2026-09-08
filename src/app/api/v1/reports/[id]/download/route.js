import {
  getReportDownloadController,
} from "@/controllers/report.controller";

import {
  reportIdSchema,
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


export async function GET(
  request,
  { params }
) {
  try {
    const { user } =
      await authenticate(request);

    const { id } =
      await params;

    const reportId =
      reportIdSchema.parse(
        id
      );

    const response =
      await getReportDownloadController(
        user,
        reportId
      );

    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}