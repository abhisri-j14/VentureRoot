import React from "react";
import { Report } from "../types";
import { ReportCard } from "./ReportCard";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { FileSearch } from "lucide-react";

interface ReportListProps {
  reports: Report[];
  onGenerateNew: () => void;
}

export const ReportList = ({ reports, onGenerateNew }: ReportListProps) => {
  const { t } = useTranslation();

  if (!reports || reports.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <FileSearch className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-heading font-bold text-secondary mb-2">
          {t("reports.empty.title") || "No reports yet"}
        </h3>
        <p className="text-secondary-muted max-w-sm mb-6">
          {t("reports.empty.desc") || "Generate a business advisory report to see your consolidated analysis here."}
        </p>
        <button
          onClick={onGenerateNew}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          {t("reports.generate") || "Generate Report"}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
};
