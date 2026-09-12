import { predictFeasibility } from "@/integrations/feasibility-ml.client";
import { mapMlPredictionToFeasibility } from "@/utils/feasibility.mapper";
import * as financeClient from "@/integrations/finance.client";
import { chatWithAi } from "@/integrations/ai.client";
import { generateTailoredRoadmapAndCompetitors } from "@/services/ai-roadmap.service";
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

    // 3. Call Python Finance Engine on port 8004
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

      financeData = {
        calculation: calcRes.status === "fulfilled" ? calcRes.value : null,
        scheme: schemeRes.status === "fulfilled" ? schemeRes.value : null,
      };
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

    // 5. Generate Tailored 12-Month Roadmap & Competitor Intelligence (Gemini + Domain Models)
    let roadmapData = null;
    try {
      roadmapData = await generateTailoredRoadmapAndCompetitors({
        business: businessObj,
        competitors: feasibilityData?.competition?.competitors || [],
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
