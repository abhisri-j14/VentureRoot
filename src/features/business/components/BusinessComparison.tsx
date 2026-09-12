"use client";

import React, { useState } from "react";
import { X, Plus, ChevronDown, BarChart2, Leaf, Check } from "lucide-react";
import { EditorialRadarChart } from "@/components/ui/charts";

// ── Hardcoded business pool (replaces backend) ─────────────────────────────
const ALL_BUSINESSES = [
  {
    id: "b1",
    name: "Dairy Farming & Milk Chilling",
    score: 82,
    viability: "HIGHEST VIABILITY",
    color: "#81cc87",
    dot: "#22c55e",
    financials: { projectCost: "₹10,00,000", margin10: "₹1,00,000", sca: "₹9,00,000" },
    netProfitMargin: "18% – 24%",
    monthlyProfit: "₹36,000 / month",
    breakEven: "5 Months",
    localSaturation: "High (Sweetmaker contracts)",
    operationalComplexity: "Moderate (Chilling & feed)",
    keyLocalRisk: "Fodder price surge & milk sourcing during summer droughts.",
    radar: { feasibility: 82, marketDemand: 88, competition: 40, investment: 70, riskLevel: 20, localOpportunity: 85 },
  },
  {
    id: "b2",
    name: "Kirana & FMCG Village Store",
    score: 74,
    viability: null,
    color: "#d97706",
    dot: "#f59e0b",
    financials: { projectCost: "₹3,50,000", margin10: "₹35,000", sca: "₹3,15,000" },
    netProfitMargin: "12% – 15%",
    monthlyProfit: "₹16,500 / month",
    breakEven: "4 Months",
    localSaturation: "Moderate (Village households)",
    operationalComplexity: "Low (Counter retail)",
    keyLocalRisk: "Credit book defaults (udhaar) and high competitor density.",
    radar: { feasibility: 74, marketDemand: 60, competition: 65, investment: 80, riskLevel: 45, localOpportunity: 70 },
  },
  {
    id: "b3",
    name: "Textiles & Tailoring Center",
    score: 79,
    viability: null,
    color: "#2563eb",
    dot: "#3b82f6",
    financials: { projectCost: "₹1,20,000", margin10: "₹12,000", sca: "₹1,08,000" },
    netProfitMargin: "26% – 32%",
    monthlyProfit: "₹14,200 / month",
    breakEven: "3 Months",
    localSaturation: "Seasonal (Weddings & Uniforms)",
    operationalComplexity: "Low (Handcraft sewing)",
    keyLocalRisk: "Seasonal slowdown outside harvest & wedding cycles.",
    radar: { feasibility: 79, marketDemand: 72, competition: 30, investment: 50, riskLevel: 30, localOpportunity: 78 },
  },
  {
    id: "b4",
    name: "Mini Oil Expeller & Flour Mill",
    score: 85,
    viability: null,
    color: "#7c3aed",
    dot: "#a78bfa",
    financials: { projectCost: "₹7,50,000", margin10: "₹75,000", sca: "₹6,75,000" },
    netProfitMargin: "22% – 28%",
    monthlyProfit: "₹32,000 / month",
    breakEven: "6 Months",
    localSaturation: "High (Farmer custom milling)",
    operationalComplexity: "Moderate (Machinery & 3-phase)",
    keyLocalRisk: "Three-phase electrical grid instability & motor maintenance.",
    radar: { feasibility: 85, marketDemand: 78, competition: 55, investment: 65, riskLevel: 35, localOpportunity: 80 },
  },
  {
    id: "b5",
    name: "Poultry & Egg Distribution",
    score: 71,
    viability: null,
    color: "#dc2626",
    dot: "#f87171",
    financials: { projectCost: "₹2,80,000", margin10: "₹28,000", sca: "₹2,52,000" },
    netProfitMargin: "15% – 20%",
    monthlyProfit: "₹22,000 / month",
    breakEven: "7 Months",
    localSaturation: "Low (Underserved market)",
    operationalComplexity: "High (Bio-security & feed)",
    keyLocalRisk: "Bird flu outbreaks and erratic feed price fluctuations.",
    radar: { feasibility: 71, marketDemand: 65, competition: 35, investment: 60, riskLevel: 55, localOpportunity: 68 },
  },
];

type Business = typeof ALL_BUSINESSES[0];

