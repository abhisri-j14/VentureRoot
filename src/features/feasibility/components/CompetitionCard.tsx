"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { Crosshair, MapPin, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { CompetitionAnalysis } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";

export const CompetitionCard = ({ data }: { data?: CompetitionAnalysis }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  if (!data) return null;

  return (
    <BentoCard className="col-span-12 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-vr-teal-light/30 rounded-lg shrink-0">
            <Crosshair className="w-5 h-5 text-vr-teal" />
          </div>
          <h3 className="text-xl font-heading font-bold text-secondary">
             {t("feasi.comp")}
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

      <p className="text-secondary-muted text-base font-medium mb-6">{data.overview}</p>

      {showDetails && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.competitors.map((comp) => (
              <div key={comp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-secondary">{comp.name}</h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${comp.type === 'Direct' ? 'bg-vr-red-light/30 text-vr-red' : 'bg-slate-100 text-secondary-muted'}`}>
                      {comp.type} {t("feasi.compDir")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm text-secondary-muted mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{comp.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{comp.pricing}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs flex-1">
                  <div>
                    <span className="block font-semibold text-primary mb-1">{t("feasi.strengths")}</span>
                    <ul className="list-disc list-inside text-secondary flex flex-col gap-0.5">
                      {comp.strengths.map((s, i) => <li key={i} className="truncate" title={s}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className="block font-semibold text-vr-red mb-1">{t("feasi.weaknesses")}</span>
                    <ul className="list-disc list-inside text-secondary flex flex-col gap-0.5">
                      {comp.weaknesses.map((w, i) => <li key={i} className="truncate" title={w}>{w}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.observations.length > 0 && (
            <div className="bg-vr-teal-light/20 border border-vr-teal-light/50 rounded-lg p-4 mb-4">
              <span className="text-xs font-semibold text-vr-teal uppercase tracking-wider mb-2 block">{t("feasi.obs")}</span>
              <ul className="text-sm text-secondary flex flex-col gap-1">
                {data.observations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-vr-teal mt-1.5 shrink-0" />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
