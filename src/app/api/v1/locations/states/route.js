import {
  getStatesController,
} from "@/controllers/location.controller";

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

    const response =
      await getStatesController();

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}