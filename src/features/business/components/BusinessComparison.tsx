"use client";

import React from "react";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { useTranslation, TranslationKey } from "@/features/i18n/hooks/useTranslation";
import { EditorialRadarChart } from "@/components/ui/charts";

import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

// Static mock data for UI demonstration only. No logic or backend calculations present.
// To be replaced by backend API endpoints during the integration phase.
const getMockData = (t: (key: TranslationKey) => string | undefined) => ({
  categories: [
    { key: "score", label: t("business.compare.score") || "Feasibility Score" },
    { key: "demand", label: t("business.compare.demand") || "Market Demand" },
    { key: "competition", label: t("business.compare.competition") || "Competition" },
    { key: "investment", label: t("business.compare.investment") || "Estimated Investment" },
    { key: "revenue", label: t("business.compare.revenue") || "Expected Monthly Revenue" },
    { key: "risk", label: t("business.compare.risk") || "Risk Level" },
    { key: "recommendedCapital", label: t("business.compare.recCapital") || "Recommended Capital" },
    { key: "potentialLoan", label: t("business.compare.loan") || "Potential Loan" },
    { key: "localOpportunity", label: t("business.compare.localOpp") || "Local Opportunity" },
  ],
  businesses: [
    {
      id: "b1",
      name: "Dairy Farming",
      values: {
        score: { value: "82/100", highlight: true, evidence: { type: "PREDICTION", label: "High" } },
        demand: { value: "High", highlight: true, evidence: { type: "FACT", label: "Verified" } },
        competition: { value: "Moderate", highlight: false, evidence: { type: "ESTIMATE", label: "Local" } },
        investment: { value: "₹5.5L", highlight: false },
        revenue: { value: "₹65k", highlight: false, evidence: { type: "ESTIMATE", label: "Projected" } },
        risk: { value: "Low", highlight: true },
        recommendedCapital: { value: "₹4.8L", highlight: false },
        potentialLoan: { value: "₹4.2L", highlight: false },
        localOpportunity: { value: "Strong", highlight: true, evidence: { type: "PREDICTION", label: "AI" } },
      }
    },
    {
      id: "b2",
      name: "Retail Store",
      values: {
        score: { value: "65/100", highlight: false, evidence: { type: "PREDICTION", label: "Moderate" } },
        demand: { value: "Moderate", highlight: false, evidence: { type: "ESTIMATE", label: "Projected" } },
        competition: { value: "High", highlight: false, evidence: { type: "FACT", label: "Verified" } },
        investment: { value: "₹3.0L", highlight: true },
        revenue: { value: "₹45k", highlight: false, evidence: { type: "ESTIMATE", label: "Projected" } },
        risk: { value: "Moderate", highlight: false },
        recommendedCapital: { value: "₹2.5L", highlight: true },
        potentialLoan: { value: "₹2.0L", highlight: false },
        localOpportunity: { value: "Average", highlight: false, evidence: { type: "PREDICTION", label: "AI" } },
      }
    },
    {
      id: "b3",
      name: "Tailoring",
      values: {
        score: { value: "71/100", highlight: false, evidence: { type: "PREDICTION", label: "Good" } },
        demand: { value: "Stable", highlight: false, evidence: { type: "ESTIMATE", label: "Trend" } },
        competition: { value: "Low", highlight: true, evidence: { type: "FACT", label: "Verified" } },
        investment: { value: "₹1.5L", highlight: true },
        revenue: { value: "₹35k", highlight: false, evidence: { type: "ESTIMATE", label: "Projected" } },
        risk: { value: "Low", highlight: true },
        recommendedCapital: { value: "₹1.2L", highlight: true },
        potentialLoan: { value: "₹1.0L", highlight: false },
        localOpportunity: { value: "Good", highlight: false, evidence: { type: "PREDICTION", label: "AI" } },
      }
    }
  ]
});

export const BusinessComparison = () => {
  const { t } = useTranslation();
  const data = getMockData(t);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
        <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          {t("business.compare.title")}
        </p>
      </div>

      {/* ── Visual Comparison Overview ── */}
      <div className="w-full max-w-3xl mx-auto h-[400px] mb-12">
        <EditorialRadarChart 
          data={[
            { metric: 'Feasibility Score', subject: 82, comparison: 65 },
            { metric: 'Market Demand', subject: 90, comparison: 50 },
            { metric: 'Competition', subject: 40, comparison: 80 },
            { metric: 'Investment Score', subject: 70, comparison: 60 },
            { metric: 'Risk Level', subject: 20, comparison: 50 },
            { metric: 'Local Opportunity', subject: 85, comparison: 55 },
          ]}
          nameKey="metric"
          subjectKey="subject"
          comparisonKey="comparison"
        />
        <div className="flex justify-center gap-8 mt-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#1E6702]"></span>
            <span className="text-secondary">Dairy Farming (Selected)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm border-2 border-dashed border-[#200813] bg-transparent"></span>
            <span className="text-secondary-muted">Retail Store (Comparison)</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px] w-full">
          {/* Header Row */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            <div className="col-span-1 flex items-end pb-3 border-b border-slate-200">
              <span className="text-sm font-semibold text-secondary-muted uppercase tracking-wider">{t("business.compare.metrics")}</span>
            </div>
            {data.businesses.map(b => (
              <div key={b.id} className="col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                <h3 className="text-lg font-heading font-bold text-secondary">{b.name}</h3>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          <div className="flex flex-col gap-2">
            {data.categories.map(category => (
              <div 
                key={category.key} 
                className="grid grid-cols-4 gap-6 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors rounded-xl px-2"
              >
                <div className="col-span-1 flex items-center">
                  <span className="text-sm font-medium text-secondary">{category.label}</span>
                </div>
                
                {data.businesses.map(b => {
                  const cell = b.values[category.key as keyof typeof b.values] as any;
                  return (
                    <div key={`${b.id}-${category.key}`} className="col-span-1 flex flex-col items-center justify-center gap-2 text-center">
                      <span className={`text-base font-semibold ${cell.highlight ? 'text-primary' : 'text-secondary'}`}>
                        {cell.value}
                      </span>
                      {cell.evidence && (
                        <EvidenceBadge type={cell.evidence.type} label={cell.evidence.label} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <MockDisclaimer text="Currently showing mock data • Competitor analysis API integration pending" />
        </div>
      </div>
    </div>
  );
};
