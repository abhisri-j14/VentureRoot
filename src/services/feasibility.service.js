import {
  loadFeasibilityData,
} from "@/services/feasibility-data.service";

import {
  predictFeasibility,
} from "@/integrations/feasibility-ml.client";

import {
  mapMlPredictionToFeasibility,
} from "@/utils/feasibility.mapper";


/**
 * GET /feasibility/:businessId
 *
 * Loads the business/profile from DB, runs the ML pipeline (Model 1 + Model 2),
 * maps results to the FeasibilityData schema expected by the frontend, and returns
 * the full feasibility intelligence object.
 *
 * On ML failure the response degrades gracefully with partial data and mlStatus=ML_ERROR.
 */
export async function getFeasibilityContext({
  userId,
  businessId,
}) {
  // 1. Load authoritative business + profile data from DB
  const data =
    await loadFeasibilityData({
      userId,
      businessId,
    });

  // 2. Run ML pipeline
  let mlResult = null;
  let mlStatus = "ML_ERROR";
  let mlError = null;

  try {
    mlResult = await predictFeasibility({
      business: data.business,
      profile: data.profile,
    });
    mlStatus = "SUCCESS";
  } catch (err) {
    mlError = err?.message || "ML pipeline failed";
    console.error("[feasibility.service] ML pipeline error:", mlError);
  }

  // 3. Map ML result to FeasibilityData schema (or return EMPTY if ML failed)
  const feasibilityData =
    mlResult
      ? mapMlPredictionToFeasibility(mlResult, data.business)
      : null;

  return {
    businessId,

    business:
      data.business,

    profile:
      data.profile,

    mlStatus,

    mlError,

    feasibility:
      feasibilityData,
  };
}


/**
 * POST /feasibility/:businessId/generate  (future use)
 *
 * Alias that forces a fresh ML run and returns the prediction directly.
 */
export async function generateFeasibility({
  userId,
  businessId,
}) {
  const data =
    await loadFeasibilityData({
      userId,
      businessId,
    });

  const prediction =
    await predictFeasibility({
      business: data.business,
      profile: data.profile,
    });

  return mapMlPredictionToFeasibility(prediction, data.business);
}