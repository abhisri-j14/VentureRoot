"use client";

import Link from "next/link";
import { ArrowLeft, Map, Compass } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { RepaymentChart } from "@/features/finance/components/RepaymentChart";
import { useParams } from "next/navigation";
import { WhatIfSimulator } from "@/features/finance/components/WhatIfSimulator";

export default function FinancePage() {
  const params = useParams();
  const id = params?.id as string;
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="mb-8">
        <Link 
          href={`/business/${id}`} 
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {t("finance.backToBusiness")}
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-heading font-bold text-secondary">
              Financial Structuring & Simulation
            </h1>
            <p className="text-secondary-muted mt-2">
              Explore financing options, run scenarios, and track projected returns
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/business/${id}/feasibility`}
              className="flex items-center gap-2 bg-white border border-slate-200 text-secondary px-4 py-2 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors shadow-sm"
            >
              <Map className="w-4 h-4" /> Feasibility
            </Link>
            <Link
              href={`/business/${id}/roadmap`}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" /> Action Roadmap
            </Link>
          </div>
        </div>
      </div>
      
      <BentoGrid>
        {/* ROW 1: Repayment Schedule */}
        <BentoCard title="Repayment Schedule" className="col-span-12">
          <RepaymentChart businessId={id} />
        </BentoCard>

        {/* ROW 2: What-If Business Simulator */}
        <BentoCard title="What-If Business Simulator" className="col-span-12">
          <WhatIfSimulator />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
