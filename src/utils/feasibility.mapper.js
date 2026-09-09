/**
 * VentureRoot Feasibility ML → Frontend Schema Mapper
 * =====================================================
 * Transforms the combined output from Model 1 (market demand & MPI) and
 * Model 2 (business viability, competition, category rankings) into the
 * FeasibilityData type expected by the frontend React components.
 *
 * Frontend type (from src/features/feasibility/types/index.ts):
 *  FeasibilityData {
 *    status, market, opportunity, competition, swot, risks, pricing
 *  }
 */

/**
 * Build a confidence object from Model 2 confidence string + Model 1 score.
 */
function buildConfidence(m1, m2) {
  const rawScore =
    m1?.confidence_score ??
    (m2?.data_completeness ? m2.data_completeness * 100 : null) ??
    70;

  const score = Math.round(Math.min(100, Math.max(0, rawScore)));

  const levelStr = (m2?.confidence || "").toUpperCase();
  const level =
    levelStr === "HIGH" || score >= 75 ? "HIGH" :
    levelStr === "LOW" || score < 50  ? "LOW"  : "MEDIUM";

  const reasons = [
    ...(m1?.warnings || []).slice(0, 2),
    ...(m2?.warnings || []).slice(0, 2),
  ].filter(Boolean);

  return { score, level, reasons };
}

/**
 * Map Model 1 + census data → MarketAnalysis
 */
function mapMarket(m1, census, businessCategory) {
  const reach = {
    radius5km: census?.reach?.radius5km || (m1?.market_potential_score ? Math.round(m1.market_potential_score * 300) : 12000),
    radius10km: census?.reach?.radius10km || (m1?.market_potential_score ? Math.round(m1.market_potential_score * 750) : 30000),
  };

  const demandIndicators = [
    ...(census?.demandIndicators || []),
    m1?.market_potential_score != null
      ? `Market Potential Index: ${m1.market_potential_score.toFixed(1)}/100`
      : null,
    m1?.demand_score != null
      ? `Demand score: ${m1.demand_score.toFixed(1)}`
      : null,
    m1?.purchasing_power_score != null
      ? `Purchasing power score: ${m1.purchasing_power_score.toFixed(1)}`
      : null,
  ].filter(Boolean);

  const localObservations = [
    ...(census?.localObservations || []),
    m1?.match_info?.status === "found"
      ? `Location matched at sub-district level: ${m1.match_info.matched_name || ""}`
      : "Prediction using district-level estimates",
    m1?.geographic_level
      ? `Geographic resolution: ${m1.geographic_level}`
      : null,
  ].filter(Boolean);

  const marketTrends = [
    ...(census?.marketTrends || []),
    m1?.opportunity_level
      ? `Opportunity level for ${businessCategory}: ${m1.opportunity_level}`
      : null,
  ].filter(Boolean);

  const positiveFactors = (m1?.top_positive_factors || [])
    .map(f => f?.factor || JSON.stringify(f))
    .filter(Boolean);

  return {
    reach,
    demandIndicators: demandIndicators.slice(0, 6),
    localObservations: localObservations.slice(0, 4),
    customerSegments: census?.customerSegments || ["Local Residents", "Small Business Owners", "Working Professionals"],
    marketSizeValue: census?.marketSizeValue || null,
    marketTrends: marketTrends.slice(0, 4),
    evidenceSources: [
      ...(m1?.data_sources || []),
      ...(census?.evidenceSources || []),
    ].slice(0, 5),
    evidence: [
      { type: "FACT", label: "Market Potential Index", source: "GramBiz Model 1 (Census 2011 + HCES 2023-24 + CPI 2026)" },
      { type: "ESTIMATE", label: "Consumer Reach", source: census ? "Census of India 2011" : "MPI-derived estimate" },
    ],
    confidence: buildConfidence(m1, null),
    why: {
      summary: m1
        ? `The ${businessCategory} category scores ${m1.market_potential_score?.toFixed(0) || "N/A"}/100 on the Market Potential Index for ${m1.location?.district || "this location"}.`
        : "Market analysis is based on census demographic data.",
      factors: positiveFactors.slice(0, 3),
    },
  };
}

