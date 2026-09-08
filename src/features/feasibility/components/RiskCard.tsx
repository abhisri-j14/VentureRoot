"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { RiskItem } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const RiskCard = ({ data }: { data?: RiskItem[] }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center border border-orange-200">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="font-sans text-[18px] font-bold text-gray-900">
          {t("feasi.risk") || "Risk Analysis"}
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {data.map((risk) => (
          <RiskItemComponent key={risk.id} risk={risk} />
        ))}
      </div>
    </div>
  );
};

const severityStyles: Record<string, { bg: string; border: string; badge: string; bar: string }> = {
  Critical: {
    bg: "bg-[#fa8d89]/10",
    border: "border-[#fa8d89]/30",
    badge: "bg-[#fa8d89] text-red-900 border-[#fa8d89]",
    bar: "bg-[#fa8d89]",
  },
  High: {
    bg: "bg-[#ffcaab]/20",
    border: "border-[#ffcaab]/50",
    badge: "bg-[#ffcaab] text-orange-900 border-[#ffcaab]",
    bar: "bg-[#ffcaab]",
  },
  Medium: {
    bg: "bg-[#ffe8b8]/30",
    border: "border-[#ffe8b8]/60",
    badge: "bg-[#ffe8b8] text-amber-900 border-[#ffe8b8]",
    bar: "bg-[#ffe8b8]",
  },
  Low: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    bar: "bg-slate-300",
  },
};

const RiskItemComponent = ({ risk }: { risk: RiskItem }) => {
  const style = severityStyles[risk.severity] || severityStyles.Low;

  return (
    <div className={`relative rounded-2xl border p-5 flex flex-col gap-4 overflow-hidden ${style.bg} ${style.border}`}>
      {/* Left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${style.bar}`} />

      <div className="flex justify-between items-start pl-2">
        <div className="flex flex-col gap-1">
          <h4 className="font-sans text-[16px] font-bold text-gray-900">{risk.title}</h4>
          <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider">{risk.category} Risk</span>
        </div>
        <span className={`px-3 py-1 rounded-full font-sans text-[11px] font-bold border ${style.badge}`}>
          {risk.severity}
        </span>
      </div>

      <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed pl-2">
        {risk.explanation}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 pl-2">
        {risk.potentialImpact && (
          <div className="flex-1">
            <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Potential Impact
            </span>
            <p className="font-sans text-[12px] text-gray-800 font-medium leading-relaxed">
              {risk.potentialImpact}
            </p>
          </div>
        )}
        {risk.mitigationAdvisory && (
          <div className="flex-1">
            <span className="font-sans text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Mitigation Advisory
            </span>
            <p className="font-sans text-[12px] text-gray-800 font-medium leading-relaxed">
              {risk.mitigationAdvisory}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
