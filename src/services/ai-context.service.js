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


function mapProfileContext(profile) {
  if (!profile) {
    return null;
  }

  return {
    firstName:
      profile.firstName,

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


  let businessContext = null;


  if (businessId) {
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


  return {
    profile:
      mapProfileContext(profile),

    business:
      businessContext,
  };
}