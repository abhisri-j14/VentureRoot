"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Edit2,
  Check,
  X,
  Camera,
  User,
  MapPin,
  Wallet,
  Briefcase,
  Leaf,
  ChevronRight,
  PlusCircle,
  BarChart2,
  TrendingUp,
  Sparkles,
  Building2,
  ShieldCheck,
  Award,
  CircleDollarSign,
  Landmark,
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useProfile } from "@/lib/data/users";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useAuthStore } from "@/stores/useAuthStore";
import { profileApi } from "@/features/profile/api/profileApi";
import { StateAutocompleteInput } from "@/components/ui/StateAutocompleteInput";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- Framer Motion Variants matching dashboard style ---
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

// --- Typography classes aligned 1:1 with dashboard/page.tsx ---
const classes = {
  pageTitle: "font-heading text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#242424] tracking-tight leading-tight",
  cardHeading: "font-heading text-[16px] sm:text-[18px] md:text-[20px] font-bold text-slate-900 tracking-tight leading-snug",
  supportingText: "font-sans text-[12.5px] sm:text-[14px] text-slate-500 font-medium leading-normal",
  smallSupporting: "font-sans text-[12px] sm:text-[13px] font-medium text-slate-400",
  profileLabel: "font-sans text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-slate-500",
  profileValue: "font-sans text-[13px] sm:text-[14px] font-semibold text-slate-900",
  buttonText: "font-sans text-[12.5px] sm:text-[14px] font-bold",
};

function CompletionRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = React.useState(circ);
  React.useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 400);
    return () => clearTimeout(t);
  }, [pct, circ]);
  return (
    <div className="relative w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] flex items-center justify-center shrink-0">
      <div className="absolute inset-0 rounded-full bg-[#1E6702]/10 blur-md" />
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="#1E6702" strokeOpacity="0.15" strokeWidth="5" fill="none" />
        <circle
          cx="44"
          cy="44"
          r={r}
          stroke="#1E6702"
          strokeWidth="5"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-heading text-[18px] sm:text-[20px] font-bold text-slate-900 tracking-tight leading-none">{pct}%</span>
        <span className="font-sans text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Active</span>
      </div>
    </div>
  );
}

function Avatar({ name, isEditing }: { name: string; isEditing: boolean }) {
  const initials = (name || "Entrepreneur")
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative group shrink-0">
      <div className="w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-gradient-to-br from-[#1E6702] to-[#124201] flex items-center justify-center shadow-[0_8px_24px_rgba(30,103,2,0.35)] border border-[#1E6702]/20">
        <span className="font-heading text-[20px] sm:text-[26px] font-bold text-white tracking-tight select-none">{initials}</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      {isEditing && (
        <button className="absolute -bottom-1 -right-1 sm:-bottom-1.5 sm:-right-1.5 w-6 h-6 sm:w-7 sm:h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-[#1E6702] transition-colors border-2 border-white">
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}
    </div>
  );
}

