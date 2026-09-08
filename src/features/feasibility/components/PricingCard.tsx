"use client";

import React from "react";
import { IndianRupee, CheckCircle2, ArrowRight } from "lucide-react";
import { PricingAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const PricingCard = ({ data }: { data?: PricingAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
          <IndianRupee className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-sans text-[18px] font-bold text-gray-900">
          {t("feasi.pricing") || "Pricing & Value"}
        </h3>
      </div>

      {/* Price Metrics */}
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
          <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("feasi.obsMarket") || "Observed Market Avg."}
          </span>
          <div className="font-sans text-[28px] font-bold text-gray-900">₹{data.observedMarketPrice}</div>
          <span className="font-sans text-[14px] text-gray-600 font-medium">per litre</span>
        </div>
        <div className="flex-1 bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-1">
          <span className="font-sans text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            {t("feasi.expLocal") || "Expected Local (Premium)"}
          </span>
          <div className="font-sans text-[28px] font-bold text-emerald-700">₹{data.expectedLocalPrice}</div>
          <span className="font-sans text-[14px] font-bold text-emerald-600">{data.marketValue} Value</span>
        </div>
      </div>

      {/* Price Range Slider */}
      {data.priceRange && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-2.5 bg-slate-100 rounded-full relative border border-slate-200">
            <div className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-emerald-300/50 rounded-full" />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-[3px] border-emerald-600 shadow"
              style={{ left: "45%" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans text-[12px] font-bold text-slate-500">₹{data.priceRange.min} min</span>
            <span className="font-sans text-[11px] text-slate-400 font-medium">Typical local market variance</span>
            <span className="font-sans text-[12px] font-bold text-slate-500">₹{data.priceRange.max} max</span>
          </div>
        </div>
      )}

      {/* Key Pricing Factors */}
      {data.pricingFactors && data.pricingFactors.length > 0 && (
        <div>
          <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">Key Pricing Factors</h4>
          <ul className="flex flex-col gap-2.5">
            {data.pricingFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Observations */}
      {data.observations && data.observations.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">Key Observations</h4>
          <ul className="flex flex-col gap-2.5">
            {data.observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2 font-sans text-[14px] text-gray-800 font-medium">
                <ArrowRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                <span className="leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
