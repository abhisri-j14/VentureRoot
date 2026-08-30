"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Report } from "../types";
import { ArrowLeft, Download, Printer, Share2, Loader2 } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MarketCard } from "@/features/feasibility/components/MarketCard";
import { OpportunityCard } from "@/features/feasibility/components/OpportunityCard";
import { CompetitionCard } from "@/features/feasibility/components/CompetitionCard";
import { SWOTCard } from "@/features/feasibility/components/SWOTCard";
import { RiskCard } from "@/features/feasibility/components/RiskCard";
import { PricingCard } from "@/features/feasibility/components/PricingCard";
import { EditorialAreaChart, EditorialBarChart } from "@/components/ui/charts";
import { reportApi } from "../api/reportApi";

interface ReportDetailViewProps {
  report: Report;
}

export const ReportDetailView = ({ report }: ReportDetailViewProps) => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Fire the GET request on mount
    reportApi.get(report.id)
      .then(() => console.log("Report detail request sent. Response consumption blocked."))
      .catch((err) => {
        console.warn("Backend request failed or offline. Proceeding with mock data for UI testing.");
      });
  }, [report.id]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await reportApi.download(report.id);
      
      // TODO: BACKEND CONFIRMATION REQUIRED
      // Assuming PDF download. Need headers/content-type confirmation.
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VentureRoot_Report_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Backend request failed or offline. Cannot download report.");
      alert("Report download is currently unavailable (Backend offline).");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-12">
      {/* Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Link 
          href="/reports" 
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("reports.back") || "Back to Reports"}
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/business/${report.businessId}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors shadow-sm text-sm"
          >
            {t("business.viewBusiness") || "View Business"}
          </Link>

          <Link
            href={`/business/${report.businessId}/roadmap`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors shadow-sm text-sm"
          >
            {t("roadmap.viewActionRoadmap") || "View Action Roadmap"}
          </Link>
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-secondary font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t("reports.print") || "Print"}</span>
          </button>

          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-secondary font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm">
            <Share2 className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t("reports.export") || "Export"}</span>
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isDownloading ? "Downloading..." : (t("reports.download") || "Download PDF")}</span>
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
              {report.type}
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary leading-tight mb-2">
              {report.title}
            </h1>
            <p className="text-secondary-muted text-lg">
              {t("reports.for") || "Prepared for"} <span className="font-semibold text-secondary">{report.businessName}</span>
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("reports.date") || "Generated On"}</span>
            <span className="font-medium text-secondary">{new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("reports.location") || "Location"}</span>
            <span className="font-medium text-secondary">{report.location || "N/A"}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("reports.status.label") || "Status"}</span>
            <span className="font-medium text-green-700">{t("reports.status.ready") || "READY"}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t("reports.ref") || "Reference ID"}</span>
            <span className="font-medium text-slate-500 font-mono text-sm">{report.id}</span>
          </div>
        </div>
      </div>

      {/* Intelligence Sections */}
      {report.feasibilityData ? (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-12 gap-6">
            <MarketCard data={report.feasibilityData.market} />
            <OpportunityCard data={report.feasibilityData.opportunity} />
          </div>
          
          <CompetitionCard data={report.feasibilityData.competition} />
          
          <div className="grid grid-cols-12 gap-6">
            <PricingCard data={report.feasibilityData.pricing} />
            <RiskCard data={report.feasibilityData.risks} />
          </div>
          
          <SWOTCard data={report.feasibilityData.swot} />
          
          {/* Financial Summary Visualization */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-heading font-bold text-secondary mb-6">{t("reports.financial") || "Financial Projections"}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col h-[300px]">
                <h4 className="text-sm font-semibold text-secondary-muted mb-4 uppercase tracking-wider">Projected Revenue Growth</h4>
                <div className="flex-1 w-full">
                  <EditorialAreaChart 
                    data={[
                      { year: 'Y1', amount: 150000 },
                      { year: 'Y2', amount: 280000 },
                      { year: 'Y3', amount: 450000 },
                      { year: 'Y4', amount: 680000 },
                      { year: 'Y5', amount: 950000 },
                    ]}
                    xKey="year"
                    yKey="amount"
                  />
                </div>
              </div>
              <div className="flex flex-col h-[300px]">
                <h4 className="text-sm font-semibold text-secondary-muted mb-4 uppercase tracking-wider">Expenditure Breakdown</h4>
                <div className="flex-1 w-full">
                  <EditorialBarChart 
                    data={[
                      { phase: 'Setup', value: 500000 },
                      { phase: 'Q1 OpEx', value: 120000 },
                      { phase: 'Q2 OpEx', value: 150000 },
                      { phase: 'Q3 OpEx', value: 180000 },
                    ]}
                    xKey="phase"
                    yKey="value"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-secondary-muted bg-white border border-slate-200 rounded-2xl">
          {t("reports.nodata") || "No detailed intelligence data available for this report."}
        </div>
      )}
    </div>
  );
};
