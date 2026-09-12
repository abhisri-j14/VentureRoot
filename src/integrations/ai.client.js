/**
 * VentureRoot AI Advisory Integration Client
 * ============================================
 * Synthesizes Google Gemini LLM API (gemini-2.5-flash / gemini-1.5-flash),
 * comprehensive user & venture context, Scheme RAG, and microservice fallbacks.
 */

const AI_ADVISOR_URL = process.env.AI_ADVISOR_URL || "http://127.0.0.1:8005";
const MODEL2_URL = process.env.MODEL2_URL || "http://127.0.0.1:8002";
const AI_TIMEOUT_MS = 30000;

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
 * Builds a structured, rich system instruction incorporating all profile & venture inputs.
 */
function buildAdvisorSystemPrompt({ profile, business, userContext }) {
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : "Local Entrepreneur";
  const userLoc = profile?.location
    ? [profile.location.village, profile.location.block, profile.location.district, profile.location.state].filter(Boolean).join(", ")
    : "India";
  const exp = profile?.businessExperience || "Not specified / First-time entrepreneur";
  const capital = profile?.availableCapital != null ? `₹${Number(profile.availableCapital).toLocaleString('en-IN')}` : "Not specified";
  const income = profile?.income != null ? `₹${Number(profile.income).toLocaleString('en-IN')}` : "Not specified";
  const edu = profile?.education || "Not specified";
  const skills = Array.isArray(profile?.skills) && profile.skills.length > 0 ? profile.skills.join(", ") : "General enterprise";

  const bizName = business?.name || "Proposed Local Venture";
  const category = business?.category?.name || "Micro / Small Enterprise";
  const bizDesc = business?.description || "Not provided";
  const bizLoc = business?.location
    ? [business.location.village, business.location.block, business.location.district, business.location.state].filter(Boolean).join(", ")
    : userLoc;
  const margin = business?.availableMargin != null
    ? `₹${Number(business.availableMargin).toLocaleString('en-IN')}`
    : capital;
  const marginNum = business?.availableMargin != null
    ? Number(business.availableMargin)
    : (profile?.availableCapital != null ? Number(profile.availableCapital) : 100000);
  const resources = business?.existingResources || "None specified";
  const rev = business?.expectedRevenue != null ? `₹${Number(business.expectedRevenue).toLocaleString('en-IN')} / month` : "Not estimated";
  const status = business?.status || "Planning / Draft";

  const estTotalCost = `₹${(marginNum * 4).toLocaleString('en-IN')} – ₹${(marginNum * 5).toLocaleString('en-IN')}`;
  const estLoanReq = `₹${(marginNum * 3).toLocaleString('en-IN')} – ₹${(marginNum * 4).toLocaleString('en-IN')}`;

  return `You are the VentureRoot AI Business Advisor, an expert micro-business mentor, financial analyst, and rural enterprise strategist in India.
Your mission is to provide personalized, realistic, and highly actionable business guidance to grassroots entrepreneurs.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ENTREPRENEUR PROFILE & BACKGROUND:
- Entrepreneur Name: ${name}
- Education: ${edu}
- Prior Business Experience: ${exp}
- Available Capital / Personal Savings: ${capital}
- Current Income Level: ${income}
- Stated Skills & Knowledge: ${skills}
- Residential Location: ${userLoc}

🏢 PROPOSED VENTURE DETAILS:
- Business Name: ${bizName}
- Industry / Category: ${category}
- Concept Description: ${bizDesc}
- Business Location: ${bizLoc}
- Available Promoter Margin (Own Equity): ${margin}
- Estimated Feasible Project Outlay: ${estTotalCost}
- Estimated Bank Loan Requirement: ${estLoanReq}
- Expected Target Revenue: ${rev}
- Existing Infrastructure / Assets Owned: ${resources}
- Planning Lifecycle Status: ${status}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS FOR YOUR ADVICE:
1. Ground your analysis directly in the entrepreneur's location (${bizLoc}), category (${category}), available margin (${margin}), and resources (${resources}).
2. When answering financial questions, reference specific Indian banking frameworks (e.g., PMEGP with 25-35% capital subsidy, MUDRA Shishu up to ₹50k, Kishor ₹50k-5L, Tarun ₹5L-10L, Stand-Up India, PMFME for food processing, or NABARD agriculture/dairy schemes).
3. If the user asks about viability or risk, evaluate local procurement, customer footfall/demand, working capital pressure, and mandatory compliance (FSSAI, Udyam Registration, Trade License).
4. Provide structured, readable answers using clear markdown headers, bullet points, and bold emphasis on key figures.
5. Tone: Respectful, pragmatic, empowering, and grounded in real-world economics. If the user addresses you in Hindi or another Indian language, respond in that language or Hinglish naturally.`;
}

