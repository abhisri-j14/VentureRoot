import { prisma } from "@/lib/prisma";

export async function createBusiness({
  userId,
  categoryId,
  locationId,
  name,
  description,
  availableMargin,
  existingResources,
  expectedRevenue,
}) {
  return prisma.business.create({
    data: {
      userId,
      categoryId,
      locationId,
      name,
      description,
      availableMargin,
      existingResources,
      expectedRevenue,
    },

    include: {
      category: true,
      location: true,
    },
  });
}

export async function findBusinessesByUserId({
  userId,
  page = 1,
  limit = 10,
  status,
  categoryId,
  search,
  sortBy = "createdAt",
  sortOrder = "desc",
}) {
  // Convert pagination values to numbers
  const currentPage = Number(page) || 1;
  const pageLimit = Number(limit) || 10;

  const skip = (currentPage - 1) * pageLimit;

  // Search must be a string
  const searchText =
    typeof search === "string"
      ? search.trim()
      : "";

  const where = {
    userId,

    ...(status && {
      status,
    }),

    ...(categoryId && {
      categoryId,
    }),

    ...(searchText && {
      OR: [
        {
          name: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchText,
            mode: "insensitive",
          },
        },
        {
          existingResources: {
            contains: searchText,
            mode: "insensitive",
          },
        },
      ],
    }),
  };

  // Only allow fields that actually exist in Business
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "name",
    "expectedRevenue",
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const safeSortOrder =
    sortOrder === "asc"
      ? "asc"
      : "desc";

  const [businesses, total] =
    await prisma.$transaction([
      prisma.business.findMany({
        where,

        include: {
          category: true,
          location: true,
        },

        skip,
        take: pageLimit,

        orderBy: {
          [safeSortBy]: safeSortOrder,
        },
      }),

      prisma.business.count({
        where,
      }),
    ]);

  return {
    businesses,
    total,
  };
}

export async function findBusinessByIdAndUserId({
  businessId,
  userId,
}) {
  return prisma.business.findFirst({
    where: {
      id: businessId,
      userId,
    },

    include: {
      category: true,
      location: true,
    },
  });
}

export async function updateBusinessByIdAndUserId({
  businessId,
  userId,
  data,
}) {
  const business =
    await prisma.business.findFirst({
      where: {
        id: businessId,
        userId,
      },

      select: {
        id: true,
      },
    });

  if (!business) {
    return null;
  }

  return prisma.business.update({
    where: {
      id: business.id,
    },

    data,

    include: {
      category: true,
      location: true,
    },
  });
}

export async function deleteBusinessByIdAndUserId({
  businessId,
  userId,
}) {
  const business =
    await prisma.business.findFirst({
      where: {
        id: businessId,
        userId,
      },

      select: {
        id: true,
      },
    });

  if (!business) {
    return null;
  }

  return prisma.business.delete({
    where: {
      id: business.id,
    },
  });
}