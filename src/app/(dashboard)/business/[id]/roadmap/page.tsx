"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import _MOCK_ACTION_ROADMAP from "@/data/roadmap.json";
import { RoadmapTimeline } from "@/features/roadmap/components/RoadmapTimeline";
import { Roadmap } from "@/features/roadmap/types";
import { MapPin, Briefcase, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

const MOCK_ACTION_ROADMAP = _MOCK_ACTION_ROADMAP as unknown as Roadmap;
import Link from "next/link";
import { useParams } from "next/navigation";

import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

export default function ActionRoadmapPage() {
  const { t } = useTranslation();
  const params = useParams();
  const businessId = params.id as string;
  
  // In a real app we'd fetch the roadmap based on businessId
  const [roadmap, setRoadmap] = useState(MOCK_ACTION_ROADMAP);

  // Calculate some simple stats for the header
  const totalActions = roadmap.actions.length;
  const completedActions = roadmap.actions.filter(a => a.status === "COMPLETED").length;
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="w-full min-h-screen bg-[#f4fce8]">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col py-8 px-6 md:px-10 lg:px-14">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link 
          href={`/business/${businessId}`}
          className="inline-flex items-center gap-2 font-sans text-[14px] font-medium text-secondary-muted hover:text-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("finance.backToBusiness") || "Back to Business Details"}
        </Link>
        
        <Link
          href={`/reports/rep-101`} // Using mock report ID for demo
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-secondary font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-sans text-[14px]"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          {t("roadmap.viewReport") || "View Full Report"}
        </Link>
      </div>

      {/* Header Context */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div>
            <h1 className="font-heading text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#301608] leading-tight mb-3">
              {t("roadmap.title") || "Action Roadmap"}
            </h1>
            <p className="font-sans text-[16px] text-secondary-muted max-w-2xl">
              {t("roadmap.subtitle") || "Your recommended next steps for starting and growing this business, broken down into clear, actionable phases."}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6 font-sans text-[14px] font-medium text-secondary">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {roadmap.businessName || t("common.unknown")}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {roadmap.location || t("common.notProvided")}
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 min-w-[200px] shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-sans text-[14px] font-bold text-secondary">{t("roadmap.progress") || "Overall Progress"}</span>
            </div>
            <div className="font-sans text-[28px] font-bold text-primary mb-2">
              {progressPercent}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="font-sans text-[12px] text-secondary-muted mt-2">
              {completedActions} / {totalActions} {t("roadmap.tasksCompleted") || "tasks completed"}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline view */}
      <RoadmapTimeline actions={roadmap.actions} />
      
      <div className="flex justify-center mt-6">
        <MockDisclaimer text="Currently showing mock data • Action roadmap API integration pending" />
      </div>
      </div>
    </div>
  );
}
