import { prisma } from "@/lib/prisma";
import { authenticate } from "@/middlewares/auth.middleware";
import { generateTailoredRoadmapAndCompetitors } from "@/services/ai-roadmap.service";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    let user = null;

    try {
      const auth = await authenticate(request);
      user = auth?.user || null;
    } catch (_) {
      // Allow unauthenticated demo read if valid business ID exists
    }

    // Attempt to find business in database
    let business = null;
    try {
      business = await prisma.business.findFirst({
        where: { id },
        include: {
          category: true,
          location: true,
        },
      });
      // If location relation wasn't loaded but locationId exists, load location
      if (business && !business.location && business.locationId) {
        business.location = await prisma.location.findUnique({
          where: { id: business.locationId },
        });
      }
    } catch (dbErr) {
      console.warn("[business/roadmap] DB query warning:", dbErr.message);
    }

    const businessName = business?.name || "Target Enterprise";
    
    // Infer true category accurately from category relation or business name
    let categoryName = business?.category?.name || "";
    const lowerName = businessName.toLowerCase();
    if (!categoryName || categoryName === "Agriculture" || categoryName === "Food Processing") {
      if (lowerName.includes("health") || lowerName.includes("hospital") || lowerName.includes("clinic") || lowerName.includes("medical")) {
        categoryName = "Healthcare & Hospital";
      } else if (lowerName.includes("dairy") || lowerName.includes("milk")) {
        categoryName = "Dairy Farming";
      } else if (lowerName.includes("cold") || lowerName.includes("storage")) {
        categoryName = "Cold Storage";
      } else if (lowerName.includes("oil") || lowerName.includes("mill")) {
        categoryName = "Agro Processing";
      } else if (lowerName.includes("poultry") || lowerName.includes("egg")) {
        categoryName = "Poultry Farming";
      } else if (lowerName.includes("food") || lowerName.includes("processing")) {
        categoryName = "Food Processing";
      } else if (!categoryName) {
        categoryName = "Food Processing";
      }
    }

    // Infer location accurately from business location or business name
    let locationObj = business?.location || null;
    if (!locationObj) {
      if (lowerName.includes("barasat")) {
        locationObj = { state: "West Bengal", district: "North 24 Parganas", block: "Barasat" };
      } else if (lowerName.includes("kolkata")) {
        locationObj = { state: "West Bengal", district: "Kolkata", block: "Kolkata" };
      } else if (lowerName.includes("maldah")) {
        locationObj = { state: "West Bengal", district: "Maldah", block: "Maldah" };
      } else if (lowerName.includes("satara")) {
        locationObj = { state: "Maharashtra", district: "Satara", block: "Satara" };
      } else if (lowerName.includes("anand")) {
        locationObj = { state: "Gujarat", district: "Anand", block: "Anand" };
      } else {
        locationObj = { state: "Gujarat", district: "Anand", block: "Anand" };
      }
    }

    const availableMargin = Number(business?.availableMargin || 250000);
    const expectedRevenue = Number(business?.expectedRevenue || availableMargin * 3);
    const projectCost = availableMargin * 8;
    const workingCapitalRequirement = Math.round(projectCost * 0.15);

    const businessObj = {
      id,
      name: businessName,
      category: { name: categoryName },
      location: locationObj,
      availableMargin,
      projectCost,
      workingCapitalRequirement,
      targetScale: "Commercial Operational Scale",
      salesChannel: "Direct & Regional Wholesale",
      expectedRevenue,
    };

    const roadmapData = await generateTailoredRoadmapAndCompetitors({
      business: businessObj,
      competitors: [],
      finance: null,
    });

    const roadmapPayload = {
      id: `roadmap-${id}`,
      businessId: id,
      businessName,
      location: `${locationObj.district || locationObj.block || "District"}, ${locationObj.state || "State"}`,
      actions: roadmapData?.actionItems || [],
      phases: roadmapData?.roadmap?.phases || [],
      competitorInsights: roadmapData?.competitorInsights || null,
      source: roadmapData?.source || "ai-advisor",
    };

    return successResponse({
      message: "Action roadmap generated successfully",
      data: roadmapPayload,
    });
  } catch (error) {
    return handleError(error);
  }
}
