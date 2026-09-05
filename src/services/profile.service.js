import {
  findProfileByUserId,
  upsertProfile,
} from "@/repositories/profile.repository";
import {
  buildLocationResponse,
} from "@/utils/location.mapper";

import {
  findLocationByHierarchy,
  findLocationWithParents,
} from "@/repositories/location.repository";

import { BadRequestError } from "@/errors/http-error";


function splitFullName(fullName) {
  const parts =
    fullName.trim().split(/\s+/);

  return {
    firstName: parts[0],

    lastName:
      parts.length > 1
        ? parts.slice(1).join(" ")
        : null,
  };
}

function mapProfileResponse({
  profile,
  email,
  location,
}) {
  if (!profile) {
    return {
      profile: null,
      onboardingCompleted: false,
    };
  }

  return {
    profile: {
      fullName: [
        profile.firstName,
        profile.lastName,
      ]
        .filter(Boolean)
        .join(" "),

      email,

      phone: profile.phone,

      location:
        buildLocationResponse(location),

      financial: {
        availableCapital:
          profile.availableCapital !== null
            ? Number(profile.availableCapital)
            : null,

        income:
          profile.income !== null
            ? Number(profile.income)
            : null,
      },

      experience: {
        businessExperience:
          profile.businessExperience,

        skills:
          profile.skills ?? [],

        education:
          profile.education,
      },
    },

    onboardingCompleted:
    isOnboardingCompleted(profile),  };
}


export async function getMyProfile(user) {
  const profile =
    await findProfileByUserId(user.id);

  if (!profile) {
    return {
      profile: null,
      onboardingCompleted: false,
    };
  }

  let location = null;

  if (profile.locationId) {
    location =
      await findLocationWithParents(
        profile.locationId
      );
  }

  return mapProfileResponse({
    profile,
    email: user.email ?? null,
    location,
  });
}


export async function upsertMyProfile(
  user,
  data
) {
  const {
    firstName,
    lastName,
  } = splitFullName(data.fullName);


  const location =
    await findLocationByHierarchy({
      state: data.location.state,
      district: data.location.district,
      block: data.location.block,
      village: data.location.village,
    });


  if (!location) {
    throw new BadRequestError(
      "Invalid location hierarchy"
    );
  }


  const profile =
    await upsertProfile({
      userId: user.id,

      firstName,
      lastName,

      phone:
        data.phone ?? null,

      locationId:
        location.id,

      availableCapital:
        data.financial.availableCapital,

      income:
        data.financial.income,

      businessExperience:
        data.experience.businessExperience,

      skills:
        data.experience.skills ?? [],

      education:
        data.experience.education ?? null,
    });


  const fullLocation =
    await findLocationWithParents(
      profile.locationId
    );


  return mapProfileResponse({
    profile,
    email: user.email ?? null,
    location: fullLocation,
  });
}

function isOnboardingCompleted(profile) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.firstName &&
    profile.locationId &&
    profile.availableCapital !== null &&
    profile.income !== null &&
    profile.businessExperience
  );
}