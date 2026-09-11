/**
 * VentureRoot AI Advisory Integration Client
 * ============================================
 * Connects the Next.js backend to the Python GramBiz AI Advisory Agent (port 8005),
 * synthesizing Gemini LLM advisory, Scheme RAG, and Financial Firewall checks.
 */

const AI_ADVISOR_URL = process.env.AI_ADVISOR_URL || "http://127.0.0.1:8005";
const MODEL2_URL = process.env.MODEL2_URL || "http://127.0.0.1:8002";
const AI_TIMEOUT_MS = 25000;

async function fetchWithTimeout(url, options = {}, timeoutMs = AI_TIMEOUT_MS) {
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
 * Chat with the AI Advisor agent
 */
export async function chatWithAi({ message, context }) {
  const biz = context?.trusted?.business;
  const loc = biz?.location || {};
  const district = loc.district || "Anand";
  const state = loc.state || "Gujarat";
  const category = biz?.category?.name || "Retail";
  const margin = Number(biz?.availableMargin || 100000);

  const payload = {
    business_id: biz?.id || null,
    user_query: message,
    location: `${district}, ${state}`,
    district,
    proposed_business: category,
    investment_amount: margin * 5,
    own_margin: margin,
  };

  try {
    const res = await fetchWithTimeout(`${AI_ADVISOR_URL}/api/v1/advise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        message: data.advisory_report || data.summary || "Advisory report generated successfully.",
        confidence: data.confidence_level || "HIGH",
        plan: data.plan,
        numericalViolations: data.numerical_violations || 0,
        warnings: data.warnings || [],
      };
    }
  } catch (err) {
    console.warn("[ai.client] Remote AI Advisor unavailable, using deterministic fallback:", err.message);
  }

  // Graceful deterministic fallback
  return {
    message: `Based on your profile for ${category} in ${district}, ${state}, we recommend verifying local demand, securing promoter margin (~₹${margin.toLocaleString('en-IN')}), and exploring PMEGP or MUDRA credit schemes.`,
    confidence: "MEDIUM",
    fallback: true,
  };
}

/**
 * Analyze a specific business with AI Advisor
 */
export async function analyzeBusinessWithAi({ context }) {
  const biz = context?.trusted?.business;
  const loc = biz?.location || {};
  const district = loc.district || "Anand";
  const state = loc.state || "Gujarat";
  const category = biz?.category?.name || "Retail";
  const margin = Number(biz?.availableMargin || 100000);

  const payload = {
    business_id: biz?.id || null,
    user_query: `Provide a comprehensive strategic feasibility, government scheme eligibility, and risk mitigation plan for a ${category} business in ${district}, ${state}.`,
    location: `${district}, ${state}`,
    district,
    proposed_business: category,
    investment_amount: margin * 5,
    own_margin: margin,
  };

  try {
    const res = await fetchWithTimeout(`${AI_ADVISOR_URL}/api/v1/advise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        analysis: data.advisory_report,
        confidenceLevel: data.confidence_level || "HIGH",
        plan: data.plan,
        warnings: data.warnings || [],
        toolResults: data.tool_results || [],
      };
    }
  } catch (err) {
    console.warn("[ai.client] Remote AI Advisor unavailable for business analysis:", err.message);
  }

  return {
    analysis: `### Business Analysis: ${biz?.name || category}\n\n**Location:** ${district}, ${state}\n**Category:** ${category}\n**Available Margin:** ₹${margin.toLocaleString('en-IN')}\n\n**Strategic Summary:** Strong local enterprise potential. Recommend applying for government credit linkage schemes like MUDRA or PMEGP with estimated project outlay of ₹${(margin * 5).toLocaleString('en-IN')}.`,
    confidenceLevel: "MEDIUM",
    fallback: true,
  };
}

/**
 * Recommend businesses using Model 2 Category Opportunity Rankings + AI Advisor
 */
export async function recommendBusinessWithAi({ context }) {
  const biz = context?.trusted?.business;
  const loc = biz?.location || {};
  const district = loc.district || "Anand";
  const state = loc.state || "Gujarat";
  const subdistrict = loc.block || loc.subdistrict || null;

  // 1. Fetch real-time empirical category rankings from Model 2 (Port 8002)
  let model2Rankings = null;
  let overallViability = null;
  let scoreBand = null;

  try {
    const m2Res = await fetchWithTimeout(`${MODEL2_URL}/api/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state_name: state,
        district_name: district,
        subdistrict_name: subdistrict,
      }),
    });

    if (m2Res.ok) {
      const m2Data = await m2Res.json();
      model2Rankings = m2Data.category_rankings || [];
      overallViability = m2Data.overall_viability_score;
      scoreBand = m2Data.score_band;
    }
  } catch (err) {
    console.warn("[ai.client] Model 2 category ranking unavailable:", err.message);
  }

  // 2. Synthesize with Gemini AI Advisor (Port 8005)
  const topRankedNames = model2Rankings?.slice(0, 3).map(r => `${r.category} (Score: ${r.opportunity_score?.toFixed(0)}/100)`).join(", ");
  const advisorPrompt = topRankedNames
    ? `Based on Model 2 viability data, the top recommended enterprise categories for ${district}, ${state} are: ${topRankedNames}. Provide a concise strategic rationale and subsidy scheme recommendation for these opportunities.`
    : `What are the top 3 highest-potential rural micro-enterprise categories recommended for ${district}, ${state}?`;

  const payload = {
    business_id: biz?.id || null,
    user_query: advisorPrompt,
    location: `${district}, ${state}`,
    district,
  };

  try {
    const res = await fetchWithTimeout(`${AI_ADVISOR_URL}/api/v1/advise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        recommendations: data.advisory_report,
        confidenceLevel: data.confidence_level || "HIGH",
        rankings: model2Rankings?.slice(0, 5) || [],
        overallViability,
        scoreBand,
      };
    }
  } catch (err) {
    console.warn("[ai.client] Remote AI Advisor unavailable for recommendations:", err.message);
  }

  // 3. Fallback: return Model 2 rankings if AI Advisor is offline, or static fallback
  if (model2Rankings && model2Rankings.length > 0) {
    const top3 = model2Rankings.slice(0, 3);
    const summary = top3.map((c, i) => `${i + 1}) **${c.category}** (Opportunity Score: ${c.opportunity_score.toFixed(1)}/100) — Key drivers: ${(c.positive_factors || []).slice(0, 2).join(", ") || "Strong local demand"}`).join("\n");
    return {
      recommendations: `### Top Recommended Rural Enterprises for ${district}, ${state} (Model 2 Opportunity Engine):\n\n${summary}`,
      confidenceLevel: "HIGH",
      rankings: model2Rankings.slice(0, 5),
      overallViability,
      scoreBand,
      fallback: false,
    };
  }

  return {
    recommendations: `Top opportunities for ${district}, ${state}: 1) Retail & Kirana (high daily consumption), 2) Dairy & Food Processing (agricultural supply linkage), 3) Services & Tailoring.`,
    confidenceLevel: "MEDIUM",
    fallback: true,
  };
}