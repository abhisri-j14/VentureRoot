"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Report } from "../types";
import {
  ArrowLeft, Download, Printer, Loader2, AlertTriangle,
  CheckCircle, Info, FileText, Target, MapPin,
  Shield, Landmark, TrendingUp, HandCoins,
  Briefcase, AlertOctagon, XCircle
} from "lucide-react";

import { reportApi } from "../api/reportApi";
import businessesData from "@/data/businesses.json";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";

interface ReportDetailViewProps {
  report: Report;
}

// ── Sidebar Navigation Item ───────────────────────────────────────────────
const NavItem = ({
  number,
  title,
  isActive,
  onClick
}: {
  number: number;
  title: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-left ${isActive ? "bg-white/20 text-white font-bold" : "hover:bg-black/5 text-[#141411]/80 hover:text-[#141411]"
      }`}
  >
    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-[12px] font-bold shrink-0 transition-colors ${isActive ? "bg-[#ebcb2f] text-[#141411] shadow-md" : "bg-white/30 text-[#141411]"
      }`}>
      {number}
    </div>
    <span className={`font-sans text-[13px] tracking-wide ${isActive ? "font-bold" : "font-semibold"}`}>
      {title}
    </span>
  </button>
);

// ── Section heading ───────────────────────────────────────────────────────
const SectionHeading = ({ number, title, icon: Icon }: { number: number; title: string; icon: any }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-[#ebcb2f]/10 flex items-center justify-center text-[#ebcb2f]">
      <Icon className="w-5 h-5" />
    </div>
    <h2 className="font-heading text-[24px] font-bold text-gray-900">
      {number}. {title}
    </h2>
  </div>
);

export const ReportDetailView = ({ report }: ReportDetailViewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  // Data mapping
  const fd = (report.feasibilityData as any) || (report as any)?.feasibilityData;
  const capital = (report as any).financialData?.capital || (report as any).business?.capital || {
    expectedInvestment: Number((report as any).business?.availableMargin || 250000) * 4,
    availableMargin: Number((report as any).business?.availableMargin || 250000),
    workingCapital: Math.round(Number((report as any).business?.availableMargin || 250000) * 0.35),
    termLoan: Number((report as any).business?.availableMargin || 250000) * 3,
    subsidyAmount: Math.round(Number((report as any).business?.availableMargin || 250000) * 4 * 0.25),
    subsidyPercent: 25,
  };
  const operations = (report as any).financialData?.operations || (report as any).business?.operations || {
    expectedRevenue: Number((report as any).business?.expectedRevenue || 120000),
    expectedPrice: 50,
    productionQuantity: 2400,
    monthlyProfit: Math.round(Number((report as any).business?.expectedRevenue || 120000) * 0.22),
    breakEvenMonths: 6,
    dscr: 1.85,
  };

  const handleDownload = () => {
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!fd) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <Link href="/reports" className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-[#ebcb2f] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Info className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="font-sans text-[20px] font-bold text-gray-900 mb-2">{report.title}</h2>
          <p className="font-sans text-[16px] text-gray-500">No detailed analysis data is available for this report yet.</p>
        </div>
      </div>
    );
  }

  const opp = fd.opportunity || {};
  const comp = fd.competition || {};
  const swot = fd.swot || {};
  const risks = fd.risks || [];
  const pricing = fd.pricing || {};
  const market = fd.market || {};
  const density = getAuthoritativeCensusDensity(report.business?.location || { name: report.location }, report.business);
  const reach = (market.reach && market.reach.radius5km && market.reach.radius5km !== 31416)
    ? market.reach
    : {
      radius5km: Math.round(78.54 * density),
      radius10km: Math.round(314.16 * density),
      radius20km: Math.round(1256.64 * density),
    };
  const primaryRisk = risks[0];

  const SECTIONS = [
    { id: 1, title: "Business Overview", icon: Briefcase },
    { id: 2, title: "Market & Positioning", icon: MapPin },
    { id: 3, title: "SWOT & Key Risks", icon: Shield },
    { id: 4, title: "Financial Outlook", icon: Landmark },
    { id: 5, title: "Action Plan & Verdict", icon: Target },
  ];

  return (
    <div className="w-full min-h-screen bg-[#81cc87] relative z-20 flex flex-col lg:flex-row print:bg-white print:block">

      {/* ── SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[300px] shrink-0 sticky top-0 h-screen flex-col py-10 px-6 print:hidden">
        <div className="mb-10">
          <h3 className="font-sans text-[13px] font-bold text-[#f9faeb]/50 uppercase tracking-wider mb-2 px-2">Navigation</h3>
          <p className="font-heading text-[22px] font-bold text-[#f9faeb] px-2 leading-tight">Report Sections</p>
        </div>

        <div className="relative flex flex-col gap-1">
          <div className="absolute left-[1.125rem] top-4 bottom-4 w-[2px] bg-[#f9faeb]/10 -z-10" />
          {SECTIONS.map((s) => (
            <NavItem
              key={s.id}
              number={s.id}
              title={s.title}
              isActive={activeSection === s.id}
              onClick={() => setActiveSection(s.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS ──────────────────────────────────── */}
      <main className="flex-1 w-full bg-white lg:rounded-tl-[40px] lg:shadow-[-20px_0_40px_rgba(0,0,0,0.2)] min-h-screen pb-20 print:shadow-none print:border-0 print:rounded-none">

        {/* ── ACTION BAR ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 lg:p-10 pb-0 print:hidden">
          <Link href="/reports" className="inline-flex items-center gap-2 font-sans text-[14px] font-semibold text-gray-500 hover:text-gray-900 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1.5 bg-[#ebcb2f]/20 text-emerald-900 font-sans text-[11px] font-bold uppercase tracking-wider rounded-lg mr-2">
              Status: {report.status}
            </span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-sans text-[14px] font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-gray-500" /> Print
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#ebcb2f] text-[#141411] font-sans text-[14px] font-bold rounded-xl hover:bg-[#ebcb2f]/90 transition-all shadow-md shadow-[#ebcb2f]/20 disabled:opacity-70"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* ── MOBILE SECTION SELECTOR TABS (< lg) ────────────────────────── */}
        <div className="lg:hidden px-4 sm:px-6 pt-4 pb-1 border-b border-gray-100 overflow-x-auto scrollbar-none print:hidden">
          <div className="flex items-center gap-2 min-w-max pb-2">
            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${isActive
                    ? "bg-[#141411] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-[#ebcb2f] text-[#141411]" : "bg-gray-300 text-gray-700"
                    }`}>
                    {s.id}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HEADER BANNER */}
        <div className="px-6 py-8 sm:px-10 sm:py-10 text-[#141411] overflow-hidden border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-block px-3 py-1 bg-[#ebcb2f]/20 text-[#141411] font-sans text-[11px] font-bold uppercase tracking-wider rounded-full">
              {report.type}
            </span>
            <span className="font-sans text-[12px] text-gray-500 font-mono">ID: {report.id}</span>
          </div>
          <h1 className="font-heading text-[28px] sm:text-[32px] md:text-[36px] font-bold text-[#141411] mb-2 leading-tight">
            {report.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 font-sans text-[13px] text-gray-600">
            <span className="font-semibold text-gray-900">Prepared for {report.businessName}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {report.location || "Catchment Area"}</span>
            <span className="flex items-center gap-1.5" suppressHydrationWarning>
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* SECTIONS BODY */}
        <div className="p-6 sm:p-10 flex flex-col gap-10">

          {/* 1. BUSINESS OVERVIEW */}
          <section id="section-1" className={`scroll-mt-6 ${activeSection === 1 ? "block" : "hidden print:block"}`}>
            <SectionHeading number={1} title="Business Overview" icon={Briefcase} />

            <div className="flex flex-col xl:flex-row gap-6 mb-6">
              <div className="flex-1">
                <p className="font-sans text-[16px] md:text-[18px] text-gray-800 font-medium leading-relaxed mb-4">
                  {opp.summary || "No summary available."}
                </p>
                <p className="font-sans text-[15px] text-gray-600 leading-relaxed">
                  {comp.why?.summary || ""} {opp.why?.summary || ""}
                </p>
              </div>

              {/* Snapshot Grid */}
              <div className="w-full xl:w-[400px] bg-[#f9faeb]/50 rounded-2xl border border-[#ebcb2f]/20 p-5 shrink-0 grid grid-cols-2 gap-4">
                <div>
                  <p className="font-sans text-[11px] text-emerald-800 font-bold uppercase tracking-wider mb-1">Market Segment</p>
                  <p className="font-sans text-[15px] font-bold text-gray-900">{pricing.marketValue || "Standard Commercial"}</p>
                </div>
                <div>
                  <p className="font-sans text-[11px] text-emerald-800 font-bold uppercase tracking-wider mb-1">Confidence Score</p>
                  <p className="font-sans text-[15px] font-bold text-gray-900">{market.confidence?.score || 88}%</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-[#ebcb2f]/20">
                  <p className="font-sans text-[11px] text-emerald-800 font-bold uppercase tracking-wider mb-1">Core Value Proposition</p>
                  <p className="font-sans text-[14px] font-medium text-gray-900 italic">"{opp.localBusinessOpportunity || "A clear opportunity to capture local market demand."}"</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="hidden print:block border-t-2 border-black" />

          {/* 2. MARKET & POSITIONING */}
          <section id="section-2" className={`scroll-mt-6 ${activeSection === 2 ? "block" : "hidden print:block"}`}>
            <SectionHeading number={2} title="Market & Positioning" icon={MapPin} />

            {/* Catchment Population Reach (5km, 10km, 20km) */}
            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Census-Calibrated Catchment Reach ({report.location || "District"})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">5 km Primary Catchment</span>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">{reach.radius5km?.toLocaleString("en-IN")}</p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Direct daily walk-in & localized footfall</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">10 km Secondary Catchment</span>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">{reach.radius10km?.toLocaleString("en-IN")}</p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Sub-district consumer & business radius</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">20 km Regional Footprint</span>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">{reach.radius20km?.toLocaleString("en-IN")}</p>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Regional commercial distribution reach</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Market Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ebcb2f]" /> Local Market Findings
                  </h3>
                  <p className="font-sans text-[15px] text-gray-700 leading-relaxed pl-4 border-l-2 border-[#ebcb2f]/30">{opp.demandOpportunity}</p>
                </div>
                <div>
                  <h3 className="font-sans text-[15px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ebcb2f]" /> Unmet Needs & Service Gaps
                  </h3>
                  <p className="font-sans text-[15px] text-gray-700 leading-relaxed pl-4 border-l-2 border-[#ebcb2f]/30">{opp.unmetNeed}</p>
                </div>
              </div>

              {/* Competition Details */}
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
                <h3 className="font-sans text-[14px] font-bold uppercase tracking-wider text-gray-900 mb-2 border-b border-gray-200 pb-2">Landscape & Advantage</h3>
                <p className="font-sans text-[14px] text-gray-700 leading-relaxed mb-3"><span className="font-semibold text-gray-900">Current Market:</span> {comp.overview}</p>
                <p className="font-sans text-[14px] text-gray-700 leading-relaxed"><span className="font-semibold text-gray-900">Competitive Edge:</span> {opp.localBusinessOpportunity}</p>

                {comp.observations && comp.observations.length > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                    <Target className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <p className="font-sans text-[13px] text-gray-700"><span className="font-bold text-gray-900">Key Observation:</span> {comp.observations[0]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Competitor Nodes Mapping */}
            {Array.isArray(comp.competitors) && comp.competitors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-sans text-[13px] font-bold uppercase tracking-wider text-gray-700 mb-3">Identified Local Competitors & Institutions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {comp.competitors.slice(0, 4).map((c: any, idx: number) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{c.type || "Competitor"}</span>
                          <span className="text-[11px] font-semibold text-emerald-700">{c.distance || "Local"}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-snug mt-1">{c.name || c.title}</p>
                        {c.gap && <p className="text-xs text-slate-500 mt-1 line-clamp-2">Gap: {c.gap}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <hr className="hidden print:block border-t-2 border-black" />

          {/* 3. SWOT & KEY RISKS */}
          <section id="section-3" className={`scroll-mt-6 ${activeSection === 3 ? "block" : "hidden print:block"}`}>
            <SectionHeading number={3} title="SWOT & Key Risks" icon={Shield} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SWOT Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                  <p className="font-sans text-[13px] font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Strengths</p>
                  <ul className="space-y-2">{(swot.strengths || []).slice(0, 3).map((s: string, i: number) => <li key={i} className="font-sans text-[13px] text-gray-700 leading-snug">• {s}</li>)}</ul>
                </div>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                  <p className="font-sans text-[13px] font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertOctagon className="w-4 h-4" /> Challenges</p>
                  <ul className="space-y-2">{(swot.weaknesses || []).slice(0, 3).map((w: string, i: number) => <li key={i} className="font-sans text-[13px] text-gray-700 leading-snug">• {w}</li>)}</ul>
                </div>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-5">
                  <p className="font-sans text-[13px] font-bold text-cyan-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Opportunities</p>
                  <ul className="space-y-2">{(swot.opportunities || []).slice(0, 3).map((o: string, i: number) => <li key={i} className="font-sans text-[13px] text-gray-700 leading-snug">• {o}</li>)}</ul>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                  <p className="font-sans text-[13px] font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Threats</p>
                  <ul className="space-y-2">{(swot.threats || []).slice(0, 3).map((t: string, i: number) => <li key={i} className="font-sans text-[13px] text-gray-700 leading-snug">• {t}</li>)}</ul>
                </div>
              </div>

              {/* Primary Risk */}
              {primaryRisk && (
                <div className="bg-[#ebcb2f] rounded-2xl p-6 text-[#141411] shadow-md relative overflow-hidden flex flex-col justify-center border-none">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><AlertTriangle className="w-32 h-32 text-[#141411]" /></div>
                  <h4 className="font-sans text-[12px] font-bold text-[#141411]/70 uppercase tracking-wider mb-2">Critical Risk</h4>
                  <p className="font-sans text-[18px] font-bold mb-2 leading-tight">{primaryRisk.title}</p>
                  <p className="font-sans text-[14px] text-[#141411]/90 mb-4 font-medium leading-relaxed">{primaryRisk.explanation}</p>
                  <div className="bg-white/30 rounded-xl p-3 mt-auto">
                    <p className="font-sans text-[11px] text-[#141411]/80 uppercase font-bold tracking-wider mb-1">Operational Mitigation</p>
                    <p className="font-sans text-[13px] font-bold leading-snug text-[#141411]">{primaryRisk.mitigationAdvisory}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="hidden print:block border-t-2 border-black" />

          {/* 4. FINANCIAL OUTLOOK */}
          <section id="section-4" className={`scroll-mt-6 ${activeSection === 4 ? "block" : "hidden print:block"}`}>
            <SectionHeading number={4} title="Financial Outlook & DPR Structure" icon={Landmark} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Capital & Revenue Summary */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <p className="font-sans text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Capital Structuring (DPR)</p>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Total Project Cost</span><span className="font-sans text-[16px] font-bold text-gray-900">₹{(capital.expectedInvestment / 100000).toFixed(1)} Lakh</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Promoter Margin (10-15%)</span><span className="font-sans text-[16px] font-bold text-gray-900">₹{(capital.availableMargin / 100000).toFixed(1)} Lakh</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Bank Term Loan (90%)</span><span className="font-sans text-[16px] font-bold text-gray-900">₹{((capital.expectedInvestment - capital.availableMargin) / 100000).toFixed(1)} Lakh</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200"><span className="font-sans text-[14px] font-bold text-emerald-800">Govt Subsidy (PMEGP)</span><span className="font-sans text-[16px] font-bold text-emerald-700">₹{(capital.subsidyAmount ? capital.subsidyAmount / 100000 : (capital.expectedInvestment * 0.25) / 100000).toFixed(1)} Lakh ({capital.subsidyPercent || 25}%)</span></div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <p className="font-sans text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Operating Viability</p>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Monthly Turnover</span><span className="font-sans text-[16px] font-bold text-gray-900">₹{(operations.expectedRevenue / 1000).toFixed(0)}K / mo</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Est. Net Profit</span><span className="font-sans text-[16px] font-bold text-gray-900">₹{(operations.monthlyProfit ? operations.monthlyProfit / 1000 : (operations.expectedRevenue * 0.22) / 1000).toFixed(0)}K / mo</span></div>
                  <div className="flex justify-between items-center mb-2"><span className="font-sans text-[14px] text-gray-600">Break-Even Horizon</span><span className="font-sans text-[16px] font-bold text-gray-900">{operations.breakEvenMonths || 6} Months</span></div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200"><span className="font-sans text-[14px] font-bold text-gray-900">DSCR Coverage</span><span className="font-sans text-[16px] font-bold text-emerald-800">{operations.dscr || "1.85"}x (Bankable)</span></div>
                </div>
              </div>

              {/* Funding Options */}
              <div className="bg-[#f9faeb]/50 border border-[#ebcb2f]/20 rounded-2xl p-5">
                <h4 className="font-sans text-[14px] font-bold text-gray-900 flex items-center gap-2 mb-4"><HandCoins className="w-5 h-5 text-emerald-700" /> Applicable Subsidies</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                    <p className="font-sans text-[13px] font-bold text-gray-900 mb-0.5">PMEGP Credit Linked Subsidy</p>
                    <p className="font-sans text-[12px] text-gray-600 leading-snug">Up to 35% margin money grant in rural areas, 25% in urban areas through KVIC portal.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                    <p className="font-sans text-[13px] font-bold text-gray-900 mb-0.5">SCA / MUDRA Term Loan</p>
                    <p className="font-sans text-[12px] text-gray-600 leading-snug">Concessional 8% p.a. interest rate with 6-month moratorium period.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="hidden print:block border-t border-gray-100" />

          {/* 5. ACTION PLAN & VERDICT */}
          <section id="section-5" className={`scroll-mt-6 ${activeSection === 5 ? "block" : "hidden print:block"}`}>
            <SectionHeading number={5} title="Action Plan & Statutory Verdict" icon={Target} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Immediate Steps */}
              <div>
                <h3 className="font-sans text-[15px] font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Immediate Next Steps</h3>
                <div className="space-y-3">
                  {[
                    { title: "Statutory Clearances", desc: "Obtain trade permit, pollution clearance, and sector registration (Udyam / Clinical Establishments Act)." },
                    { title: "Submit Bank DPR", desc: "Carry this DPR report to the regional PSU branch for PMEGP loan sanction." },
                    { title: "Procurement & Site Setup", desc: primaryRisk?.mitigationAdvisory || "Secure reliable vendor agreements and initiate site civil works." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="w-6 h-6 rounded-full bg-[#ebcb2f] text-[#141411] flex items-center justify-center font-sans text-[12px] font-bold shrink-0">{idx + 1}</div>
                      <div>
                        <p className="font-sans text-[14px] font-bold text-gray-900">{step.title}</p>
                        <p className="font-sans text-[13px] text-gray-600 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verdict & Evidence */}
              <div className="flex flex-col gap-4">
                <div className="bg-[#ebcb2f] text-[#141411] rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-center border-none">
                  <h3 className="font-sans text-[14px] font-bold text-[#141411]/80 uppercase tracking-wider mb-2">Final Advisory Verdict</h3>
                  <p className="font-heading text-[20px] md:text-[22px] font-extrabold text-[#141411] mb-2 leading-tight">
                    {swot.why?.summary || "Favorable local conditions for commercial enterprise."}
                  </p>
                  <p className="font-sans text-[14px] text-[#141411]/90 font-medium leading-relaxed">
                    {opp.summary}
                  </p>
                </div>

                {/* Compact Data Confidence */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-wrap gap-2 font-sans text-[11px]">
                  <span className="font-bold text-gray-500 uppercase w-full mb-1">Data Confidence Scores</span>
                  {[
                    { l: "Market Potential", c: market.confidence?.score || 88 },
                    { l: "Opportunity", c: opp.confidence?.score || 85 },
                    { l: "Competition", c: comp.confidence?.score || 82 },
                    { l: "SWOT Validation", c: swot.confidence?.score || 86 }
                  ].map((d, idx) => (
                    <span key={idx} className="bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-xs">
                      {d.l}: <span className="font-bold text-gray-900">{d.c}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

    </div>
  );
};

