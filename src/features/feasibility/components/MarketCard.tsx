"use client";

import React from "react";
import { Users, TrendingUp, Target, MapPin } from "lucide-react";
import { MarketAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LocationIntelligenceMap } from "@/features/location/components/LocationIntelligenceMap";

export const MarketCard = ({ data }: { data?: MarketAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <>
      {/* 1. Location Intelligence (Map) - Full Width */}
      <div className="col-span-1 xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-vr-teal/10 flex items-center justify-center border border-vr-teal/20">
            <MapPin className="w-5 h-5 text-vr-teal" />
          </div>
          <h2 className="font-heading text-[28px] md:text-[32px] font-bold text-gray-900">
            Location Intelligence
          </h2>
        </div>

        <div className="w-full rounded-2xl overflow-hidden border border-slate-200 relative min-h-[450px] bg-slate-50">
          <LocationIntelligenceMap />
        </div>
      </div>

      {/* 2. Market Demand (Stats) - Half Width */}
      <div className="col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="font-sans text-[18px] font-bold text-gray-900">
            Market Demand
          </h3>
        </div>

        {/* Population Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 5km Population Reach
            </div>
            <div className="font-sans text-[28px] font-bold text-gray-900">
              {data.reach.radius5km.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 10km Population Reach
            </div>
            <div className="font-sans text-[28px] font-bold text-gray-900">
              {data.reach.radius10km.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Customer Segments */}
        <div>
          <div className="font-sans text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-vr-teal" /> Customer Segments
          </div>
          <ul className="flex flex-col gap-2.5">
            {(data.customerSegments || []).map((segment, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-vr-teal mt-1.5 shrink-0" />
                {segment}
              </li>
            ))}
          </ul>
        </div>

        {/* Market Trends */}
        <div>
          <div className="font-sans text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Market Trends
          </div>
          <ul className="flex flex-col gap-2.5">
            {(data.marketTrends || []).map((trend, idx) => (
              <li key={idx} className="flex items-start gap-2.5 font-sans text-[14px] text-gray-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                {trend}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </>
  );
};
