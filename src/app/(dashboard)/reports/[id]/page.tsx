"use client";
import React, { useState, useEffect } from "react";
import { ReportDetailView } from "@/features/reports/components/ReportDetailView";
import { Report } from "@/features/reports/types";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getReportDetails } from "@/lib/data/reports";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getReportDetails(id)
        .then((r) => {
          setReport(r as Report | null);
          setIsLoading(false);
        })
        .catch(() => {
          setReport(null);
          setIsLoading(false);
        });
    }
  }, [id]);

  if (isLoading || !id) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#81cc87]/10">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-sm font-semibold text-slate-700">Synthesizing Detailed Project Report (DPR)...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center gap-4 shadow-sm">
          <FileText className="w-12 h-12 text-slate-400" />
          <h2 className="font-heading text-xl font-bold text-slate-800">Report Not Found</h2>
          <p className="font-sans text-sm text-slate-500">
            This business report does not exist or has not been generated for your account.
          </p>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  return <ReportDetailView report={report} />;
}