/**
 * Map Model 2 selected category analysis → OpportunityAnalysis
 */
function mapOpportunity(m1, m2, businessCategory) {
  const cat = m2?.selected_category_analysis;
  const viabilityScore = m2?.overall_viability_score ?? m1?.market_potential_score ?? 0;
  const scoreBand = m2?.score_band || (viabilityScore >= 65 ? "HIGH" : viabilityScore >= 45 ? "MODERATE" : "LOW");

  const positiveFactors = cat?.positive_factors || m2?.category_rankings?.[0]?.positive_factors || [];
  const keyDrivers = positiveFactors.slice(0, 4);

  const observations = [
    m2?.overall_viability_score != null
      ? `Overall location viability score: ${m2.overall_viability_score.toFixed(1)}/100 (${scoreBand})`
      : null,
    cat?.opportunity_score != null
      ? `Opportunity score for ${businessCategory}: ${cat.opportunity_score.toFixed(1)}/100`
      : null,
    m2?.ood ? "⚠ Location may have limited census data coverage" : null,
  ].filter(Boolean);

  const confidence = buildConfidence(m1, m2);

  return {
    summary:
      cat
        ? `${businessCategory} ranks #${cat.rank} across all categories for this location with an opportunity score of ${cat.opportunity_score?.toFixed(1)}/100.`
        : `Viability band for this location is ${scoreBand} (${viabilityScore.toFixed(1)}/100).`,
    demandOpportunity:
      cat
        ? `Demand proxy score: ${cat.demand_proxy_score?.toFixed(1)}/100`
        : `Overall viability: ${viabilityScore.toFixed(1)}/100`,
    unmetNeed:
      cat?.risk_factors?.length
        ? `Key risk: ${cat.risk_factors[0]}`
        : "Insufficient local business density suggests unmet demand.",
    localBusinessOpportunity:
      cat?.observed_competitor_count != null
        ? `${cat.observed_competitor_count} competitor(s) observed in the area`
        : "Local competition data not available for this sub-district.",
    keyDrivers,
    observations,
    evidence: [
      { type: "PREDICTION", label: "Viability Score", source: "GramBiz Model 2 (Competition & Opportunity Engine)" },
    ],
    confidence,
    why: {
      summary: `Model 2 scored ${businessCategory} using competition density, demand proxy, and purchasing power indicators.`,
      factors: keyDrivers.slice(0, 3),
    },
  };
}

/**
 * Map Model 2 category rankings + selected category → CompetitionAnalysis
 */
function mapCompetition(m2, businessCategory) {
  const cat = m2?.selected_category_analysis;
  const rankings = m2?.category_rankings || [];

  const competitorCount = cat?.observed_competitor_count;
  const competitionScore = cat?.competition_score;

  const competitors = rankings
    .filter(r => r.category !== businessCategory)
    .slice(0, 4)
    .map((r, i) => ({
      id: `competitor-${i + 1}`,
      name: r.category,
      type: "Indirect",
      location: "Same sub-district",
      pricing: "Market rate",
      strengths: r.positive_factors?.slice(0, 2) || ["Established market presence"],
      weaknesses: r.risk_factors?.slice(0, 1) || ["Limited differentiation"],
      positioning: `Rank #${r.rank} — opportunity score ${r.opportunity_score?.toFixed(1)}/100`,
    }));

  return {
    overview: cat
      ? `${businessCategory} has a competition score of ${competitionScore?.toFixed(1)}/100. ${competitorCount != null ? `${competitorCount} direct competitor(s) observed.` : "Competitor count data not available."}`
      : "Competition analysis based on category opportunity rankings.",
    competitors,
    observations: [
      competitionScore != null
        ? `Competition intensity: ${competitionScore >= 70 ? "High" : competitionScore >= 40 ? "Medium" : "Low"} (${competitionScore?.toFixed(1)}/100)`
        : null,
      m2?.geospatial_radius_available
        ? "Geospatial competitor radius analysis available."
        : "Competitor density is based on administrative-level data, not geospatial radius.",
    ].filter(Boolean),
    evidence: [
      { type: "ESTIMATE", label: "Competition Score", source: "GramBiz Model 2" },
    ],
    confidence: { score: 70, level: "MEDIUM", reasons: m2?.warnings?.slice(0, 2) || [] },
  };
}

