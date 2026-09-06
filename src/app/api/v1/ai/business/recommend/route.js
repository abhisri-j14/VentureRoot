import {
  recommendBusinessController,
} from "@/controllers/ai.controller";

import {
  recommendBusinessSchema,
} from "@/validators/ai/ai.validator";

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
      recommendBusinessSchema.parse(
        body
      );

    const response =
      await recommendBusinessController(
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