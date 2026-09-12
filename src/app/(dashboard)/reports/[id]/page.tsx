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

  if (!report) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#81cc87]/10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-sm font-semibold text-slate-700">Synthesizing Detailed Project Report (DPR)...</p>
        </div>
      </div>
    );
  }

  return <ReportDetailView report={report} />;
}
