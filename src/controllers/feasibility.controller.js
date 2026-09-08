import {
  getFeasibilityContext,
  generateFeasibility,
} from "@/services/feasibility.service";


export async function getFeasibilityController(
  user,
  businessId
) {
  const feasibility =
    await getFeasibilityContext({
      userId: user.id,
      businessId,
    });

  return {
    message:
      "Feasibility context fetched successfully",

    data: {
      feasibility,
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