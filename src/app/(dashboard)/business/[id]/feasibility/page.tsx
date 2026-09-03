"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Compass } from "lucide-react";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { LocationIntelligenceMap } from "@/features/location/components/LocationIntelligenceMap";
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
import { useEffect } from "react";

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

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href={`/business/${id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Business Details
          </Link>
          <div className="flex justify-between items-start w-full">
            <div>
              <h1 className="text-3xl font-heading font-bold text-secondary">
                Business Intelligence
              </h1>
              <p className="text-secondary-muted mt-1">
                Hyper-local market demand, competitor positioning, and feasibility intelligence.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-8 md:mt-0 self-start">
          <Link 
            href={`/business/${id}/finance`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
          >
            <Calculator className="w-4 h-4" /> Finance
          </Link>
          <Link 
            href={`/business/${id}/roadmap`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100"
          >
            <Compass className="w-4 h-4" /> Roadmap
          </Link>
        </div>
      </div>

      <FeasibilityStateBoundary status={feasibilityData.status}>
        <div className="flex flex-col gap-8">
          {/* Map Section */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-secondary mb-4">
              Location Intelligence
            </h2>
            <BentoCard className="col-span-12 p-0 overflow-hidden border-0 relative">
              <LocationIntelligenceMap />
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-black/5 shadow-sm">
                <MockDisclaimer text="Currently showing mock data • Geographic API integration pending" className="!mt-0" />
              </div>
            </BentoCard>
          </section>

          <BentoGrid>
            {/* Row 1: Market & Opportunity */}
            <MarketCard data={feasibilityData.market} />
            <OpportunityCard data={feasibilityData.opportunity} />

            {/* Row 2: Pricing & Risk */}
            <PricingCard data={feasibilityData.pricing} />
            <RiskCard data={feasibilityData.risks} />

            {/* Row 3: Competition */}
            <CompetitionCard data={feasibilityData.competition} />

            {/* Row 4: SWOT */}
            <SWOTCard data={feasibilityData.swot} />
          </BentoGrid>
        </div>
      </FeasibilityStateBoundary>
      
      <div className="flex justify-center w-full">
        <MockDisclaimer text="Currently showing mock data • Machine Learning intelligence pending" />
      </div>
    </div>
  );
}
