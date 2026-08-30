"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { ListTree, ArrowUpRight, ArrowDownRight, Flame, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { SWOTAnalysis } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";

interface SWOTCardProps {
  data?: SWOTAnalysis;
}

export const SWOTCard = ({ data }: { data?: SWOTAnalysis }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <BentoCard className="col-span-12">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
            <ListTree className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-heading font-bold text-secondary">{t("feasi.swot")}</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-primary">{t("feasi.strengths")}</h4>
            </div>
            <ul className="flex flex-col gap-3">
              {data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 bg-vr-red-light/20 border border-vr-red-light/50 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownRight className="w-5 h-5 text-vr-red" />
              <h4 className="font-bold text-vr-red-dark">{t("feasi.weaknesses")}</h4>
            </div>
            <ul className="flex flex-col gap-3">
              {data.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-vr-red mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 bg-vr-teal-light/20 border border-vr-teal-light/50 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-vr-teal" />
              <h4 className="font-bold text-vr-teal">{t("feasi.swotOpp")}</h4>
            </div>
            <ul className="flex flex-col gap-3">
              {data.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-vr-teal mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-5 bg-vr-yellow-light/20 border border-vr-yellow-light/50 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-vr-yellow" />
              <h4 className="font-bold text-vr-yellow">{t("feasi.swotThreats")}</h4>
            </div>
            <ul className="flex flex-col gap-3">
              {data.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-vr-yellow mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
