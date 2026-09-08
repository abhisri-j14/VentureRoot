"use client";

import React, { useState } from "react";

// ── Standard EMI formula (frontend-only, no API) ─────────────────────────────
function calcEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  return Math.round((principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ── Scenario labels ───────────────────────────────────────────────────────────
const SCENARIOS = [
  { key: "optimistic", label: "If sales go well",    revenueMultiplier: 1.25, bg: "#e0ffde", border: "#86efac" },
  { key: "base",       label: "Expected situation",  revenueMultiplier: 1.0,  bg: "#deefff", border: "#93c5fd" },
  { key: "pessimistic",label: "If sales are lower",  revenueMultiplier: 0.75, bg: "#f8e8ff", border: "#d8b4fe" },
];

interface WhatIfSimulatorProps {
  defaultLoan?: number;
  defaultRate?: number;
  defaultTenure?: number;
  defaultMoratorium?: number;
}

export const WhatIfSimulator = ({
  defaultLoan = 500000,
  defaultRate = 9,
  defaultTenure = 60,
  defaultMoratorium = 6,
}: WhatIfSimulatorProps) => {

  const [loanAmount,    setLoanAmount]    = useState(defaultLoan);
  const [interestRate,  setInterestRate]  = useState(defaultRate);
  const [tenure,        setTenure]        = useState(defaultTenure);
  const [moratorium,    setMoratorium]    = useState(defaultMoratorium);
  const [revenue,       setRevenue]       = useState(50000);
  const [expenses,      setExpenses]      = useState(30000);

  // Sync state if scheme defaults change
  React.useEffect(() => {
    setLoanAmount(defaultLoan);
    setInterestRate(defaultRate);
    setTenure(defaultTenure);
    setMoratorium(defaultMoratorium);
  }, [defaultLoan, defaultRate, defaultTenure, defaultMoratorium]);

  const activeMonths = tenure - moratorium;
  const emi = calcEMI(loanAmount, interestRate, activeMonths > 0 ? activeMonths : tenure);
  const totalPaid = emi * (tenure - moratorium) + (loanAmount * (interestRate / 100 / 12)) * moratorium;
  const totalInterest = Math.round(totalPaid - loanAmount);

  return (
    <div className="flex flex-col md:flex-row gap-10">

      {/* ── Left: Controls ─────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="font-sans text-[14px] font-semibold text-gray-700">Money you may need</label>
            <span className="font-sans text-[14px] font-bold text-gray-900" suppressHydrationWarning>{fmt(loanAmount)}</span>
          </div>
          <input type="range" min="50000" max="2000000" step="50000"
            value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
            className="w-full accent-primary h-1.5 rounded-full" />
          <div className="flex justify-between font-sans text-[12px] text-gray-400 mt-1">
            <span>₹50,000</span><span>₹20,00,000</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="font-sans text-[14px] font-semibold text-gray-700">Yearly interest rate</label>
            <span className="font-sans text-[14px] font-bold text-gray-900">{interestRate}%</span>
          </div>
          <input type="range" min="1" max="24" step="0.5"
            value={interestRate} onChange={e => setInterestRate(Number(e.target.value))}
            className="w-full accent-primary h-1.5 rounded-full" />
          <div className="flex justify-between font-sans text-[12px] text-gray-400 mt-1">
            <span>1%</span><span>24%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[14px] font-semibold text-gray-700 block mb-1.5">Time to repay</label>
            <select value={tenure} onChange={e => setTenure(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 p-2.5 font-sans text-[14px] bg-white text-gray-900 focus:ring-1 focus:ring-primary outline-none">
              {[12,24,36,48,60,84].map(m => <option key={m} value={m}>{m} months</option>)}
            </select>
          </div>
          <div>
            <label className="font-sans text-[14px] font-semibold text-gray-700 block mb-1.5">Payment pause</label>
            <select value={moratorium} onChange={e => setMoratorium(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 p-2.5 font-sans text-[14px] bg-white text-gray-900 focus:ring-1 focus:ring-primary outline-none">
              <option value={0}>None</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="font-sans text-[14px] font-semibold text-gray-700">Expected monthly income</label>
            <span className="font-sans text-[14px] font-bold text-gray-900" suppressHydrationWarning>{fmt(revenue)}</span>
          </div>
          <input type="range" min="5000" max="500000" step="5000"
            value={revenue} onChange={e => setRevenue(Number(e.target.value))}
            className="w-full accent-primary h-1.5 rounded-full" />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <label className="font-sans text-[14px] font-semibold text-gray-700">Expected monthly expenses</label>
            <span className="font-sans text-[14px] font-bold text-gray-900" suppressHydrationWarning>{fmt(expenses)}</span>
          </div>
          <input type="range" min="5000" max="500000" step="5000"
            value={expenses} onChange={e => setExpenses(Number(e.target.value))}
            className="w-full accent-primary h-1.5 rounded-full" />
        </div>

        {/* Key output summary */}
        <div className="grid grid-cols-3 gap-px bg-slate-100 rounded-xl overflow-hidden border border-slate-100 mt-2">
          <div className="bg-[#f4fce8] px-4 py-4 text-center">
            <div className="font-sans text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Monthly EMI</div>
            <div className="font-sans text-[28px] font-bold text-primary" suppressHydrationWarning>{fmt(emi)}</div>
          </div>
          <div className="bg-[#deefff] px-4 py-4 text-center">
            <div className="font-sans text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Net surplus</div>
            <div className={`font-sans text-[28px] font-bold ${(revenue - expenses - emi) >= 0 ? "text-primary" : "text-red-600"}`} suppressHydrationWarning>
              {fmt(revenue - expenses - emi)}
            </div>
          </div>
          <div className="bg-[#f8e8ff] px-4 py-4 text-center">
            <div className="font-sans text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total interest</div>
            <div className="font-sans text-[28px] font-bold text-[#094f9e]" suppressHydrationWarning>{fmt(totalInterest)}</div>
          </div>
        </div>
      </div>

      {/* ── Right: Scenario Results ─────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div>
          <h3 className="font-sans text-[16px] font-bold text-gray-900 mb-1">What may happen?</h3>
          <p className="font-sans text-[14px] text-gray-500 mb-4">
            Illustrative result using your inputs above. Adjust the sliders to see how different situations affect repayment.
          </p>
        </div>

        {SCENARIOS.map(sc => {
          const adjRevenue = Math.round(revenue * sc.revenueMultiplier);
          const surplus = adjRevenue - expenses - emi;
          const canRepay = surplus >= 0;
          const isBase = sc.key === "base";
          return (
            <div key={sc.key}
              style={{ background: sc.bg, borderLeftColor: sc.border }}
              className="rounded-xl border-l-4 border border-slate-200 p-4 flex items-center justify-between gap-4 transition-colors shadow-sm">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[14px] font-bold text-gray-900">{sc.label}</span>
                  {isBase && <span className="font-sans text-[11px] font-bold bg-white/70 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider">Base case</span>}
                </div>
                <span className="font-sans text-[12px] text-gray-500">
                  Monthly income: <span className="font-semibold text-gray-800" suppressHydrationWarning>{fmt(adjRevenue)}</span>
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`font-sans text-[18px] font-bold ${canRepay ? "text-green-700" : "text-red-600"}`} suppressHydrationWarning>
                  {surplus >= 0 ? "+" : ""}{fmt(surplus)}/mo
                </span>
                <span className={`font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  canRepay
                    ? "bg-white/70 text-green-700 border-green-300"
                    : "bg-white/70 text-red-700 border-red-300"
                }`}>
                  {canRepay ? "Manageable" : "Tight"}
                </span>
              </div>
            </div>
          );
        })}

        {/* Is it safe? */}
        <div className="mt-2 rounded-xl border border-transparent bg-[#7a3f12] text-white p-4 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${(revenue - expenses - emi) >= 0 ? "bg-white" : "bg-red-400"}`} />
          <div>
            <span className="font-sans text-[14px] font-bold">Is repayment manageable? </span>
            <span className={`font-sans text-[14px] font-semibold ${(revenue - expenses - emi) >= 0 ? "text-white/90" : "text-red-300"}`} suppressHydrationWarning>
              {(revenue - expenses - emi) >= 0 ? "Yes, based on current inputs." : "Tight — consider reducing loan or expenses."}
            </span>
          </div>
        </div>

        <p className="font-sans text-[12px] text-gray-400 mt-1 italic">
          Illustrative result using sample financial data. Actual figures depend on final loan terms and business performance.
        </p>
      </div>
    </div>
  );
};
