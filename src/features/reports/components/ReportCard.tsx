import React from "react";
import Link from "next/link";
import { Report } from "../types";
import { FileText, Clock, MapPin, Building, AlertCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

interface ReportCardProps {
  report: Report;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "READY": return "bg-green-100 text-green-800 border-green-200";
      case "GENERATING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "FAILED": return "bg-red-100 text-red-800 border-red-200";
      case "DRAFT": return "bg-slate-100 text-slate-800 border-slate-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusKey = (status: string) => {
    switch (status) {
      case "READY": return "reports.status.ready";
      case "GENERATING": return "reports.status.generating";
      case "FAILED": return "reports.status.failed";
      case "DRAFT": return "reports.status.draft";
      default: return "reports.status.idle";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden group">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-secondary text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {report.title}
            </h3>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {report.type}
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border whitespace-nowrap shrink-0 ${getStatusColor(report.status)}`}>
          {t(getStatusKey(report.status) as any) || report.status}
        </span>
      </div>

      {/* Middle info */}
      <div className="flex flex-col gap-2 text-sm text-secondary-muted flex-1 mb-6">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="truncate">{report.businessName}</span>
        </div>
        {report.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="truncate">{report.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0 text-slate-400" />
          <span suppressHydrationWarning>{new Date(report.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* Action bottom */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        {report.status === "FAILED" ? (
          <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
            <AlertCircle className="w-4 h-4" />
            {t("reports.failed.desc")}
          </div>
        ) : (
          <div />
        )}

        {report.status === "READY" ? (
          <Link
            href={`/reports/${report.id}`}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("reports.view")}
          </Link>
        ) : (
          <button 
            disabled 
            className="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed"
          >
            {t("reports.view")}
          </button>
        )}
      </div>
    </div>
  );
};
