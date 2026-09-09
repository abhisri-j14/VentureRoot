/**
 * VentureRoot AI Advisory Integration Client
 * ============================================
 * Connects the Next.js backend to the Python GramBiz AI Advisory Agent (port 8005),
 * synthesizing Gemini LLM advisory, Scheme RAG, and Financial Firewall checks.
 */

const AI_ADVISOR_URL = process.env.AI_ADVISOR_URL || "http://127.0.0.1:8005";
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
 * Recommend businesses with AI Advisor
 */
export async function recommendBusinessWithAi({ context }) {
  const biz = context?.trusted?.business;
  const loc = biz?.location || {};
  const district = loc.district || "Anand";
  const state = loc.state || "Gujarat";

  const payload = {
    business_id: biz?.id || null,
    user_query: `What are the top 3 highest-potential rural micro-enterprise categories recommended for ${district}, ${state}?`,
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
      };
    }
  } catch (err) {
    console.warn("[ai.client] Remote AI Advisor unavailable for recommendations:", err.message);
  }

  return {
    recommendations: `Top opportunities for ${district}, ${state}: 1) Retail & Kirana (high daily consumption), 2) Dairy & Food Processing (agricultural supply linkage), 3) Services & Tailoring.`,
    confidenceLevel: "MEDIUM",
    fallback: true,
  };
}