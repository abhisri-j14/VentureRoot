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
  const role = useAuthStore((s) => s.role);
  const isSimple = role === "ENTREPRENEUR";
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
        {!isSimple && data.confidence && (
          <div className="w-full sm:w-auto sm:max-w-xs shrink-0">
            <ConfidenceIndicator 
              score={data.confidence.score}
              level={data.confidence.level}
              reasons={data.confidence.reasons}
            />
          </div>
        )}
      </div>

      {(!isSimple || showDetails) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="p-5 bg-green-50/70 border border-green-100 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-800">{t("feasi.strengths")}</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {data.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-green-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 bg-red-50/70 border border-red-100 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-800">{t("feasi.weaknesses")}</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {data.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 bg-blue-50/70 border border-blue-100 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-800">{t("feasi.swotOpp")}</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {data.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-blue-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-5 bg-orange-50/70 border border-orange-100 rounded-xl h-full">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-orange-800">{t("feasi.swotThreats")}</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {data.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-orange-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {isSimple && (
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors self-start mb-4"
        >
          {showDetails ? t("evidence.simple.viewDetails") : t("evidence.simple.why")}
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      {(!isSimple || showDetails) && data.why && (
        <WhyPanel summary={data.why.summary} factors={data.why.factors} />
      )}

      {(!isSimple || showDetails) && data.evidence && data.evidence.length > 0 && (
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
