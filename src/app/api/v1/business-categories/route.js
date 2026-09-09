import { listActiveBusinessCategories } from "@/repositories/business-category.repository";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function GET() {
  try {
    const categories = await listActiveBusinessCategories();
    return successResponse({
      data: categories,
      message: "Business categories fetched successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