/**
 * Build a SWOT analysis from Model 1 factors and Model 2 category insights.
 */
function mapSWOT(m1, m2, businessCategory) {
  const cat = m2?.selected_category_analysis;
  const positiveFactors = m1?.top_positive_factors?.map(f => f?.factor || String(f)) || [];
  const negativeFactors = m1?.top_negative_factors?.map(f => f?.factor || String(f)) || [];
  const catPositive = cat?.positive_factors || [];
  const catRisks = cat?.risk_factors || [];

  const strengths = [
    ...catPositive.slice(0, 2),
    ...positiveFactors.slice(0, 2),
    m1?.market_potential_score >= 65 ? "Above-average market potential score" : null,
  ].filter(Boolean).slice(0, 4);

  const weaknesses = [
    ...negativeFactors.slice(0, 2),
    m1?.market_potential_score < 45 ? "Below-average market potential for this area" : null,
    m2?.data_completeness < 0.6 ? "Limited local census data coverage" : null,
  ].filter(Boolean).slice(0, 4);

  const opportunities = [
    cat?.opportunity_score >= 60 ? `High opportunity score (${cat.opportunity_score?.toFixed(0)}/100) for ${businessCategory}` : null,
    cat?.rank <= 3 ? `${businessCategory} ranks in top 3 categories for this location` : null,
    m1?.infrastructure_score >= 60 ? "Strong infrastructure score supports business operations" : null,
    "Growing rural consumption backed by HCES 2023-24 data",
  ].filter(Boolean).slice(0, 4);

  const threats = [
    ...catRisks.slice(0, 2),
    m2?.ood ? "Location is near the edge of the training data distribution — predictions may be less reliable" : null,
    "Census data anchored to 2011 — local dynamics may have shifted",
  ].filter(Boolean).slice(0, 4);

  return {
    strengths: strengths.length ? strengths : ["Local market presence", "Established community networks"],
    weaknesses: weaknesses.length ? weaknesses : ["Limited capital access", "Informal competition"],
    opportunities: opportunities.length ? opportunities : ["Underserved local demand", "Government scheme eligibility"],
    threats: threats.length ? threats : ["Seasonal revenue fluctuation", "Supply chain instability"],
    evidence: [{ type: "PREDICTION", label: "SWOT Factors", source: "GramBiz Model 1 & 2" }],
    confidence: buildConfidence(m1, m2),
  };
}

/**
 * Build risk items from model warnings, risk factors, and OOD checks.
 */
function mapRisks(m1, m2, businessCategory) {
  const risks = [];
  let riskId = 1;

  // From Model 2 category risk factors
  const catRisks = m2?.selected_category_analysis?.risk_factors || [];
  catRisks.slice(0, 3).forEach(riskFactor => {
    risks.push({
      id: `risk-${riskId++}`,
      title: riskFactor,
      category: "Market",
      severity: "Medium",
      explanation: `Model 2 identified this as a risk factor for ${businessCategory} in this location.`,
      potentialImpact: "May reduce market opportunity score and overall viability.",
      mitigationAdvisory: "Consider market differentiation and targeted customer outreach.",
    });
  });

  // From Model 1 OOD checks
  if (m1?.ood_checks?.is_out_of_distribution) {
    risks.push({
      id: `risk-${riskId++}`,
      title: "Limited census data coverage for this location",
      category: "Operational",
      severity: "High",
      explanation: "This location had limited coverage in the training dataset. Predictions may be less precise.",
      potentialImpact: "Market potential scores carry higher uncertainty.",
      mitigationAdvisory: "Conduct primary local market research before final investment decisions.",
    });
  }

  if (m1?.ood_checks?.missing_feature_count > 10) {
    risks.push({
      id: `risk-${riskId++}`,
      title: "Incomplete location feature data",
      category: "Operational",
      severity: "Medium",
      explanation: `${m1.ood_checks.missing_feature_count} census features were missing for this sub-district.`,
      potentialImpact: "Reduced prediction confidence.",
      mitigationAdvisory: "Cross-reference with state-level averages.",
    });
  }

  // From Model 2 warnings
  (m2?.warnings || []).slice(0, 2).forEach(w => {
    risks.push({
      id: `risk-${riskId++}`,
      title: "Data quality warning",
      category: "Market",
      severity: "Low",
      explanation: w,
      potentialImpact: "May affect prediction accuracy.",
      mitigationAdvisory: "Use as a planning guide, not a guarantee.",
    });
  });

  // Generic financial risk
  risks.push({
    id: `risk-${riskId++}`,
    title: "Revenue below break-even",
    category: "Financial",
    severity: "Medium",
    explanation: "New businesses in rural markets often take 4-8 months to reach sustainable revenue.",
    potentialImpact: "Cash flow gap if working capital is insufficient.",
    mitigationAdvisory: "Maintain 3-6 months of operating expenses as a buffer.",
  });

  return risks.slice(0, 6);
}

