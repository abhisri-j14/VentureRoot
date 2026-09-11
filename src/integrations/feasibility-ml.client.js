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
const MODEL3_URL = process.env.MODEL3_URL || "http://127.0.0.1:8003";
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
 * Maps a business category to the closest APMC commodity supported by Model 3.
 */
function mapCategoryToCommodity(category) {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("dairy") || cat.includes("milk") || cat.includes("ghee")) return "Dairy";
  if (cat.includes("rice") || cat.includes("paddy")) return "Rice";
  if (cat.includes("wheat") || cat.includes("flour") || cat.includes("bakery")) return "Wheat";
  if (cat.includes("onion")) return "Onion";
  if (cat.includes("tomato")) return "Tomato";
  if (cat.includes("garlic")) return "Garlic";
  if (cat.includes("ginger")) return "Ginger";
  if (cat.includes("banana")) return "Banana";
  if (cat.includes("apple") || cat.includes("fruit")) return "Apple";
  if (cat.includes("poultry") || cat.includes("feed")) return "Wheat";
  if (cat.includes("retail") || cat.includes("kirana") || cat.includes("grocery")) return "Wheat";
  if (cat.includes("food")) return "Potato";
  return "Potato";
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
 * Call Model 3 — Local Market Price Prediction & Conformal Intervals
 * Returns: expected_market_price, prediction_interval, recent_observed_price, target_unit, etc.
 */
async function callModel3({ state, district, businessCategory }) {
  const commodity = mapCategoryToCommodity(businessCategory);
  const payload = {
    state: state || "Gujarat",
    district: district || "Anand",
    market: `${district || "Anand"} APMC`,
    commodity,
  };

  try {
    const res = await fetchWithTimeout(`${MODEL3_URL}/api/v1/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.warn(`[feasibility-ml.client] Model 3 price prediction unavailable (${err.message}). Falling back.`);
    return null;
  }
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
 * Calls Model 1 + Model 2 + Model 3 in parallel and returns a combined prediction object.
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

  // Run Model 1, Model 2, Model 3, and Data Service in parallel for maximum performance
  const [model1Result, model2Result, model3Result, censusData] = await Promise.allSettled([
    callModel1({ state, district, subdistrict, village, businessCategory, latitude, longitude }),
    callModel2({ state, district, subdistrict, businessCategory }),
    callModel3({ state, district, businessCategory }),
    callDataService({ state }),
  ]);

  const m1 = model1Result.status === "fulfilled" ? model1Result.value : null;
  const m2 = model2Result.status === "fulfilled" ? model2Result.value : null;
  const m3 = model3Result.status === "fulfilled" ? model3Result.value : null;
  const census = censusData.status === "fulfilled" ? censusData.value : null;

  // At least one core model (Model 1 or Model 2) must succeed
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
    model3: m3,
    census,
    location: { state, district, subdistrict, village },
    businessCategory,
    availableMargin: Number(business?.availableMargin || profile?.availableCapital || 0),
  };
}