export function mapReportBusiness(
  business
) {
  if (!business) {
    return null;
  }

  return {
    id:
      business.id,

    name:
      business.name,

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
  };
}


export function mapReport(
  report
) {
  if (!report) {
    return null;
  }


  return {
    id:
      report.id,

    businessId:
      report.businessId,

    title:
      report.title,

    type:
      report.type,

    status:
      report.status,

    file: {
      name:
        report.fileName,

      url:
        report.fileUrl,

      size:
        report.fileSize !== null
          ? Number(
              report.fileSize
            )
          : null,
    },

    generatedAt:
      report.generatedAt,

    createdAt:
      report.createdAt,

    updatedAt:
      report.updatedAt,

    business:
      mapReportBusiness(
        report.business
      ),
  };
}


export function mapReports(
  reports
) {
  return reports.map(
    mapReport
  );
}