import {
  getDistrictsController,
} from "@/controllers/location.controller";

import {
  districtQuerySchema,
} from "@/validators/location/location.validator";

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
    await authenticate(request);

    const { searchParams } =
      new URL(request.url);

    const rawQuery =
      Object.fromEntries(
        searchParams.entries()
      );

    const query =
      districtQuerySchema.parse(
        rawQuery
      );

    const response =
      await getDistrictsController(
        query.state_id
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}