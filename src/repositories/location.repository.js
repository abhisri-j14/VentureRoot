import { prisma } from "@/lib/prisma";


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


  let currentLocation = districtRecord;


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

    currentLocation = blockRecord;


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