"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { ArrowRight, PieChart } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import businessesData from "@/data/businesses.json";

// --- Frontend-safe structured placeholders for ML/backend data ---
const ML_PLACEHOLDERS = {
  business: {
    focus: "Packaged millet-based food products",
    primaryMarket: "Local households + retail",
    positioning: "Affordable · Local · Health-focused",
    businessModel: "Direct to Consumer (B2C) + Local Retail",
    keyOpportunity: "Rising health consciousness and lack of organized millet players in the local market.",
  },
  finance: {
    monthlyRevenue: "₹1.72L",
    monthlyNetProfit: "₹50,450",
    breakEvenMonth: 5,
  }
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    fetchUser();
    // Trigger animations after a tiny delay for visual effect
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  const { dashboard, details } = businessesData;
  const capexBreakdown = dashboard.capexBreakdown || [];
  
  // Financial metrics
  const totalCapex = details.capital.expectedInvestment / 100000; // in Lakhs
  const loanAmount = 7.65; // Example loan calculation
  const ltvPercentage = (loanAmount / totalCapex) * 100;
  const businessScore = 78;

  const firstName = user?.name?.split(" ")[0] || "Entrepreneur";
  const locationStr = details.location ? `${details.location.district}, ${details.location.state}` : "Local Area";

  // Breakdown colors - professional SaaS palette
  const breakdownColors = ["bg-[#3B82F6]", "bg-[#10B981]", "bg-[#F59E0B]", "bg-[#6366F1]"];
  const totalBreakdown = capexBreakdown.reduce((sum, item) => sum + item.value, 0);

  // SVG Circumference constants
  const CIRCLE_RADIUS = 54;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~339.29
  
  const DONUT_RADIUS = 35;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS; // ~219.91

  // Shared Typography Classes based on the new hierarchical system
  const classes = {
    cardHeading: "text-[16px] font-bold text-slate-900 tracking-tight", // Clean, prominent, modern SaaS heading
    mainValue: "font-bold text-slate-900 tracking-tight", // Crisp dark values
    supportingText: "text-sm text-slate-500 font-medium", // Clean slate supporting text
    smallSupporting: "text-[12px] font-medium text-slate-400", 
    profileLabel: "text-[13px] font-semibold text-slate-500", // Soft but legible labels
    profileValue: "text-[15px] font-bold text-slate-900" // Strong data points
  };

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#242424] tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className={classes.supportingText + " mt-1"}>
            {details.category} • {locationStr}
          </p>
        </div>
      </div>

      {/* Main Grid Canvas */}
      <div className="flex flex-col gap-6">
        
        {/* TOP ROW: KPI CARDS WITH GRAPHS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KPI 1: Viability */}
          <div className="bg-white rounded-xl border border-gray-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-900/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <h3 className={`${classes.cardHeading} mb-6 text-center`}>
              Business Viability
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle cx="64" cy="64" r={CIRCLE_RADIUS} stroke="#F3F4F6" strokeWidth="12" fill="none" />
                  <circle 
                    cx="64" cy="64" r={CIRCLE_RADIUS} 
                    stroke="#1E6702" strokeWidth="12" fill="none" 
                    strokeDasharray={CIRCLE_CIRCUMFERENCE} 
                    strokeDashoffset={mounted ? CIRCLE_CIRCUMFERENCE - (businessScore / 100) * CIRCLE_CIRCUMFERENCE : CIRCLE_CIRCUMFERENCE}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-4xl ${classes.mainValue} leading-none`}>
                    {mounted ? <CountUp to={businessScore} duration={1} /> : "0"}
                  </span>
                  <span className={`${classes.smallSupporting} uppercase tracking-widest mt-1`}>Score</span>
                </div>
              </div>
              <div className="text-center w-full">
                <span className={`${classes.supportingText} font-bold block mb-1 text-[#242424]`}>Good viability</span>
                <span className={classes.smallSupporting}>Currently showing mock data • ML integration pending</span>
              </div>
            </div>
          </div>

          {/* KPI 2: CAPEX */}
          <div className="bg-white rounded-xl border border-gray-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-900/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <h3 className={`${classes.cardHeading} mb-8 text-left`}>
              Estimated Capex
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-8">
                <span className={`text-5xl ${classes.mainValue} truncate mr-2`}>
                  <CountUp to={totalCapex} prefix="₹" suffix="L" decimals={1} duration={2} />
                </span>
                
                {/* Donut Chart Visual (Stacked perfectly to avoid gaps) */}
                <div className="w-16 h-16 lg:w-20 lg:h-20 relative shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#F3F4F6" strokeWidth="20" />
                    <circle 
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#1E6702" strokeWidth="20" 
                      strokeDasharray={DONUT_CIRCUMFERENCE} 
                      strokeDashoffset={mounted ? 0 : DONUT_CIRCUMFERENCE} 
                      className="transition-all duration-1000 ease-out delay-100"
                    />
                    <circle 
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#2b8a03" strokeWidth="20" 
                      strokeDasharray={DONUT_CIRCUMFERENCE} 
                      strokeDashoffset={mounted ? DONUT_CIRCUMFERENCE * 0.45 : DONUT_CIRCUMFERENCE} 
                      className="transition-all duration-1000 ease-out delay-200"
                    />
                    <circle 
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#4bc71a" strokeWidth="20" 
                      strokeDasharray={DONUT_CIRCUMFERENCE} 
                      strokeDashoffset={mounted ? DONUT_CIRCUMFERENCE * 0.75 : DONUT_CIRCUMFERENCE} 
                      className="transition-all duration-1000 ease-out delay-300"
                    />
                  </svg>
                </div>
              </div>
              
              <div className="mt-auto border-t border-slate-100 pt-6">
                <span className={`${classes.supportingText} font-bold block mb-1 text-[#242424]`}>Based on market averages</span>
                <span className={classes.smallSupporting}>Backend integration pending • Currently showing mock data</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Loan */}
          <div className="bg-white rounded-xl border border-gray-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-900/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 lg:p-8 flex flex-col relative overflow-hidden">
            <h3 className={`${classes.cardHeading} mb-8 text-left`}>
              Possible Loan
            </h3>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-6 mb-8">
                <span className={`text-5xl ${classes.mainValue}`}>
                  <CountUp to={loanAmount} prefix="₹" suffix="L" decimals={2} duration={2} />
                </span>
                
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#5B514A] uppercase tracking-[0.04em]">
                    <span>LTV</span>
                    <span className="text-[#1E6702]">{Math.round(ltvPercentage)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#1E6702]/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#1E6702] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: mounted ? `${ltvPercentage}%` : "0%" }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-auto border-t border-slate-100 pt-6">
                <span className={`${classes.supportingText} font-bold block mb-1 text-[#242424]`}>{Math.round(ltvPercentage)}% LTV</span>
                <span className={classes.smallSupporting}>Backend integration pending • Currently showing mock data</span>
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE AND BOTTOM ROWS: Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* LEFT COLUMN (2fr span) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Business Dossier */}
            <div className="bg-[#cde06e] text-gray-900 rounded-xl border border-gray-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-900/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 lg:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className={`text-gray-700 text-[11px] uppercase tracking-wider font-bold block mb-2`}>Business Overview</span>
                  <h2 className={`text-xl font-bold text-gray-900`}>{details.category}</h2>
                </div>
                <span className="bg-white/40 text-gray-900 px-3 py-1 rounded-md text-xs font-semibold shadow-sm">Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col gap-2">
                  <span className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Business focus</span>
                  <p className="text-sm font-semibold text-gray-900">{ML_PLACEHOLDERS.business.focus}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Primary market</span>
                  <p className="text-sm font-semibold text-gray-900">{ML_PLACEHOLDERS.business.primaryMarket}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Positioning</span>
                  <p className="text-sm font-semibold text-gray-900">{ML_PLACEHOLDERS.business.positioning}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-gray-700 text-xs font-semibold uppercase tracking-wider">Business model</span>
                  <p className="text-sm font-semibold text-gray-900">{ML_PLACEHOLDERS.business.businessModel}</p>
                </div>
              </div>

              <div className="p-4 bg-white/30 rounded-lg border border-white/50 mt-auto shadow-sm">
                <span className={`text-gray-700 text-xs font-semibold uppercase tracking-wider block mb-2`}>Key opportunity</span>
                <p className={`text-sm font-bold text-gray-900`}>
                  {ML_PLACEHOLDERS.business.keyOpportunity}
                </p>
              </div>
            </div>

            {/* Capital Breakdown */}
            {capexBreakdown.length > 0 && (
              <div className="bg-[#fcfce8] rounded-xl border border-gray-900/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-900/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className={classes.cardHeading}>Capital Breakdown</h3>
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View details</button>
                </div>

                <div className="flex flex-col gap-8">
                  {/* Progress Bar */}
                  <div className="flex h-4 rounded-full overflow-hidden w-full gap-[1px]">
                    {capexBreakdown.map((item, i) => (
                      <div 
                        key={item.name}
                        className={`${breakdownColors[i % breakdownColors.length]} transition-all duration-1000 ease-out`}
                        style={{ width: mounted ? `${(item.value / totalBreakdown) * 100}%` : "0%" }}
                      />
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {capexBreakdown.map((item, i) => (
                      <div key={item.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-sm ${breakdownColors[i % breakdownColors.length]}`} />
                          <span className={`${classes.profileLabel} truncate`}>{item.name}</span>
                        </div>
                        <span className={`text-lg ${classes.mainValue}`}>
                          ₹{(item.value / 100000).toFixed(1)}L
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (1fr span) */}
          <div className="flex flex-col gap-6 h-full">
            
            {/* FINANCIAL OUTLOOK */}
            <div className="bg-[#bd9702] rounded-xl shadow-lg shadow-[#bd9702]/20 p-6 lg:p-8 flex flex-col flex-1 relative overflow-hidden group">
              {/* Subtle light bloom in the top left to add depth without being rainbow */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#fcf8e6]/80 mb-2 block">
                  Financial Outlook
                </span>
                
                <h3 className="text-xl font-heading font-semibold text-[#fcf8e6] mb-8 tracking-tight">
                  Your business, in numbers
                </h3>
                
                <div className="flex items-center justify-between gap-4 w-full mb-8">
                  <div className="flex flex-col gap-1 w-1/2">
                    <span className="text-2xl lg:text-3xl font-heading font-bold text-[#fcf8e6] tracking-tight">
                      {ML_PLACEHOLDERS.finance.monthlyRevenue}
                    </span>
                    <span className="text-[13px] font-medium text-[#fcf8e6]/80">Monthly revenue</span>
                  </div>
                  
                  <div className="w-px h-10 bg-[#fcf8e6]/20"></div>

                  <div className="flex flex-col gap-1 w-1/2">
                    <span className="text-2xl lg:text-3xl font-heading font-bold text-[#fcf8e6] tracking-tight">
                      {ML_PLACEHOLDERS.finance.monthlyNetProfit}
                    </span>
                    <span className="text-[13px] font-medium text-[#fcf8e6]/80">Monthly net profit</span>
                  </div>
                </div>
                
                <div className="w-full border-t border-[#fcf8e6]/20 pt-6 mb-8">
                  <span className="text-[13px] font-medium text-[#fcf8e6]/80 block mb-1">Estimated break-even</span>
                  <div className="flex items-center gap-2 text-lg font-heading font-semibold text-[#fcf8e6]">
                    <PieChart className="w-4 h-4 text-[#fcf8e6]" />
                    Month {ML_PLACEHOLDERS.finance.breakEvenMonth}
                  </div>
                </div>
                
                <Link 
                  href={`/business/${details.id}/finance`}
                  className="mt-auto flex items-center justify-center gap-2 w-full bg-[#fcf8e6] hover:bg-white text-[#bd9702] px-4 py-3 rounded-lg text-sm font-bold transition-colors"
                >
                  <span>View financial analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Next Action -> My Business */}
            <div className="bg-[#943212] rounded-xl shadow-lg shadow-[#943212]/20 p-6 lg:p-8 flex flex-col shrink-0 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#ffeee8]/70 mb-4">
                Recommended Action
              </span>
              
              <h3 className="text-xl font-heading font-semibold mb-6 tracking-tight leading-snug text-[#ffeee8]">
                Explore your business overview
              </h3>
              
              <p className="text-[15px] text-[#ffeee8]/90 mb-8 font-medium">
                Get a detailed and comprehensive overview of your entire business operations.
              </p>
              
              <Link 
                href={`/business/${details.id}`}
                className="mt-auto flex items-center justify-center gap-2 w-full bg-[#ffeee8] hover:bg-white text-[#943212] px-4 py-3 rounded-lg text-sm font-bold transition-colors"
              >
                <span>My Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
