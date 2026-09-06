import {
  getLocationController,
} from "@/controllers/location.controller";

import {
  locationIdSchema,
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


export async function GET(
  request,
  { params }
) {
  try {
    await authenticate(request);

    const { id } =
      await params;

    const locationId =
      locationIdSchema.parse(id);

    const response =
      await getLocationController(
        locationId
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}