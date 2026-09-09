import {
  getFeasibilityContext,
  generateFeasibility,
} from "@/services/feasibility.service";


export async function getFeasibilityController(
  user,
  businessId
) {
  const context =
    await getFeasibilityContext({
      userId: user.id,
      businessId,
    });

  return {
    message:
      "Feasibility context fetched successfully",

    data: {
      // context.feasibility is the FeasibilityData (market, opportunity, etc.)
      // context also has: businessId, business, profile, mlStatus, mlError
      feasibility: {
        businessId: context.businessId,
        business: context.business,
        mlStatus: context.mlStatus,
        mlError: context.mlError || null,
        // The FeasibilityData is spread at the top level of the feasibility object
        // so the frontend hook can extract it as res.data.feasibility.feasibility
        feasibility: context.feasibility,
      },
    },
  };
}


export async function generateFeasibilityController(
  user,
  businessId
) {
  const feasibility =
    await generateFeasibility({
      userId: user.id,
      businessId,
    });

  return {
    message:
      "Feasibility generated successfully",

    data: {
      feasibility,
    },
  };
}