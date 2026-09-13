"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Map, Compass, TrendingUp, Wallet, PiggyBank,
  BarChart3, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight,
  IndianRupee, Clock, Percent, CalendarDays, ChevronLeft, ChevronRight,
  MapPin
} from "lucide-react";
import { useParams } from "next/navigation";
import { WhatIfSimulator } from "@/features/finance/components/WhatIfSimulator";
import { useBusinessDetails } from "@/lib/data/businesses";
import {
  computeFinancialPlan,
  MICRO_FINANCE_SCHEME,
  TERM_LOAN_SCHEME,
  type SchemeDefinition,
  type FinancialPlan,
  type RepaymentRow,
} from "@/features/finance/schemeEngine";
import financeData from "@/data/finance.json";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function fmtLakh(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lakh`;
  return fmt(n);
}

const statusStyle: Record<string, string> = {
  "Likely relevant": "bg-green-100 text-green-700 border border-green-200",
  "May be relevant": "bg-amber-100 text-amber-700 border border-amber-200",
  "Needs verification": "bg-slate-100 text-slate-600 border border-slate-200",
};

// ── Shared Card wrapper ───────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] transition-all duration-300 w-full min-w-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title, subtitle, accent = false
}: { title: string; subtitle?: string; accent?: boolean }) {
  return (
    <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 min-w-0 ${accent ? "bg-[#81cc87]" : ""}`}>
      <h2 className={`font-sans text-base sm:text-[18px] tracking-tight font-bold break-words ${accent ? "text-[#f9faeb]" : "text-slate-900"}`}>{title}</h2>
      {subtitle && <p className={`font-sans text-xs sm:text-[12px] mt-0.5 break-words ${accent ? "text-[#f9faeb]/80" : "text-gray-500"}`}>{subtitle}</p>}
    </div>
  );
}

