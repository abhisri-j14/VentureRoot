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
  buildLocationResponse,
} from "@/utils/location.mapper";

import {
  NotFoundError,
} from "@/errors/http-error";


function mapBusinessReportContext(
  business,
  location
) {
  return {
    id: business.id,

    name:
      business.name,

    description:
      business.description,

    status:
      business.status,

    category:
      business.category
        ? {
            id:
              business.category.id,

            name:
              business.category.name,

            slug:
              business.category.slug,
          }
        : null,

    location:
      buildLocationResponse(
        location
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
  };
}


function mapProfileReportContext(
  profile
) {
  if (!profile) {
    return null;
  }

  return {
    firstName:
      profile.firstName,

    lastName:
      profile.lastName,

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
      Array.isArray(
        profile.skills
      )
        ? profile.skills
        : [],

    education:
      profile.education,
  };
}


export async function loadReportContext({
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


  let location = null;


  if (business.locationId) {
    location =
      await findLocationWithParents(
        business.locationId
      );
  }


  return {
    business:
      mapBusinessReportContext(
        business,
        location
      ),

    profile:
      mapProfileReportContext(
        profile
      ),
  };
}