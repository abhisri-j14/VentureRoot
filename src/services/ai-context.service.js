import {
  findBusinessByIdAndUserId,
  findBusinessesByUserId,
} from "@/repositories/business.repository";

import {
  findProfileByUserId,
} from "@/repositories/profile.repository";

import {
  findLocationWithParents,
} from "@/repositories/location.repository";

import {
  NotFoundError,
} from "@/errors/http-error";

import {
  buildLocationResponse,
} from "@/utils/location.mapper";


function mapBusinessContext(
  business,
  fullLocation
) {
  return {
    id: business.id,

    name:
      business.name,

    description:
      business.description,

    category:
      business.category
        ? {
            id: business.category.id,
            name: business.category.name,
            slug: business.category.slug,
          }
        : null,

    location:
      buildLocationResponse(
        fullLocation
      ),

    availableMargin:
      business.availableMargin !== null
        ? Number(
            business.availableMargin
          )
        : null,

    existingResources:
      business.existingResources,

    expectedRevenue:
      business.expectedRevenue !== null
        ? Number(
            business.expectedRevenue
          )
        : null,

    status:
      business.status,
  };
}


function mapProfileContext(profile, fullLocation = null) {
  if (!profile) {
    return null;
  }

  return {
    firstName:
      profile.firstName,

    lastName:
      profile.lastName || null,

    phone:
      profile.phone || null,

    location:
      fullLocation
        ? buildLocationResponse(fullLocation)
        : null,

    businessExperience:
      profile.businessExperience,

    availableCapital:
      profile.availableCapital !== null
        ? Number(
            profile.availableCapital
          )
        : null,

    income:
      profile.income !== null
        ? Number(profile.income)
        : null,

    skills:
      Array.isArray(profile.skills)
        ? profile.skills
        : [],

    education:
      profile.education,
  };
}


export async function loadAiContext({
  userId,
  businessId = null,
}) {
  const profile =
    await findProfileByUserId(
      userId
    );

  let profileLocation = null;
  if (profile?.locationId) {
    try {
      profileLocation = await findLocationWithParents(profile.locationId);
    } catch {
      // Non-blocking location fetch
    }
  }

  let targetBusinessId = businessId;

  // Auto-discover user's active/latest business if not explicitly provided
  if (!targetBusinessId) {
    try {
      const [businesses] = await findBusinessesByUserId({
        userId,
        limit: 1,
      });
      if (businesses && businesses.length > 0) {
        targetBusinessId = businesses[0].id;
      }
    } catch (e) {
      console.warn("[ai-context.service] Auto-discovery of business fallback:", e?.message);
    }
  }

  let businessContext = null;

  if (targetBusinessId) {
    const business =
      await findBusinessByIdAndUserId({
        businessId: targetBusinessId,
        userId,
      });

    if (business) {
      let fullLocation = null;

      if (business.locationId) {
        fullLocation =
          await findLocationWithParents(
            business.locationId
          );
      }

      businessContext =
        mapBusinessContext(
          business,
          fullLocation
        );
    }
  }

  return {
    profile:
      mapProfileContext(profile, profileLocation),

    business:
      businessContext,
  };
}