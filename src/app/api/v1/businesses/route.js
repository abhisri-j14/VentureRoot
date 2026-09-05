import {
  createBusinessController,
  getBusinessesController,
} from "@/controllers/business.controller";

import {
  createBusinessSchema,
  businessQuerySchema,
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


export async function POST(request) {
  try {
    // 1. Authenticate current user
    const { user } =
      await authenticate(request);

    // 2. Read request body
    const body =
      await request.json();

    // 3. Validate input
    const validatedData =
      createBusinessSchema.parse(body);

    // 4. Controller
    const response =
      await createBusinessController(
        user,
        validatedData
      );

    // 5. Standard success response
    return successResponse({
      ...response,
      status: 201,
    });
  } catch (error) {
    return handleError(error);
  }
}


export async function GET(request) {
  try {
    const { user } =
      await authenticate(request);


    const { searchParams } =
      new URL(request.url);


    const rawQuery =
      Object.fromEntries(
        searchParams.entries()
      );


    const query =
      businessQuerySchema.parse(
        rawQuery
      );


    const response =
      await getBusinessesController(
        user,
        query
      );


    return successResponse(
      response
    );
  } catch (error) {
    return handleError(error);
  }
}