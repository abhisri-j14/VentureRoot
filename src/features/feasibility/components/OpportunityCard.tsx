"use client";

import React from "react";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { OpportunityAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const OpportunityCard = ({ data }: { data?: OpportunityAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
          <Lightbulb className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="font-sans text-[18px] font-bold text-gray-900">
          {t("feasi.opp") || "Opportunity"}
        </h3>
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed">
          {data.summary}
        </p>
      )}

      {/* Unmet Need Box */}
      {data.unmetNeed && (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
          <h4 className="font-sans text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">
            Unmet Need
          </h4>
          <p className="font-sans text-[14px] text-gray-800 font-medium">
            {data.unmetNeed}
          </p>
        </div>
      )}

      {/* Key Drivers */}
      {data.keyDrivers && data.keyDrivers.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="font-sans text-[12px] font-bold text-gray-900 uppercase tracking-wide">
            Key Drivers
          </h4>
          <ul className="flex flex-col gap-2.5">
            {data.keyDrivers.map((driver, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <span className="leading-snug">{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Local Business Opportunity */}
      {data.localBusinessOpportunity && (
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <h4 className="font-sans text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
            Local Business Opportunity
          </h4>
          <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed">
            {data.localBusinessOpportunity}
          </p>
        </div>
      )}

    </div>
  );
};