/**
 * Calls Google Gemini REST API directly.
 * Tests gemini-2.5-flash, gemini-1.5-flash, and gemini-2.0-flash with graceful fallback.
 */
async function callGeminiApi({ apiKey, systemInstruction, message, history = [] }) {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];

  const contents = [];

  if (Array.isArray(history) && history.length > 0) {
    for (const h of history) {
      if (h?.role && h?.content) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: String(h.content) }],
        });
      }
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: String(message) }],
  });

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.65,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, 30000);

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text, model };
        }
      } else {
        const errText = await res.text();
        console.warn(`[ai.client] Gemini ${model} status ${res.status}:`, errText);
        lastError = new Error(`Gemini ${model} error (${res.status})`);
      }
    } catch (err) {
      console.warn(`[ai.client] Gemini ${model} request failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to reach Gemini API");
}

/**
 * Chat with the AI Advisor agent
 */
export async function chatWithAi({ message, context, history = [] }) {
  const profile = context?.trusted?.profile;
  const biz = context?.trusted?.business;
  const userProvided = context?.userProvided || {};

  const loc = biz?.location || profile?.location || {};
  const district = loc.district || "Your Location";
  const state = loc.state || "India";
  const category = biz?.category?.name || "Enterprise";
  const marginNum = Number(biz?.availableMargin || profile?.availableCapital || 100000);

  // 1. Check for Gemini API key
  const geminiApiKey = process.env.GEMINI_API_KEY || userProvided.geminiApiKey;

  if (geminiApiKey && typeof geminiApiKey === "string" && geminiApiKey.trim()) {
    try {
      const systemInstruction = buildAdvisorSystemPrompt({
        profile,
        business: biz,
        userContext: userProvided,
      });

      const geminiResult = await callGeminiApi({
        apiKey: geminiApiKey.trim(),
        systemInstruction,
        message,
        history: userProvided.history || history,
      });

      return {
        message: geminiResult.text,
        confidence: "HIGH",
        model: geminiResult.model,
        evidence: {
          sources: [
            `Venture: ${biz?.name || "Business"} (${category}, ${district})`,
            `Promoter Margin: ₹${marginNum.toLocaleString('en-IN')}`,
            `Powered by Google Gemini (${geminiResult.model})`,
          ],
          type: "FACT",
          confidence: 96,
        },
      };
    } catch (err) {
      console.error("[ai.client] Gemini API error, falling back:", err.message);
    }
  }

  // 2. Try Python local AI Advisor cluster (port 8005)
  const payload = {
    business_id: biz?.id || null,
    user_query: message,
    location: `${district}, ${state}`,
    district,
    proposed_business: category,
    investment_amount: marginNum * 5,
    own_margin: marginNum,
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
    console.warn("[ai.client] Remote Python Advisor unavailable:", err.message);
  }

  // 3. Intelligent data-grounded contextual response (utilizing all user inputs)
  const bizTitle = biz?.name || category;
  const projectOutlay = marginNum * 4.5;
  const loanEstimate = marginNum * 3.5;
  const subsidyPct = state.toLowerCase().includes("assam") || state.toLowerCase().includes("hill") ? "35%" : "25%";

  return {
    message: `### 📊 Advisory Analysis for ${bizTitle}\n\n` +
      `**Location:** ${district}, ${state} | **Sector:** ${category}\n` +
      `**Promoter Equity:** ₹${marginNum.toLocaleString('en-IN')} | **Estimated Project Size:** ₹${projectOutlay.toLocaleString('en-IN')}\n\n` +
      `#### 1. Financial Viability & Bank Financing\n` +
      `- With your personal margin of **₹${marginNum.toLocaleString('en-IN')}**, you can comfortably leverage a commercial bank loan of approximately **₹${loanEstimate.toLocaleString('en-IN')}**.\n` +
      `- **Recommended Scheme:** **PMEGP (Prime Minister Employment Generation Programme)** offers a **${subsidyPct} margin money subsidy** for rural projects in ${district}, substantially lowering repayment stress.\n` +
      `- **Alternative:** **MUDRA (Kishor/Tarun)** provides collateral-free working capital up to ₹10 Lakhs.\n\n` +
      `#### 2. Local Market & Risk Assessment\n` +
      `- **Demand Factors:** ${category} enterprises in ${district} thrive when tied directly to local weekly mandis, direct-to-consumer routes, or institutional buyers.\n` +
      `- **Key Risk:** Ensure at least 3 months of working capital reserve (approx ₹${(marginNum * 0.4).toLocaleString('en-IN')}) for initial operations.\n\n` +
      `#### 3. Recommended Immediate Steps\n` +
      `1. Register your business on the free **Udyam portal** to unlock MSME priority lending rates.\n` +
      `2. Prepare a 1-page Project Profile highlighting your promoter margin of ₹${marginNum.toLocaleString('en-IN')}.\n` +
      `3. Inquire at your local Lead District Bank (LDB) or District Industries Centre (DIC) for PMEGP sponsorship.\n\n` +
      `*💡 Note: To enable live real-time conversational responses powered by Google Gemini, add your \`GEMINI_API_KEY\` to \`.env.local\` or click the 🔑 API Key button above.*`,
    confidence: "MEDIUM",
    fallback: true,
    evidence: {
      sources: [
        `VentureRoot Profile: ${profile?.firstName || "User"} (${district}, ${state})`,
        `Promoter Margin: ₹${marginNum.toLocaleString('en-IN')}`,
        "PMEGP / MUDRA Policy Guidelines",
      ],
      type: "ESTIMATE",
      confidence: 88,
    },
  };
}

