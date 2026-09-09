/**
 * VentureRoot Feasibility ML Integration Client
 * ================================================
 * Connects the Next.js backend to the three Python ML microservices:
 *   - Model 1 (port 8001): Hyper-Local Market Potential & Demand Prediction
 *   - Model 2 (port 8002): Business Viability, Competition & Category Ranking
 *   - Data Service (port 8000): Census population/housing statistics
 *
 * Each service is called with location and business category derived
 * from the authoritative DB business record — never from untrusted frontend input.
 */

const MODEL1_URL = process.env.MODEL1_URL || "http://127.0.0.1:8001";
const MODEL2_URL = process.env.MODEL2_URL || "http://127.0.0.1:8002";
const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || "http://127.0.0.1:8000";

// Timeout for each ML call (ms)
const ML_TIMEOUT_MS = 20000;

/**
 * Wraps fetch with an AbortController timeout so we don't hang forever.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = ML_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call Model 1 — Market Potential & Demand Score
 * Returns: market_potential_score, opportunity_level, component_scores, etc.
 */
async function callModel1({ state, district, subdistrict, village, businessCategory, latitude, longitude }) {
  const payload = {
    state: state || "Gujarat",
    district: district || "Anand",
    subdistrict: subdistrict || null,
    village: village || null,
    business_category: businessCategory || "Retail",
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  };

  const res = await fetchWithTimeout(`${MODEL1_URL}/api/v1/model1/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Model 1 error (${res.status}): ${errText}`);
  }
  return res.json();
}

/**
 * Call Model 2 — Business Viability, Competition & Category Ranking
 * Returns: overall_viability_score, score_band, competition analysis, category rankings, etc.
 */
async function callModel2({ state, district, subdistrict, businessCategory }) {
  const payload = {
    state_name: state || "Gujarat",
    district_name: district || "Anand",
    subdistrict_name: subdistrict || null,
    business_category: businessCategory || null,
  };

  const res = await fetchWithTimeout(`${MODEL2_URL}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Model 2 error (${res.status}): ${errText}`);
  }
  return res.json();
}

/**
 * Call Data Service — Census population/housing statistics for location context
 * Returns: reach (radius5km, radius10km), market size, commercial units, etc.
 */
async function callDataService({ state }) {
  const stateName = encodeURIComponent(state || "Gujarat");

  try {
    const res = await fetchWithTimeout(
      `${DATA_SERVICE_URL}/locations/${stateName}/statistics`,
      { method: "GET" },
      10000
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    // Data service is optional — it enriches the response but is not required
    return null;
  }
}

/**
 * Main ML prediction function.
 * Calls Model 1 + Model 2 in parallel and returns a combined prediction object.
 * Optionally enriches with census data from the data service.
 *
 * @param {{ business: object, profile: object }} params
 * @returns {Promise<object>} Combined ML prediction result
 */
export async function predictFeasibility({ business, profile }) {
  const loc = business?.location || {};
  const state = loc.state || "Gujarat";
  const district = loc.district || "Anand";
  const subdistrict = loc.block || loc.subdistrict || district;
  const village = loc.village || null;
  const latitude = loc.latitude !== undefined && loc.latitude !== null ? Number(loc.latitude) : null;
  const longitude = loc.longitude !== undefined && loc.longitude !== null ? Number(loc.longitude) : null;
  const businessCategory = business?.category?.name || "Retail";

  // Run Model 1, Model 2, and Data Service in parallel for performance
  const [model1Result, model2Result, censusData] = await Promise.allSettled([
    callModel1({ state, district, subdistrict, village, businessCategory, latitude, longitude }),
    callModel2({ state, district, subdistrict, businessCategory }),
    callDataService({ state }),
  ]);

  const m1 = model1Result.status === "fulfilled" ? model1Result.value : null;
  const m2 = model2Result.status === "fulfilled" ? model2Result.value : null;
  const census = censusData.status === "fulfilled" ? censusData.value : null;

  // At least one model must succeed
  if (!m1 && !m2) {
    const errors = [
      model1Result.status === "rejected" ? model1Result.reason?.message : null,
      model2Result.status === "rejected" ? model2Result.reason?.message : null,
    ].filter(Boolean).join("; ");
    throw new Error(`All ML services failed: ${errors}`);
  }

  return {
    model1: m1,
    model2: m2,
    census,
    location: { state, district, subdistrict, village },
    businessCategory,
    availableMargin: Number(business?.availableMargin || profile?.availableCapital || 0),
  };
}