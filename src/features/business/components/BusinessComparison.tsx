"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, ChevronDown, BarChart2, Leaf, Check, Award, ShieldAlert, FileText, Landmark, TrendingUp, Compass, Users } from "lucide-react";
import { EditorialRadarChart } from "@/components/ui/charts";
import { useBusinessesComparison } from "@/lib/data/businesses";

// ── Curated Domain Sector Benchmarks ─────────────────────────────────────────
const SECTOR_BENCHMARKS = [
  {
    id: "bench-food",
    name: "Food Processing & Agro Packaging",
    score: 88,
    viability: "HIGH AGRO POTENTIAL",
    color: "#81cc87",
    dot: "#15803d",
    badgeWinner: "HIGHEST PMEGP SUBSIDY",
    financials: {
      projectCost: "₹12,00,000",
      margin10: "₹1,20,000",
      termLoan: "₹10,80,000",
      subsidy: "₹4,20,000 (35% Rural PMEGP)",
      workingCapital: "₹1,50,000",
    },
    netProfitMargin: "24% – 30%",
    monthlyGross: "₹1,40,000 / month",
    monthlyProfit: "₹38,000 / month",
    breakEven: "5 Months",
    projectedIrr: "28.5%",
    catchment: "~31.4k (5km) / ~125.6k (10km)",
    competitionDensity: "Moderate (Traditional millers)",
    localSaturation: "Low in hygienic packaged goods",
    operationalComplexity: "Moderate (Machinery & sorting)",
    licenses: "Udyam, FSSAI State Mfg, Trade NOC, SPCB Green",
    infrastructure: "3-Phase 20 HP, Drainage, Sorting shed",
    keyLocalRisk: "Raw material price volatility during seasonal harvest peaks.",
    riskMitigation: "Forward procurement contracts with local Farmer Producer Orgs (FPOs).",
    bestSuitedFor: "Agrarian entrepreneurs leveraging local crop surplus for value addition.",
    radar: { feasibility: 88, marketDemand: 86, competition: 35, investment: 72, riskLevel: 25, localOpportunity: 90 },
  },
  {
    id: "bench-health",
    name: "Community Health Center & Day Clinic",
    score: 92,
    viability: "CRITICAL LOCAL DEMAND",
    color: "#0284c7",
    dot: "#0369a1",
    badgeWinner: "HIGHEST DEMAND DEFICIT",
    financials: {
      projectCost: "₹18,50,000",
      margin10: "₹2,50,000",
      termLoan: "₹16,00,000",
      subsidy: "₹4,50,000 (PMEGP + Health Mission)",
      workingCapital: "₹2,50,000",
    },
    netProfitMargin: "26% – 34%",
    monthlyGross: "₹2,10,000 / month",
    monthlyProfit: "₹58,000 / month",
    breakEven: "6 Months",
    projectedIrr: "32.0%",
    catchment: "~31.4k (5km) / ~125.6k (10km)",
    competitionDensity: "Low in secondary inpatient care",
    localSaturation: "Acute Shortage (18km travel to Civil)",
    operationalComplexity: "High (24x7 RMO & Nursing)",
    licenses: "Clinical Establishments Act, BMW SPCB, FDA Pharmacy, Fire NOC",
    infrastructure: "Oxygen pipeline, Minor OT, DG backup, 15-20 Beds",
    keyLocalRisk: "Clinical staffing retention & statutory audit approval timelines.",
    riskMitigation: "Shift incentive allowances, on-campus quarters, and accredited nurse tie-ups.",
    bestSuitedFor: "Healthcare professionals & investors targeting steady institutional PM-JAY revenues.",
    radar: { feasibility: 92, marketDemand: 95, competition: 20, investment: 65, riskLevel: 30, localOpportunity: 94 },
  },
  {
    id: "bench-dairy",
    name: "Modern Dairy & Bulk Milk Chilling",
    score: 84,
    viability: "STEADY DAILY CASHFLOW",
    color: "#22c55e",
    dot: "#16a34a",
    badgeWinner: "FASTEST DAILY LIQUIDITY",
    financials: {
      projectCost: "₹10,00,000",
      margin10: "₹1,00,000",
      termLoan: "₹9,00,000",
      subsidy: "₹2,50,000 (NABARD AHIDF / DEDS)",
      workingCapital: "₹80,000",
    },
    netProfitMargin: "18% – 24%",
    monthlyGross: "₹1,60,000 / month",
    monthlyProfit: "₹34,000 / month",
    breakEven: "4 Months",
    projectedIrr: "24.0%",
    catchment: "~31.4k (5km) / ~125.6k (10km)",
    competitionDensity: "High (Informal sweetmakers)",
    localSaturation: "High volume, price-sensitive",
    operationalComplexity: "Moderate (Cold chain & cattle health)",
    licenses: "Udyam, FSSAI Registration, Animal Husbandry NOC",
    infrastructure: "Bulk Milk Cooler (1000L), Misting fans, Borewell",
    keyLocalRisk: "Summer fodder price spikes & livestock mastitis outbreaks.",
    riskMitigation: "Silage storage pit, Napier grass cultivation, and veterinary AMC.",
    bestSuitedFor: "Livestock owners seeking guaranteed daily payments from cooperatives.",
    radar: { feasibility: 84, marketDemand: 90, competition: 55, investment: 78, riskLevel: 25, localOpportunity: 82 },
  },
  {
    id: "bench-cold",
    name: "Cold Storage & Agrilogistics Unit",
    score: 86,
    viability: "HIGH ASSET VALUE",
    color: "#6366f1",
    dot: "#4f46e5",
    badgeWinner: "HIGHEST COMMERCIAL ASSET",
    financials: {
      projectCost: "₹28,00,000",
      margin10: "₹3,50,000",
      termLoan: "₹24,50,000",
      subsidy: "₹9,80,000 (35% NHB Mission Subsidy)",
      workingCapital: "₹1,80,000",
    },
    netProfitMargin: "30% – 38%",
    monthlyGross: "₹2,80,000 / month",
    monthlyProfit: "₹92,000 / month",
    breakEven: "8 Months",
    projectedIrr: "26.5%",
    catchment: "~125.6k (10km) / ~482.5k (20km)",
    competitionDensity: "Very Low (No multi-commodity facility)",
    localSaturation: "Severe Deficit (High post-harvest loss)",
    operationalComplexity: "High (Refrigeration & 3-phase grid)",
    licenses: "WDRA Accreditation, SPCB Consent, NHB Clearance, Electricity DISCOM",
    infrastructure: "Ammonia/Freon chiller, 500 MT insulated chambers, Loading dock",
    keyLocalRisk: "Power tariff fluctuations & off-season chamber under-utilization.",
    riskMitigation: "Multi-crop seasonal rotation (potato, tomato, spices) & solar PV rooftop offset.",
    bestSuitedFor: "High-net-worth investors seeking long-term commercial lease cashflows.",
    radar: { feasibility: 86, marketDemand: 88, competition: 15, investment: 50, riskLevel: 35, localOpportunity: 89 },
  },
  {
    id: "bench-mill",
    name: "Mini Oil Expeller & Grain Mill",
    score: 81,
    viability: "LOW ENTRY BARRIER",
    color: "#d97706",
    dot: "#b45309",
    badgeWinner: "LOWEST TECHNICAL COMPLEXITY",
    financials: {
      projectCost: "₹5,50,000",
      margin10: "₹55,000",
      termLoan: "₹4,95,000",
      subsidy: "₹1,92,500 (35% PMEGP Grant)",
      workingCapital: "₹60,000",
    },
    netProfitMargin: "20% – 26%",
    monthlyGross: "₹95,000 / month",
    monthlyProfit: "₹22,500 / month",
    breakEven: "4 Months",
    projectedIrr: "22.5%",
    catchment: "~31.4k (5km) / ~125.6k (10km)",
    competitionDensity: "Moderate (Local chakki units)",
    localSaturation: "Moderate (Steady household custom milling)",
    operationalComplexity: "Low (Rotary expeller & pulverizer)",
    licenses: "Udyam, FSSAI Basic, Gram Panchayat Trade Permit",
    infrastructure: "15 HP commercial power, Dust extraction, Storage drums",
    keyLocalRisk: "Seasonal mustard/seed crop failure & local grid power outages.",
    riskMitigation: "Dual-motor backup pulley and off-season spice grinding diversification.",
    bestSuitedFor: "First-time micro-entrepreneurs wanting quick break-even and low capital risk.",
    radar: { feasibility: 81, marketDemand: 76, competition: 50, investment: 85, riskLevel: 30, localOpportunity: 78 },
  },
  {
    id: "bench-poultry",
    name: "Poultry & Commercial Egg Production",
    score: 75,
    viability: "FAST CYCLE TURNOVER",
    color: "#dc2626",
    dot: "#b91c1c",
    badgeWinner: "FASTEST 45-DAY CASH CYCLES",
    financials: {
      projectCost: "₹4,80,000",
      margin10: "₹48,000",
      termLoan: "₹4,32,000",
      subsidy: "₹1,20,000 (NABARD Poultry Subsidy)",
      workingCapital: "₹75,000",
    },
    netProfitMargin: "16% – 22%",
    monthlyGross: "₹1,10,000 / month",
    monthlyProfit: "₹20,000 / month",
    breakEven: "5 Months",
    projectedIrr: "21.0%",
    catchment: "~31.4k (5km) / ~125.6k (10km)",
    competitionDensity: "Moderate to High",
    localSaturation: "High demand, volatile chicken prices",
    operationalComplexity: "Moderate (Biosecurity & feed)",
    licenses: "Udyam, Veterinary SPCB Clearance, Trade Permit",
    infrastructure: "Deep litter shed, Automated nipple drinkers, Feed mixer",
    keyLocalRisk: "Avian influenza (Bird Flu) outbreaks & sharp soybean meal feed inflation.",
    riskMitigation: "Strict perimeter biosecurity disinfection and contract farming buy-back guarantee.",
    bestSuitedFor: "Small landholders seeking fast-cycling protein sales in peri-urban markets.",
    radar: { feasibility: 75, marketDemand: 82, competition: 60, investment: 80, riskLevel: 55, localOpportunity: 74 },
  },
  {
    id: "bench-kirana",
    name: "Kirana & FMCG Modern Village Store",
    score: 72,
    viability: "EVERYDAY ESSENTIALS",
    color: "#ea580c",
    dot: "#c2410c",
    badgeWinner: "LOWEST CAPITAL REQUIRED",
    financials: {
      projectCost: "₹3,50,000",
      margin10: "₹35,000",
      termLoan: "₹3,15,000",
      subsidy: "₹87,500 (Mudra Shishu Loan)",
      workingCapital: "₹1,20,000",
    },
    netProfitMargin: "12% – 16%",
    monthlyGross: "₹1,25,000 / month",
    monthlyProfit: "₹17,000 / month",
    breakEven: "3 Months",
    projectedIrr: "18.5%",
    catchment: "~12,000 (3km Immediate Village)",
    competitionDensity: "High (5+ village shops within 1km)",
    localSaturation: "High (Price competition)",
    operationalComplexity: "Low (Counter retail sales)",
    licenses: "Udyam, GST, Shop & Establishment Act",
    infrastructure: "Retail display racks, POS billing scanner, Deep freezer",
    keyLocalRisk: "Customer credit default (udhaar) and high wholesaler minimum orders.",
    riskMitigation: "Strict digital UPI discount policy and automated FMCG stock reordering.",
    bestSuitedFor: "Local families with road-facing commercial storefronts seeking immediate sales.",
    radar: { feasibility: 72, marketDemand: 70, competition: 75, investment: 90, riskLevel: 45, localOpportunity: 68 },
  },
];

