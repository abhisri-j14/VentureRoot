"use client";

import React from "react";
import { Crosshair, MapPin, Tag } from "lucide-react";
import { CompetitionAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const CompetitionCard = ({ data }: { data?: CompetitionAnalysis }) => {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
          <Crosshair className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="font-sans text-[18px] font-bold text-gray-900">
          {t("feasi.comp") || "Competition Landscape"}
        </h3>
      </div>

      {data.overview && (
        <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed">
          {data.overview}
        </p>
      )}

      {/* VS Grid */}
      <div className="flex flex-col md:flex-row gap-5 relative mt-1">
        {(data.competitors || []).length >= 2 && (
          <div className="hidden md:flex absolute top-[10%] bottom-[10%] left-1/2 -translate-x-1/2 w-px bg-slate-200 z-0" />
        )}

        {(data.competitors || []).map((comp, index) => (
          <React.Fragment key={comp.id}>
            <div className="flex-1 bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-100 z-10 relative">
              <div className="flex flex-col mb-4">
                <h4 className="font-sans text-[16px] font-bold text-gray-900">{comp.name}</h4>
                <span className={`font-sans text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mt-2 self-start border ${
                  comp.type === "Direct"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }`}>
                  {comp.type} {t("feasi.compDir") || "Competitor"}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-1.5 font-sans text-[12px] font-bold text-gray-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{comp.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-sans text-[12px] font-bold text-gray-900">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>{comp.pricing}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                    {t("feasi.strengths") || "Strengths"}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {(comp.strengths || []).map((s, i) => (
                      <li key={i} className="font-sans text-[12px] font-medium text-gray-800 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                        <span className="leading-snug">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-red-600 mb-2">
                    {t("feasi.weaknesses") || "Weaknesses"}
                  </span>
                  <ul className="flex flex-col gap-2">
                    {(comp.weaknesses || []).map((w, i) => (
                      <li key={i} className="font-sans text-[12px] font-medium text-gray-800 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        <span className="leading-snug">{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            {index < (data.competitors || []).length - 1 && (
              <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex justify-center items-center py-2 md:py-0 z-20">
                <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-black font-sans text-[11px] shadow ring-4 ring-white">
                  VS
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {(data.observations || []).length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <span className="font-sans text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 block">
            {t("feasi.obs") || "Key Observation"}
          </span>
          <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed">
            {data.observations[0]}
          </p>
        </div>
      )}
    </div>
  );
};
