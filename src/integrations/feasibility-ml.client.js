/**
 * VentureRoot Step 3 ML & Data Integration Client
 * Connects Next.js backend to the authoritative Step 3 Python Service.
 */

const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || "http://127.0.0.1:8000";

export async function predictFeasibility({ business, profile }) {
  const loc = business?.location || {};
  const state = loc.state || "Gujarat";
  const district = loc.district || "Anand";
  const subdistrict = loc.subdistrict || loc.block || district;
  const latitude = loc.latitude !== undefined && loc.latitude !== null ? Number(loc.latitude) : null;
  const longitude = loc.longitude !== undefined && loc.longitude !== null ? Number(loc.longitude) : null;
  const categoryName = business?.category?.name || "Retail";
  const availableMargin = Number(business?.availableMargin || profile?.availableCapital || 50000);
  const proposedBudget = business?.expectedRevenue ? Number(business.expectedRevenue) : null;

  const payload = {
    state,
    district,
    subdistrict,
    block: subdistrict,
    latitude,
    longitude,
    business_category: categoryName,
    commodity: business?.product || null,
    available_margin_inr: Math.max(availableMargin, 1000),
    proposed_budget_inr: proposedBudget,
    preferred_catchment_radius_km: 10.0,
    preferred_market_radius_km: 10.0,
  };

  const response = await fetch(`${DATA_SERVICE_URL}/api/v1/analyze-business`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Step 3 Pipeline Service Error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  return json.data;
}