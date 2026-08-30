import React from "react";
import { ReportDetailView } from "@/features/reports/components/ReportDetailView";
import { MOCK_REPORTS } from "@/features/reports/constants/mockData";
import { notFound } from "next/navigation";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Find report in mock data
  const report = MOCK_REPORTS.find(r => r.id === id);
  
  if (!report) {
    // If not in standard mock data, we could just render a placeholder 
    // or return 404. Since we simulate adding new reports, 
    // let's fallback to the first mock report if not found for demo purposes,
    // but ideally we'd use local storage or real API.
    // We will just show the first mock report for newly generated ones so it doesn't crash.
    const fallbackReport = {
      ...MOCK_REPORTS[0],
      id: id,
      title: "Generated Report Snapshot",
    };
    return <ReportDetailView report={fallbackReport} />;
  }

  return <ReportDetailView report={report} />;
}
