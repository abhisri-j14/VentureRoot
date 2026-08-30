"use client";

import React, { useState } from "react";
import { BentoCard } from "@/components/layout/BentoCard";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { RiskItem } from "../types";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";

export const RiskCard = ({ data }: { data?: RiskItem[] }) => {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const isSimple = role === "ENTREPRENEUR";
  const [expandedRisks, setExpandedRisks] = useState<Record<string, boolean>>({});

  const toggleRisk = (id: string) => {
    setExpandedRisks(prev => ({...prev, [id]: !prev[id]}));
  };

  if (!data || data.length === 0) return null;

  const severityColors = {
    Low: "bg-blue-100 text-blue-800 border-blue-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    High: "bg-orange-100 text-orange-800 border-orange-200",
    Critical: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <BentoCard className="col-span-12 md:col-span-7 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-xl font-heading font-bold text-secondary">{t("feasi.risk")}</h3>
      </div>

      <div className="flex flex-col gap-4">
        {data.map((risk) => {
          const isExpanded = !isSimple || expandedRisks[risk.id];
          return (
            <div key={risk.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-secondary">{risk.title}</h4>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{risk.category} {t("feasi.riskCat")}</span>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${severityColors[risk.severity]}`}>
                  {risk.severity}
                </span>
              </div>
              
              <p className={`text-secondary leading-relaxed ${isSimple ? "text-base" : "text-sm"}`}>{risk.explanation}</p>
              
              {isExpanded && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 mb-1">{t("feasi.impact")}</span>
                      <p className="text-sm text-secondary-muted">{risk.potentialImpact}</p>
                    </div>
                    {risk.mitigationAdvisory && (
                      <div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 mb-1">
                          <Info className="w-3 h-3" /> {t("feasi.mitigation")}
                        </span>
                        <p className="text-sm text-secondary-muted">{risk.mitigationAdvisory}</p>
                      </div>
                    )}
                  </div>

                  {risk.evidence && risk.evidence.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-medium text-secondary-muted uppercase tracking-wider">{t("feasi.evidence")}:</span>
                      {risk.evidence.map((ev, idx) => (
                        <EvidenceBadge 
                          key={idx} 
                          type={ev.type} 
                          label={`${ev.label} (${ev.source})`} 
                          confidence={ev.confidenceScore} 
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {isSimple && (
                <button 
                  onClick={() => toggleRisk(risk.id)}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors self-start mt-2"
                >
                  {isExpanded ? t("evidence.simple.viewDetails") : t("evidence.simple.why")}
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
};
