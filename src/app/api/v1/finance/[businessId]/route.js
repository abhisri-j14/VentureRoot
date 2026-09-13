import {
  authenticate,
} from "@/middlewares/auth.middleware";

import {
  successResponse,
} from "@/utils/api-response";

import {
  handleError,
} from "@/utils/error-handler";

import {
  findBusinessByIdAndUserId,
} from "@/repositories/business.repository";

import {
  findLocationWithParents,
} from "@/repositories/location.repository";

import {
  buildLocationResponse,
} from "@/utils/location.mapper";

import {
  NotFoundError,
} from "@/errors/http-error";

import {
  businessIdSchema,
} from "@/validators/business/business.validator";

import {
  calculateRepaymentSummary,
} from "@/utils/finance/repayment";

import * as financeClient from "@/integrations/finance.client";


export async function GET(request, { params }) {
  try {
    const { user } =
      await authenticate(request);

    const { businessId } = await params;

    const validatedBusinessId =
      businessIdSchema.parse(businessId);

    // Fetch the business owned by this user
    const business =
      await findBusinessByIdAndUserId({
        businessId: validatedBusinessId,
        userId: user.id,
      });

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    // Fetch full location hierarchy
    let location = null;
    if (business.locationId) {
      location = await findLocationWithParents(business.locationId);
    }

    const availableMargin = Number(business.availableMargin || 0);
    const expectedRevenue = Number(business.expectedRevenue || 0);

    // Compute a simple default loan estimate (80% of available margin, MUDRA style)
    const estimatedLoan = Math.round(availableMargin * 0.8);
    const defaultInterestRate = 10.5; // MUDRA Shishu / Kishore default %
    const defaultTenure = 36; // 3 years in months

    let repayment = null;
    if (estimatedLoan > 0) {
      repayment = calculateRepaymentSummary({
        loanAmount: estimatedLoan,
        interestRate: defaultInterestRate,
        tenure: defaultTenure,
      });
    }

    const locResponse = buildLocationResponse(location);
    const category = business.category?.name || "Retail";
    const state = locResponse?.state || "West Bengal";

    let pyCalculation = null;
    let pyScheme = null;
    try {
      const calcProjectCost = availableMargin > 0 ? availableMargin / 0.1 : 1500000;
      const [calcRes, schemeRes] = await Promise.allSettled([
        financeClient.calculateFinance({
          availableMargin: availableMargin > 0 ? availableMargin : 150000,
          businessCategory: category,
          state,
          proposedProjectCost: calcProjectCost,
        }),
        financeClient.routeScheme({ projectCost: calcProjectCost }),
      ]);
      if (calcRes.status === "fulfilled") pyCalculation = calcRes.value;
      if (schemeRes.status === "fulfilled") pyScheme = schemeRes.value;
    } catch (_) {}

    return successResponse({
      message: "Business finance summary fetched successfully",
      data: {
        business: {
          id: business.id,
          name: business.name,
          status: business.status,
          category: business.category
            ? {
                id: business.category.id,
                name: business.category.name,
                slug: business.category.slug,
              }
            : null,
          location: locResponse,
          availableMargin,
          expectedRevenue,
        },
        finance: {
          estimatedLoan,
          defaultInterestRate,
          defaultTenureMonths: defaultTenure,
          repayment,
          engineCalculation: pyCalculation,
          engineScheme: pyScheme,
          note: "Use POST /finance/structure to compute a full finance plan with custom loan parameters.",
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}