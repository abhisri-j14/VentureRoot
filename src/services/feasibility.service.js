import {
  loadFeasibilityData,
} from "@/services/feasibility-data.service";

import {
  predictFeasibility,
} from "@/integrations/feasibility-ml.client";

import {
  ServiceUnavailableError,
} from "@/errors/http-error";


export async function getFeasibilityContext({
  userId,
  businessId,
}) {
  const data =
    await loadFeasibilityData({
      userId,
      businessId,
    });

  return {
    businessId,

    business:
      data.business,

    profile:
      data.profile,

    mlStatus:
      "PENDING_INTEGRATION",
  };
}


export async function generateFeasibility({
  userId,
  businessId,
}) {
  const data =
    await loadFeasibilityData({
      userId,
      businessId,
    });

  try {
    const prediction =
      await predictFeasibility({
        business:
          data.business,

        profile:
          data.profile,
      });

    return prediction;
  } catch (error) {
    throw new ServiceUnavailableError(
      "Feasibility ML model is not available yet"
    );
  }
}