import { prisma } from "@/lib/prisma";


const reportInclude = {
  business: {
    select: {
      id: true,
      name: true,
      status: true,

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};


export async function createReport({
  businessId,
  userId,
  title,
  type,
}) {
  return prisma.report.create({
    data: {
      businessId,
      userId,
      title,
      type,
      status: "GENERATING",
    },

    include:
      reportInclude,
  });
}


export async function findReportsByUserId({
  userId,

  page,
  limit,

  status,
  type,
  businessId,

  sortBy,
  sortOrder,
}) {
  const where = {
    userId,

    ...(status && {
      status,
    }),

    ...(type && {
      type,
    }),

    ...(businessId && {
      businessId,
    }),
  };


  const skip =
    (page - 1) * limit;


  const [
    reports,
    total,
  ] =
    await prisma.$transaction([
      prisma.report.findMany({
        where,

        include:
          reportInclude,

        orderBy: {
          [sortBy]:
            sortOrder,
        },

        skip,

        take: limit,
      }),

      prisma.report.count({
        where,
      }),
    ]);


  return {
    reports,
    total,
  };
}


export async function findReportByIdAndUserId({
  reportId,
  userId,
}) {
  return prisma.report.findFirst({
    where: {
      id: reportId,
      userId,
    },

    include:
      reportInclude,
  });
}


export async function updateReportByIdAndUserId({
  reportId,
  userId,
  data,
}) {
  const result =
    await prisma.report.updateMany({
      where: {
        id: reportId,
        userId,
      },

      data,
    });


  if (result.count === 0) {
    return null;
  }


  return findReportByIdAndUserId({
    reportId,
    userId,
  });
}