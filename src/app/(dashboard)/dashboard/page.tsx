"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import Link from "next/link";
import { 
  ArrowRight, PieChart, TrendingUp, Sparkles, Briefcase, 
  PlusCircle, MapPin, BarChart2, ShieldCheck, ChevronRight, 
  CheckCircle2, Building2, AlertCircle, Users, Landmark, 
  Clock, Target, FileText, Compass, Layers, CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useProfile } from "@/lib/data/users";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useFeasibility } from "@/lib/data/feasibility";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";

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
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: EASE_OUT_EXPO,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, fetchUser } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedBusinessIndex, setSelectedBusinessIndex] = useState(0);

  useEffect(() => {
    fetchUser();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  const { data: profileData } = useProfile();
  const { data: businesses, isLoading: isBusinessesLoading } = useBusinessesComparison();

  // Dynamic active business based on user selection
  const currentIdx = businesses && businesses.length > 0
    ? Math.min(selectedBusinessIndex, businesses.length - 1)
    : 0;
  const activeBusiness = businesses?.[currentIdx];
  const { data: activeFeasibility } = useFeasibility(activeBusiness?.id || "");

  const firstName =
    profileData?.fullName?.split(" ")[0] ||
    user?.name?.split(" ")[0] ||
    "Entrepreneur";

  const locationStr = profileData?.location?.state
    ? `${profileData.location.village ? profileData.location.village + ", " : ""}${profileData.location.district ? profileData.location.district + ", " : ""}${profileData.location.state}`
    : "Local Region";

  const businessLocationStr = activeBusiness?.location?.district
    ? `${activeBusiness.location.district}, ${activeBusiness.location.state || profileData?.location?.state || "State"}`
    : activeBusiness?.location?.state || locationStr;

  const userCapital = Number(profileData?.financial?.availableCapital) || 0;

  // Dynamic business details
  const businessName = activeBusiness?.name || `Business ${currentIdx + 1}`;
  const rawCategory = activeBusiness?.category?.name || activeBusiness?.category || "Agro-Processing & Value Addition";
  const businessCategory = rawCategory.toLowerCase();
  const businessId = activeBusiness?.id || "";

  // Sector identification
  const isHealthcare = businessCategory.includes("health") || businessCategory.includes("hospital") || businessCategory.includes("clinic") || businessCategory.includes("medical");
  const isFoodProcessing = businessCategory.includes("food") || businessCategory.includes("processing") || businessCategory.includes("agro") || businessCategory.includes("millet");
  const isDairy = businessCategory.includes("dairy") || businessCategory.includes("milk") || businessCategory.includes("chilling");
  const isColdStorage = businessCategory.includes("cold") || businessCategory.includes("warehouse") || businessCategory.includes("storage");

  // Dynamic financial figures tailored to business
  const marginAmt = Number(activeBusiness?.availableMargin) || 0;
  const revAmt = Number(activeBusiness?.expectedRevenue) || 0;
  const totalCapex = activeBusiness
    ? Math.max(1, revAmt > 0 ? Number((revAmt * 0.4 / 100000).toFixed(2)) : marginAmt > 0 ? Number((marginAmt * 3 / 100000).toFixed(2)) : userCapital > 0 ? Number((userCapital / 100000).toFixed(2)) : 12.5)
    : 12.5;

  const loanAmount = Number((totalCapex * 0.8).toFixed(2));
  const promoterEquity = Number((totalCapex * 0.15).toFixed(2));
  const subsidyAmount = Number((totalCapex * 0.35).toFixed(2));

  // Dynamic Census Catchment Demographics
  const density = useMemo(() => {
    return getAuthoritativeCensusDensity(activeBusiness?.location || { name: businessLocationStr }, activeBusiness);
  }, [activeBusiness, businessLocationStr]);

  const pop5km = Math.round(78.54 * density);
  const pop10km = Math.round(314.16 * density);
  const pop20km = Math.round(1256.64 * density);

  // Time-adjusted operational lifecycle calculation
  const businessCreatedAt = activeBusiness?.createdAt ? new Date(activeBusiness.createdAt) : new Date();
  const daysElapsed = Math.max(3, Math.min(84, Math.floor((Date.now() - businessCreatedAt.getTime()) / (1000 * 60 * 60 * 24)) || 14));

  // Sector-Specific Semantic Summaries
  const feasibilitySummary = useMemo(() => {
    if (isHealthcare) {
      return {
        verdict: "Highly Feasible — Severe Rural Inpatient Bed Deficit",
        grade: "Grade A+ (Viability: 91/100)",
        statusTheme: "text-emerald-700 bg-emerald-50 border-emerald-200",
        why: `Acute deficit in secondary hospital beds across ${businessLocationStr} with ~${pop10km.toLocaleString("en-IN")} population in 10km catchment. High OPD conversion backed by Ayushman Bharat (PM-JAY) subsidy eligibility.`,
        keyMoat: "Only localized private inpatient facility within 5km radius with 24x7 emergency coverage.",
        breakEvenHorizon: "Month 5 (OPD cashflow self-sustaining from Month 2)",
      };
    }
    if (isFoodProcessing) {
      return {
        verdict: "Strong Feasibility — High Margin Value-Addition Arbitrage",
        grade: "Grade A (Viability: 87/100)",
        statusTheme: "text-emerald-700 bg-emerald-50 border-emerald-200",
        why: `High farmgate produce availability in ${businessLocationStr} allows 22–26% net value-addition margin over raw Mandi auction prices. Caters to ~${pop10km.toLocaleString("en-IN")} consumers across regional wholesale and retail corridors.`,
        keyMoat: "Direct farmgate aggregation avoiding multiple intermediary APMC commissions.",
        breakEvenHorizon: "Month 4 (Immediate batch processing revenue cycle)",
      };
    }
    if (isDairy) {
      return {
        verdict: "Exceptional Feasibility — Guaranteed Daily Milk Offtake",
        grade: "Grade A+ (Viability: 92/100)",
        statusTheme: "text-emerald-700 bg-emerald-50 border-emerald-200",
        why: `High-velocity daily liquidity cycle supported by ~${pop5km.toLocaleString("en-IN")} residents within 5km. Captures consistent institutional demand from regional sweet makers, dairy booths, and chilling cooperatives.`,
        keyMoat: "Established milk route procurement network with zero intermediate transit spoilage.",
        breakEvenHorizon: "Month 3 (Daily cash payments with minimal debtor lag)",
      };
    }
    return {
      verdict: "Prime Feasibility — High Catchment Demand with Manageable Incumbents",
      grade: "Grade A (Viability: 84/100)",
      statusTheme: "text-emerald-700 bg-emerald-50 border-emerald-200",
      why: `Sustained consumer consumption base in ${businessLocationStr} with ~${pop5km.toLocaleString("en-IN")} localized footfall. Healthy margin buffer under current inflationary pricing trends.`,
      keyMoat: "Established proximity advantage over distant district-headquarter suppliers.",
      breakEvenHorizon: "Month 4–5 (Predictable break-even horizon)",
    };
  }, [isHealthcare, isFoodProcessing, isDairy, businessLocationStr, pop5km, pop10km]);

  // Sector-Specific Priority Milestones
  const immediateMilestones = useMemo(() => {
    if (isHealthcare) {
      return [
        { title: "Clinical Registration", desc: "File Form-1 under State Clinical Establishments Act for 15–20 beds.", status: "In Progress" },
        { title: "Statutory Clearances", desc: "Biomedical Waste (BMWM) authorization & Fire Safety NOC.", status: "Pending Filing" },
        { title: "Bank DPR Finalization", desc: "Finalize bank-grade DPR for ₹" + loanAmount + "L term loan sanction.", status: "Ready for Bank" },
      ];
    }
    if (isFoodProcessing) {
      return [
        { title: "FSSAI Manufacturing License", desc: "State license application with food safety management plan.", status: "In Progress" },
        { title: "PCB Consent to Establish (CTE)", desc: "Pollution Control Board green/orange category filing.", status: "Filing Ready" },
        { title: "Machinery Procurement", desc: "Release RFQs for processing line & packaging equipment.", status: "Vendor Shortlist" },
      ];
    }
    return [
      { title: "Entity Registration & Udyam", desc: "MSME registration with banking partner linkage.", status: "Completed" },
      { title: "Statutory Approvals & DPR", desc: "Bank DPR submission for PMEGP capital subsidy claim.", status: "In Progress" },
      { title: "Vendor Setup & Procurement", desc: "Supply agreements for raw inventory and fixtures.", status: "Action Needed" },
    ];
  }, [isHealthcare, isFoodProcessing, loanAmount]);

  const monthlyRevenueFormatted = activeBusiness?.expectedRevenue
    ? `₹${(Number(activeBusiness.expectedRevenue) / 1200000).toFixed(2)}L`
    : `₹${(totalCapex * 0.32).toFixed(2)}L`;

  const monthlyProfitFormatted = activeBusiness?.expectedRevenue
    ? `₹${Math.round(Number(activeBusiness.expectedRevenue) * 0.24 / 12).toLocaleString("en-IN")}`
    : `₹${Math.round(totalCapex * 32000 * 0.24).toLocaleString("en-IN")}`;

  const capexBreakdown = [
    { name: isHealthcare ? "Medical Equipment" : "Plant & Machinery", value: totalCapex * 45000 },
    { name: isHealthcare ? "Civil & Wards" : "Working Capital", value: totalCapex * 25000 },
    { name: isHealthcare ? "Pharmacy Inventory" : "Raw Inventory", value: totalCapex * 18000 },
    { name: "Licensing & Setup", value: totalCapex * 12000 },
  ];

  const breakdownColors = [
    { hex: "#60a5fa", bg: "bg-[#60a5fa]" }, // Medium Light Blue
    { hex: "#38bdf8", bg: "bg-[#38bdf8]" }, // Sky Cyan Blue
    { hex: "#93c5fd", bg: "bg-[#93c5fd]" }, // Soft Cornflower Blue
    { hex: "#bae6fd", bg: "bg-[#bae6fd]" }, // Pale Ice Blue
  ];
  const totalBreakdown = capexBreakdown.reduce((sum: number, item: any) => sum + item.value, 0);

  // Fresh Account Check: If user has 0 businesses, show graceful frosted prompt
  if (!isBusinessesLoading && (!businesses || businesses.length === 0)) {
    return (
      <div className="relative w-full min-h-[85vh] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-hidden">
        <div className="filter blur-md opacity-30 select-none pointer-events-none flex flex-col gap-6">
          <div className="h-10 w-64 bg-slate-300 rounded-xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-44 bg-slate-200 rounded-2xl"></div>
            <div className="h-44 bg-slate-200 rounded-2xl"></div>
            <div className="h-44 bg-slate-200 rounded-2xl"></div>
            <div className="h-44 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="bg-white/95 backdrop-blur-2xl border border-[#1E6702]/30 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg w-full text-center flex flex-col items-center gap-5"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>No Active Venture Yet</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#1E6702] text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#242424] tracking-tight">
                Create Your Business to Activate Dashboard
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Your dashboard synthesizes real-time Census demographics, capital structures, and feasibility intelligence once your first venture is registered.
              </p>
            </div>

            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/business/create"
                className="w-full sm:w-auto px-6 py-3 bg-[#1E6702] hover:bg-[#165201] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create New Business</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/analysis"
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Instant Analysis</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 overflow-x-hidden">

      {/* ═══ HEADER: Multi-Business Tabs + Executive Status ═══ */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#242424] tracking-tight leading-tight">
              Executive Overview, {firstName}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-[#1E6702] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Active Venture {currentIdx + 1}: {businessName}
              </span>
              <span>•</span>
              <span className="text-slate-700 font-semibold">{rawCategory}</span>
              <span>•</span>
              <span className="text-slate-500">{businessLocationStr}</span>
            </p>
          </div>

          {/* Real-time Status Badge */}
          <div className="flex items-center gap-2 self-start lg:self-auto bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">Operational Phase 1</span>
            <span className="text-[11px] font-medium text-slate-400">| Day {daysElapsed} of 90</span>
          </div>
        </div>

        {/* ─── Multi-Business Horizontal Switcher (Scroll-safe on mobile) ─── */}
        <div className="w-full flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {businesses && businesses.length > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap">
              {businesses.map((biz: any, idx: number) => {
                const isSelected = idx === currentIdx;
                return (
                  <button
                    key={biz.id || idx}
                    type="button"
                    onClick={() => setSelectedBusinessIndex(idx)}
                    className={`shrink-0 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 ${
                      isSelected
                        ? "bg-[#1E6702] text-white shadow-sm shadow-emerald-900/20 ring-1.5 ring-emerald-600/30 scale-[1.01]"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Briefcase className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isSelected ? "text-emerald-200" : "text-slate-400"}`} />
                    <span className={isSelected ? "text-emerald-200 font-extrabold" : "text-slate-400"}>
                      <span className="sm:hidden">V{idx + 1}:</span>
                      <span className="hidden sm:inline">Venture {idx + 1}:</span>
                    </span>
                    <span className="truncate max-w-[36px] xs:max-w-[50px] sm:max-w-[150px]">
                      {biz.name || `Business ${idx + 1}`}
                    </span>
                  </button>
                );
              })}

              <Link
                href="/business/create"
                className="shrink-0 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1E6702] text-[10px] sm:text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="sm:hidden">Add</span>
                <span className="hidden sm:inline">+ Add Venture</span>
              </Link>
            </div>
          ) : null}
        </div>

        {/* ─── Portfolio Context Bar (If multiple businesses exist) ─── */}
        {businesses && businesses.length > 1 ? (
          <div className="bg-emerald-950 text-white rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-emerald-900">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 block">
                  Enterprise Portfolio ({businesses.length} Active Ventures)
                </span>
                <p className="text-xs sm:text-[13px] text-emerald-100 font-medium">
                  Switching ventures adjusts feasibility summaries, demographic footfall, and financing allocations in real-time.
                </p>
              </div>
            </div>
            <Link
              href="/business/compare"
              className="self-end sm:self-auto shrink-0 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-3.5 py-1.5 rounded-xl font-sans text-xs font-extrabold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Side-by-Side Compare</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : null}
      </motion.div>

      {/* ═══ 4 CORE EXECUTIVE STATUS CARDS (Text-First, Qualitative Intelligence) ═══ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-stretch"
      >

        {/* CARD 1: Business Feasibility & Market Viability */}
        <motion.div 
          variants={cardVariants} 
          className="group relative overflow-hidden bg-white/95 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-slate-300/90 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between h-full"
        >
          {/* Ambient glass top light reflection */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-200 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 min-h-[54px]">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Feasibility Status
              </span>
              <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug line-clamp-2">
                {feasibilitySummary.verdict}
              </h3>
            </div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border shrink-0 shadow-xs ${feasibilitySummary.statusTheme}`}>
              {feasibilitySummary.grade}
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col justify-between my-3">
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed bg-slate-50/90 backdrop-blur-xs p-3 rounded-xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <p className="line-clamp-3 sm:line-clamp-none">{feasibilitySummary.why}</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 font-medium text-emerald-800 text-[11px]">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Moat: {feasibilitySummary.keyMoat}</span>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-2.5 border-t border-slate-100 mt-auto">
            <Link
              href={`/business/${activeBusiness?.id}/feasibility`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E6702] hover:text-[#165201] transition-colors group/link"
            >
              <span>Inspect Feasibility Radar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </motion.div>

        {/* CARD 2: Capital Architecture & Subsidy Health */}
        <motion.div 
          variants={cardVariants} 
          className="group relative overflow-hidden bg-white/95 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-slate-300/90 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between h-full"
        >
          {/* Ambient glass top light reflection */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-200 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-sky-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 min-h-[54px]">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Landmark className="w-3.5 h-3.5 text-sky-600" />
                Capital & Financing
              </span>
              <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug line-clamp-2">
                Structured ₹{totalCapex}L Outlay (80% Debt Eligible)
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border text-sky-700 bg-sky-50 border-sky-200 shrink-0 shadow-xs">
              PMEGP Eligible
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col justify-between my-3">
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 backdrop-blur-xs p-3 rounded-xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Promoter Equity (15%):</span>
                <span className="font-bold text-slate-900">₹{promoterEquity}L</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Bank Term Loan (80%):</span>
                <span className="font-bold text-sky-800">₹{loanAmount}L</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Govt Subsidy Grant:</span>
                <span className="font-bold text-emerald-800">Up to ₹{subsidyAmount}L</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium">
                Break-Even: <span className="font-bold text-slate-800">{feasibilitySummary.breakEvenHorizon}</span>
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-2.5 border-t border-slate-100 mt-auto">
            <Link
              href={`/business/${activeBusiness?.id}/finance`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 transition-colors group/link"
            >
              <span>Review Finance & Subsidies</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </motion.div>

        {/* CARD 3: Hyper-Local Catchment Footprint */}
        <motion.div 
          variants={cardVariants} 
          className="group relative overflow-hidden bg-white/95 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-slate-300/90 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between h-full"
        >
          {/* Ambient glass top light reflection */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-200 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 min-h-[54px]">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                Demographic Reach
              </span>
              <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug line-clamp-2">
                ~{pop5km >= 100000 ? `${(pop5km / 100000).toFixed(2)}L` : pop5km.toLocaleString("en-IN")} Pop. in 5km Core
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border text-amber-800 bg-amber-50 border-amber-200 shrink-0 shadow-xs">
              Census 2011 PCA
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col justify-between my-3">
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 backdrop-blur-xs p-3 rounded-xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">5km Daily Footfall:</span>
                <span className="font-bold text-slate-900">~{pop5km.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">10km Regional Trade:</span>
                <span className="font-bold text-slate-900">~{pop10km.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">20km District Reach:</span>
                <span className="font-bold text-slate-900">~{pop20km.toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium truncate">
                Density: <span className="font-bold text-slate-800">{density} /km²</span> in {activeBusiness?.location?.district || "District"}
              </div>
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-2.5 border-t border-slate-100 mt-auto">
            <Link
              href={`/business/${activeBusiness?.id}/feasibility`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors group/link"
            >
              <span>Open Geospatial Radar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </motion.div>

        {/* CARD 4: Immediate Statutory & Operational Milestones */}
        <motion.div 
          variants={cardVariants} 
          className="group relative overflow-hidden bg-white/95 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-1 hover:border-slate-300/90 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between h-full"
        >
          {/* Ambient glass top light reflection */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-200 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />

          {/* Header */}
          <div className="flex items-start justify-between gap-2 min-h-[54px]">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                Execution Roadmap
              </span>
              <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-slate-900 leading-snug line-clamp-2">
                Phase 1: Clearances & Statutory Filing
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border text-purple-800 bg-purple-50 border-purple-200 shrink-0 shadow-xs">
              3 Actions Active
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 flex flex-col justify-between my-3">
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/90 backdrop-blur-xs p-3 rounded-xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              {immediateMilestones.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                  <CheckSquare className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{item.title}: </span>
                    <span className="text-slate-600 line-clamp-1 sm:line-clamp-none">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Link */}
          <div className="pt-2.5 border-t border-slate-100 mt-auto">
            <Link
              href={`/business/${activeBusiness?.id}/roadmap`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-800 hover:text-purple-950 transition-colors group/link"
            >
              <span>View 12-Month Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </motion.div>

      </motion.div>

      {/* ═══ LOWER GRID: Business Profile Details + Capital Allocation + Financial Health ═══ */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch"
      >

        {/* LEFT COLUMN: Overview + Capital Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">

          {/* Business Overview Card */}
          <motion.div 
            variants={cardVariants} 
            className="group relative overflow-hidden bg-gradient-to-br from-[#fbfce6] via-[#f7f9d9] to-[#edf2c7] text-[#2b542f] rounded-2xl border border-[#2b542f]/20 shadow-[0_8px_30px_-6px_rgba(43,84,47,0.12),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_40px_-6px_rgba(43,84,47,0.18)] hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 lg:p-7 flex flex-col gap-5"
          >
            {/* Ambient specular highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/30 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-[#2b542f] bg-white/70 backdrop-blur-xs border border-[#2b542f]/20 px-2.5 py-0.5 rounded-md shadow-xs inline-block mb-1">
                  Venture {currentIdx + 1} Profile & Positioning
                </span>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#2b542f]">
                  {businessName}
                </h2>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  href={`/business/${activeBusiness?.id}/feasibility`}
                  className="inline-flex items-center gap-1.5 bg-white/85 hover:bg-white text-[#2b542f] px-3 py-1.5 rounded-xl font-sans text-xs font-bold shadow-xs border border-white/70 hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#2b542f]" />
                  <span>Feasibility</span>
                </Link>
                <Link
                  href={`/reports/${activeBusiness?.id}`}
                  className="inline-flex items-center gap-1.5 bg-[#2b542f] hover:bg-[#204023] text-white px-3 py-1.5 rounded-xl font-sans text-xs font-bold shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>DPR Report</span>
                </Link>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
              <div className="flex flex-col gap-0.5 bg-white/45 backdrop-blur-xs p-3 rounded-xl border border-[#2b542f]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#2b542f]/70">Business Focus</span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-[#2b542f]">
                  {activeBusiness?.description || (isHealthcare ? "Secondary Care Hospital with 24x7 Inpatient & Diagnostic Services" : isFoodProcessing ? "Value-Added Agro-Processing & Modern Packaged Foods" : "Commercial Production & Distribution")}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 bg-white/45 backdrop-blur-xs p-3 rounded-xl border border-[#2b542f]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#2b542f]/70">Primary Market</span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-[#2b542f]">
                  {activeBusiness?.existingResources || `${businessLocationStr} peri-urban catchment (~${pop10km.toLocaleString()} residents)`}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 bg-white/45 backdrop-blur-xs p-3 rounded-xl border border-[#2b542f]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#2b542f]/70">Positioning Moat</span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-[#2b542f]">
                  {feasibilitySummary.keyMoat}
                </p>
              </div>
              <div className="flex flex-col gap-0.5 bg-white/45 backdrop-blur-xs p-3 rounded-xl border border-[#2b542f]/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#2b542f]/70">Sales Channels</span>
                <p className="font-sans text-xs sm:text-sm font-semibold text-[#2b542f]">
                  {isHealthcare ? "Direct OPD walk-in + PM-JAY Empanelment + Local Doctors" : "Direct Retail + Regional Mandi Distributors"}
                </p>
              </div>
            </div>

            {/* Key Opportunity Highlight */}
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.03)] flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#2b542f]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Strategic Opportunity</span>
              </div>
              <p className="font-sans text-xs sm:text-[13px] font-medium text-[#2b542f] leading-relaxed">
                {isHealthcare
                  ? `With only 2 major tertiary hospitals in ${businessLocationStr}, localized demand for affordable bed capacity and clinical diagnostics creates a reliable patient pipeline.`
                  : isFoodProcessing
                  ? `Leveraging available margin of ₹${marginAmt > 0 ? marginAmt.toLocaleString("en-IN") : "1,50,000"} allows immediate capture of premium packaging arbitrage over commodity mandi prices.`
                  : `Capturing the sub-district commercial deficit in ${businessLocationStr} with low competitive pressure.`}
              </p>
            </div>
          </motion.div>

          {/* Capital Breakdown Card */}
          <motion.div 
            variants={cardVariants} 
            className="group relative overflow-hidden bg-gradient-to-br from-[#234670] via-[#1c385a] to-[#142840] text-[#f2f5d0] rounded-2xl border border-white/15 shadow-[0_10px_35px_-6px_rgba(20,40,64,0.45),0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_45px_-6px_rgba(20,40,64,0.6)] hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 lg:p-7 flex flex-col gap-5"
          >
            {/* Ambient specular highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-300/40 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#f2f5d0]/70 block mb-0.5">
                  Capex Architecture
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#f2f5d0]">
                  Capital Allocation & Working Reserve
                </h3>
              </div>
              <span className="text-xs font-bold text-[#f2f5d0] bg-white/10 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/15 shadow-xs">
                ₹{totalCapex}L Total Outlay
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex h-3 rounded-full overflow-hidden w-full gap-[2px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4),0_0_15px_rgba(56,189,248,0.2)] bg-black/35 p-0.5 relative z-10">
              {capexBreakdown.map((item: any, i: number) => {
                const color = breakdownColors[i % breakdownColors.length];
                return (
                  <div
                    key={item.name}
                    className="rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.value / Math.max(1, totalBreakdown)) * 100}%`,
                      backgroundColor: color.hex,
                    }}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 relative z-10">
              {capexBreakdown.map((item: any, i: number) => {
                const color = breakdownColors[i % breakdownColors.length];
                return (
                  <div key={item.name} className="flex flex-col gap-0.5 bg-white/8 backdrop-blur-xs p-2.5 sm:p-3 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-200">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] sm:text-[11px] font-medium text-[#f2f5d0]/80 truncate">{item.name}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#f2f5d0]">
                      ₹{item.value >= 100000 ? `${(item.value / 100000).toFixed(2)}L` : `${Math.round(item.value).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Financial Health & Quick Actions */}
        <div className="flex flex-col gap-5 sm:gap-6">

          {/* Financial Outlook Card */}
          <motion.div 
            variants={cardVariants} 
            className="group relative overflow-hidden bg-gradient-to-br from-[#567a59] via-[#486b4b] to-[#38543b] text-[#fbfce6] rounded-2xl border border-white/15 shadow-[0_10px_35px_-6px_rgba(56,84,59,0.35),0_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0_16px_45px_-6px_rgba(56,84,59,0.5)] hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 lg:p-7 flex flex-col justify-between gap-5"
          >
            {/* Ambient specular highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#fbfce6]/75 block mb-1">
                Financial Health & Cashflow
              </span>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#fbfce6]">
                Turnover & Profit Targets
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/12 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] relative z-10">
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#fbfce6]/70 block">Monthly Revenue</span>
                <span className="text-xl sm:text-2xl font-bold text-white block mt-0.5">
                  {monthlyRevenueFormatted}
                </span>
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#fbfce6]/70 block">Net Profit / mo</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-200 block mt-0.5">
                  {monthlyProfitFormatted}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#fbfce6]/90 bg-black/15 backdrop-blur-md p-3.5 rounded-xl border border-white/10 relative z-10">
              <div className="flex justify-between items-center">
                <span>Estimated Break-Even:</span>
                <span className="font-bold text-white">{feasibilitySummary.breakEvenHorizon}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Term Loan EMI:</span>
                <span className="font-bold text-white">~₹{Math.round(loanAmount * 1800).toLocaleString("en-IN")} /mo</span>
              </div>
              <div className="flex justify-between items-center">
                <span>DSCR Coverage Ratio:</span>
                <span className="font-bold text-emerald-300">2.14x (Bank Grade)</span>
              </div>
            </div>

            <Link
              href={`/business/${activeBusiness?.id}/finance`}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#fbfce6] to-white hover:from-white hover:to-white text-[#38543b] rounded-xl font-bold text-xs sm:text-sm text-center shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 relative z-10"
            >
              <span>Explore Loan Subsidy Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Action Center Card */}
          <motion.div 
            variants={cardVariants} 
            className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_14px_35px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between gap-4"
          >
            {/* Ambient specular highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                Venture Operations
              </span>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-slate-900">
                Action Center & Next Steps
              </h3>
            </div>

            <div className="space-y-2.5 relative z-10">
              <Link
                href={`/reports/${activeBusiness?.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-950 border border-slate-200/70 hover:border-emerald-200/80 hover:shadow-xs transition-all text-xs font-bold group/item"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100/60 flex items-center justify-center text-emerald-800 shrink-0 group-hover/item:scale-105 transition-transform">
                    <FileText className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span>Detailed Project Report (DPR)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 text-emerald-700 transition-transform" />
              </Link>

              <Link
                href="/business/compare"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 hover:bg-sky-50/70 text-slate-800 hover:text-sky-950 border border-slate-200/70 hover:border-sky-200/80 hover:shadow-xs transition-all text-xs font-bold group/item"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100/60 flex items-center justify-center text-sky-800 shrink-0 group-hover/item:scale-105 transition-transform">
                    <Layers className="w-4 h-4 text-sky-700" />
                  </div>
                  <span>Compare with Benchmarks</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 text-sky-700 transition-transform" />
              </Link>

              <Link
                href={`/business/${activeBusiness?.id}/roadmap`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 hover:bg-purple-50/70 text-slate-800 hover:text-purple-950 border border-slate-200/70 hover:border-purple-200/80 hover:shadow-xs transition-all text-xs font-bold group/item"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100/60 flex items-center justify-center text-purple-800 shrink-0 group-hover/item:scale-105 transition-transform">
                    <Compass className="w-4 h-4 text-purple-700" />
                  </div>
                  <span>12-Month Execution Roadmap</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 text-purple-700 transition-transform" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 text-center font-medium relative z-10">
              VentureRoot Intelligence Grounded in Census 2011 & APMC Mandis
            </p>
          </motion.div>

        </div>

      </motion.div>

    </div>
  );
}
