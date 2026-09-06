import {
  getReports,
  getReport,
  generateReport,
  getReportStatus,
  getReportDownload,
} from "@/services/report.service";


export async function getReportsController(
  user,
  validatedQuery
) {
  const result =
    await getReports({
      userId:
        user.id,

      query:
        validatedQuery,
    });


  return {
    message:
      "Reports fetched successfully",

    data:
      result,
  };
}


export async function getReportController(
  user,
  reportId
) {
  const report =
    await getReport({
      userId:
        user.id,

      reportId,
    });


  return {
    message:
      "Report fetched successfully",

    data: {
      report,
    },
  };
}


export async function generateReportController(
  user,
  validatedData
) {
  const result =
    await generateReport({
      userId:
        user.id,

      data:
        validatedData,
    });


  return {
    message:
      "Report generation request created successfully",

    data:
      result,
  };
}


export async function getReportStatusController(
  user,
  reportId
) {
  const status =
    await getReportStatus({
      userId:
        user.id,

      reportId,
    });


  return {
    message:
      "Report status fetched successfully",

    data: {
      status,
    },
  };
}


export async function getReportDownloadController(
  user,
  reportId
) {
  const download =
    await getReportDownload({
      userId:
        user.id,

      reportId,
    });


  return {
    message:
      "Report download information fetched successfully",

    data: {
      download,
    },
  };
}