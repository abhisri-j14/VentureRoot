"use client";

import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Briefcase,
  Brain,
  AlertTriangle,
  ClipboardCheck,
  BookOpen,
  FileText,
  BarChart2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { FeasibilityRing, EditorialDonutChart, MiniSparkline } from "@/components/ui/charts";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

export default function DashboardPage() {
  const { t } = useTranslation();
  const [showEvidence, setShowEvidence] = useState(false);

  const mockCapexBreakdown = [
    { name: "Equipment", value: 400000 },
    { name: "Setup", value: 150000 },
    { name: "Inventory", value: 200000 },
    { name: "Working Capital", value: 100000 },
  ];

  const totalCapex = 8.5; // Lakhs
  const loanAmount = 7.65; // Lakhs
  const ltvPercentage = (loanAmount / totalCapex) * 100;

  const mockDemandTrend = [
    { month: 'Jan', demand: 60 },
    { month: 'Feb', demand: 65 },
    { month: 'Mar', demand: 75 },
    { month: 'Apr', demand: 82 },
    { month: 'May', demand: 88 },
    { month: 'Jun', demand: 95 },
  ];

  const summaryCards: any[] = [
    { 
      title: t("dashboard.simple.feasibility" as any), 
      chart: <FeasibilityRing value={78} label="Score" />, 
      subtitle: t("dashboard.goodViability") 
    },
    { 
      title: t("dashboard.simple.capital" as any), 
      value: <CountUp to={totalCapex} prefix="₹" suffix="L" decimals={1} duration={2} />, 
      subtitle: t("dashboard.estCapex"),
      sideVisual: (
        <div className="w-16 h-16 opacity-90 mt-1">
          <EditorialDonutChart data={mockCapexBreakdown} nameKey="name" valueKey="value" innerRadius={18} outerRadius={30} />
        </div>
      )
    },
    { 
      title: t("dashboard.simple.loan" as any), 
      value: <CountUp to={loanAmount} prefix="₹" suffix="L" decimals={2} duration={2} />, 
      subtitle: t("dashboard.ltv"),
      bottomVisual: (
        <div className="flex flex-col justify-center gap-1.5 w-full mt-3">
          <div className="flex justify-between items-end leading-none">
            <span className="text-[10px] font-bold text-[#200813]/50 uppercase tracking-wider">LTV</span>
            <span className="text-xs font-bold text-[#1E6702]">{Math.round(ltvPercentage)}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#1E6702]/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#1E6702]" 
              initial={{ width: 0 }} 
              animate={{ width: `${ltvPercentage}%` }} 
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      )
    },
    { 
      title: t("dashboard.simple.demand" as any), 
      chart: <div className="w-full h-14 mt-2 opacity-80"><MiniSparkline data={mockDemandTrend} yKey="demand" /></div>, 
      subtitle: "Verified positive local trend" 
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pt-4 pb-12 px-4 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }} 
        className="mb-12"
      >
        <h1 className="text-4xl lg:text-[44px] font-heading font-medium text-[#200813] tracking-tight">{t("dashboard.welcome")}</h1>
        <p className="text-[#200813]/60 mt-3 text-lg font-sans max-w-2xl leading-relaxed">{t("dashboard.subtitle")}</p>
      </motion.div>

      <BentoGrid className="gap-6 lg:gap-8">
        {summaryCards.map((card, idx) => (
          <motion.div 
            key={card.title as string} 
            className="col-span-1 md:col-span-3 min-h-[160px]"
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1 + idx * 0.08, ease: "easeOut" }}
          >
            <BentoCard title={card.title as string} className="h-full">
              {idx === 0 && (
                <svg className="absolute -bottom-2 -right-2 w-32 h-32 text-[#1E6702] opacity-[0.06] pointer-events-none transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              )}
              {idx === 1 && (
                <svg className="absolute top-0 right-0 w-28 h-28 text-[#1E6702] opacity-[0.04] pointer-events-none transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
              {idx === 2 && (
                <svg className="absolute bottom-4 right-4 w-24 h-24 text-[#1E6702] opacity-[0.05] pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              )}
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex-1">
                      {card.chart ? (
                        <div className="flex items-center justify-start">
                          {card.chart}
                        </div>
                      ) : card.value ? (
                        <p className="text-[40px] leading-none font-heading font-semibold text-[#200813] tracking-tight">{card.value}</p>
                      ) : (
                        <p className="text-[40px] leading-none font-heading font-semibold text-[#200813]/20 tracking-tight">—</p>
                      )}
                    </div>
                    {card.sideVisual && (
                      <div className="shrink-0 ml-4 flex items-center justify-center">
                        {card.sideVisual}
                      </div>
                    )}
                  </div>
                  {card.bottomVisual && (
                    <div className="w-full">
                      {card.bottomVisual}
                    </div>
                  )}
                </div>
                {card.subtitle && <p className="text-sm text-[#200813]/50 mt-4 font-sans font-medium">{card.subtitle as string}</p>}
                {card.title !== t("dashboard.simple.feasibility" as any) && (
                  <MockDisclaimer className="mt-2" />
                )}
                {card.title === t("dashboard.simple.feasibility" as any) && (
                  <MockDisclaimer text="Currently showing mock data • ML integration pending" className="mt-2" />
                )}
              </div>
            </BentoCard>
          </motion.div>
        ))}

        <motion.div 
          className="col-span-1 md:col-span-12 min-h-[360px]"
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
        >
          <BentoCard title={t("dashboard.radiusTitle") as string} className="h-full relative">
            <div className="w-full h-full min-h-[280px] rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-[#200813]/40 text-sm font-medium border border-black/5">
              {t("dashboard.mapPlaceholder")}
              <MockDisclaimer text="Currently showing mock data • Map/Location API integration pending" className="mt-4" />
            </div>
          </BentoCard>
        </motion.div>

        <motion.div 
          className="col-span-12 mt-2"
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
        >
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-2 text-[15px] font-semibold text-[#1E6702] hover:text-[#144801] transition-colors py-2 px-1"
          >
            {t("evidence.simple.why" as any)}
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showEvidence ? "rotate-90" : ""}`} />
          </button>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 overflow-hidden ${showEvidence ? "opacity-100 mt-6 max-h-[500px]" : "opacity-0 max-h-0 mt-0"}`}>
            <EvidenceBadge type="FACT" label={t("dashboard.pop") as string} confidence={98} />
            <EvidenceBadge type="ESTIMATE" label={t("dashboard.localDemand") as string} confidence={74} />
            <EvidenceBadge type="PREDICTION" label={t("dashboard.profitability") as string} confidence={62} />
          </div>
          {showEvidence && <MockDisclaimer text="Currently showing mock data • ML integration pending" className="mt-4" />}
        </motion.div>
      </BentoGrid>
    </div>
  );
}


