"use client";

import React, { useState } from "react";
import { Edit2, Check, X, Camera, User, MapPin, Wallet, Briefcase, Leaf, ChevronRight } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";
import { useProfile } from "@/lib/data/users";
import { profileApi } from "@/features/profile/api/profileApi";
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
  pageTitle: "font-heading text-[22px] font-bold text-[#242424] tracking-tight leading-tight",
  cardHeading: "font-heading text-[20px] font-bold text-slate-900 tracking-tight",
  supportingText: "font-sans text-[14px] text-slate-500 font-medium",
  smallSupporting: "font-sans text-[14px] font-medium text-slate-400",
  profileLabel: "font-sans text-[13px] font-semibold text-slate-500",
  profileValue: "font-sans text-[14px] font-semibold text-slate-900",
  buttonText: "font-sans text-[14px] font-bold",
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
    <div className="relative w-[88px] h-[88px] flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#80638a]/10 blur-md" />
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="#80638a" strokeOpacity="0.15" strokeWidth="5" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke="#80638a" strokeWidth="5" fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-heading text-[20px] font-bold text-slate-900 tracking-tight leading-none">{pct}%</span>
        <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Done</span>
      </div>
    </div>
  );
}

function Avatar({ name, isEditing }: { name: string; isEditing: boolean }) {
  const initials = name.split(/\s+/).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="relative group shrink-0">
      <div className="w-[80px] h-[80px] rounded-2xl bg-gradient-to-br from-[#80638a] to-[#674b72] flex items-center justify-center shadow-[0_8px_24px_rgba(128,99,138,0.35)] border border-[#80638a]/20">
        <span className="font-heading text-[24px] font-bold text-white tracking-tight select-none">{initials}</span>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      {isEditing && (
        <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-[#80638a] transition-colors border-2 border-white">
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function SectionHeading({ icon: Icon, label, iconClass }: { icon: any; label: string; iconClass: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-900/8">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className={classes.cardHeading}>{label}</h3>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", editable = true, options = null }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full group">
      <label className={classes.profileLabel}>{label}</label>
      {editable && onChange ? (
        options ? (
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-white border border-gray-900/10 rounded-xl px-3 py-2.5 ${classes.profileValue} focus:outline-none focus:border-[#80638a]/60 focus:ring-2 focus:ring-[#80638a]/10 transition-all shadow-sm`}
          >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-white border border-gray-900/10 rounded-xl px-3 py-2.5 ${classes.profileValue} focus:outline-none focus:border-[#80638a]/60 focus:ring-2 focus:ring-[#80638a]/10 transition-all shadow-sm`}
          />
        )
      ) : (
        <div className={`w-full bg-white/70 border border-gray-900/8 rounded-xl px-3 py-2.5 ${classes.profileValue} min-h-[42px] flex items-center shadow-sm group-hover:border-[#80638a]/30 transition-colors`}>
          {value || <span className={`${classes.smallSupporting} italic font-normal`}>Not provided</span>}
        </div>
      )}
    </div>
  );
}

export const ProfileView = () => {
  const { data: fetchedProfile, isLoading, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (fetchedProfile) {
      setProfile({
        ...fetchedProfile,
        experience: {
          ...fetchedProfile.experience,
          skills: Array.isArray(fetchedProfile.experience?.skills)
            ? fetchedProfile.experience.skills.join(", ")
            : fetchedProfile.experience?.skills || "",
        },
      });
    }
  }, [fetchedProfile]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#80638a] border-t-transparent rounded-full animate-spin" />
          <p className={classes.supportingText}>Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="max-w-md w-full bg-[#fffff5] rounded-2xl border border-gray-900/10 p-8 shadow-lg text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#80638a]/10 flex items-center justify-center text-[#80638a]">
            <User className="w-8 h-8" />
          </div>
          <h2 className={classes.cardHeading}>No Profile Found</h2>
          <p className={classes.supportingText}>
            You haven't completed your entrepreneur profile yet. Please complete the quick onboarding to set your business preferences and capital.
          </p>
          <a
            href="/onboarding"
            className="mt-2 px-6 py-3 bg-[#80638a] hover:bg-[#6c4f75] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            Complete Onboarding
          </a>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const skillsArray = typeof profile?.experience?.skills === "string"
        ? profile.experience.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(profile?.experience?.skills)
        ? profile.experience.skills
        : [];

      const payload = {
        fullName: profile.fullName || "",
        email: profile.email || undefined,
        phone: profile.phone || undefined,
        location: {
          state: profile.location?.state || "Maharashtra",
          district: profile.location?.district || "Pune",
          block: profile.location?.block || undefined,
          village: profile.location?.village || undefined,
        },
        financial: {
          availableCapital: Number(profile.financial?.availableCapital) || 0,
          income: Number(profile.financial?.income) || 0,
        },
        experience: {
          businessExperience: profile.experience?.businessExperience || "None",
          skills: skillsArray,
          education: profile.experience?.education || undefined,
        },
      };

      await profileApi.updateProfile(payload as any);
      refetch();
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update profile", err);
      setSaveError(err?.message || "Failed to save profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const stateName = profile.location?.state || "Local";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible"
      className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">

      {/* Header Card */}
      <motion.div variants={itemVariants}
        className="relative w-full bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] overflow-hidden mb-6">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#80638a] via-[#a387ad] to-[#c7b0d0]" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#80638a]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#80638a]/6 blur-2xl pointer-events-none" />

        <div className="relative px-6 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <Avatar name={profile.fullName || "User"} isEditing={isEditing} />
            <div>
              <h1 className={classes.pageTitle}>{profile.fullName || "Entrepreneur Profile"}</h1>
              <p className={`${classes.supportingText} mt-1 flex items-center gap-1.5`}>
                <Leaf className="w-3.5 h-3.5 text-[#80638a]" />
                <span>{stateName} Entrepreneur</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <CompletionRing pct={100} />
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div key="editing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                    }}
                    disabled={isSaving}
                    className={`px-4 py-2.5 bg-white border border-gray-900/10 text-slate-700 ${classes.buttonText} rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50`}
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-4 py-2.5 bg-[#80638a] text-white ${classes.buttonText} rounded-xl hover:bg-[#6c4f75] shadow-md shadow-[#80638a]/20 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50`}
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </motion.div>
              ) : (
                <motion.button key="view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2.5 bg-white border border-gray-900/10 text-slate-900 ${classes.buttonText} rounded-xl hover:border-[#80638a]/40 hover:bg-[#80638a]/5 shadow-sm transition-all flex items-center gap-1.5 group`}>
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {saveError && (
          <div className="mx-6 md:mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {saveError}
          </div>
        )}
      </motion.div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(128,99,138,0.14)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-4 transition-shadow">
          <SectionHeading icon={User} label="Personal" iconClass="bg-[#80638a]/10 text-[#80638a]" />
          <InputField label="Full Name" value={profile.fullName} onChange={isEditing ? (v: any) => setProfile({ ...profile, fullName: v }) : null} editable={isEditing} />
          <InputField label="Email Address" type="email" value={profile.email} onChange={isEditing ? (v: any) => setProfile({ ...profile, email: v }) : null} editable={isEditing} />
          <InputField label="Phone Number" type="tel" value={profile.phone} onChange={isEditing ? (v: any) => setProfile({ ...profile, phone: v }) : null} editable={isEditing} />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(128,99,138,0.14)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-4 transition-shadow">
          <SectionHeading icon={MapPin} label="Location" iconClass="bg-orange-50 text-orange-600" />
          {isEditing && <p className="font-sans text-[12px] font-medium text-orange-700 bg-orange-50 border border-orange-200/60 rounded-xl px-3 py-2">{t("profile.locEditWarn")}</p>}
          <InputField label="State" value={profile.location?.state} editable={false} />
          <InputField label="District" value={profile.location?.district} editable={false} />
          <InputField label="Block / Taluka" value={profile.location?.block} editable={false} />
          <InputField label="Village" value={profile.location?.village} editable={false} />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(128,99,138,0.14)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-4 transition-shadow">
          <SectionHeading icon={Wallet} label="Financial" iconClass="bg-blue-50 text-blue-600" />
          <InputField label="Available Capital (Rs)" type="number" value={profile.financial?.availableCapital} onChange={isEditing ? (v: any) => setProfile({ ...profile, financial: { ...profile.financial, availableCapital: Number(v) } }) : null} editable={isEditing} />
          <InputField label="Monthly Income (Rs)" type="number" value={profile.financial?.income} onChange={isEditing ? (v: any) => setProfile({ ...profile, financial: { ...profile.financial, income: Number(v) } }) : null} editable={isEditing} />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(128,99,138,0.14)" }}
          className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col gap-4 transition-shadow">
          <SectionHeading icon={Briefcase} label="Experience" iconClass="bg-purple-50 text-purple-600" />
          <InputField label="Business Experience" options={isEditing ? ["None", "0-2 years", "3-5 years", "5+ years"] : null} value={profile.experience?.businessExperience} onChange={isEditing ? (v: any) => setProfile({ ...profile, experience: { ...profile.experience, businessExperience: v } }) : null} editable={isEditing} />
          <InputField label="Key Skills" value={profile.experience?.skills} onChange={isEditing ? (v: any) => setProfile({ ...profile, experience: { ...profile.experience, skills: v } }) : null} editable={isEditing} />
          <InputField label="Education" value={profile.experience?.education} onChange={isEditing ? (v: any) => setProfile({ ...profile, experience: { ...profile.experience, education: v } }) : null} editable={isEditing} />
        </motion.div>
      </div>

    </motion.div>
  );
};
