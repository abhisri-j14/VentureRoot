import { prisma } from "@/lib/prisma";


export async function findStates() {
  return prisma.location.findMany({
    where: {
      type: "STATE",
      parentId: null,
    },

    orderBy: {
      name: "asc",
    },
  });
}


export async function findDistrictsByStateId(
  stateId
) {
  return prisma.location.findMany({
    where: {
      type: "DISTRICT",
      parentId: stateId,
    },

    orderBy: {
      name: "asc",
    },
  });
}


export async function findBlocksByDistrictId(
  districtId
) {
  return prisma.location.findMany({
    where: {
      type: "BLOCK",
      parentId: districtId,
    },

    orderBy: {
      name: "asc",
    },
  });
}


export async function findVillagesByBlockId(
  blockId
) {
  return prisma.location.findMany({
    where: {
      type: "VILLAGE",
      parentId: blockId,
    },

    orderBy: {
      name: "asc",
    },
  });
}


export async function searchLocations({
  query,
  limit,
}) {
  return prisma.location.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },

        {
          code: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },

    select: {
      id: true,
      name: true,
      code: true,
      type: true,
    },

    orderBy: {
      name: "asc",
    },

    take: limit,
  });
}


export async function findLocationById(
  locationId
) {
  return prisma.location.findUnique({
    where: {
      id: locationId,
    },
  });
}


export async function findLocationByHierarchy({
  state,
  district,
  block,
  village,
}) {
  const stateRecord =
    await prisma.location.findFirst({
      where: {
        name: state,
        type: "STATE",
        parentId: null,
      },
    });

  if (!stateRecord) {
    return null;
  }


  const districtRecord =
    await prisma.location.findFirst({
      where: {
        name: district,
        type: "DISTRICT",
        parentId: stateRecord.id,
      },
    });

  if (!districtRecord) {
    return null;
  }


  let currentLocation =
    districtRecord;


  if (block) {
    const blockRecord =
      await prisma.location.findFirst({
        where: {
          name: block,
          type: "BLOCK",
          parentId: districtRecord.id,
        },
      });

    if (!blockRecord) {
      return null;
    }

    currentLocation =
      blockRecord;


    if (village) {
      const villageRecord =
        await prisma.location.findFirst({
          where: {
            name: village,
            type: "VILLAGE",
            parentId: blockRecord.id,
          },
        });

      if (!villageRecord) {
        return null;
      }

      currentLocation =
        villageRecord;
    }
  }


  return currentLocation;
}


export async function findLocationWithParents(
  locationId
) {
  return prisma.location.findUnique({
    where: {
      id: locationId,
    },

    include: {
      parent: {
        include: {
          parent: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
  });
}