import {
  createReport,
  findReportsByUserId,
  findReportByIdAndUserId,
  updateReportByIdAndUserId,
} from "@/repositories/report.repository";

import {
  loadReportContext,
} from "@/services/report-data.service";

import {
  mapReport,
  mapReports,
} from "@/utils/report.mapper";

import {
  NotFoundError,
  BadRequestError,
} from "@/errors/http-error";

import reportsData from "@/data/reports.json";


function buildReportTitle({
  businessName,
  reportType,
}) {
  const name =
    businessName?.trim() ||
    "Business";


  const titleMap = {
    FEASIBILITY:
      "Feasibility Report",

    FINANCIAL:
      "Financial Report",

    BUSINESS_PLAN:
      "Business Plan",

    COMPREHENSIVE:
      "Comprehensive Business Report",
  };


  return `${name} - ${titleMap[reportType]}`;
}


export async function getReports({
  userId,
  query,
}) {
  const {
    page,
    limit,
    status,
    type,
    businessId,
    sortBy,
    sortOrder,
  } = query;


  const {
    reports,
    total,
  } =
    await findReportsByUserId({
      userId,

      page,
      limit,

      status,
      type,
      businessId,

      sortBy,
      sortOrder,
    });


  const totalPages =
    Math.ceil(
      total / limit
    );


  return {
    reports:
      mapReports(reports),

    pagination: {
      page,

      limit,

      total,

      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
}


export async function getReport({
  userId,
  reportId,
}) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
  const report = isUuid
    ? await findReportByIdAndUserId({
        reportId,
        userId,
      })
    : null;

  if (!report) {
    const mockReport = reportsData.find((r) => r.id === reportId);
    if (mockReport) {
      return mockReport;
    }

    throw new NotFoundError(
      "Report not found"
    );
  }

  return mapReport(
    report
  );
}


export async function generateReport({
  userId,
  data,
}) {
  /*
    First verify that the business
    belongs to the authenticated user
    and load clean report context.
  */
  const context =
    await loadReportContext({
      userId,
      businessId:
        data.businessId,
    });


  const title =
    buildReportTitle({
      businessName:
        context.business.name,

      reportType:
        data.type,
    });


  /*
    Actual PDF/file generation is
    intentionally NOT performed yet.

    We create the persistent report job
    in GENERATING state.
  */
  const report =
    await createReport({
      businessId:
        data.businessId,

      userId,

      title,

      type:
        data.type,
    });


  return {
    report:
      mapReport(report),

    generation: {
      status:
        "PENDING_GENERATOR",

      message:
        "Report record created. PDF generation is not configured yet.",
    },
  };
}


export async function getReportStatus({
  userId,
  reportId,
}) {
  const report =
    await findReportByIdAndUserId({
      reportId,
      userId,
    });


  if (!report) {
    throw new NotFoundError(
      "Report not found"
    );
  }


  return {
    id:
      report.id,

    businessId:
      report.businessId,

    type:
      report.type,

    status:
      report.status,

    generatedAt:
      report.generatedAt,

    updatedAt:
      report.updatedAt,
  };
}


export async function getReportDownload({
  userId,
  reportId,
}) {
  const report =
    await findReportByIdAndUserId({
      reportId,
      userId,
    });


  if (!report) {
    throw new NotFoundError(
      "Report not found"
    );
  }


  if (report.status !== "READY") {
    throw new BadRequestError(
      "Report is not ready for download"
    );
  }


  if (!report.fileUrl) {
    throw new BadRequestError(
      "Report file is not available"
    );
  }


  return {
    id:
      report.id,

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
  };
}

export async function markReportReady({
  userId,
  reportId,
  file,
}) {
  const report =
    await findReportByIdAndUserId({
      reportId,
      userId,
    });


  if (!report) {
    throw new NotFoundError(
      "Report not found"
    );
  }


  if (report.status !== "GENERATING") {
    throw new BadRequestError(
      "Only generating reports can be marked as ready"
    );
  }


  if (!file?.url) {
    throw new BadRequestError(
      "Report file URL is required"
    );
  }


  const updatedReport =
    await updateReportByIdAndUserId({
      reportId,
      userId,

      data: {
        status: "READY",

        fileName:
          file.name ?? null,

        fileUrl:
          file.url,

        fileSize:
          file.size !== undefined &&
          file.size !== null
            ? BigInt(file.size)
            : null,

        generatedAt:
          new Date(),
      },
    });


  return mapReport(
    updatedReport
  );
}


export async function markReportFailed({
  userId,
  reportId,
}) {
  const report =
    await findReportByIdAndUserId({
      reportId,
      userId,
    });


  if (!report) {
    throw new NotFoundError(
      "Report not found"
    );
  }


  if (report.status !== "GENERATING") {
    throw new BadRequestError(
      "Only generating reports can be marked as failed"
    );
  }


  const updatedReport =
    await updateReportByIdAndUserId({
      reportId,
      userId,

      data: {
        status: "FAILED",

        fileName: null,
        fileUrl: null,
        fileSize: null,
        generatedAt: null,
      },
    });


  return mapReport(
    updatedReport
  );
}