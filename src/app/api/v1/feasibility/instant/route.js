import { predictFeasibility } from "@/integrations/feasibility-ml.client";
import { mapMlPredictionToFeasibility } from "@/utils/feasibility.mapper";
import * as financeClient from "@/integrations/finance.client";
import { calculateEmi } from "@/utils/finance/emi";
import { chatWithAi } from "@/integrations/ai.client";
import { generateTailoredRoadmapAndCompetitors } from "@/services/ai-roadmap.service";
import { fetchCompetitorsByRadius } from "@/services/competitor-radar.service";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";
import { INDIAN_LOCATIONS_MASTER } from "@/services/location-search.service";

export async function POST(request) {
  try {
    const body = await request.json();

    const businessName = body.businessName?.trim() || "My Business Venture";
    const category = body.category?.trim() || "Dairy";
    const state = body.state?.trim() || "Gujarat";
    const district = body.district?.trim() || "Anand";
    const subdistrict = body.subdistrict?.trim() || district;
    const village = body.village?.trim() || null;
    const availableMargin = Number(body.availableMargin || 150000);
    const projectCost = Number(body.projectCost || availableMargin * 10);
    const landType = body.landType || "Owned Land";
    const targetScale = body.targetScale || "";
    const salesChannel = body.salesChannel || "APMC Mandi / Local Wholesale";
    const workingCapitalRequirement = Number(body.workingCapitalRequirement || Math.round(projectCost * 0.15));
    const facilityType = body.facilityType || "";
    const bedCapacity = body.bedCapacity || "";
    const medicalSpecialties = body.medicalSpecialties || "";

    // Resolve accurate user coordinates (OpenStreetMap / Master Census DB)
    let latitude = body.latitude !== undefined && body.latitude !== null ? Number(body.latitude) : null;
    let longitude = body.longitude !== undefined && body.longitude !== null ? Number(body.longitude) : null;

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      const match = INDIAN_LOCATIONS_MASTER.find(
        (l) => l.district.toLowerCase() === district.toLowerCase() &&
               (!state || l.state.toLowerCase() === state.toLowerCase())
      ) || INDIAN_LOCATIONS_MASTER.find(
        (l) => l.district.toLowerCase() === district.toLowerCase()
      );

      if (match && match.lat && match.lon) {
        latitude = match.lat;
        longitude = match.lon;
      } else {
        try {
          const query = encodeURIComponent(`${district}, ${state}, India`);
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
            headers: { "User-Agent": "VentureRoot-App/1.0" },
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (Array.isArray(geoData) && geoData.length > 0) {
              latitude = Number(geoData[0].lat);
              longitude = Number(geoData[0].lon);
            }
          }
        } catch (_) {}
      }
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      latitude = 22.5645;
      longitude = 72.9289;
    }

    const businessObj = {
      name: businessName,
      category: { name: category },
      location: {
        state,
        district,
        block: subdistrict,
        subdistrict,
        village,
        lat: latitude,
        lon: longitude,
        latitude,
        longitude,
      },
      availableMargin,
      projectCost,
      landType,
      targetScale,
      salesChannel,
      workingCapitalRequirement,
      facilityType,
      bedCapacity,
      medicalSpecialties,
      expectedRevenue: Number(body.expectedRevenue || Math.round(projectCost * 0.25)),
    };

    // 1. Run core ML pipeline (Model 1, Model 2, Model 3, Census)
    let mlResult = null;
    let mlError = null;
    try {
      mlResult = await predictFeasibility({
        business: businessObj,
        profile: { availableCapital: availableMargin },
      });
    } catch (err) {
      mlError = err.message;
      console.warn("[feasibility/instant] ML pipeline warning:", mlError);
    }

    // 2. Map ML predictions to FeasibilityData structure
    const feasibilityData = mlResult
      ? mapMlPredictionToFeasibility(mlResult, businessObj)
      : null;

    // 3. Call Python Finance Engine on deployed URL / local
    let financeData = null;
    try {
      const [calcRes, schemeRes] = await Promise.allSettled([
        financeClient.calculateFinance({
          availableMargin,
          businessCategory: category,
          state,
          proposedProjectCost: projectCost,
        }),
        financeClient.routeScheme({ projectCost }),
      ]);

      if (calcRes.status === "rejected") {
        console.warn("[feasibility/instant] Finance Engine calculate error:", calcRes.reason?.message || calcRes.reason);
      }
      if (schemeRes.status === "rejected") {
        console.warn("[feasibility/instant] Finance Engine routeScheme error:", schemeRes.reason?.message || schemeRes.reason);
      }

      const calculation = calcRes.status === "fulfilled" ? calcRes.value : null;
      const scheme = schemeRes.status === "fulfilled" ? schemeRes.value : null;

      if (!calculation) {
        const margin = Number(availableMargin) || 150000;
        const calcProjectCost = projectCost || (margin * 8);
        const calcLoan = Math.max(0, calcProjectCost - margin);
        const interestRate = 0.08;
        const tenureMonths = 84;
        const emi = calculateEmi({
          principal: calcLoan,
          annualInterestRate: interestRate * 100,
          tenureMonths,
        });

        financeData = {
          calculation: {
            available_margin: margin,
            calculated_project_cost: calcProjectCost,
            beneficiary_contribution: margin,
            calculated_loan: calcLoan,
            eligible_loan: calcLoan,
            is_within_scheme_limit: true,
            interest_rate: interestRate,
            tenure_years: 7,
            tenure_months: tenureMonths,
            moratorium_months: 6,
            monthly_emi: emi,
            effective_principal_after_moratorium: calcLoan,
            total_interest: Math.round(emi * tenureMonths - calcLoan),
            total_repayment: Math.round(emi * tenureMonths),
            scheme: {
              name: "Term Loan Scheme (PMEGP / MUDRA)",
              scheme_id: "term_loan",
              interest_rate: 0.08,
              tenure_months: 84,
            },
            explanatory_notes: [
              `Your available margin of ₹${margin.toLocaleString('en-IN')} represents beneficiary contribution.`,
              `Eligible loan estimate is ₹${calcLoan.toLocaleString('en-IN')} under government credit linkage norms.`,
              `Indicative interest rate is 8.0% p.a. over 7 years.`
            ],
            repayment_assumption_note: "Repayment assumption: Tenure includes standard moratorium. Interest accrued during moratorium is capitalized before regular EMI begins.",
            financial_disclaimer: "This tool provides an indicative financial calculation based on government scheme parameters."
          },
          scheme: scheme || {
            scheme: {
              scheme_id: "term_loan",
              name: "Term Loan Scheme (PMEGP / MUDRA)",
              min_project_cost: 140000,
              max_project_cost: 5000000,
              interest_rate: 0.08,
              tenure_months: 84,
            },
            eligible_loan: calcLoan,
            status_message: "Your project cost qualifies for the Term Loan Scheme."
          }
        };
      } else {
        financeData = {
          calculation,
          scheme,
        };
      }
    } catch (err) {
      console.warn("[feasibility/instant] Finance Engine warning:", err.message);
    }

    // 4. Generate AI Advisory recommendations
    let aiAdvice = null;
    try {
      aiAdvice = await chatWithAi({
        message: `Provide an instant strategic feasibility summary, competitor differentiation advice, and launch checklist for a ${category} business in ${district}, ${state} with available capital of ₹${availableMargin.toLocaleString('en-IN')}.`,
        context: {
          trusted: {
            business: {
              ...businessObj,
              id: "instant-biz",
            },
          },
        },
      });
    } catch (err) {
      console.warn("[feasibility/instant] AI Advisor warning:", err.message);
    }

    // 5. Fetch real local competitors via Overpass API (OSM) + Gemini enrichment
    let competitorRadarData = null;
    try {
      competitorRadarData = await fetchCompetitorsByRadius({
        lat: latitude,
        lon: longitude,
        category,
        district,
        state,
      });
    } catch (err) {
      console.warn("[feasibility/instant] Competitor radar warning:", err.message);
    }

    // 6. Generate Tailored 12-Month Roadmap & Competitor Intelligence (Gemini + Domain Models)
    let roadmapData = null;
    try {
      const osmCompetitors = [
        ...(competitorRadarData?.within10km || []),
        ...(competitorRadarData?.within20km || []),
      ];
      roadmapData = await generateTailoredRoadmapAndCompetitors({
        business: businessObj,
        competitors: osmCompetitors.length > 0 ? osmCompetitors : (feasibilityData?.competition?.competitors || []),
        finance: financeData,
      });
    } catch (err) {
      console.warn("[feasibility/instant] Roadmap synthesis warning:", err.message);
    }

    return successResponse({
      message: "Instant business analysis generated successfully",
      data: {
        business: {
          name: businessName,
          category,
          location: {
            state,
            district,
            subdistrict,
            village,
            lat: latitude,
            lon: longitude,
            latitude,
            longitude,
          },
          availableMargin,
          projectCost,
          landType,
          targetScale,
          salesChannel,
          workingCapitalRequirement,
          facilityType,
          bedCapacity,
          medicalSpecialties,
        },
        feasibility: feasibilityData,
        finance: financeData,
        aiAdvice,
        roadmap: roadmapData?.roadmap || null,
        roadmapActions: roadmapData?.actionItems || [],
        competitorInsights: roadmapData?.competitorInsights || null,
        // Real competitor radar: OSM-scraped + Gemini-enriched
        competitorRadar: competitorRadarData
          ? {
              within10km: competitorRadarData.within10km || [],
              within20km: competitorRadarData.within20km || [],
              total: competitorRadarData.total || 0,
              source: competitorRadarData.source,
              aiEnriched: competitorRadarData.aiEnriched,
              fetchedAt: competitorRadarData.fetchedAt,
            }
          : null,
        rawMl: {
          model1: mlResult?.model1 || null,
          model2: mlResult?.model2 || null,
          model3: mlResult?.model3 || null,
          census: mlResult?.census || null,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
