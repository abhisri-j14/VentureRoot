import {
  getVillagesController,
} from "@/controllers/location.controller";

import {
  villageQuerySchema,
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
      villageQuerySchema.parse(
        rawQuery
      );

    const response =
      await getVillagesController(
        query.block_id
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}