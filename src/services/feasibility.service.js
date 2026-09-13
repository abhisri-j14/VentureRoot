import {
  loadFeasibilityData,
} from "@/services/feasibility-data.service";

import {
  predictFeasibility,
} from "@/integrations/feasibility-ml.client";

import {
  mapMlPredictionToFeasibility,
} from "@/utils/feasibility.mapper";

import {
  fetchCompetitorsByRadius,
} from "@/services/competitor-radar.service";

import * as financeClient from "@/integrations/finance.client";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";



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

  // 3. Map ML result to FeasibilityData schema
  // When local ML services (8001/8002) are offline, map using authoritative Census 2011 district density & APMC sector benchmarks
  const feasibilityData =
    mlResult
      ? mapMlPredictionToFeasibility(mlResult, data.business)
      : mapMlPredictionToFeasibility(
          {
            model1: null,
            model2: null,
            model3: null,
            census: null,
            location: data.business?.location,
            businessCategory: data.business?.category?.name || data.business?.category || "Enterprise",
          },
          data.business
        );

  // 4. Fetch real local competitors via Overpass API (OSM) + Gemini AI enrichment
  let competitorRadar = null;
  try {
    const rawLoc = data.business?.location;
    const resolved = resolveCoordinatesForLocation(rawLoc);
    const lat = rawLoc?.lat ?? rawLoc?.latitude ?? resolved.lat;
    const lon = rawLoc?.lon ?? rawLoc?.longitude ?? resolved.lon;
    const category = data.business?.category?.name || data.business?.category || "Agro-Enterprise";
    const district = rawLoc?.district?.name || rawLoc?.district || "Local District";
    const state = rawLoc?.state?.name || rawLoc?.state || "India";

    if (lat && lon) {
      competitorRadar = await fetchCompetitorsByRadius({
        lat: Number(lat),
        lon: Number(lon),
        category,
        district,
        state,
      });
    }
  } catch (err) {
    console.warn("[feasibility.service] Competitor radar warning:", err?.message);
  }

  // 5. Query Python Finance Engine for authoritative calculation based on registered state
  let financeData = null;
  try {
    const availableMargin = Number(data.business?.availableMargin || data.profile?.availableCapital || 150000);
    const category = data.business?.category?.name || data.business?.category || "Agro-Enterprise";
    const state = data.business?.location?.state || "West Bengal";
    const calcProjectCost = availableMargin / 0.1;

    const [calcRes, schemeRes] = await Promise.allSettled([
      financeClient.calculateFinance({
        availableMargin,
        businessCategory: category,
        state,
        proposedProjectCost: calcProjectCost,
      }),
      financeClient.routeScheme({ projectCost: calcProjectCost }),
    ]);

    const calculation = calcRes.status === "fulfilled" ? calcRes.value : null;
    const scheme = schemeRes.status === "fulfilled" ? schemeRes.value : null;

    if (calculation || scheme) {
      financeData = {
        calculation,
        scheme,
      };
    }
  } catch (finErr) {
    console.warn("[feasibility.service] Remote Python Finance Engine warning:", finErr?.message);
  }

  if (feasibilityData) {
    if (competitorRadar) {
      feasibilityData.competitorRadar = competitorRadar;
    }
    if (financeData) {
      feasibilityData.finance = financeData;
    }
  }

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

    competitorRadar,

    finance:
      financeData,
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

  const feasibility = mapMlPredictionToFeasibility(prediction, data.business);

  try {
    const rawLoc = data.business?.location;
    const resolved = resolveCoordinatesForLocation(rawLoc);
    const lat = rawLoc?.lat ?? rawLoc?.latitude ?? resolved.lat;
    const lon = rawLoc?.lon ?? rawLoc?.longitude ?? resolved.lon;
    const category = data.business?.category?.name || data.business?.category || "Agro-Enterprise";
    const district = rawLoc?.district?.name || rawLoc?.district || "Local District";
    const state = rawLoc?.state?.name || rawLoc?.state || "India";

    if (lat && lon && feasibility) {
      feasibility.competitorRadar = await fetchCompetitorsByRadius({
        lat: Number(lat),
        lon: Number(lon),
        category,
        district,
        state,
      });
    }
  } catch (err) {
    console.warn("[feasibility.service] Competitor radar warning in generateFeasibility:", err?.message);
  }

  return feasibility;
}