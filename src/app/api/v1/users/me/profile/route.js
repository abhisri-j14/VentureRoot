import {
  getProfile,
  updateProfile,
} from "@/controllers/profile.controller";

import { authenticate } from "@/middlewares/auth.middleware";

import { updateProfileSchema } from "@/validators/profile/profile.validator";

import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";


export async function GET(request) {
  try {
    const { user } =
      await authenticate(request);

    const response =
      await getProfile(user);

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}


export async function PUT(request) {
  try {
    const { user } =
      await authenticate(request);

    const body =
      await request.json();

    const validatedData =
      updateProfileSchema.parse(body);

    const response =
      await updateProfile(
        user,
        validatedData
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}