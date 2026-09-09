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

  const stateRecord =
    await prisma.location.findFirst({
      where: {
        name: { equals: state.trim(), mode: "insensitive" },
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
        name: { equals: district.trim(), mode: "insensitive" },
        type: "DISTRICT",
        parentId: stateRecord.id,
      },
    });

  if (!districtRecord) {
    return null;
  }

  let currentLocation =
    districtRecord;

  if (block && block.trim()) {
    const blockRecord =
      await prisma.location.findFirst({
        where: {
          name: { equals: block.trim(), mode: "insensitive" },
          type: "BLOCK",
          parentId: districtRecord.id,
        },
      });

    if (!blockRecord) {
      return currentLocation; // fallback to district if block not pre-seeded
    }

    currentLocation =
      blockRecord;

    if (village && village.trim()) {
      const villageRecord =
        await prisma.location.findFirst({
          where: {
            name: { equals: village.trim(), mode: "insensitive" },
            type: "VILLAGE",
            parentId: blockRecord.id,
          },
        });

      if (!villageRecord) {
        return currentLocation; // fallback to block if village not pre-seeded
      }

      currentLocation =
        villageRecord;
    }
  }

  return currentLocation;
}

export async function findOrCreateLocationByHierarchy({
  state,
  district,
  block,
  village,
}) {
  if (!state || !district) return null;

  const stateName = state.trim();
  const districtName = district.trim();

  let stateRecord = await prisma.location.findFirst({
    where: {
      name: { equals: stateName, mode: "insensitive" },
      type: "STATE",
      parentId: null,
    },
  });

  if (!stateRecord) {
    stateRecord = await prisma.location.create({
      data: {
        name: stateName,
        type: "STATE",
        parentId: null,
      },
    });
  }

  let districtRecord = await prisma.location.findFirst({
    where: {
      name: { equals: districtName, mode: "insensitive" },
      type: "DISTRICT",
      parentId: stateRecord.id,
    },
  });

  if (!districtRecord) {
    districtRecord = await prisma.location.create({
      data: {
        name: districtName,
        type: "DISTRICT",
        parentId: stateRecord.id,
      },
    });
  }

  let currentLocation = districtRecord;

  if (block && block.trim()) {
    const blockName = block.trim();
    let blockRecord = await prisma.location.findFirst({
      where: {
        name: { equals: blockName, mode: "insensitive" },
        type: "BLOCK",
        parentId: districtRecord.id,
      },
    });

    if (!blockRecord) {
      blockRecord = await prisma.location.create({
        data: {
          name: blockName,
          type: "BLOCK",
          parentId: districtRecord.id,
        },
      });
    }

    currentLocation = blockRecord;

    if (village && village.trim()) {
      const villageName = village.trim();
      let villageRecord = await prisma.location.findFirst({
        where: {
          name: { equals: villageName, mode: "insensitive" },
          type: "VILLAGE",
          parentId: blockRecord.id,
        },
      });

      if (!villageRecord) {
        villageRecord = await prisma.location.create({
          data: {
            name: villageName,
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