// ── Dropdown component for business selection ──────────────────────────────
const BusinessSelector = ({
  selected,
  allBusinesses,
  onToggle,
  onAdd,
  onRemove,
}: {
  selected: Business[];
  allBusinesses: Business[];
  onToggle: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0 leading-tight">
        Select Candidates<br />to Evaluate:
      </span>

      {selected.map((b) => (
        <div key={b.id} className="relative">
          <div
            className="flex items-center gap-2 bg-[#81cc87] text-[#f9faeb] rounded-lg px-3.5 py-2 font-sans text-[14px] font-semibold shadow-sm cursor-pointer select-none"
            onClick={() => setOpenDropdown(openDropdown === b.id ? null : b.id)}
          >
            <span className="max-w-[160px] truncate">{b.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${openDropdown === b.id ? "rotate-180" : ""}`} />
            <button
              className="ml-1 opacity-70 hover:opacity-100 hover:text-red-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); onRemove(b.id); setOpenDropdown(null); }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {openDropdown === b.id && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[220px]">
              {allBusinesses.map((ab) => {
                const isSelected = selected.some((s) => s.id === ab.id);
                return (
                  <button
                    key={ab.id}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 font-sans text-[14px] text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    onClick={() => { onToggle(ab.id); setOpenDropdown(null); }}
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ab.dot }} />
                      {ab.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#81cc87] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {selected.length < ALL_BUSINESSES.length && (
        <button
          className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg px-3.5 py-2 font-sans text-[14px] font-semibold text-gray-500 hover:border-[#81cc87] hover:text-[#81cc87] transition-colors"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" /> Add Business
        </button>
      )}
    </div>
  );
};

// ── Row label component ────────────────────────────────────────────────────
const RowLabel = ({ label }: { label: string }) => (
  <div className="col-span-1 flex items-center py-4 border-b border-gray-200">
    <span className="text-[13px] font-extrabold text-gray-900 uppercase tracking-wide">{label}</span>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
export const BusinessComparison = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(["b1", "b2", "b3", "b4"]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeBiz = ALL_BUSINESSES.filter((b) => selectedIds.includes(b.id));

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((s) => s !== id) : prev // keep at least 1
        : prev.length < 4 ? [...prev, id] : prev               // max 4
    );
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.length > 1 ? prev.filter((s) => s !== id) : prev);
  };

  const handleAdd = () => {
    const next = ALL_BUSINESSES.find((b) => !selectedIds.includes(b.id));
    if (next) setSelectedIds((prev) => [...prev, next.id]);
  };

  const cols = activeBiz.length;

  return (
    <div className="w-full h-full p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6" onClick={() => setDropdownOpen(false)}>

      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[24px] sm:text-[32px] font-bold text-[#242424] tracking-tight leading-tight">Compare Business Ideas</h1>
          <p className="font-sans text-[13px] sm:text-[14px] text-slate-500 font-medium mt-0.5">Compare potential enterprises side by side before making a decision.</p>
        </div>
        <div className="flex items-center gap-2 opacity-75 shrink-0">
          <Leaf className="w-5 sm:w-6 h-5 sm:h-6 text-[#81cc87]" />
          <span className="font-heading italic text-[13px] sm:text-[15px] text-gray-500 text-right leading-snug">
            "Better Decisions<br />Stronger Tomorrows"
          </span>
        </div>
      </div>

      {/* ── SELECTOR BAR ─────────────────────────────────────────── */}
      <div onClick={(e) => e.stopPropagation()}>
        <BusinessSelector
          selected={activeBiz}
          allBusinesses={ALL_BUSINESSES}
          onToggle={handleToggle}
          onAdd={handleAdd}
          onRemove={handleRemove}
        />
      </div>

      {/* ── RADAR CHART ──────────────────────────────────────────── */}
      <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-4 sm:p-6 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-[#81cc87]" />
          <span className="font-heading text-[18px] sm:text-[20px] font-bold text-gray-900 tracking-tight">Visual Comparison</span>
          <span className="font-sans text-[12px] text-gray-400 font-medium ml-1 hidden md:block">Compare key parameters across all selected business ideas.</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full lg:w-[380px] h-[220px] sm:h-[260px] shrink-0">
            <EditorialRadarChart
              data={[
                { metric: "Feasibility Score", subject: activeBiz[0]?.radar.feasibility || 0, comparison: activeBiz[1]?.radar.feasibility || 0 },
                { metric: "Market Demand",      subject: activeBiz[0]?.radar.marketDemand || 0, comparison: activeBiz[1]?.radar.marketDemand || 0 },
                { metric: "Competition",         subject: activeBiz[0]?.radar.competition || 0, comparison: activeBiz[1]?.radar.competition || 0 },
                { metric: "Investment Score",    subject: activeBiz[0]?.radar.investment || 0, comparison: activeBiz[1]?.radar.investment || 0 },
                { metric: "Risk Level",          subject: activeBiz[0]?.radar.riskLevel || 0, comparison: activeBiz[1]?.radar.riskLevel || 0 },
                { metric: "Local Opportunity",   subject: activeBiz[0]?.radar.localOpportunity || 0, comparison: activeBiz[1]?.radar.localOpportunity || 0 },
              ]}
              nameKey="metric"
              subjectKey="subject"
              comparisonKey="comparison"
            />
          </div>
          <div className="flex flex-col gap-3 flex-1 w-full">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {activeBiz.map((b) => (
                <div key={b.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.dot }} />
                  <span className="font-sans text-[13px] sm:text-[14px] font-medium text-gray-700">{b.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 bg-[#f9faeb] rounded-xl p-3.5 sm:p-4 border border-[#81cc87]/10 flex items-center gap-3">
              <Leaf className="w-4 h-4 text-[#81cc87] shrink-0" />
              <p className="font-heading italic text-[13px] sm:text-[14px] font-semibold text-[#81cc87]">"Compare today, build a brighter tomorrow."</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH COMPARISON TABLE ───────────────────────────── */}
      <div className="flex items-center justify-between lg:hidden mb-1 px-1 text-[11px] font-semibold text-slate-500">
        <span>Detailed Comparison</span>
        <span className="text-[#1E6702]">Swipe table horizontally →</span>
      </div>
      <div className="w-full overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <div
          className="min-w-[600px] w-full rounded-xl overflow-hidden shadow-[0_4px_24px_rgb(0,0,0,0.05)] border border-gray-900/8"
          style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(16px)" }}
        >

          {/* ── HEADER ROW: business names ── */}
          <div
            className="grid border-b-[3px] border-[#81cc87]"
            style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}
          >
            {/* Label column header */}
            <div className="px-5 py-5 bg-[#81cc87]">
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#f9faeb]/70">Metric</span>
            </div>
            {activeBiz.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-center justify-center px-4 py-5 border-l border-[#81cc87]/20"
                style={{ background: "rgba(129,204,135,0.04)" }}
              >
                {b.viability && (
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider bg-[#81cc87] text-[#f9faeb] px-2.5 py-0.5 rounded-full mb-2 shadow-sm">
                    {b.viability}
                  </span>
                )}
                <h3 className="font-sans text-[18px] font-bold text-gray-950 text-center leading-snug">{b.name}</h3>
                <p className="font-sans text-[14px] font-bold text-[#81cc87] mt-1">Score: {b.score} / 100</p>
              </div>
            ))}
          </div>

          {/* ── SECTION HEADER: Financials ── */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}
          >
            <div className="px-5 py-3 bg-[#f9faeb]/50 border-b border-r border-gray-200 flex items-center">
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-[#81cc87] bg-[#f9faeb] border border-[#81cc87]/10 px-3 py-1 rounded-md">
                Financials
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="px-5 py-3 bg-[#f8fdf9] border-b border-l border-gray-200">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="font-sans text-[14px] text-gray-500 font-medium pr-3 py-1">Project Cost</td>
                      <td className="font-sans text-[14px] text-gray-900 font-bold text-right">{b.financials.projectCost}</td>
                    </tr>
                    <tr>
                      <td className="font-sans text-[14px] text-gray-500 font-medium pr-3 py-1">10% Margin</td>
                      <td className="font-sans text-[14px] text-gray-900 font-bold text-right">{b.financials.margin10}</td>
                    </tr>
                    <tr>
                      <td className="font-sans text-[14px] text-gray-500 font-medium pr-3 py-1">90% SCA Loan</td>
                      <td className="font-sans text-[14px] text-gray-900 font-bold text-right">{b.financials.sca}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* ── ROW: Net Profit Margin ── */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}>
            <div className="flex items-center px-5 py-5 border-r border-gray-200 bg-white">
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                Net Profit Margin
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="flex flex-col justify-center px-5 py-5 border-l border-gray-200 bg-white">
                <p className="font-sans text-[20px] font-bold text-gray-950 leading-none tracking-tight">{b.netProfitMargin}</p>
                <p className="font-sans text-[14px] text-gray-500 font-medium mt-1.5">{b.monthlyProfit}</p>
              </div>
            ))}
          </div>

          {/* ── ROW: Time to Break-Even ── */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}>
            <div className="flex items-center px-5 py-5 border-r border-gray-200" style={{ background: "rgba(241,245,249,0.6)" }}>
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                Time to Break-Even
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="flex items-center px-5 py-5 border-l border-gray-200" style={{ background: "rgba(241,245,249,0.6)" }}>
                <p className="font-sans text-[24px] font-bold text-gray-950 tracking-tight">{b.breakEven}</p>
              </div>
            ))}
          </div>

          {/* ── ROW: Local Saturation ── */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}>
            <div className="flex items-center px-5 py-5 border-r border-gray-200 bg-white">
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                Local Saturation
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="flex items-center px-5 py-5 border-l border-gray-200 bg-white">
                <p className="font-sans text-[14px] font-medium text-gray-900">{b.localSaturation}</p>
              </div>
            ))}
          </div>

          {/* ── ROW: Operational Complexity ── */}
          <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}>
            <div className="flex items-center px-5 py-5 border-r border-gray-200" style={{ background: "rgba(241,245,249,0.6)" }}>
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                Operational Complexity
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="flex items-center px-5 py-5 border-l border-gray-200" style={{ background: "rgba(241,245,249,0.6)" }}>
                <p className="font-sans text-[14px] font-medium text-gray-900">{b.operationalComplexity}</p>
              </div>
            ))}
          </div>

          {/* ── ROW: Key Local Risk ── */}
          <div className="grid" style={{ gridTemplateColumns: `220px repeat(${cols}, 1fr)` }}>
            <div className="flex items-center px-5 py-5 border-r border-gray-200 bg-white">
              <span className="inline-flex items-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-md">
                Key Local Risk
              </span>
            </div>
            {activeBiz.map((b) => (
              <div key={b.id} className="px-5 py-5 border-l border-gray-200 bg-white">
                <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
                  <p className="font-sans text-[14px] text-red-900 font-medium leading-snug">{b.keyLocalRisk}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

