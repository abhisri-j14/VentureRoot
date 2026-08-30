"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { Users, TrendingUp, Target, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { MarketAnalysis } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export const MarketCard = ({ data }: { data?: MarketAnalysis }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <BentoCard className="col-span-12 md:col-span-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-vr-teal-light/30 rounded-lg shrink-0">
            <Users className="w-5 h-5 text-vr-teal" />
          </div>
          <h3 className="text-xl font-heading font-bold text-secondary">
            {t("dashboard.simple.demand")}
          </h3>
        </div>
        {showDetails && data.confidence && (
          <div className="w-full sm:w-auto sm:max-w-xs shrink-0">
            <ConfidenceIndicator 
              score={data.confidence.score}
              level={data.confidence.level}
              reasons={data.confidence.reasons}
            />
          </div>
        )}
      </div>

      {showDetails && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-secondary-muted flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {t("feasi.reach5")}
              </span>
              <span className="text-2xl font-bold text-secondary">
                {data.reach.radius5km.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-secondary-muted flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {t("feasi.reach10")}
              </span>
              <span className="text-2xl font-bold text-secondary">
                {data.reach.radius10km.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-6">
            <div>
              <h4 className="font-semibold text-secondary flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-slate-400" /> {t("feasi.custSeg")}
              </h4>
              <ul className="flex flex-col gap-2">
                {data.customerSegments.map((segment, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-vr-teal mt-1.5 shrink-0" />
                    {segment}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-secondary flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-400" /> {t("feasi.trends")}
              </h4>
              <ul className="flex flex-col gap-2">
                {data.marketTrends.map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors self-start mb-4 mt-6"
      >
        {showDetails ? t("evidence.simple.viewDetails") : t("evidence.simple.why")}
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showDetails && data.why && (
        <WhyPanel summary={data.why.summary} factors={data.why.factors} />
      )}

      {showDetails && data.evidence && data.evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-secondary-muted uppercase tracking-wider">{t("feasi.evidence")}:</span>
          {data.evidence.map((ev, idx) => (
            <EvidenceBadge 
              key={idx} 
              type={ev.type} 
              label={`${ev.label} (${ev.source})`} 
              confidence={ev.confidenceScore} 
            />
          ))}
        </div>
      )}
    </BentoCard>
  );
};