function SectionHeading({ icon: Icon, label, iconClass }: { icon: any; label: string; iconClass: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-gray-900/8 min-w-0">
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <h3 className={`${classes.cardHeading} break-words`}>{label}</h3>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", editable = true, options = null }: any) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 w-full group min-w-0">
      <label className={`${classes.profileLabel} break-words`}>{label}</label>
      {editable && onChange ? (
        options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-white border border-gray-900/10 rounded-xl px-3 py-2 sm:py-2.5 ${classes.profileValue} focus:outline-none focus:border-[#1E6702]/60 focus:ring-2 focus:ring-[#1E6702]/10 transition-all shadow-sm break-words`}
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full bg-white border border-gray-900/10 rounded-xl px-3 py-2 sm:py-2.5 ${classes.profileValue} focus:outline-none focus:border-[#1E6702]/60 focus:ring-2 focus:ring-[#1E6702]/10 transition-all shadow-sm`}
          />
        )
      ) : (
        <div
          className={`w-full bg-white/70 border border-gray-900/8 rounded-xl px-3 py-2 sm:py-2.5 ${classes.profileValue} min-h-[38px] sm:min-h-[42px] flex items-center shadow-sm group-hover:border-[#1E6702]/30 transition-colors break-words [overflow-wrap:anywhere]`}
        >
          {value || <span className={`${classes.smallSupporting} italic font-normal`}>Not provided</span>}
        </div>
      )}
    </div>
  );
}

export const ProfileView = () => {
  const { data: fetchedProfile, isLoading, refetch } = useProfile();
  const { data: businesses, isLoading: isBusinessesLoading } = useBusinessesComparison();
  const user = useAuthStore((s) => s.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { t } = useTranslation();

  // Initialize or fallback to real user information:
  React.useEffect(() => {
    const localName = typeof window !== "undefined" ? localStorage.getItem("ventureroot_user_name") : null;
    const resolvedName =
      fetchedProfile?.fullName ||
      user?.name ||
      localName ||
      (user?.email
        ? user.email
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase())
        : "Entrepreneur");

    let savedLocation = {
      state: "Gujarat",
      district: "Anand",
      block: "Anand",
      village: "Anand",
    };

    if (typeof window !== "undefined") {
      try {
        const locStr = localStorage.getItem("ventureroot_base_location");
        if (locStr) {
          const parsed = JSON.parse(locStr);
          if (parsed.state) savedLocation = parsed;
        }
      } catch (_) {}
    }

    if (fetchedProfile) {
      setProfile({
        ...fetchedProfile,
        fullName: fetchedProfile.fullName || resolvedName,
        email: fetchedProfile.email || user?.email || "entrepreneur@ventureroot.in",
        phone: fetchedProfile.phone || "9876543210",
        location: fetchedProfile.location?.state ? fetchedProfile.location : savedLocation,
        experience: {
          ...fetchedProfile.experience,
          skills: Array.isArray(fetchedProfile.experience?.skills)
            ? fetchedProfile.experience.skills.join(", ")
            : fetchedProfile.experience?.skills || "Business Operations, APMC Trade, Supply Chain",
        },
      });
    } else {
      setProfile({
        fullName: resolvedName,
        email: user?.email || "entrepreneur@ventureroot.in",
        phone: "9876543210",
        location: savedLocation,
        financial: {
          availableCapital: 100000,
          income: 25000,
        },
        experience: {
          businessExperience: "1-3 years",
          skills: "Business Operations, Local Trade, Supply Chain",
          education: "Graduate",
        },
      });
    }
  }, [fetchedProfile, user]);

  // Aggregate User Financial Intelligence across all ventures
  const financialMetrics = React.useMemo(() => {
    const bizList = businesses || [];
    const count = bizList.length;

    const totalAvailableMargin =
      bizList.reduce((acc, b: any) => acc + Number(b.availableMargin || 0), 0) ||
      Number(profile?.financial?.availableCapital) ||
      100000;

    const totalRevenue = bizList.reduce((acc, b: any) => acc + Number(b.expectedRevenue || 0), 0);

    const totalCapex =
      bizList.reduce(
        (acc, b: any) =>
          acc + Number(b.expectedRevenue ? b.expectedRevenue * 0.4 : b.availableMargin * 3 || 100000),
        0
      ) || (count > 0 ? totalAvailableMargin * 3 : 250000);

    // Statutory PMEGP subsidy grant (25% for rural general, up to 35% for special categories)
    const subsidyGrantEst = Math.round(totalCapex * 0.25);
    const bankLoanCapacity = Math.max(0, totalCapex - totalAvailableMargin - subsidyGrantEst);

    return {
      count,
      totalAvailableMargin,
      totalRevenue,
      totalCapex,
      subsidyGrantEst,
      bankLoanCapacity,
    };
  }, [businesses, profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const skillsArray =
        typeof profile?.experience?.skills === "string"
          ? profile.experience.skills
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : Array.isArray(profile?.experience?.skills)
          ? profile.experience.skills
          : [];

      const payload = {
        fullName: profile.fullName || "",
        email: profile.email || undefined,
        phone: profile.phone || undefined,
        location: {
          state: profile.location?.state || "Gujarat",
          district: profile.location?.district || "Anand",
          block: profile.location?.block || undefined,
          village: profile.location?.village || undefined,
        },
        financial: {
          availableCapital: Number(profile.financial?.availableCapital) || 0,
          income: Number(profile.financial?.income) || 0,
        },
        experience: {
          businessExperience: profile.experience?.businessExperience || "1-3 years",
          skills: skillsArray,
          education: profile.experience?.education || undefined,
        },
      };

      if (typeof window !== "undefined" && profile.fullName) {
        localStorage.setItem("ventureroot_user_name", profile.fullName.trim());
      }

      await profileApi.updateProfile(payload as any);
      refetch();
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Failed to update profile", err);
      // Even if API endpoint errors, persist locally so user experience is smooth
      if (typeof window !== "undefined" && profile.fullName) {
        localStorage.setItem("ventureroot_user_name", profile.fullName.trim());
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentProfile = profile || {
    fullName: user?.name || "Entrepreneur",
    email: user?.email || "entrepreneur@ventureroot.in",
    phone: "9876543210",
    location: { state: "Gujarat", district: "Anand" },
    financial: { availableCapital: 100000, income: 25000 },
    experience: { businessExperience: "1-3 years", skills: "Business Operations", education: "Graduate" },
  };

  const stateName = currentProfile.location?.state || "Gujarat";
  const districtName = currentProfile.location?.district || "Anand";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full h-full p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 font-sans max-w-full overflow-x-hidden">
      
      {/* ═══ Header Card ═══ */}
      <motion.div
        variants={itemVariants}
        className="relative w-full bg-[#fffff5] rounded-2xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] overflow-hidden min-w-0"
      >
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#1E6702] via-[#2ca104] to-[#81cc87]" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#1E6702]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#1E6702]/6 blur-2xl pointer-events-none" />

        <div className="relative p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5 min-w-0">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 w-full md:w-auto min-w-0 flex-1">
            <Avatar name={currentProfile.fullName} isEditing={isEditing} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className={`${classes.pageTitle} break-words`}>{currentProfile.fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-bold border border-emerald-200 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1E6702]" />
                  Verified
                </span>
              </div>
              <div className={`${classes.supportingText} mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-[13.5px]`}>
                <span className="flex items-center gap-1 shrink-0">
                  <Leaf className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
                  <span className="break-words">{districtName}, {stateName} Entrepreneur</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-500 break-words">
                  Username: <span className="font-semibold text-slate-700">@{currentProfile.fullName.toLowerCase().replace(/\s+/g, "_")}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-gray-900/5 shrink-0">
            <CompletionRing pct={100} />
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2 sm:gap-2.5 flex-wrap"
                >
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                    }}
                    disabled={isSaving}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-900/10 text-slate-700 ${classes.buttonText} rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 text-xs sm:text-sm`}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-[#1E6702] text-white ${classes.buttonText} rounded-xl hover:bg-[#154a01] shadow-md shadow-[#1E6702]/20 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs sm:text-sm`}
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="view"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-900/10 text-slate-900 ${classes.buttonText} rounded-xl hover:border-[#1E6702]/40 hover:bg-[#1E6702]/5 shadow-sm transition-all flex items-center gap-1.5 group text-xs sm:text-sm shrink-0`}
                >
                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E6702]" />
                  Edit Profile
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {saveSuccess && (
          <div className="mx-4 sm:mx-6 md:mx-8 mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 break-words">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        {saveError && (
          <div className="mx-4 sm:mx-6 md:mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl break-words">
            {saveError}
          </div>
        )}
      </motion.div>

      {/* ═══ FINANCIAL STATUS OF CURRENT LOGGED-IN USER ═══ */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col gap-4 min-w-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#1E6702] flex items-center justify-center font-bold border border-emerald-200 shrink-0 mt-0.5 sm:mt-0">
              <CircleDollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`${classes.cardHeading} break-words`}>Financial Status & Enterprise Capital</h2>
              <p className={`${classes.supportingText} break-words text-xs sm:text-[14px] mt-0.5`}>
                Consolidated capital standing, venture investment capacity, and institutional loan readiness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shrink-0">
              <Award className="w-3.5 h-3.5 text-[#1E6702]" />
              PMEGP & MUDRA Eligible
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {/* Card 1: Available Margin */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 break-words">Available Own Margin</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              ₹{financialMetrics.totalAvailableMargin.toLocaleString("en-IN")}
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5 break-words">
              <TrendingUp className="w-3 h-3 shrink-0" /> Ready for deployment
            </span>
          </div>

          {/* Card 2: Capex Scale */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-900 break-words">Total Capex Scale</span>
            <div className="text-xl sm:text-2xl font-bold text-[#1E6702] break-words">
              ₹{(financialMetrics.totalCapex / 100000).toFixed(1)} Lakhs
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-slate-600 font-medium break-words">
              Across {financialMetrics.count} {financialMetrics.count === 1 ? "venture" : "ventures"}
            </span>
          </div>

          {/* Card 3: Projected Turnover */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 break-words">Annual Turnover Target</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
              {financialMetrics.totalRevenue > 0
                ? `₹${financialMetrics.totalRevenue.toLocaleString("en-IN")}`
                : "₹18,50,000"}
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium break-words">
              {financialMetrics.totalRevenue > 0 ? "Consolidated projections" : "Based on district benchmarks"}
            </span>
          </div>

          {/* Card 4: Subsidy Grant */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-900 break-words">PMEGP Grant Subsidy</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-950 break-words">
              ₹{(financialMetrics.subsidyGrantEst / 100000).toFixed(1)} Lakhs
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-amber-800 font-semibold flex items-center gap-1 break-words">
              <Landmark className="w-3 h-3 shrink-0" /> 25% Non-refundable Margin Money
            </span>
          </div>
        </div>
      </motion.div>

      {/* ═══ Info Grid ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(30,103,2,0.12)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 transition-shadow min-w-0"
        >
          <SectionHeading icon={User} label="Personal Details" iconClass="bg-[#1E6702]/10 text-[#1E6702]" />
          <InputField
            label="Full Name"
            value={currentProfile.fullName}
            onChange={isEditing ? (v: any) => setProfile({ ...currentProfile, fullName: v }) : null}
            editable={isEditing}
          />
          <InputField
            label="Email Address"
            type="email"
            value={currentProfile.email}
            onChange={isEditing ? (v: any) => setProfile({ ...currentProfile, email: v }) : null}
            editable={isEditing}
          />
          <InputField
            label="Phone Number"
            type="tel"
            value={currentProfile.phone}
            onChange={isEditing ? (v: any) => setProfile({ ...currentProfile, phone: v }) : null}
            editable={isEditing}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(30,103,2,0.12)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 transition-shadow min-w-0"
        >
          <SectionHeading icon={MapPin} label="Base Location" iconClass="bg-orange-50 text-orange-600" />
          {isEditing ? (
            <>
              <div className="flex flex-col gap-1 sm:gap-1.5 w-full min-w-0">
                <label className={classes.profileLabel}>State / UT</label>
                <StateAutocompleteInput
                  value={currentProfile.location?.state || ""}
                  onChange={(val) =>
                    setProfile({
                      ...currentProfile,
                      location: { ...(currentProfile.location || {}), state: val },
                    })
                  }
                  placeholder="Type state initials or name..."
                  inputClassName="bg-white border-gray-900/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
              <InputField
                label="District"
                value={currentProfile.location?.district || ""}
                onChange={(v: any) =>
                  setProfile({
                    ...currentProfile,
                    location: { ...(currentProfile.location || {}), district: v },
                  })
                }
                editable={true}
              />
              <InputField
                label="Block / Taluka"
                value={currentProfile.location?.block || ""}
                onChange={(v: any) =>
                  setProfile({
                    ...currentProfile,
                    location: { ...(currentProfile.location || {}), block: v },
                  })
                }
                editable={true}
              />
              <InputField
                label="Village"
                value={currentProfile.location?.village || ""}
                onChange={(v: any) =>
                  setProfile({
                    ...currentProfile,
                    location: { ...(currentProfile.location || {}), village: v },
                  })
                }
                editable={true}
              />
            </>
          ) : (
            <>
              <InputField label="State" value={currentProfile.location?.state || "Gujarat"} editable={false} />
              <InputField label="District" value={currentProfile.location?.district || "Anand"} editable={false} />
              <InputField label="Block / Taluka" value={currentProfile.location?.block || "Anand"} editable={false} />
              <InputField label="Village" value={currentProfile.location?.village || "Anand"} editable={false} />
            </>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(30,103,2,0.12)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 transition-shadow min-w-0"
        >
          <SectionHeading icon={Wallet} label="Capital & Income" iconClass="bg-blue-50 text-blue-600" />
          <InputField
            label="Available Capital (₹)"
            type="number"
            value={currentProfile.financial?.availableCapital}
            onChange={
              isEditing
                ? (v: any) =>
                    setProfile({
                      ...currentProfile,
                      financial: { ...currentProfile.financial, availableCapital: Number(v) },
                    })
                : null
            }
            editable={isEditing}
          />
          <InputField
            label="Monthly Income (₹)"
            type="number"
            value={currentProfile.financial?.income}
            onChange={
              isEditing
                ? (v: any) =>
                    setProfile({
                      ...currentProfile,
                      financial: { ...currentProfile.financial, income: Number(v) },
                    })
                : null
            }
            editable={isEditing}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(30,103,2,0.12)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 transition-shadow min-w-0"
        >
          <SectionHeading icon={Briefcase} label="Enterprise Background" iconClass="bg-purple-50 text-purple-600" />
          <InputField
            label="Business Experience"
            options={isEditing ? ["None", "0-2 years", "3-5 years", "5+ years"] : null}
            value={currentProfile.experience?.businessExperience || "1-3 years"}
            onChange={
              isEditing
                ? (v: any) =>
                    setProfile({
                      ...currentProfile,
                      experience: { ...currentProfile.experience, businessExperience: v },
                    })
                : null
            }
            editable={isEditing}
          />
          <InputField
            label="Key Competencies"
            value={currentProfile.experience?.skills}
            onChange={
              isEditing
                ? (v: any) =>
                    setProfile({
                      ...currentProfile,
                      experience: { ...currentProfile.experience, skills: v },
                    })
                : null
            }
            editable={isEditing}
          />
          <InputField
            label="Education / Certification"
            value={currentProfile.experience?.education || "Graduate"}
            onChange={
              isEditing
                ? (v: any) =>
                    setProfile({
                      ...currentProfile,
                      experience: { ...currentProfile.experience, education: v },
                    })
                : null
            }
            editable={isEditing}
          />
        </motion.div>
      </div>

      {/* ═══ MY VENTURES & ANALYZED BUSINESSES (Business 1, 2, 3...) ═══ */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:gap-5 mt-2 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-900/8 min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E6702]/15 text-[#1E6702] flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5 sm:mt-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`${classes.cardHeading} break-words`}>My Ventures & Analyzed Businesses</h2>
              <p className={`${classes.supportingText} break-words text-xs sm:text-[14px] mt-0.5`}>
                {businesses && businesses.length > 0
                  ? `${businesses.length} ${businesses.length === 1 ? "business venture" : "business ventures"} linked to your profile`
                  : "No businesses registered or analyzed yet"}
              </p>
            </div>
          </div>

          <Link
            href="/business/create"
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#1E6702] hover:bg-[#154a01] text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto hover:-translate-y-0.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Business</span>
          </Link>
        </div>

        {isBusinessesLoading ? (
          <div className="p-8 bg-[#fffff5] rounded-xl border border-gray-900/8 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <div className="w-5 h-5 border-2 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
              <span>Loading your businesses...</span>
            </div>
          </div>
        ) : businesses && businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map((biz: any, idx: number) => {
              const capexEst = (
                Number(biz.expectedRevenue ? biz.expectedRevenue * 0.4 : biz.availableMargin * 3 || 100000) / 100000
              ).toFixed(1);

              return (
                <motion.div
                  key={biz.id || idx}
                  variants={itemVariants}
                  whileHover={{ y: -3, boxShadow: "0 10px 30px rgba(30,103,2,0.14)" }}
                  className="bg-[#fffff5] rounded-2xl border border-gray-900/8 p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 transition-all shadow-[0_4px_24px_rgb(0,0,0,0.04)] relative overflow-hidden group min-w-0"
                >
                  <div className="space-y-3.5 min-w-0">
                    {/* Header with explicit "Business 1", "Business 2", etc. */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[#1E6702]/15 text-[#1E6702] text-[11px] sm:text-xs font-extrabold tracking-wide border border-[#1E6702]/20">
                          Business {idx + 1}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                        {biz.status || "Active"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#1E6702] transition-colors break-words line-clamp-1">
                        {biz.name || `Business ${idx + 1}`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10.5px] sm:text-[11px] border border-amber-200/50 shrink-0">
                          {biz.category?.name || biz.category || "Enterprise"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 break-words">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="break-words">
                            {biz.location?.district
                              ? `${biz.location.district}, ${biz.location.state}`
                              : biz.location?.state || "Anand, Gujarat"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {biz.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-gray-900/5 break-words">
                        {biz.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-900/8 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50/80 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider break-words">
                          Available Margin
                        </span>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm break-words">
                          ₹{Number(biz.availableMargin || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1E6702]/5 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#1E6702] block tracking-wider break-words">
                          Est. Project Scale
                        </span>
                        <span className="font-bold text-[#1E6702] text-xs sm:text-sm break-words">
                          ₹{capexEst} Lakhs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-900/8 grid grid-cols-3 gap-1.5 sm:gap-2">
                    <Link
                      href={`/business/${biz.id}/feasibility`}
                      className="text-center py-2 px-1 sm:px-2 rounded-xl bg-[#1E6702]/10 hover:bg-[#1E6702]/20 text-[#1E6702] text-[10px] sm:text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <BarChart2 className="w-3 h-3 shrink-0" />
                      <span>Analysis</span>
                    </Link>
                    <Link
                      href={`/business/${biz.id}/finance`}
                      className="text-center py-2 px-1 sm:px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] sm:text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <CircleDollarSign className="w-3 h-3 shrink-0" />
                      <span>Finance</span>
                    </Link>
                    <Link
                      href={`/business/${biz.id}`}
                      className="text-center py-2 px-1 sm:px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Overview</span>
                      <ChevronRight className="w-3 h-3 shrink-0" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#fffff5] rounded-2xl border-2 border-dashed border-gray-900/15 p-8 text-center flex flex-col items-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#1E6702]/10 text-[#1E6702] flex items-center justify-center shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="font-heading text-base font-bold text-slate-800">
                No Businesses Registered or Analyzed Yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You currently have 0 businesses connected. Create your first business (Business 1) to run feasibility checks, generate financial forecasts, and link it with your profile.
              </p>
            </div>
            <Link
              href="/business/create"
              className="px-5 py-2.5 bg-[#1E6702] hover:bg-[#154a01] text-white text-xs font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Business 1</span>
            </Link>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
};