/**
 * Build pricing analysis — currently derived from Model 2 viability score.
 * Model 3 (price prediction) can be integrated here later.
 */
function mapPricing(m1, m2, business) {
  const viabilityScore = m2?.overall_viability_score ?? m1?.market_potential_score ?? 60;
  const purchasingPower = m1?.purchasing_power_score;
  const marketGap = m1?.market_gap_score;

  // Derive a price multiplier from purchasing power and market gap
  const priceMultiplier = purchasingPower != null
    ? 0.8 + (purchasingPower / 100) * 0.6  // 0.8x to 1.4x of typical market rate
    : 1.0;

  const basePrice = 100; // normalized ₹/unit placeholder
  const expectedPrice = Math.round(basePrice * priceMultiplier);
  const observedPrice = Math.round(expectedPrice * 0.9);

  const observations = [
    purchasingPower != null
      ? `Local purchasing power score: ${purchasingPower.toFixed(1)}/100`
      : null,
    marketGap != null
      ? `Market gap score: ${marketGap.toFixed(1)}/100 — ${marketGap >= 60 ? "High unmet demand suggests premium pricing potential" : "Competitive market, price sensitivity likely"}`
      : null,
    m2?.selected_category_analysis?.competition_score != null
      ? `Competition score: ${m2.selected_category_analysis.competition_score.toFixed(1)}/100`
      : null,
  ].filter(Boolean);

  return {
    expectedLocalPrice: expectedPrice,
    observedMarketPrice: observedPrice,
    priceRange: { min: Math.round(expectedPrice * 0.75), max: Math.round(expectedPrice * 1.35) },
    marketValue: viabilityScore >= 65 ? "Above Average" : viabilityScore >= 45 ? "Average" : "Below Average",
    observations: observations.length ? observations : ["Price data derived from regional model predictions."],
    pricingFactors: [
      "Rural consumer purchasing power index",
      "Local market competition density",
      "Market gap and unmet demand indicators",
    ],
    evidence: [
      { type: "ESTIMATE", label: "Price Estimate", source: "GramBiz Model 1 & 2 (Indirect)" },
    ],
    confidence: buildConfidence(m1, m2),
  };
}

/**
 * Master mapper: combines Model 1, Model 2, and census data into FeasibilityData.
 *
 * @param {{ model1, model2, census, location, businessCategory }} mlResult
 * @param {object} business Business record from DB
 * @returns {import("@/features/feasibility/types").FeasibilityData}
 */
export function mapMlPredictionToFeasibility(mlResult, business) {
  const { model1: m1, model2: m2, census } = mlResult;
  const businessCategory = mlResult.businessCategory || business?.category?.name || "Retail";

  return {
    status: "SUCCESS",
    market: mapMarket(m1, census, businessCategory),
    opportunity: mapOpportunity(m1, m2, businessCategory),
    competition: mapCompetition(m2, businessCategory),
    swot: mapSWOT(m1, m2, businessCategory),
    risks: mapRisks(m1, m2, businessCategory),
    pricing: mapPricing(m1, m2, business),
  };
}