/**
 * Analyze a specific business with AI Advisor (synthesizing Gemini + context)
 */
export async function analyzeBusinessWithAi({ context }) {
  const profile = context?.trusted?.profile;
  const biz = context?.trusted?.business;
  const userProvided = context?.userProvided || {};

  const loc = biz?.location || profile?.location || {};
  const district = loc.district || "Your District";
  const state = loc.state || "India";
  const category = biz?.category?.name || "Enterprise";
  const marginNum = Number(biz?.availableMargin || profile?.availableCapital || 100000);

  // Check for Gemini API key
  const geminiApiKey = process.env.GEMINI_API_KEY || userProvided.geminiApiKey;

  if (geminiApiKey && typeof geminiApiKey === "string" && geminiApiKey.trim()) {
    try {
      const systemInstruction = buildAdvisorSystemPrompt({
        profile,
        business: biz,
        userContext: userProvided,
      });

      const geminiResult = await callGeminiApi({
        apiKey: geminiApiKey.trim(),
        systemInstruction,
        message: `Provide a comprehensive strategic feasibility, government scheme eligibility, and risk mitigation plan for my proposed ${category} business in ${district}, ${state}.`,
      });

      return {
        analysis: geminiResult.text,
        confidenceLevel: "HIGH",
        model: geminiResult.model,
      };
    } catch (err) {
      console.warn("[ai.client] Gemini analysis failed, using fallback:", err.message);
    }
  }

  // Fallback to local python advisor or deterministic analysis
  const payload = {
    business_id: biz?.id || null,
    user_query: `Provide a comprehensive strategic feasibility, government scheme eligibility, and risk mitigation plan for a ${category} business in ${district}, ${state}.`,
    location: `${district}, ${state}`,
    district,
    proposed_business: category,
    investment_amount: marginNum * 5,
    own_margin: marginNum,
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
    analysis: `### Business Analysis: ${biz?.name || category}\n\n**Location:** ${district}, ${state}\n**Category:** ${category}\n**Available Margin:** ₹${marginNum.toLocaleString('en-IN')}\n\n**Strategic Summary:** Strong local enterprise potential. Recommend applying for government credit linkage schemes like MUDRA or PMEGP with estimated project outlay of ₹${(marginNum * 5).toLocaleString('en-IN')}.`,
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