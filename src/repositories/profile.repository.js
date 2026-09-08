import { prisma } from "@/lib/prisma";


export async function findProfileByUserId(
  userId
) {
  return prisma.profile.findUnique({
    where: {
      userId,
    },
  });
}


export async function upsertProfile({
  userId,
  firstName,
  lastName,
  phone,
  locationId,
  availableCapital,
  income,
  businessExperience,
  skills,
  education,
}) {
  return prisma.profile.upsert({
    where: {
      userId,
    },

    update: {
      firstName,
      lastName,
      phone,
      locationId,
      availableCapital,
      income,
      businessExperience,
      skills,
      education,
    },

    create: {
      userId,
      firstName,
      lastName,
      phone,
      locationId,
      availableCapital,
      income,
      businessExperience,
      skills,
      education,
    },
  });
}