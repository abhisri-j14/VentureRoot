"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { DollarSign, Tag, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PricingAnalysis } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
export const PricingCard = ({ data }: { data?: PricingAnalysis }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <BentoCard className="col-span-12 md:col-span-5 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-xl font-heading font-bold text-secondary">{t("feasi.pricing")}</h3>
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        {showDetails && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-secondary-muted uppercase tracking-wider">{t("feasi.obsMarket")}</span>
            <span className="text-2xl font-bold text-secondary">₹{data.observedMarketPrice}</span>
            <span className="text-xs text-slate-500">{t("feasi.avgComp")}</span>
          </div>
        )}
        <div className={`flex flex-col gap-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100 ${!showDetails ? 'col-span-2' : ''}`}>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">{t("feasi.expLocal")}</span>
          <span className="text-2xl font-bold text-emerald-700">₹{data.expectedLocalPrice}</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2 py-0.5 bg-white text-emerald-700 rounded-full">
              {data.marketValue} {t("feasi.val")}
            </span>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-secondary-muted mb-2">
              <span>₹{data.priceRange.min} ({t("feasi.min")})</span>
              <span>₹{data.priceRange.max} ({t("feasi.max")})</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-blue-200 rounded-full" />
              <div className="absolute top-0 bottom-0 w-2 h-2 rounded-full bg-emerald-500 shadow" style={{ left: "45%" }} />
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">{t("feasi.variance")}</p>
          </div>

          <div className="flex-1 flex flex-col gap-4 mb-6">
            <div>
              <h4 className="font-semibold text-secondary text-sm mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" /> {t("feasi.factors")}
              </h4>
              <ul className="flex flex-col gap-1.5">
                {data.pricingFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-secondary">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <h4 className="font-semibold text-secondary text-sm mb-1">{t("feasi.obs")}</h4>
              <ul className="flex flex-col gap-1">
                {data.observations.map((obs, idx) => (
                  <li key={idx} className="text-xs text-secondary-muted">• {obs}</li>
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