type BusinessCandidate = typeof SECTOR_BENCHMARKS[0];

// ── Dropdown Component for Business Selection ──────────────────────────────
const BusinessSelector = ({
  selected,
  allBusinesses,
  onToggle,
  onAdd,
  onRemove,
}: {
  selected: BusinessCandidate[];
  allBusinesses: BusinessCandidate[];
  onToggle: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 leading-tight">
        Selected Ventures<br />to Compare:
      </span>

      {selected.map((b) => (
        <div key={b.id} className="relative">
          <div
            className="flex items-center gap-2 bg-[#234670] text-[#f9faeb] rounded-xl px-3.5 py-2 font-sans text-[13px] font-bold shadow-xs cursor-pointer select-none hover:bg-[#1a3556] transition-colors"
            onClick={() => setOpenDropdown(openDropdown === b.id ? null : b.id)}
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.dot }} />
            <span className="max-w-[170px] truncate">{b.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openDropdown === b.id ? "rotate-180" : ""}`} />
            <button
              className="ml-1 opacity-70 hover:opacity-100 hover:text-red-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); onRemove(b.id); setOpenDropdown(null); }}
              title="Remove from comparison"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {openDropdown === b.id && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[260px] max-h-[300px] overflow-y-auto">
              {allBusinesses.map((ab) => {
                const isSelected = selected.some((s) => s.id === ab.id);
                return (
                  <button
                    key={ab.id}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 font-sans text-[13px] text-gray-700 hover:bg-slate-50 font-medium transition-colors text-left"
                    onClick={() => { onToggle(ab.id); setOpenDropdown(null); }}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ab.dot }} />
                      <span className="truncate">{ab.name}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {selected.length < allBusinesses.length && (
        <button
          className="flex items-center gap-2 border-2 border-dashed border-slate-300 rounded-xl px-3.5 py-2 font-sans text-[13px] font-semibold text-slate-600 hover:border-[#234670] hover:text-[#234670] transition-colors"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" /> Add Venture
        </button>
      )}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
export const BusinessComparison = () => {
  const { data: dbBusinesses } = useBusinessesComparison();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Merge user's actual database businesses with sector benchmarks
  const allCandidatePool = useMemo<BusinessCandidate[]>(() => {
    const list: BusinessCandidate[] = [];

    // Transform user's real businesses
    if (Array.isArray(dbBusinesses) && dbBusinesses.length > 0) {
      dbBusinesses.forEach((b: any, idx: number) => {
        const margin = Number(b.availableMargin || 250000);
        const revenue = Number(b.expectedRevenue || margin * 0.45);
        const projectCost = Math.round(margin * 4.5);
        const termLoan = Math.round(margin * 3.5);
        const subsidy = Math.round(projectCost * 0.25);
        const workingCap = Math.round(margin * 0.35);
        const catName = b.category?.name || b.category || "Enterprise";

        list.push({
          id: b.id,
          name: b.name || `${catName} Enterprise`,
          score: 89,
          viability: "YOUR ACTIVE VENTURE",
          color: "#1E6702",
          dot: "#22c55e",
          badgeWinner: "ENTERED BUSINESS",
          financials: {
            projectCost: `₹${(projectCost / 100000).toFixed(1)} Lakh`,
            margin10: `₹${(margin / 100000).toFixed(1)} Lakh`,
            termLoan: `₹${(termLoan / 100000).toFixed(1)} Lakh`,
            subsidy: `₹${(subsidy / 100000).toFixed(1)} Lakh (25% PMEGP)`,
            workingCapital: `₹${(workingCap / 100000).toFixed(1)} Lakh`,
          },
          netProfitMargin: "22% – 28%",
          monthlyGross: `₹${(revenue / 1000).toFixed(0)}K / month`,
          monthlyProfit: `₹${Math.round((revenue * 0.24) / 1000)}K / month`,
          breakEven: "5 Months",
          projectedIrr: "25.0%",
          catchment: "~31.4k (5km) / ~125.6k (10km)",
          competitionDensity: "Moderate",
          localSaturation: "High demand with local supply gap",
          operationalComplexity: "Moderate",
          licenses: "Udyam, Trade Permit, SPCB Consent, Sector Registration",
          infrastructure: "Commercial premises, 3-Phase power, utility connection",
          keyLocalRisk: "Working capital stretching across harvest & wholesale credit cycles.",
          riskMitigation: "Securing Bank Cash Credit (CC) limit & rolling 7-day payment terms.",
          bestSuitedFor: "Your customized business parameters entered in VentureRoot.",
          radar: { feasibility: 89, marketDemand: 86, competition: 40, investment: 76, riskLevel: 25, localOpportunity: 88 },
        });
      });
    }

    // Append standard curated benchmarks
    SECTOR_BENCHMARKS.forEach((sb) => {
      if (!list.some((existing) => existing.name.toLowerCase() === sb.name.toLowerCase())) {
        list.push(sb);
      }
    });

    return list;
  }, [dbBusinesses]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (allCandidatePool.length > 0 && selectedIds.length === 0) {
      // Pick active business first, then top 3 sector options
      setSelectedIds(allCandidatePool.slice(0, Math.min(4, allCandidatePool.length)).map((b) => b.id));
    }
  }, [allCandidatePool, selectedIds.length]);

  const activeBiz = useMemo(() => {
    return allCandidatePool.filter((b) => selectedIds.includes(b.id));
  }, [allCandidatePool, selectedIds]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((s) => s !== id) : prev
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => (prev.length > 1 ? prev.filter((s) => s !== id) : prev));
  };

  const handleAdd = () => {
    const next = allCandidatePool.find((b) => !selectedIds.includes(b.id));
    if (next) setSelectedIds((prev) => [...prev, next.id]);
  };

  const cols = activeBiz.length;
  const gridColTemplate = `minmax(125px, 190px) repeat(${cols}, minmax(140px, 1fr))`;

  return (
    <div className="w-full h-full flex flex-col gap-5 sm:gap-6">

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold text-[#242424] tracking-tight leading-tight break-words">
            Compare Business Opportunities
          </h1>
          <p className="font-sans text-xs sm:text-[14px] text-slate-500 font-medium mt-1 leading-normal break-words">
            Evaluate your enterprise against alternative ventures with verified financial, statutory, and market viability metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 opacity-80 shrink-0 self-start md:self-auto">
          <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E6702]" />
          <span className="font-heading italic text-xs sm:text-[14px] text-gray-500 text-left md:text-right leading-snug">
            "Compare today,<br className="hidden md:inline" /> prosper tomorrow"
          </span>
        </div>
      </div>

      {/* ── SELECTOR BAR ─────────────────────────────────────────── */}
      <div onClick={(e) => e.stopPropagation()}>
        <BusinessSelector
          selected={activeBiz}
          allBusinesses={allCandidatePool}
          onToggle={handleToggle}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </div>

      {/* ── RADAR COMPARISON CHART ───────────────────────────────── */}
      <div className="bg-[#fffff5] rounded-2xl border border-gray-900/10 shadow-xs p-4 sm:p-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#234670]" />
          <span className="font-heading text-base sm:text-[18px] font-bold text-gray-900 tracking-tight">Multi-Dimensional Viability Spider Matrix</span>
          <span className="font-sans text-[12px] text-gray-500 font-medium ml-2 hidden md:inline">
            Visual comparison across feasibility, demand, competitive moat, and capital efficiency.
          </span>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full lg:w-[420px] h-[260px] sm:h-[280px] shrink-0">
            <EditorialRadarChart
              data={[
                { metric: "Feasibility Score", subject: activeBiz[0]?.radar.feasibility || 0, comparison: activeBiz[1]?.radar.feasibility || 0 },
                { metric: "Market Demand",      subject: activeBiz[0]?.radar.marketDemand || 0, comparison: activeBiz[1]?.radar.marketDemand || 0 },
                { metric: "Competitive Moat",  subject: 100 - (activeBiz[0]?.radar.competition || 50), comparison: 100 - (activeBiz[1]?.radar.competition || 50) },
                { metric: "Capital Efficiency", subject: activeBiz[0]?.radar.investment || 0, comparison: activeBiz[1]?.radar.investment || 0 },
                { metric: "Low Risk Level",     subject: 100 - (activeBiz[0]?.radar.riskLevel || 30), comparison: 100 - (activeBiz[1]?.radar.riskLevel || 30) },
                { metric: "Local Opportunity",  subject: activeBiz[0]?.radar.localOpportunity || 0, comparison: activeBiz[1]?.radar.localOpportunity || 0 },
              ]}
              nameKey="metric"
              subjectKey="subject"
              comparisonKey="comparison"
            />
          </div>
          <div className="flex flex-col gap-3 flex-1 w-full">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Active Comparison Legend:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {activeBiz.map((b, idx) => (
                <div key={b.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: b.dot }} />
                  <div className="truncate">
                    <p className="font-sans text-[13px] font-bold text-gray-900 truncate">{b.name}</p>
                    <p className="text-[11px] text-slate-500">{idx === 0 ? "Benchmark Target" : `Comparison Alternative #${idx}`}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-[#f9faeb] rounded-xl p-3 sm:p-3.5 border border-[#81cc87]/20 flex items-center gap-3">
              <Compass className="w-4 h-4 text-[#1E6702] shrink-0" />
              <p className="font-sans text-[11px] sm:text-[12px] text-slate-700 leading-snug break-words">
                Radar chart compares primary candidate <strong className="text-gray-900">{activeBiz[0]?.name}</strong> (Green) directly against <strong className="text-gray-900">{activeBiz[1]?.name || "Sector Benchmark"}</strong> (Secondary).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH COMPARISON TABLE ───────────────────────────── */}
      <div className="w-full">
        {/* Mobile Swipe Hint */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium sm:hidden mb-2.5">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#1E6702]" />
            <span>Swipe left / right to compare all</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
            {cols} ventures
          </span>
        </div>

        <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300">
          <div
            className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-900/10 bg-white"
            style={{ minWidth: `${125 + cols * 140}px` }}
          >

            {/* ── HEADER ROW: Business Names & Winner Badges ── */}
            <div
              className="grid border-b-2 border-slate-200 bg-slate-50/70"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-slate-100 p-3 sm:p-5 flex flex-col justify-end border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <span className="font-sans text-[10px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-700 leading-tight">
                  Comparative Parameter
                </span>
              </div>
              {activeBiz.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col items-center justify-center p-3 sm:p-5 border-l border-slate-200 text-center"
                >
                  {b.badgeWinner && (
                    <span className="font-sans text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mb-1.5 border border-emerald-200 shadow-2xs break-words text-center">
                      {b.badgeWinner}
                    </span>
                  )}
                  <h3 className="font-sans text-xs sm:text-[15px] font-bold text-gray-950 leading-snug break-words text-center">
                    {b.name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-700">Score: {b.score}/100</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-tight">({b.viability})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── SECTION 1: FINANCIAL ARCHITECTURE ── */}
            <div
              className="grid bg-[#234670]/10 border-b border-slate-200"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-[#e4edf5] px-3 sm:px-5 py-2.5 flex items-center gap-2 border-r border-slate-200/80 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <Landmark className="w-4 h-4 text-[#234670] shrink-0" />
                <span className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#234670]">
                  1. Financial Architecture
                </span>
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="border-l border-slate-200/80" />
              ))}
            </div>

            {/* Row: Project Capex */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Total Project Capex
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-bold text-gray-900 break-words whitespace-normal">
                  {b.financials.projectCost}
                </div>
              ))}
            </div>

            {/* Row: Promoter Margin Equity */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                10-15% Promoter Equity
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-medium text-slate-900 break-words whitespace-normal">
                  {b.financials.margin10}
                </div>
              ))}
            </div>

            {/* Row: Term Loan Requirement */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Bank Term Loan (up to 90%)
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-medium text-slate-900 break-words whitespace-normal">
                  {b.financials.termLoan}
                </div>
              ))}
            </div>

            {/* Row: Govt Subsidy Grant */}
            <div className="grid border-b border-slate-200 bg-emerald-50/30" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-[#eef7ee] px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-bold text-emerald-900 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Govt Subsidy Eligibility
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[13px] font-bold text-emerald-800 break-words whitespace-normal">
                  {b.financials.subsidy}
                </div>
              ))}
            </div>

            {/* ── SECTION 2: PROFITABILITY & CASHFLOW ── */}
            <div
              className="grid bg-[#234670]/10 border-b border-slate-200"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-[#e4edf5] px-3 sm:px-5 py-2.5 flex items-center gap-2 border-r border-slate-200/80 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <TrendingUp className="w-4 h-4 text-[#234670] shrink-0" />
                <span className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#234670]">
                  2. Profitability & Returns
                </span>
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="border-l border-slate-200/80" />
              ))}
            </div>

            {/* Row: Net Profit Margin */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Net Profit Margin (%)
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[16px] font-bold text-emerald-700 break-words whitespace-normal">
                  {b.netProfitMargin}
                </div>
              ))}
            </div>

            {/* Row: Monthly Net Cashflow */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Projected Monthly Net Profit
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-bold text-gray-900 break-words whitespace-normal">
                  {b.monthlyProfit}
                </div>
              ))}
            </div>

            {/* Row: Break-Even Horizon */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Break-Even Horizon
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-bold text-gray-900 break-words whitespace-normal">
                  {b.breakEven}
                </div>
              ))}
            </div>

            {/* Row: 3-Year Projected IRR */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                3-Year Projected IRR / ROI
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[14px] font-bold text-indigo-700 break-words whitespace-normal">
                  {b.projectedIrr}
                </div>
              ))}
            </div>

            {/* ── SECTION 3: MARKET & COMPETITION ── */}
            <div
              className="grid bg-[#234670]/10 border-b border-slate-200"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-[#e4edf5] px-3 sm:px-5 py-2.5 flex items-center gap-2 border-r border-slate-200/80 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <Users className="w-4 h-4 text-[#234670] shrink-0" />
                <span className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#234670]">
                  3. Market & Catchment
                </span>
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="border-l border-slate-200/80" />
              ))}
            </div>

            {/* Row: Catchment Reach */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Catchment Population (5km / 10km)
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[13px] font-medium text-slate-800 break-words whitespace-normal">
                  {b.catchment}
                </div>
              ))}
            </div>

            {/* Row: Competitor Density */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Competitor Density
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[13px] font-medium text-slate-800 break-words whitespace-normal">
                  {b.competitionDensity}
                </div>
              ))}
            </div>

            {/* Row: Local Saturation */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Local Market Saturation
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[13px] font-medium text-slate-800 break-words whitespace-normal">
                  {b.localSaturation}
                </div>
              ))}
            </div>

            {/* ── SECTION 4: STATUTORY & OPERATIONAL BURDEN ── */}
            <div
              className="grid bg-[#234670]/10 border-b border-slate-200"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-[#e4edf5] px-3 sm:px-5 py-2.5 flex items-center gap-2 border-r border-slate-200/80 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <FileText className="w-4 h-4 text-[#234670] shrink-0" />
                <span className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#234670]">
                  4. Clearances & Complexity
                </span>
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="border-l border-slate-200/80" />
              ))}
            </div>

            {/* Row: Statutory Licenses */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Required Clearances & Licenses
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-[11px] sm:text-[12px] font-semibold text-slate-800 leading-snug break-words whitespace-normal">
                  {b.licenses}
                </div>
              ))}
            </div>

            {/* Row: Technical Complexity */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Operational Complexity
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-xs sm:text-[13px] font-medium text-slate-800 break-words whitespace-normal">
                  {b.operationalComplexity}
                </div>
              ))}
            </div>

            {/* ── SECTION 5: RISK & FINAL VERDICT ── */}
            <div
              className="grid bg-[#234670]/10 border-b border-slate-200"
              style={{ gridTemplateColumns: gridColTemplate }}
            >
              <div className="sticky left-0 z-20 bg-[#e4edf5] px-3 sm:px-5 py-2.5 flex items-center gap-2 border-r border-slate-200/80 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)]">
                <ShieldAlert className="w-4 h-4 text-[#234670] shrink-0" />
                <span className="font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#234670]">
                  5. Risk & Recommendation
                </span>
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="border-l border-slate-200/80" />
              ))}
            </div>

            {/* Row: Critical Risk & Hedge */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3.5 font-sans text-xs sm:text-[13px] font-semibold text-slate-700 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Critical Risk & Mitigation
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-2.5 sm:py-3.5 border-l border-slate-200 font-sans text-[11px] sm:text-[12px] leading-relaxed break-words whitespace-normal">
                  <p className="text-red-800 font-medium break-words whitespace-normal">{b.keyLocalRisk}</p>
                  <p className="text-emerald-900 mt-1 font-semibold break-words whitespace-normal">Hedge: {b.riskMitigation}</p>
                </div>
              ))}
            </div>

            {/* Row: Best Suited For */}
            <div className="grid bg-slate-50/40" style={{ gridTemplateColumns: gridColTemplate }}>
              <div className="sticky left-0 z-20 bg-slate-100 px-3 sm:px-5 py-3 sm:py-4 font-sans text-xs sm:text-[13px] font-bold text-slate-900 border-r border-slate-200 shadow-[3px_0_8px_-2px_rgba(0,0,0,0.06)] break-words whitespace-normal">
                Recommended Verdict
              </div>
              {activeBiz.map((b) => (
                <div key={b.id} className="px-3 sm:px-5 py-3 sm:py-4 border-l border-slate-200 font-sans text-[11px] sm:text-[12px] text-slate-800 font-medium leading-snug break-words whitespace-normal">
                  {b.bestSuitedFor}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