// ── Auto-Selected Scheme Card ─────────────────────────────────────────────────
function SchemeCard({ scheme, plan }: { scheme: SchemeDefinition; plan: FinancialPlan }) {
  const isMicro = scheme.id === "micro-finance";

  return (
    <div className={`rounded-2xl border-2 overflow-hidden shadow-md w-full min-w-0 ${isMicro ? "border-blue-300 bg-blue-50/30" : "border-emerald-300 bg-emerald-50/30"
      }`}>
      {/* Header */}
      <div className={`px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isMicro ? "bg-blue-600" : "bg-emerald-700"
        }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-sans text-base sm:text-[18px] font-bold text-white break-words">{scheme.name}</h3>
            <p className="font-sans text-[11px] sm:text-[12px] text-white/80 mt-0.5 break-words">Auto-selected based on your project cost</p>
          </div>
        </div>
        <span className="bg-white/20 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-white/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Recommended for you
        </span>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 min-w-0">
        <p className="font-sans text-xs sm:text-[14px] text-gray-700 leading-relaxed mb-4 sm:mb-6 break-words whitespace-normal">
          {scheme.description}
        </p>

        {/* Parameter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: "Interest Rate", value: `${scheme.interestRate}% p.a.`, icon: Percent, color: isMicro ? "text-blue-700" : "text-emerald-700" },
            { label: "Tenure", value: `${scheme.tenureYears} yrs (${scheme.tenureMonths} mos)`, icon: CalendarDays, color: isMicro ? "text-blue-700" : "text-emerald-700" },
            { label: "Moratorium", value: `${scheme.moratoriumMonths} months`, icon: Clock, color: isMicro ? "text-blue-700" : "text-emerald-700" },
            { label: "Max Loan", value: fmtLakh(scheme.maxLoanAmount), icon: IndianRupee, color: isMicro ? "text-blue-700" : "text-emerald-700" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 min-w-0 overflow-hidden shadow-2xs">
              <div className="flex items-center gap-1.5">
                <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{item.label}</span>
              </div>
              <span className={`font-sans text-sm sm:text-[16px] font-bold break-words ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Financial Outcome */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 min-w-0 shadow-2xs">
          <h4 className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Your Financial Outcome</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="min-w-0">
              <span className="font-sans text-[11px] sm:text-[12px] text-slate-500 font-medium block mb-1 truncate">Monthly EMI</span>
              <span className="font-sans text-base sm:text-xl md:text-[22px] font-bold text-gray-900 break-words">{fmt(plan.monthlyEMI)}</span>
            </div>
            <div className="min-w-0">
              <span className="font-sans text-[11px] sm:text-[12px] text-slate-500 font-medium block mb-1 truncate">Total Interest</span>
              <span className="font-sans text-base sm:text-xl md:text-[22px] font-bold text-gray-900 break-words">{fmt(plan.totalInterest)}</span>
            </div>
            <div className="min-w-0">
              <span className="font-sans text-[11px] sm:text-[12px] text-slate-500 font-medium block mb-1 truncate">Total Repayment</span>
              <span className="font-sans text-base sm:text-xl md:text-[22px] font-bold text-gray-900 break-words">{fmt(plan.totalRepayment)}</span>
            </div>
            <div className="min-w-0">
              <span className="font-sans text-[11px] sm:text-[12px] text-slate-500 font-medium block mb-1 truncate">Funding Ratio</span>
              <span className="font-sans text-base sm:text-xl md:text-[22px] font-bold text-gray-900 break-words">90 : 10</span>
              <span className="font-sans text-[10px] sm:text-[11px] text-slate-400 block truncate">Loan : Your share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const [schedulePage, setSchedulePage] = useState(0);
  const params = useParams();
  const id = params?.id as string;
  const { data: business, isLoading } = useBusinessDetails(id);

  const businessLocationStr = useMemo(() => {
    const loc = (business as any)?.location;
    if (!loc) return null;
    if (loc.formatted) return loc.formatted;
    const parts = [loc.village, loc.block || loc.subdistrict, loc.district, loc.state].filter(Boolean);
    const unique = parts.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
    return unique.join(", ");
  }, [business]);

  // Get margin from business data
  const availableMargin = business?.capital?.availableMargin ?? (business as any)?.availableMargin ?? 0;

  // ── Compute the full financial plan from the user's margin ──
  const plan = useMemo(() => computeFinancialPlan(availableMargin), [availableMargin]);

  const schemeRouted = plan.schemeResult.routed;
  const scheme = schemeRouted ? (plan.schemeResult as { routed: true; scheme: SchemeDefinition }).scheme : null;

  // ── Existing MUDRA / NABARD options from JSON (kept as-is) ──
  const { fundingAllocation, fundingOptions } = financeData;
  const totalAllocation = fundingAllocation.reduce((s, r) => s + r.amount, 0);

  // Dynamically computed repayment schedule from scheme engine
  const scheduleRows = plan.repaymentSchedule;

  if (isLoading) {
    return (
      <div className="w-full h-full p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-sm text-slate-500 font-medium">Loading financial planning...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="max-w-md w-full bg-[#fffff5] rounded-2xl border border-gray-900/10 p-8 shadow-lg text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E6702]/10 flex items-center justify-center text-[#1E6702]">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-[22px] font-bold text-slate-900">Venture Plan Needed</h2>
          <p className="font-sans text-sm text-slate-500">
            Please create or select a venture plan to view its customized financial projection and loan options.
          </p>
          <Link
            href="/business/create"
            className="mt-2 px-6 py-3 bg-[#1E6702] hover:bg-[#164e01] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            Create Business Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-3.5 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 bg-[#f4fce8] max-w-full overflow-x-hidden">

      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <div className="mb-4 sm:mb-8">
        <Link
          href={`/business/${id}`}
          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[14px] font-semibold text-gray-500 hover:text-primary transition-colors mb-3 sm:mb-5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to business
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-heading text-2xl sm:text-[32px] font-bold text-[#242424] tracking-tight leading-tight break-words">
              Financial Planning
            </h1>
            <p className="font-sans text-xs sm:text-[14px] text-slate-500 font-medium mt-0.5 break-words">
              Understand the money needed, possible funding, and repayment burden.
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-block font-sans text-[10px] sm:text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-wider break-words">
                Preliminary estimate · based on information provided
              </span>
              {businessLocationStr && (
                <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  {businessLocationStr}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
            <Link href={`/business/${id}/feasibility`}
              className="flex items-center gap-1.5 sm:gap-2 bg-white border border-slate-200 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-sans text-xs sm:text-[14px] font-semibold hover:border-primary hover:text-primary transition-all shadow-sm">
              <Map className="w-4 h-4 shrink-0" /> Feasibility
            </Link>
            <Link href={`/business/${id}/roadmap`}
              className="flex items-center gap-1.5 sm:gap-2 bg-primary text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-sans text-xs sm:text-[14px] font-semibold hover:bg-primary-light transition-colors shadow-sm">
              <Compass className="w-4 h-4 shrink-0" /> Action Roadmap
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Summary Strip (DYNAMIC from 10% formula) ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: "Project Cost", value: fmt(plan.projectCost), sub: "Available Margin ÷ 10%", icon: BarChart3, bgClass: "bg-[#094f9e] border-transparent" },
          { label: "Your Margin (10%)", value: fmt(plan.availableMargin), sub: "Your own capital contribution", icon: Wallet, bgClass: "bg-[#c2a213] border-transparent" },
          { label: "Loan Amount (90%)", value: fmt(plan.loanAmount), sub: scheme ? `Via ${scheme.name}` : "Scheme not available", icon: PiggyBank, bgClass: "bg-[#8f785a] border-transparent" },
          { label: "Monthly EMI", value: fmt(plan.monthlyEMI), sub: scheme ? `${scheme.interestRate}% p.a. · ${scheme.tenureYears}yr tenure` : "—", icon: TrendingUp, bgClass: "bg-[#54365e] border-transparent" },
        ].map(item => (
          <div key={item.label}
            className={`rounded-2xl border p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 shadow-sm min-w-0 overflow-hidden ${item.bgClass}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white/80 break-words">{item.label}</span>
              <item.icon className="w-4 h-4 text-white/50 shrink-0" />
            </div>
            <div className="font-sans text-xl sm:text-2xl lg:text-[26px] font-bold leading-tight text-white break-words" suppressHydrationWarning>
              {item.value}
            </div>
            <p className="font-sans text-[11px] sm:text-[12px] text-white/70 break-words whitespace-normal">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* ── 3. The 10% Formula Explanation ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
        <Card>
          <CardHeader title="How the 10% formula works" accent />
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3.5 sm:gap-4 min-w-0">
            {[
              { label: "Your Available Margin (10%)", value: plan.availableMargin, color: "text-primary", dot: "bg-primary", note: "What you bring to the table" },
              { label: "Total Project Cost", value: plan.projectCost, color: "text-gray-900", dot: "bg-slate-400", note: "Margin ÷ 10% = Full project size" },
              { label: "Loan from Scheme (90%)", value: plan.loanAmount, color: "text-[#094f9e]", dot: "bg-[#094f9e]", note: scheme ? `Capped at ${fmtLakh(scheme.maxLoanAmount)}` : "—" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between gap-2 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-100 last:border-0 last:pb-0 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-xs sm:text-[14px] text-gray-700 font-medium break-words">{row.label}</span>
                    <span className="font-sans text-[10px] sm:text-[11px] text-gray-400 break-words">{row.note}</span>
                  </div>
                </div>
                <span className={`font-sans text-sm sm:text-[16px] font-bold shrink-0 ${row.color}`} suppressHydrationWarning>{fmt(row.value)}</span>
              </div>
            ))}

            {/* Formula visual */}
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mt-2 border border-slate-100 min-w-0 overflow-hidden">
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 font-mono text-xs sm:text-[14px] text-gray-700 text-center" suppressHydrationWarning>
                <span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-lg break-words">{fmt(plan.availableMargin)}</span>
                <span className="text-gray-400 font-bold">÷ 10%</span>
                <span className="text-gray-400 font-bold">=</span>
                <span className="bg-slate-200 text-gray-900 font-bold px-2.5 py-1 rounded-lg break-words">{fmt(plan.projectCost)}</span>
                <span className="text-gray-400 font-bold">× 90%</span>
                <span className="text-gray-400 font-bold">=</span>
                <span className="bg-[#094f9e]/10 text-[#094f9e] font-bold px-2.5 py-1 rounded-lg break-words">{fmt(plan.loanAmount)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Funding proportion" accent />
          <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4 sm:gap-5 justify-center h-auto sm:h-[calc(100%-61px)] min-w-0">
            <div className="flex rounded-xl overflow-hidden h-9 sm:h-10 shadow-inner border border-slate-100 min-w-0">
              <div
                className="bg-primary flex items-center justify-center text-white font-sans text-xs sm:text-[14px] font-bold transition-all duration-700"
                style={{ width: "10%" }}
              >
                10%
              </div>
              <div
                className="bg-[#094f9e] flex items-center justify-center text-white font-sans text-xs sm:text-[14px] font-bold transition-all duration-700"
                style={{ width: "90%" }}
              >
                90%
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 font-sans text-xs sm:text-[14px] text-gray-600">
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded bg-primary inline-block shrink-0" />
                <span className="break-words">Your contribution — <strong className="text-gray-800">{fmt(plan.availableMargin)}</strong></span>
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded bg-[#094f9e] inline-block shrink-0" />
                <span className="break-words">Concessional loan — <strong className="text-gray-800">{fmt(plan.loanAmount)}</strong></span>
              </span>
            </div>

            {/* Scheme routing explanation */}
            <div className={`rounded-xl p-3.5 sm:p-4 border mt-2 min-w-0 ${scheme?.id === "micro-finance"
                ? "bg-blue-50 border-blue-200"
                : scheme
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}>
              <div className="flex items-start gap-2.5 min-w-0">
                {schemeRouted ? (
                  <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${scheme?.id === "micro-finance" ? "text-blue-600" : "text-emerald-600"}`} />
                ) : (
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
                )}
                <div className="min-w-0 flex-1">
                  <span className={`font-sans text-xs sm:text-[13px] font-bold break-words block ${scheme?.id === "micro-finance" ? "text-blue-700" : scheme ? "text-emerald-700" : "text-red-700"
                    }`}>
                    {schemeRouted
                      ? `Auto-selected: ${scheme!.name}`
                      : "No concessional scheme available"}
                  </span>
                  <p className="font-sans text-[11px] sm:text-[12px] text-gray-600 mt-1 break-words whitespace-normal" suppressHydrationWarning>
                    {schemeRouted
                      ? `Project cost of ${fmtLakh(plan.projectCost)} falls ${scheme?.id === "micro-finance"
                        ? "within the ₹1.40 Lakh Micro Finance threshold"
                        : "between ₹1.40 Lakh and ₹50 Lakh (Term Loan range)"
                      }.`
                      : (plan.schemeResult as { routed: false; reason: string }).reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 4. Auto-Selected Scheme ─────────────────────────────────────── */}
      {schemeRouted && scheme && (
        <div className="mb-4 sm:mb-6 min-w-0">
          <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" /> Matched Government Concessional Scheme
          </h2>
          <SchemeCard scheme={scheme} plan={plan} />
        </div>
      )}

      {/* ── 5. Repayment Plan Summary ───────────────────────────────────── */}
      {schemeRouted && scheme && (
        <div className="bg-[#094f9e] rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm min-w-0 overflow-hidden">
          <h2 className="font-sans text-[11px] sm:text-[12px] font-bold text-white/80 uppercase tracking-wider mb-4 sm:mb-5 break-words">Your repayment plan · {scheme.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {[
              { label: "Frequency", value: "Quarterly" },
              { label: "Period", value: `${scheme.tenureMonths} mos (${scheme.tenureYears} yrs)` },
              { label: "Interest rate", value: `${scheme.interestRate}% p.a.` },
              { label: "Moratorium", value: `${scheme.moratoriumMonths} mos (int. only)` },
              { label: "Monthly EMI", value: fmt(plan.monthlyEMI) },
              { label: "Total interest", value: fmt(plan.totalInterest) },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-1 min-w-0">
                <span className="font-sans text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider truncate">{item.label}</span>
                <span className="font-sans text-sm sm:text-[16px] font-bold text-white leading-tight break-words" suppressHydrationWarning>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 10. Other Available Funding Options (MUDRA / NABARD) ────────── */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader
          title="Other Available Funding Options"
          subtitle="Additional schemes and lending products that may also be relevant to your business."
          accent
        />
        <div className="overflow-x-auto w-full max-w-full pb-2 scrollbar-thin">
          <table className="w-full font-sans text-xs sm:text-[14px]">
            <thead>
              <tr className="border-b border-[#81cc87] bg-[#81cc87]">
                {["Option", "Why it may suit", "Type", "Possible amount", "Interest", "Period", "Moratorium", "Status"].map(h => (
                  <th key={h} className="text-left font-sans text-[10px] sm:text-[11px] font-bold text-[#f9faeb] uppercase tracking-wider py-2.5 sm:py-3 px-3 sm:px-4 first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fundingOptions.map(opt => (
                <tr key={opt.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 sm:py-4 px-3 sm:px-4 pl-4 sm:pl-6 font-sans text-xs sm:text-[14px] font-bold text-gray-900 whitespace-nowrap">{opt.name}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 font-sans text-[11px] sm:text-[12px] min-w-[180px] max-w-[240px] break-words whitespace-normal">{opt.reason}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-700 whitespace-nowrap">{opt.supportType}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">{opt.amount}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-700 whitespace-nowrap">{opt.interest}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-700 whitespace-nowrap">{opt.tenure}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-700 whitespace-nowrap">{opt.moratorium}</td>
                  <td className="py-3 sm:py-4 px-3 sm:px-4 pr-4 sm:pr-6 whitespace-nowrap">
                    <span className={`font-sans text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${statusStyle[opt.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {opt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 6. Dynamic Repayment Schedule ───────────────────────────────── */}
      {scheduleRows.length > 0 && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader title="Repayment schedule" subtitle="Quarter-by-quarter breakdown of principal, interest, and outstanding balance." accent />
          <div className="overflow-x-auto px-0 w-full max-w-full pb-2 scrollbar-thin">
            <table className="w-full font-sans text-xs sm:text-[14px]">
              <thead>
                <tr className="border-b border-[#81cc87] bg-[#81cc87]">
                  {["Period", "Type", "Principal", "Interest", "Total payment", "Balance left"].map(h => (
                    <th key={h} className="text-left font-sans text-[10px] sm:text-[11px] font-bold text-[#f9faeb] uppercase tracking-wider py-2.5 sm:py-3 px-3 sm:px-4 first:pl-4 sm:first:pl-6 last:pr-4 sm:last:pr-6 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.slice(schedulePage * 6, (schedulePage + 1) * 6).map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 ${row.isMoratorium ? "bg-amber-50/40" : ""}`}>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 pl-4 sm:pl-6 font-sans text-xs sm:text-[14px] font-bold text-gray-900 whitespace-nowrap">{row.period}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`font-sans text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border ${row.isMoratorium
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-green-100 text-green-700 border-green-200"
                        }`}>
                        {row.isMoratorium ? "Moratorium" : "Regular"}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 font-sans text-xs sm:text-[14px] text-gray-700 font-medium whitespace-nowrap" suppressHydrationWarning>{fmt(row.principal)}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 font-sans text-xs sm:text-[14px] text-gray-700 font-medium whitespace-nowrap" suppressHydrationWarning>{fmt(row.interest)}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 font-sans text-xs sm:text-[14px] font-bold text-gray-900 whitespace-nowrap" suppressHydrationWarning>{fmt(row.total)}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 pr-4 sm:pr-6 font-sans text-xs sm:text-[14px] font-bold text-[#094f9e] whitespace-nowrap" suppressHydrationWarning>{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scheduleRows.length > 6 && (
            <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-[11px] sm:text-[12px] text-slate-500 text-center sm:text-left">
                Showing quarters {schedulePage * 6 + 1} - {Math.min((schedulePage + 1) * 6, scheduleRows.length)} of {scheduleRows.length}.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSchedulePage(p => Math.max(0, p - 1))}
                  disabled={schedulePage === 0}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSchedulePage(p => p + 1)}
                  disabled={(schedulePage + 1) * 6 >= scheduleRows.length}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── 7. Repayment Chart (uses dynamic data) ─────────────────────── */}
      {scheduleRows.length > 0 && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader title="Repayment chart" subtitle="Visual breakdown of principal and interest across quarters." accent />
          <div className="p-3.5 sm:px-6 sm:py-5 min-w-0">
            <DynamicRepaymentChart data={scheduleRows} />
          </div>
        </Card>
      )}

      {/* ── 8. What-If Simulator (pre-populated with scheme defaults) ──── */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader
          title="What may happen?"
          subtitle="Adjust the sliders to explore how different loan sizes, rates, and revenues affect your repayment. (Note: Initial values are auto-synced to your selected government scheme)"
          accent
        />
        <div className="p-4 sm:p-6 min-w-0">
          <WhatIfSimulator
            defaultLoan={plan.loanAmount}
            defaultRate={scheme?.interestRate ?? 9}
            defaultTenure={scheme?.tenureMonths ?? 60}
            defaultMoratorium={scheme?.moratoriumMonths ?? 6}
          />
        </div>
      </Card>

      {/* ── 9. Where the money may go ──────────────────────────────────── */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader title="Where the money may go" subtitle="Estimated breakdown of project costs." accent />
        <div className="px-3 sm:px-6 py-2 overflow-x-auto w-full max-w-full scrollbar-thin">
          <table className="min-w-[380px] sm:min-w-[440px] w-full font-sans text-xs sm:text-[14px]">
            <thead>
              <tr className="border-b border-[#81cc87] bg-[#81cc87]">
                {["Item", "Estimated amount", "Share of total", ""].map(h => (
                  <th key={h} className="text-left font-sans text-[10px] sm:text-[11px] font-bold text-[#f9faeb] uppercase tracking-wider py-2.5 sm:py-3 px-3 sm:px-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fundingAllocation.map(row => {
                const pct = Math.round((row.amount / totalAllocation) * 100);
                return (
                  <tr key={row.item} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-xs sm:text-[14px] text-gray-800 font-medium break-words">{row.item}</td>
                    <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-xs sm:text-[14px] font-bold text-gray-900 whitespace-nowrap" suppressHydrationWarning>{fmt(row.amount)}</td>
                    <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-xs sm:text-[14px] text-gray-500 font-medium">{pct}%</td>
                    <td className="py-3 sm:py-3.5 w-36 sm:w-48 hidden sm:table-cell">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-[#f4fce8]">
                <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-xs sm:text-[14px] font-bold text-gray-900 rounded-bl-xl">Total</td>
                <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-sm sm:text-[16px] font-bold text-primary whitespace-nowrap" suppressHydrationWarning>{fmt(totalAllocation)}</td>
                <td className="py-3 sm:py-3.5 pr-3 sm:pr-6 font-sans text-xs sm:text-[14px] text-gray-500 font-medium">100%</td>
                <td className="rounded-br-xl hidden sm:table-cell" />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 11. Important note ─────────────────────────────────────────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:px-6 sm:py-4 mb-4 min-w-0">
        <p className="font-sans text-xs sm:text-[13px] text-amber-800 leading-relaxed break-words">
          <strong className="font-bold">Important: </strong>
          These figures are preliminary estimates only. Final loan terms, scheme eligibility, actual income,
          and repayment requirements must be verified with the State Channelizing Agency (SCA) or a qualified
          lending institution before making any financial commitment.
        </p>
      </div>
    </div>
  );
}

// ── Inline Repayment Chart (uses dynamic schedule data) ──────────────────────
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

function DynamicRepaymentChart({ data }: { data: RepaymentRow[] }) {
  const MORATORIUM_COLOR = "#d1d5db";
  const PRINCIPAL_COLOR = "#094f9e";
  const INTEREST_COLOR = "#8e90f5";

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `₹${v / 1000}k`}
          />
          <Tooltip
            cursor={{ fill: "#f1f5f9" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px -4px rgba(0,0,0,0.1)",
              fontSize: 13,
            }}
            formatter={(value, name) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, String(name)]}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
            formatter={(value) => <span style={{ color: "#475569", fontWeight: 500 }}>{value}</span>}
          />
          <Bar dataKey="principal" name="Principal (₹)" stackId="a" fill={PRINCIPAL_COLOR} radius={[0, 0, 4, 4]} />
          <Bar dataKey="interest" name="Interest (₹)" stackId="a" fill={INTEREST_COLOR} radius={[4, 4, 0, 0]}>
            {data.map((entry, i) =>
              entry.isMoratorium
                ? <Cell key={i} fill={MORATORIUM_COLOR} />
                : <Cell key={i} fill={INTEREST_COLOR} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="font-sans text-[12px] text-center text-gray-400 mt-2">
        Grey bars indicate moratorium quarters (interest only). Data computed from your margin input.
      </p>
    </div>
  );
}
