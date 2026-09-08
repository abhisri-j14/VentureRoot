"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { ReportList } from "@/features/reports/components/ReportList";
import { ReportGenerator } from "@/features/reports/components/ReportGenerator";
import { FileText, Plus } from "lucide-react";
import { useReports } from "@/lib/data/reports";
import { Report } from "@/features/reports/types";

export default function ReportsPage() {
  const { t } = useTranslation();
  const { data: fetchedReports, isLoading } = useReports();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "FEASIBILITY" | "BUSINESS_PLAN" | "MARKET_RESEARCH">("ALL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    if (fetchedReports) {
      setReports(fetchedReports as Report[]);
    }
  }, [fetchedReports]);

  const handleGenerateComplete = () => {
    setIsGenerating(false);
    // Simulate adding a new report to the list
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title: "New AI Business Advisory Report",
      businessId: "biz-new",
      businessName: "New Selected Business",
      status: "READY",
      createdAt: new Date().toISOString(),
      type: "Comprehensive Advisory",
    };
    setReports([newReport, ...reports]);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-[22px] font-bold text-[#242424] tracking-tight leading-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#242424]" />
            {t("reports.title") || "Business Reports"}
          </h1>
          <p className="font-sans text-[14px] text-slate-500 font-medium mt-0.5">
            {t("reports.subtitle") || "Access and generate comprehensive business intelligence reports."}
          </p>
        </div>
        
        {!isGenerating && (
          <button
            onClick={() => setIsGenerating(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-sans text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {t("reports.generate.new") || "Generate New Report"}
          </button>
        )}
      </div>

      {isGenerating ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <ReportGenerator 
            onCancel={() => setIsGenerating(false)}
            onComplete={handleGenerateComplete}
          />
        </div>
      ) : (
        <div className="flex-1">
          <ReportList 
            reports={reports} 
            onGenerateNew={() => setIsGenerating(true)} 
          />
        </div>
      )}
    </div>
  );
}
