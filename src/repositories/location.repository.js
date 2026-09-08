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
  if (!state || !district) return null;

  let stateRecord = await prisma.location.findFirst({
    where: {
      name: { equals: state.trim(), mode: "insensitive" },
      type: "STATE",
      parentId: null,
    },
  });

  if (!stateRecord) {
    stateRecord = await prisma.location.create({
      data: {
        name: state.trim(),
        type: "STATE",
        parentId: null,
      },
    });
  }

  let districtRecord = await prisma.location.findFirst({
    where: {
      name: { equals: district.trim(), mode: "insensitive" },
      type: "DISTRICT",
      parentId: stateRecord.id,
    },
  });

  if (!districtRecord) {
    districtRecord = await prisma.location.create({
      data: {
        name: district.trim(),
        type: "DISTRICT",
        parentId: stateRecord.id,
      },
    });
  }

  let currentLocation = districtRecord;

  if (block && block.trim()) {
    let blockRecord = await prisma.location.findFirst({
      where: {
        name: { equals: block.trim(), mode: "insensitive" },
        type: "BLOCK",
        parentId: districtRecord.id,
      },
    });

    if (!blockRecord) {
      blockRecord = await prisma.location.create({
        data: {
          name: block.trim(),
          type: "BLOCK",
          parentId: districtRecord.id,
        },
      });
    }

    currentLocation = blockRecord;

    if (village && village.trim()) {
      let villageRecord = await prisma.location.findFirst({
        where: {
          name: { equals: village.trim(), mode: "insensitive" },
          type: "VILLAGE",
          parentId: blockRecord.id,
        },
      });

      if (!villageRecord) {
        villageRecord = await prisma.location.create({
          data: {
            name: village.trim(),
            type: "VILLAGE",
            parentId: blockRecord.id,
          },
        });
      }

      currentLocation = villageRecord;
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