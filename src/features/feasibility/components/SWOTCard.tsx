"use client";

import React from "react";
import { ListTree, ArrowUpRight, ArrowDownRight, Flame, ShieldCheck } from "lucide-react";
import { SWOTAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const SWOTCard = ({ data }: { data?: SWOTAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center border border-teal-200">
          <ListTree className="w-5 h-5 text-teal-600" />
        </div>
        <h3 className="font-sans text-[18px] font-bold text-gray-900">
          {t("feasi.swot") || "SWOT Analysis"}
        </h3>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Headers */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200">
          <div className="hidden md:block md:col-span-1" />
          <div className="md:col-span-5 p-2 text-center border-b md:border-b-0 md:border-r border-slate-200">
            <span className="font-sans text-[11px] font-bold text-teal-600 uppercase tracking-wider">Helpful</span>
          </div>
          <div className="md:col-span-5 p-2 text-center">
            <span className="font-sans text-[11px] font-bold text-red-500 uppercase tracking-wider">Harmful</span>
          </div>
        </div>

        {/* Row 1: Internal */}
        <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200">
          <div className="hidden md:flex md:col-span-1 items-center justify-center border-r border-slate-200 bg-slate-50">
            <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider -rotate-90">Internal</span>
          </div>

          {/* Strengths */}
          <div className="md:col-span-5 p-5 bg-[#b4ffa8] border-b md:border-b-0 md:border-r border-slate-200">
            <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">
              {t("feasi.strengths") || "Strengths"}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 font-sans text-[12px] font-medium text-gray-800">
                  <ArrowUpRight className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="md:col-span-5 p-5 bg-[#fae293]">
            <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">
              {t("feasi.weaknesses") || "Weaknesses"}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {data.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 font-sans text-[12px] font-medium text-gray-800">
                  <ArrowDownRight className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: External */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="hidden md:flex md:col-span-1 items-center justify-center border-r border-slate-200 bg-slate-50">
            <span className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider -rotate-90">External</span>
          </div>

          {/* Opportunities */}
          <div className="md:col-span-5 p-5 bg-[#ebd2fc] border-b md:border-b-0 md:border-r border-slate-200">
            <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">
              {t("feasi.swotOpp") || "Opportunities"}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {data.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 font-sans text-[12px] font-medium text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="md:col-span-5 p-5 bg-[#ffc1bd]">
            <h4 className="font-sans text-[14px] font-bold text-gray-900 mb-3">
              {t("feasi.swotThreats") || "Threats"}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {data.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 font-sans text-[12px] font-medium text-gray-800">
                  <Flame className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
