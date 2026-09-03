"use client";
import React, { useState, useEffect } from "react";
import { ReportDetailView } from "@/features/reports/components/ReportDetailView";
import { Report } from "@/features/reports/types";
import { notFound } from "next/navigation";
import { getReportDetails } from "@/lib/data/reports";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) {
      getReportDetails(id).then(r => {
        if (r) setReport(r as Report);
        else {
           setReport({
             id: id,
             title: "Generated Report Snapshot",
             businessId: "biz-mock",
             businessName: "Mock Business",
             status: "READY",
             createdAt: new Date().toISOString(),
             type: "Comprehensive Advisory",
           });
        }
      });
    }
  }, [id]);

  if (!report) return null;

  return <ReportDetailView report={report} />;
}
