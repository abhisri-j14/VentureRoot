import {
  findBusinessByIdAndUserId,
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


function mapBusinessForFeasibility(
  business,
  location
) {
  return {
    id: business.id,

    name: business.name,

    description:
      business.description,

    category: business.category
      ? {
          id: business.category.id,
          name: business.category.name,
          slug: business.category.slug,
        }
      : null,

    location:
      buildLocationResponse(
        location
      ),

    availableMargin:
      Number(
        business.availableMargin
      ),

    existingResources:
      business.existingResources,

    expectedRevenue:
      Number(
        business.expectedRevenue
      ),

    status:
      business.status,
  };
}


function mapProfileForFeasibility(
  profile
) {
  if (!profile) {
    return null;
  }

  return {
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

    businessExperience:
      profile.businessExperience,

    skills:
      Array.isArray(profile.skills)
        ? profile.skills
        : [],

    education:
      profile.education,
  };
}


export async function loadFeasibilityData({
  userId,
  businessId,
}) {
  const business =
    await findBusinessByIdAndUserId({
      businessId,
      userId,
    });


  if (!business) {
    throw new NotFoundError(
      "Business not found"
    );
  }


  const profile =
    await findProfileByUserId(
      userId
    );


  let fullLocation = null;

  if (business.locationId) {
    fullLocation =
      await findLocationWithParents(
        business.locationId
      );
  }


  return {
    business:
      mapBusinessForFeasibility(
        business,
        fullLocation
      ),

    profile:
      mapProfileForFeasibility(
        profile
      ),
  };
}