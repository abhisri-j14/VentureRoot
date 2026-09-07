"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Map, Compass, TrendingUp, Wallet, PiggyBank, BarChart3 } from "lucide-react";
import { useParams } from "next/navigation";
import { RepaymentChart } from "@/features/finance/components/RepaymentChart";
import { WhatIfSimulator } from "@/features/finance/components/WhatIfSimulator";
import financeData from "@/data/finance.json";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

const statusStyle: Record<string, string> = {
  "Likely relevant":    "bg-green-100 text-green-700 border border-green-200",
  "May be relevant":    "bg-amber-100 text-amber-700 border border-amber-200",
  "Needs verification": "bg-slate-100 text-slate-600 border border-slate-200",
};

// ── Derived values ────────────────────────────────────────────────────────────
const totalAllocation = financeData.fundingAllocation.reduce((s, r) => s + r.amount, 0);
let balance = financeData.summary.possibleLoan;
const scheduleRows = financeData.repaymentSchedule.map(r => {
  const total = r.principal + r.interest;
  balance = Math.max(0, balance - r.principal);
  return { ...r, total, balance };
});

// ── Shared Card wrapper ───────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({
  title, subtitle, accent = false
}: { title: string; subtitle?: string; accent?: boolean }) {
  return (
    <div className={`px-6 py-5 border-b border-slate-100 ${accent ? "bg-[#96b827]" : ""}`}>
      <h2 className={`text-[20px] tracking-tight font-bold ${accent ? "text-white" : "text-slate-900"}`}>{title}</h2>
      {subtitle && <p className={`text-xs mt-0.5 ${accent ? "text-white/70" : "text-gray-500"}`}>{subtitle}</p>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FinancePage() {
  const params = useParams();
  const id = params?.id as string;
  const { summary, fundingAllocation, fundingOptions, repaymentPlan } = financeData;

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-[#f4fce8]">

        {/* ── 1. Header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <Link
            href={`/business/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to business
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-heading font-bold text-[#242424] tracking-tight leading-tight">
                Financial Planning
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Understand the money needed, possible funding, and repayment burden.
              </p>
              <span className="inline-block mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Preliminary estimate · based on information provided
              </span>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/business/${id}/feasibility`}
                className="flex items-center gap-2 bg-white border border-slate-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-all shadow-sm">
                <Map className="w-4 h-4" /> Feasibility
              </Link>
              <Link href={`/business/${id}/roadmap`}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors shadow-sm">
                <Compass className="w-4 h-4" /> Action Roadmap
              </Link>
            </div>
          </div>
        </div>

        {/* ── 2. Summary Strip ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total needed",      value: fmt(summary.totalNeeded),     sub: "Estimated project cost",    icon: BarChart3, bgClass: "bg-[#094f9e] border-transparent" },
            { label: "Your contribution", value: fmt(summary.ownContribution), sub: "Own capital applied",        icon: Wallet,    bgClass: "bg-[#c2a213] border-transparent" },
            { label: "Possible loan",     value: fmt(summary.possibleLoan),    sub: "To be financed externally", icon: PiggyBank, bgClass: "bg-[#8f785a] border-transparent" },
            { label: "Monthly surplus",   value: fmt(summary.monthlySurplus),  sub: "After EMI and expenses",    icon: TrendingUp,bgClass: "bg-[#54365e] border-transparent" },
          ].map(item => (
            <div key={item.label}
              className={`rounded-2xl border p-5 flex flex-col gap-3 shadow-sm ${item.bgClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">{item.label}</span>
                <item.icon className="w-4 h-4 text-white/40" />
              </div>
              <div className="text-2xl md:text-3xl font-black font-heading leading-none text-white">
                {item.value}
              </div>
              <p className="text-xs text-white/60">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ── 3. Funding Calculation ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader title="How your funding is calculated" accent />
            <div className="px-6 py-5 flex flex-col gap-4">
              {[
                { label: "Estimated project cost", value: summary.totalNeeded,     color: "text-gray-900",  dot: "bg-slate-300" },
                { label: "Your own capital",        value: summary.ownContribution, color: "text-primary",   dot: "bg-primary" },
                { label: "Amount to be borrowed",   value: summary.possibleLoan,    color: "text-[#094f9e]", dot: "bg-[#094f9e]" },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${row.dot}`} />
                    <span className="text-sm text-gray-600 font-medium">{row.label}</span>
                  </div>
                  <span className={`text-lg font-bold shrink-0 ${row.color}`}>{fmt(row.value)}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">Based on information provided during setup.</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Funding proportion" accent />
            <div className="px-6 py-5 flex flex-col gap-5 justify-center h-[calc(100%-61px)]">
              <div className="flex rounded-xl overflow-hidden h-10 shadow-inner border border-slate-100">
                <div
                  className="bg-primary flex items-center justify-center text-white text-sm font-bold transition-all duration-700"
                  style={{ width: `${Math.round((summary.ownContribution / summary.totalNeeded) * 100)}%` }}
                >
                  {Math.round((summary.ownContribution / summary.totalNeeded) * 100)}%
                </div>
                <div
                  className="bg-[#094f9e] flex items-center justify-center text-white text-sm font-bold transition-all duration-700"
                  style={{ width: `${Math.round((summary.possibleLoan / summary.totalNeeded) * 100)}%` }}
                >
                  {Math.round((summary.possibleLoan / summary.totalNeeded) * 100)}%
                </div>
              </div>
              <div className="flex gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-primary inline-block shrink-0" />
                  Own contribution — {fmt(summary.ownContribution)}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-[#094f9e] inline-block shrink-0" />
                  Possible loan — {fmt(summary.possibleLoan)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── 4. Funding Options ───────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader
            title="Funding Options"
            subtitle="Compare options that may suit your business."
            accent
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Option", "Why it may suit", "Type", "Possible amount", "Interest", "Period", "Moratorium", "Status"].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3 px-4 first:pl-6 last:pr-6 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fundingOptions.map(opt => (
                  <tr key={opt.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 pl-6 font-bold text-gray-900 whitespace-nowrap">{opt.name}</td>
                    <td className="py-4 px-4 text-gray-500 text-xs max-w-[200px]">{opt.reason}</td>
                    <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{opt.supportType}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">{opt.amount}</td>
                    <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{opt.interest}</td>
                    <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{opt.tenure}</td>
                    <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{opt.moratorium}</td>
                    <td className="py-4 px-4 pr-6 whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusStyle[opt.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {opt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── 5. Where the money may go ────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader title="Where the money may go" subtitle="Estimated breakdown of project costs." accent />
          <div className="px-6 py-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Item", "Estimated amount", "Share of total", ""].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3 pr-6">
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
                      <td className="py-3.5 pr-6 text-gray-800 font-medium">{row.item}</td>
                      <td className="py-3.5 pr-6 font-bold text-gray-900">{fmt(row.amount)}</td>
                      <td className="py-3.5 pr-6 text-gray-500 font-medium">{pct}%</td>
                      <td className="py-3.5 w-48 hidden sm:table-cell">
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
                  <td className="py-3.5 pr-6 font-bold text-gray-900 rounded-bl-xl">Total</td>
                  <td className="py-3.5 pr-6 font-black text-primary text-base">{fmt(totalAllocation)}</td>
                  <td className="py-3.5 pr-6 text-gray-500 font-medium">100%</td>
                  <td className="rounded-br-xl hidden sm:table-cell" />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── 6. Repayment Plan Summary ─────────────────────────────────── */}
        <div className="bg-[#094f9e] rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-5">Your repayment plan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
            {[
              { label: "Frequency",       value: repaymentPlan.frequency },
              { label: "Period",          value: repaymentPlan.period },
              { label: "Interest rate",   value: repaymentPlan.interestRate },
              { label: "Payment pause",   value: repaymentPlan.moratorium },
              { label: "Regular payment", value: repaymentPlan.regularPayment },
              { label: "Total interest",  value: repaymentPlan.totalInterest },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{item.label}</span>
                <span className="text-base font-bold text-white leading-tight">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. Repayment Schedule ─────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader title="Repayment schedule" subtitle="Period-by-period breakdown of principal, interest, and outstanding balance." accent />
          <div className="overflow-x-auto px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Period", "Type", "Principal", "Interest", "Total payment", "Balance left"].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest py-3 px-4 first:pl-6 last:pr-6 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleRows.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 ${row.isMoratorium ? "bg-amber-50/40" : ""}`}>
                    <td className="py-4 px-4 pl-6 font-bold text-gray-900">{row.period}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        row.isMoratorium
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}>
                        {row.isMoratorium ? "Moratorium" : "Regular"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{fmt(row.principal)}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{fmt(row.interest)}</td>
                    <td className="py-4 px-4 font-bold text-gray-900">{fmt(row.total)}</td>
                    <td className="py-4 px-4 pr-6 font-bold text-[#094f9e]">{fmt(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── 8. Repayment Chart ────────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader title="Repayment chart" subtitle="Visual breakdown of principal and interest across quarters." accent />
          <div className="px-6 py-5">
            <RepaymentChart businessId={id} />
          </div>
        </Card>

        {/* ── 9. What-If Simulator ──────────────────────────────────────── */}
        <Card className="mb-6">
          <CardHeader
            title="What may happen?"
            subtitle="Adjust the sliders to explore how different loan sizes, rates, and revenues affect your repayment."
            accent
          />
          <div className="px-6 py-6">
            <WhatIfSimulator />
          </div>
        </Card>

        {/* ── 10. Important note ───────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4 mb-4">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong className="font-bold">Important: </strong>
            These figures are preliminary estimates only. Final loan terms, scheme eligibility, actual income,
            and repayment requirements must be verified with a qualified financial advisor or lending institution
            before making any financial commitment.
          </p>
        </div>
    </div>
  );
}
