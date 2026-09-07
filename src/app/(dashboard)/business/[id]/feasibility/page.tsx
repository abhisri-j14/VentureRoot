"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

import { FeasibilityStateBoundary } from "@/features/feasibility/components/FeasibilityStateBoundary";
import { MarketCard } from "@/features/feasibility/components/MarketCard";
import { OpportunityCard } from "@/features/feasibility/components/OpportunityCard";
import { CompetitionCard } from "@/features/feasibility/components/CompetitionCard";
import { SWOTCard } from "@/features/feasibility/components/SWOTCard";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";
import { RiskCard } from "@/features/feasibility/components/RiskCard";
import { PricingCard } from "@/features/feasibility/components/PricingCard";

import { 
  FeasibilityData, 
  MarketAnalysis, 
  OpportunityAnalysis, 
  CompetitionAnalysis, 
  SWOTAnalysis, 
  RiskItem, 
  PricingAnalysis 
} from "@/features/feasibility/types";

import { useFeasibility } from "@/lib/data/feasibility";

export default function FeasibilityPage() {
  const params = useParams();
  const id = params?.id as string || "123";

  const { data: fetchedFeasibility, isLoading } = useFeasibility(id);
  const [feasibilityData, setFeasibilityData] = useState<FeasibilityData | null>(null);

  useEffect(() => {
    if (fetchedFeasibility) {
      setFeasibilityData({
        status: "SUCCESS",
        market: fetchedFeasibility.market as MarketAnalysis,
        opportunity: fetchedFeasibility.opportunity as OpportunityAnalysis,
        competition: fetchedFeasibility.competition as CompetitionAnalysis,
        swot: fetchedFeasibility.swot as unknown as SWOTAnalysis,
        risks: fetchedFeasibility.risks as RiskItem[],
        pricing: fetchedFeasibility.pricing as unknown as PricingAnalysis,
      });
    }
  }, [fetchedFeasibility]);

  if (!feasibilityData) return null;

  // Derive composite confidence from Opportunity score (or mock average)
  const compositeConfidence = feasibilityData.opportunity?.confidence?.score || 84;

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-background font-sans">
      <main className="flex-1 w-full max-w-full flex flex-col gap-6">
        
        {/* Header Section */}
        <div className="mb-6">
          <Link href={`/business/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-muted hover:text-primary transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to business details
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-[22px] font-heading font-bold text-[#242424] tracking-tight leading-tight">
                Business Intelligence
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Hyper-local market demand, competitor positioning, and feasibility intelligence.
              </p>
            </div>
            
            <div className="hidden md:flex gap-3">
              <Link href={`/business/${id}/finance`} className="px-4 py-2 bg-surface text-primary border border-slate-200 font-semibold text-sm rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                ₹ Finance
              </Link>
              <Link href={`/business/${id}/roadmap`} className="px-4 py-2 bg-surface text-vr-red border border-slate-200 font-semibold text-sm rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                ⊕ Roadmap
              </Link>
            </div>
          </div>
        </div>

        <FeasibilityStateBoundary status={feasibilityData.status}>
          {/* Stats Banner */}
          <div className="bg-[#d2e866] rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm border border-[#c4da5a]">
            
            <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
              <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">5KM Population</span>
              <div className="text-2xl md:text-3xl font-bold font-heading text-secondary">{feasibilityData.market?.reach?.radius5km.toLocaleString()}</div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-secondary/10"></div>

            <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
              <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">10KM Population</span>
              <div className="text-2xl md:text-3xl font-bold font-heading text-secondary">{feasibilityData.market?.reach?.radius10km.toLocaleString()}</div>
            </div>

            <div className="hidden md:block w-px h-10 bg-secondary/10"></div>

            <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
              <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">Observed Price</span>
              <div className="text-2xl md:text-3xl font-bold font-heading flex justify-center md:justify-start items-baseline gap-1 text-secondary">
                ₹{feasibilityData.pricing?.observedMarketPrice} <span className="text-xs text-secondary/60 font-sans font-medium">/liter</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-secondary/10"></div>

            <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
              <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">Expected Price</span>
              <div className="text-2xl md:text-3xl font-bold font-heading flex justify-center md:justify-start items-center gap-2 text-secondary">
                ₹{feasibilityData.pricing?.expectedLocalPrice} 
                <span className="text-[9px] px-1.5 py-0.5 bg-white text-secondary font-sans rounded-full uppercase tracking-wider font-bold shadow-sm">
                  ▲ premium
                </span>
              </div>
            </div>

            <div className="hidden md:block w-px h-10 bg-secondary/10"></div>

            <div className="flex-1 flex flex-col gap-1 w-full text-center md:text-left">
              <span className="text-xs font-bold text-secondary/60 uppercase tracking-widest">Confidence</span>
              <div className="text-2xl md:text-3xl font-bold font-heading flex justify-center md:justify-start items-baseline gap-1 text-secondary">
                {compositeConfidence} <span className="text-xs text-secondary/60 font-sans font-medium">/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-16 items-start">
            
            {/* Market is full width (Map) + half width (Stats), MarketCard returns a fragment */}
            <MarketCard data={feasibilityData.market} />

            <div className="col-span-1 h-full">
              <OpportunityCard data={feasibilityData.opportunity} />
            </div>

            <div className="col-span-1 h-full">
              <PricingCard data={feasibilityData.pricing} />
            </div>
            
            <div className="col-span-1 h-full">
              <RiskCard data={feasibilityData.risks} />
            </div>

            <div className="col-span-1 xl:col-span-2">
              <CompetitionCard data={feasibilityData.competition} />
            </div>

            <div className="col-span-1 xl:col-span-2">
              <SWOTCard data={feasibilityData.swot} />
            </div>

          </div>
        </FeasibilityStateBoundary>
        
        <div className="flex justify-center w-full mt-4 pb-6 border-t border-slate-200 pt-6">
          <p className="text-xs text-secondary-muted">
            Generated by VentureRoot • Location and market data shown are illustrative - Not a legal or financial guarantee
          </p>
        </div>
      </main>
    </div>
  );
}
