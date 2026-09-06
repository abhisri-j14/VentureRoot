import {
  advisorChatController,
} from "@/controllers/ai.controller";

import {
  advisorChatSchema,
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
      advisorChatSchema.parse(
        body
      );

    const response =
      await advisorChatController(
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