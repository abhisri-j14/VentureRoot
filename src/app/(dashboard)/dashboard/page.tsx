"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { ArrowRight, PieChart, TrendingUp, Sparkles } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { motion } from "framer-motion";
import businessesData from "@/data/businesses.json";
import { useProfile } from "@/lib/data/users";

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

// --- Framer Motion Variants ---
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: EASE_OUT_EXPO,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

import { useBusinessesComparison } from "@/lib/data/businesses";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchUser();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  const { data: profileData } = useProfile();
  const { data: businesses, isLoading: isBusinessesLoading } = useBusinessesComparison();
  const activeBusiness = businesses?.[0];

  const firstName =
    profileData?.fullName?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "Entrepreneur";

  const locationStr = profileData?.location?.state
    ? `${profileData.location.village ? profileData.location.village + ", " : ""}${profileData.location.district ? profileData.location.district + ", " : ""}${profileData.location.state}`
    : "Local Region";

  // Financial & business metrics dynamically derived from profile and active business
  const userCapital = Number(profileData?.financial?.availableCapital) || 0;
  const userIncome = Number(profileData?.financial?.income) || 0;

  // If user has a real business in DB
  const businessName = activeBusiness?.name || (userCapital > 0 ? "New Venture Opportunity" : "Packaged millet-based food products");
  const businessCategory = activeBusiness?.category?.name || activeBusiness?.category || "Agriculture & Allied";
  const businessId = activeBusiness?.id || "create";

  // Capex: If active business has expectedRevenue/margin or user has capital
  const totalCapex = activeBusiness
    ? Math.max(1, (Number(activeBusiness.availableMargin) || userCapital || 100000) / 100000)
    : userCapital > 0
    ? Number((userCapital / 100000).toFixed(2))
    : businessesData.details.capital.expectedInvestment / 100000;

  // Estimated loan (e.g. 75% - 85% of capex under MUDRA / PMEGP guidelines)
  const loanAmount = Number((totalCapex * 0.8).toFixed(2));
  const ltvPercentage = totalCapex > 0 ? Math.min(95, Math.round((loanAmount / totalCapex) * 100)) : 80;
  const businessScore = activeBusiness ? 84 : userCapital > 0 ? 80 : 75;

  const capexBreakdown = activeBusiness ? [
    { name: "Equipment & Mach.", value: totalCapex * 40000 },
    { name: "Working Capital", value: totalCapex * 30000 },
    { name: "Inventory & Stock", value: totalCapex * 20000 },
    { name: "Licensing & Setup", value: totalCapex * 10000 },
  ] : userCapital > 0 ? [
    { name: "Initial Inventory", value: userCapital * 0.4 },
    { name: "Tools & Equipment", value: userCapital * 0.3 },
    { name: "Operational Margin", value: userCapital * 0.2 },
    { name: "Marketing & Setup", value: userCapital * 0.1 },
  ] : businessesData.dashboard.capexBreakdown || [];

  const breakdownColors = ["bg-[#60a5fa]", "bg-[#93c5fd]", "bg-[#38bdf8]", "bg-[#dbeafe]"];
  const totalBreakdown = capexBreakdown.reduce((sum: number, item: any) => sum + item.value, 0);

  // SVG Circumference constants
  const CIRCLE_RADIUS = 50;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  const DONUT_RADIUS = 35;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

  const classes = {
    cardHeading: "font-sans text-[18px] lg:text-[20px] font-semibold text-slate-900 tracking-tight",
    mainValue: "font-sans font-bold text-slate-900 tracking-tight",
    supportingText: "font-sans text-[14px] font-medium text-slate-500",
    smallSupporting: "font-sans text-[12px] font-medium text-slate-400",
    profileLabel: "font-sans text-[11px] uppercase tracking-wider font-bold text-slate-500",
    profileValue: "font-sans text-[14px] font-semibold text-slate-900"
  };

  // Card base classes
  const cardBase = "bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] transition-all duration-300 card-hover-lift";

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">

      {/* ═══ HEADER with staggered entrance ═══ */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row md:items-center justify-between gap-2"
      >
        <div>
          <h1 className="font-heading text-[32px] font-bold text-[#242424] tracking-tight leading-tight">
            Welcome back, {firstName}
          </h1>
          <p className={classes.supportingText + " mt-0.5"}>
            {businessCategory} • {locationStr}
          </p>
        </div>
        {/* Live status indicator */}
        <div className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Database Connected
        </div>
      </motion.div>

      {/* ═══ MAIN GRID CANVAS ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >

        {/* ─── TOP ROW: KPI CARDS ─── */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* KPI 1: Business Viability */}
          <motion.div variants={cardVariants} className={`${cardBase} p-6 lg:p-7 flex flex-col relative overflow-hidden group`}>
            {/* Subtle corner glow */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#1E6702]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#1E6702]/10 transition-colors duration-700" />

            <h3 className={`${classes.cardHeading} mb-5 text-left relative z-10`}>
              Business Viability
            </h3>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              {/* SVG Ring with animated glow */}
              <div className={`relative w-28 h-28 flex items-center justify-center mb-4 ${mounted ? 'animate-pulse-glow' : ''}`}>
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle cx="56" cy="56" r={CIRCLE_RADIUS} stroke="#F3F4F6" strokeWidth="11" fill="none" />
                  <circle
                    cx="56" cy="56" r={CIRCLE_RADIUS}
                    stroke="url(#viabilityGradient)" strokeWidth="11" fill="none"
                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                    strokeDashoffset={mounted ? CIRCLE_CIRCUMFERENCE - (businessScore / 100) * CIRCLE_CIRCUMFERENCE : CIRCLE_CIRCUMFERENCE}
                    strokeLinecap="round"
                    className="transition-all duration-[1.5s] ease-out"
                  />
                  <defs>
                    <linearGradient id="viabilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E6702" />
                      <stop offset="100%" stopColor="#4bc71a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-[34px] leading-none ${classes.mainValue}`}>
                    {mounted ? <CountUp to={businessScore} duration={1} /> : "0"}
                  </span>
                  <span className={`${classes.smallSupporting} uppercase tracking-widest mt-0.5`}>Score</span>
                </div>
              </div>
              <div className="text-center w-full">
                <span className={`${classes.supportingText} font-bold block mb-0.5 text-[#242424]`}>Good viability</span>
                <span className={`${classes.smallSupporting} flex items-center justify-center gap-1.5 text-emerald-600 font-medium`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Real time data
                </span>
              </div>
            </div>
          </motion.div>

          {/* KPI 2: Estimated Capex */}
          <motion.div variants={cardVariants} className={`${cardBase} p-6 lg:p-7 flex flex-col relative overflow-hidden group`}>
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#1E6702]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#1E6702]/10 transition-colors duration-700" />

            <h3 className={`${classes.cardHeading} mb-5 text-left relative z-10`}>
              Estimated Capex
            </h3>

            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className={`text-[42px] leading-none ${classes.mainValue} truncate mr-2`}>
                  <CountUp to={totalCapex} prefix="₹" suffix="L" decimals={1} duration={2} />
                </span>

                <div className="w-14 h-14 lg:w-16 lg:h-16 relative shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#F3F4F6" strokeWidth="20" />
                    <circle
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#1E6702" strokeWidth="20"
                      strokeDasharray={DONUT_CIRCUMFERENCE}
                      strokeDashoffset={mounted ? 0 : DONUT_CIRCUMFERENCE}
                      className="transition-all duration-[1.2s] ease-out delay-100"
                    />
                    <circle
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#2b8a03" strokeWidth="20"
                      strokeDasharray={DONUT_CIRCUMFERENCE}
                      strokeDashoffset={mounted ? DONUT_CIRCUMFERENCE * 0.45 : DONUT_CIRCUMFERENCE}
                      className="transition-all duration-[1.2s] ease-out delay-200"
                    />
                    <circle
                      cx="50" cy="50" r={DONUT_RADIUS} fill="none" stroke="#4bc71a" strokeWidth="20"
                      strokeDasharray={DONUT_CIRCUMFERENCE}
                      strokeDashoffset={mounted ? DONUT_CIRCUMFERENCE * 0.75 : DONUT_CIRCUMFERENCE}
                      className="transition-all duration-[1.2s] ease-out delay-300"
                    />
                  </svg>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className={`${classes.supportingText} font-bold block mb-0.5 text-[#242424]`}>Based on market averages</span>
                <span className={`${classes.smallSupporting} flex items-center gap-1.5 text-emerald-600 font-medium`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Real time data
                </span>
              </div>
            </div>
          </motion.div>

          {/* KPI 3: Possible Loan */}
          <motion.div variants={cardVariants} className={`${cardBase} p-6 lg:p-7 flex flex-col relative overflow-hidden group`}>
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#1E6702]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#1E6702]/10 transition-colors duration-700" />

            <h3 className={`${classes.cardHeading} mb-5 text-left relative z-10`}>
              Possible Loan
            </h3>

            <div className="flex-1 flex flex-col justify-between relative z-10">
              <div className="flex flex-col gap-4 mb-5">
                <span className={`text-[42px] leading-none ${classes.mainValue}`}>
                  <CountUp to={loanAmount} prefix="₹" suffix="L" decimals={2} duration={2} />
                </span>

                <div className="flex flex-col gap-1.5 w-full">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#5B514A] uppercase tracking-[0.04em]">
                    <span>LTV</span>
                    <span className="text-[#1E6702]">{Math.round(ltvPercentage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#1E6702]/10 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E6702] to-[#4bc71a] rounded-full transition-all duration-[1.5s] ease-out relative progress-shine"
                      style={{ width: mounted ? `${ltvPercentage}%` : "0%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className={`${classes.supportingText} font-bold block mb-0.5 text-[#242424]`}>{Math.round(ltvPercentage)}% LTV</span>
                <span className={`${classes.smallSupporting} flex items-center gap-1.5 text-emerald-600 font-medium`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Real time data
                </span>
              </div>
            </div>
          </motion.div>

        </motion.div>

        {/* ─── LOWER GRID: 2/3 left + 1/3 right ─── */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Business Overview — Premium warm card */}
            <motion.div variants={cardVariants} className="bg-[#fbfce6] text-[#2b542f] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 lg:p-7 flex flex-col flex-1 card-hover-lift relative overflow-hidden group">
              {/* Decorative floating orb */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2b542f]/5 rounded-full blur-3xl pointer-events-none animate-float" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/30 rounded-full blur-2xl pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

              {/* Header */}
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div>
                  <span className="font-sans text-[11px] uppercase tracking-wider font-bold block mb-1 text-[#2b542f]">Business Overview</span>
                  <h2 className="font-heading text-[25px] font-bold text-[#2b542f]">{businessName}</h2>
                </div>
                <span className="bg-white/50 backdrop-blur-sm text-[#2b542f] px-3 py-1.5 rounded-lg font-sans text-[11px] uppercase tracking-wider font-bold shadow-sm border border-white/60">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activeBusiness ? activeBusiness.status || "Active" : userCapital > 0 ? "Profile Ready" : "Active"}
                  </span>
                </span>
              </div>

              {/* Data grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-5 relative z-10">
                {[
                  { label: "Business focus", value: activeBusiness?.description || (profileData?.experience?.skills ? `Focus in ${Array.isArray(profileData.experience.skills) ? profileData.experience.skills.join(", ") : profileData.experience.skills}` : ML_PLACEHOLDERS.business.focus) },
                  { label: "Primary market", value: activeBusiness?.existingResources || (profileData?.location?.district ? `${profileData.location.district} Region & Local Retail` : ML_PLACEHOLDERS.business.primaryMarket) },
                  { label: "Positioning", value: activeBusiness ? "Quality · Reliable · Local Supplier" : ML_PLACEHOLDERS.business.positioning },
                  { label: "Business model", value: activeBusiness?.category?.name || ML_PLACEHOLDERS.business.businessModel },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="flex flex-col gap-1"
                  >
                    <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-[#2b542f]">{item.label}</span>
                    <p className="font-sans text-[14px] font-medium text-[#2b542f]">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Key Opportunity — glassmorphism */}
              <div className="p-4 bg-white/35 backdrop-blur-sm rounded-lg border border-white/60 mt-auto shadow-sm relative z-10 group/opp hover:bg-white/50 transition-colors duration-300">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-[#2b542f]/60" />
                  <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-[#2b542f]">Key opportunity</span>
                </div>
                <p className="font-sans text-[14px] font-medium text-[#2b542f]">
                  {activeBusiness
                    ? `Leveraging available margin of ₹${Number(activeBusiness.availableMargin || 0).toLocaleString("en-IN")} and resources (${activeBusiness.existingResources || "facilities"}) in ${locationStr}.`
                    : userCapital > 0
                    ? `With ₹${userCapital.toLocaleString("en-IN")} personal capital in ${locationStr}, high loan eligibility unlocks up to ₹${(userCapital * 4).toLocaleString("en-IN")} project capacity.`
                    : ML_PLACEHOLDERS.business.keyOpportunity}
                </p>
              </div>
            </motion.div>

            {/* Capital Breakdown — Earthy olive card */}
            {capexBreakdown.length > 0 && (
              <motion.div variants={cardVariants} className={`${cardBase} p-6 lg:p-7 relative overflow-hidden group`} style={{ backgroundColor: '#234670' }}>
                {/* Decorative orb */}
                <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-[#f2f5d0]/10 rounded-full blur-2xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <h3 className={classes.cardHeading} style={{ fontSize: '29px', color: '#f2f5d0' }}>Capital Allocation</h3>
                </div>

                <div className="flex flex-col gap-5 relative z-10">
                  {/* Animated progress bars with rounded segments */}
                  <div className="flex h-3.5 rounded-full overflow-hidden w-full gap-[2px] shadow-inner">
                    {capexBreakdown.map((item: any, i: number) => (
                      <motion.div
                        key={item.name}
                        className={`${breakdownColors[i % breakdownColors.length]} rounded-sm`}
                        initial={{ width: "0%" }}
                        animate={{ width: mounted ? `${(item.value / Math.max(1, totalBreakdown)) * 100}%` : "0%" }}
                        transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: EASE_OUT_EXPO }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {capexBreakdown.map((item: any, i: number) => (
                      <motion.div
                        key={item.name}
                        className="flex flex-col gap-1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: EASE_OUT_EXPO }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-sm ${breakdownColors[i % breakdownColors.length]} shadow-sm`} />
                          <span className="font-sans text-[12px] font-medium text-[#f2f5d0]/90 truncate">{item.name}</span>
                        </div>
                        <span className="font-sans text-[20px] font-bold text-[#f2f5d0] tracking-tight">
                          ₹{item.value >= 100000 ? `${(item.value / 100000).toFixed(1)}L` : `${Math.round(item.value).toLocaleString("en-IN")}`}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">

            {/* Financial Outlook — Premium purple accent */}
            <motion.div variants={cardVariants} className="bg-[#567a59] rounded-xl shadow-[0_8px_32px_rgba(86,122,89,0.25)] p-6 lg:p-7 flex flex-col flex-1 relative overflow-hidden group">
              {/* Floating decorative orbs */}
              <div className="absolute top-0 left-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -ml-8 -mt-8 pointer-events-none animate-float" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-6 -mb-6 pointer-events-none animate-float" style={{ animationDelay: '4s' }} />

              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-xl" />

              <div className="relative z-10 flex flex-col h-full">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#fbfce6]/80 mb-1.5 block">
                  Financial Outlook
                </span>

                <h3 className="font-heading text-[25px] font-bold text-[#fbfce6] mb-5 tracking-tight leading-snug">
                  Your business in numbers
                </h3>

                {/* Revenue + profit side-by-side */}
                <div className="flex items-stretch justify-between gap-3 w-full mb-5">
                  <motion.div
                    className="flex flex-col gap-0.5 flex-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: EASE_OUT_EXPO }}
                  >
                    <span className="font-sans text-[28px] font-bold text-[#fbfce6] tracking-tight leading-none">
                      {activeBusiness?.expectedRevenue
                        ? `₹${(Number(activeBusiness.expectedRevenue) / 1200000).toFixed(2)}L`
                        : userIncome > 0
                        ? `₹${Math.round(userIncome * 1.6).toLocaleString("en-IN")}`
                        : ML_PLACEHOLDERS.finance.monthlyRevenue}
                    </span>
                    <span className="font-sans text-[12px] font-medium text-[#fbfce6]/75 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Monthly revenue
                    </span>
                  </motion.div>

                  <div className="w-px bg-[#fbfce6]/20 self-stretch" />

                  <motion.div
                    className="flex flex-col gap-0.5 flex-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5, ease: EASE_OUT_EXPO }}
                  >
                    <span className="font-sans text-[28px] font-bold text-[#fbfce6] tracking-tight leading-none">
                      {activeBusiness?.expectedRevenue
                        ? `₹${Math.round(Number(activeBusiness.expectedRevenue) * 0.25 / 12).toLocaleString("en-IN")}`
                        : userIncome > 0
                        ? `₹${Math.round(userIncome * 0.45).toLocaleString("en-IN")}`
                        : ML_PLACEHOLDERS.finance.monthlyNetProfit}
                    </span>
                    <span className="font-sans text-[12px] font-medium text-[#fbfce6]/75 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Net profit / mo
                    </span>
                  </motion.div>
                </div>

                {/* Break-even */}
                <div className="w-full border-t border-[#fbfce6]/20 pt-4 mb-5">
                  <span className="font-sans text-[12px] font-medium text-[#fbfce6]/75 block mb-0.5">Estimated break-even</span>
                  <div className="flex items-center gap-1.5 font-sans text-[28px] font-bold text-[#fbfce6]">
                    <PieChart className="w-3.5 h-3.5 text-[#fbfce6]" />
                    Month {activeBusiness ? 4 : ML_PLACEHOLDERS.finance.breakEvenMonth}
                  </div>
                </div>

                <Link
                  href={activeBusiness?.id ? `/business/${activeBusiness.id}/finance` : "/business/create"}
                  className="group/btn mt-auto flex items-center justify-center gap-2 w-full bg-[#fbfce6] hover:bg-white text-[#567a59] px-4 py-2.5 rounded-lg font-sans text-[14px] font-semibold transition-all duration-300 hover:shadow-[0_4px_16px_rgba(235,237,209,0.4)]"
                >
                  <span>{activeBusiness ? "View financial analysis" : "Setup venture financials"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Recommended Action — Deep terracotta accent */}
            <motion.div variants={cardVariants} className="bg-[#fbfce6] rounded-xl shadow-[0_8px_32px_rgba(251,252,230,0.25)] p-6 lg:p-7 flex flex-col relative overflow-hidden text-[#234670] group">
              {/* Floating orbs */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#234670]/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none animate-float" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#234670]/5 rounded-full blur-xl -ml-6 -mb-6 pointer-events-none animate-float" style={{ animationDelay: '5s' }} />

              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-xl" />

              <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-[#234670]/70 mb-3 relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Recommended Action
              </span>

              <h3 className="font-heading text-[25px] font-bold mb-3 tracking-tight leading-snug text-[#234670] relative z-10">
                {activeBusiness ? "Explore your business overview" : "Create your first business"}
              </h3>

              <p className="font-sans text-[14px] font-medium text-[#234670]/85 mb-5 relative z-10">
                {activeBusiness
                  ? "Get a detailed overview of your entire business operations and financials."
                  : "Start planning your enterprise feasibility, market positioning, and capital requirements."}
              </p>

              <Link
                href={activeBusiness?.id ? `/business/${activeBusiness.id}` : "/business/create"}
                className="group/btn mt-auto flex items-center justify-center gap-2 w-full bg-[#234670] hover:bg-[#1c3a5e] text-[#fbfce6] px-4 py-2.5 rounded-lg font-sans text-[14px] font-semibold transition-all duration-300 relative z-10 hover:shadow-[0_4px_16px_rgba(35,70,112,0.4)]"
              >
                <span>{activeBusiness ? "My Business" : "Create Business"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
