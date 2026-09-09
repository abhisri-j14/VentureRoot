import {
  getBusinessController,
  updateBusinessController,
  deleteBusinessController,
} from "@/controllers/business.controller";

import {
  updateBusinessSchema,
  businessIdSchema,
} from "@/validators/business/business.validator";

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
    // Next.js dynamic route params
    const { id } = await params;

    // 1. Validate business ID
    const businessId =
      businessIdSchema.parse(id);

    // 2. Authenticate current user
    const { user } =
      await authenticate(request);

    // 3. Fetch owned business
    const response =
      await getBusinessController(
        user,
        businessId
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}


export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;

    // 1. Validate route ID
    const businessId =
      businessIdSchema.parse(id);

    // 2. Authenticate current user
    const { user } =
      await authenticate(request);

    // 3. Read body
    const body =
      await request.json();

    // 4. Validate update payload
    const validatedData =
      updateBusinessSchema.parse(body);

    // 5. Update owned business
    const response =
      await updateBusinessController(
        user,
        businessId,
        validatedData
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}


export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;

    // 1. Validate business ID
    const businessId =
      businessIdSchema.parse(id);

    // 2. Authenticate current user
    const { user } =
      await authenticate(request);

    // 3. Delete owned business
    const response =
      await deleteBusinessController(
        user,
        businessId
      );

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}