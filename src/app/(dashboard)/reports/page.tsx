"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { ReportList } from "@/features/reports/components/ReportList";
import { ReportGenerator } from "@/features/reports/components/ReportGenerator";
import { MOCK_REPORTS } from "@/features/reports/constants/mockData";
import { FileText, Plus } from "lucide-react";
import { Report } from "@/features/reports/types";
import { reportApi } from "@/features/reports/api/reportApi";

export default function ReportsPage() {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reports, setReports] = useState<Report[]>(MOCK_REPORTS);

  useEffect(() => {
    reportApi.list()
      .then(() => console.log("Report list request sent. Response consumption blocked."))
      .catch((err) => {
        console.warn("Backend request failed or offline. Proceeding with mock data for UI testing.");
      });
  }, []);

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
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-secondary flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {t("reports.title") || "Business Reports"}
          </h1>
          <p className="text-secondary-muted mt-1">
            {t("reports.subtitle") || "Access and generate comprehensive business intelligence reports."}
          </p>
        </div>
        
        {!isGenerating && (
          <button
            onClick={() => setIsGenerating(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
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
