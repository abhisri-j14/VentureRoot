"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { Lightbulb, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { OpportunityAnalysis } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";

export const OpportunityCard = ({ data }: { data?: OpportunityAnalysis }) => {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const isSimple = role === "ENTREPRENEUR";
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <BentoCard className="col-span-12 md:col-span-4 flex flex-col h-full bg-gradient-to-br from-amber-50 to-orange-50 border-orange-100">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-heading font-bold text-secondary">{t("feasi.opp")}</h3>
          </div>
        </div>
        {!isSimple && data.confidence && (
          <ConfidenceIndicator 
            score={data.confidence.score}
            level={data.confidence.level}
            reasons={data.confidence.reasons}
          />
        )}
      </div>

      <p className={`text-secondary font-medium leading-relaxed ${isSimple ? "text-lg" : ""} mb-6`}>
        {data.summary}
      </p>

      {(!isSimple || showDetails) && (
        <div className="flex flex-col gap-4 flex-1 mb-6">
          <div className="bg-white/60 p-3 rounded-lg border border-amber-100/50">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">{t("feasi.unmet")}</p>
            <p className="text-sm text-secondary">{data.unmetNeed}</p>
          </div>
          
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">{t("feasi.drivers")}</p>
            <ul className="flex flex-col gap-2">
              {data.keyDrivers.map((driver: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                  <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isSimple && (
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors self-start mb-4"
        >
          {showDetails ? t("evidence.simple.viewDetails") : t("evidence.simple.why")}
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      {(!isSimple || showDetails) && data.why && (
        <WhyPanel summary={data.why.summary} factors={data.why.factors} />
      )}

      {(!isSimple || showDetails) && data.evidence && data.evidence.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200/50 flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">{t("feasi.evidence")}:</span>
          {data.evidence.map((ev: any, idx: number) => (
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
