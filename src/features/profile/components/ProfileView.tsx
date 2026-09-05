"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit2, Check, ArrowLeft, Camera, User, MapPin, Wallet, Briefcase } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

import { useProfile } from "@/lib/data/users";

export const ProfileView = () => {
  const { data: fetchedProfile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(fetchedProfile);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    }
  }, [fetchedProfile]);

  if (!profile) return null;

  const handleSave = () => {
    console.log("Mock profile update:", profile);
    setIsEditing(false);
  };

  const getInitials = (name: string) =>
    name
      .split(/\s+/)
      .map((word) => word.slice(0, 1))
      .join('');

  const InputField = ({ label, value, onChange, type = "text", editable = true, options = null }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[13px] md:text-[14px] font-black uppercase tracking-widest text-emerald-950 pl-1 drop-shadow-sm">
        {label}
      </label>

      {isEditing && editable ? (
        options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3 text-[14px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500/50 focus:bg-white/60 transition-all shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]"
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3 text-[14px] font-bold text-slate-900 focus:outline-none focus:border-emerald-500/50 focus:bg-white/60 transition-all shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]"
          />
        )
      ) : (
        <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-xl p-3 text-[14px] font-bold text-slate-900 flex items-center min-h-[48px] shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
          {value || <span className="text-slate-500/70 italic font-medium">Not provided</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full min-h-screen px-6 md:px-12 lg:px-20 pb-24 relative">

      {/* Top Banner Image Area */}
      <div className="w-full h-[180px] md:h-[240px] bg-[url('/images/profile-banner-highres.jpg')] bg-cover bg-center bg-no-repeat rounded-2xl relative mt-4 shadow-lg border border-white/40 mb-4">

        {/* Elegant floating Back button */}
        <div className="absolute top-4 left-4 z-10 bg-white/40 backdrop-blur-xl border border-white/60 p-1.5 pr-4 rounded-full inline-flex shadow-[0_4px_16px_0_rgba(31,38,135,0.05)]">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-wide text-emerald-950 hover:text-emerald-700 transition-colors">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </div>
            BACK TO DASHBOARD
          </Link>
        </div>
      </div>

      {/* Avatar & Title (BELOW the banner, no overlap) */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between w-full mb-16 gap-6 px-2">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/40 backdrop-blur-xl p-1.5 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/60">
              <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-4xl md:text-5xl font-heading font-black border border-emerald-200/50 overflow-hidden">
                {getInitials(profile.fullName)}
              </div>
            </div>
            {isEditing && (
              <button className="absolute bottom-1 right-1 p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg border-[3px] border-emerald-50">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="pb-2">
            <h1 className="text-3xl md:text-4xl font-heading font-black text-emerald-950 tracking-tight drop-shadow-sm">{profile.fullName}</h1>
            <p className="text-sm md:text-base font-bold text-emerald-800/80 mt-1 uppercase tracking-widest">{profile.location.state} Entrepreneur</p>
          </div>
        </div>

        {/* Right Side Actions & Ring */}
        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* Actions */}
          <div className="order-2 md:order-1">
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={() => setIsEditing(false)} className="px-5 py-3 bg-white/40 backdrop-blur-xl border border-white/60 font-bold text-slate-800 rounded-xl hover:bg-white/60 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] transition-all">Cancel</button>
                <button onClick={handleSave} className="px-5 py-3 bg-[#1E6702] hover:bg-[#2b8a03] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-5 py-3 bg-white/40 backdrop-blur-xl border border-white/60 font-bold text-emerald-950 rounded-xl hover:bg-white/60 shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] flex items-center gap-2 transition-all">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* 75% Completion Ring */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/40 backdrop-blur-xl rounded-full shadow-[0_4px_16px_0_rgba(31,38,135,0.05)] border border-white/60 order-1 md:order-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="38%" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" />
              <circle
                cx="50%" cy="50%" r="38%"
                stroke="#1E6702" strokeWidth="4" fill="none"
                strokeDasharray="240"
                strokeDashoffset={240 - (0.75 * 240)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center mt-0.5">
              <span className="text-[13px] md:text-[14px] font-black text-[#1E6702] leading-none">75%</span>
              <span className="text-[6px] font-bold uppercase tracking-[0.2em] text-[#1E6702]/60 mt-0.5">Done</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Layout - DIRECTLY ON CANVAS utilizing entire screen width */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 lg:gap-x-12 xl:gap-x-16 gap-y-12">

        {/* Personal Details Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-1 border-b border-[#1E6702]/10 pb-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100/80 backdrop-blur-sm flex items-center justify-center text-emerald-800 shadow-sm border border-emerald-200/50">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">Personal</h3>
          </div>

          <InputField label="Full Name" value={profile.fullName} onChange={(v: any) => setProfile({ ...profile, fullName: v })} />
          <InputField label="Email Address" type="email" value={profile.email} onChange={(v: any) => setProfile({ ...profile, email: v })} />
          <InputField label="Phone Number" type="tel" value={profile.phone} onChange={(v: any) => setProfile({ ...profile, phone: v })} />
        </div>

        {/* Location Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-1 border-b border-[#1E6702]/10 pb-3">
            <div className="w-9 h-9 rounded-full bg-orange-100/80 backdrop-blur-sm flex items-center justify-center text-orange-700 shadow-sm border border-orange-200/50">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">Location</h3>
          </div>

          {isEditing && (
            <p className="text-[12px] font-bold text-orange-900 bg-orange-100/80 backdrop-blur-sm p-3 rounded-xl border border-orange-200/60 shadow-sm">
              {t("profile.locEditWarn")}
            </p>
          )}
          <InputField label="State" value={profile.location.state} editable={false} />
          <InputField label="District" value={profile.location.district} editable={false} />
          <InputField label="Block / Taluka" value={profile.location.block} editable={false} />
          <InputField label="Village" value={profile.location.village} editable={false} />
        </div>

        {/* Financial Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-1 border-b border-[#1E6702]/10 pb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100/80 backdrop-blur-sm flex items-center justify-center text-blue-700 shadow-sm border border-blue-200/50">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">Financials</h3>
          </div>

          <InputField label="Available Capital (₹)" type="number" value={profile.financial.availableCapital} onChange={(v: any) => setProfile({ ...profile, financial: { ...profile.financial, availableCapital: Number(v) } })} />
          <InputField label="Monthly Income (₹)" type="number" value={profile.financial.income} onChange={(v: any) => setProfile({ ...profile, financial: { ...profile.financial, income: Number(v) } })} />
        </div>

        {/* Experience Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-1 border-b border-[#1E6702]/10 pb-3">
            <div className="w-9 h-9 rounded-full bg-purple-100/80 backdrop-blur-sm flex items-center justify-center text-purple-700 shadow-sm border border-purple-200/50">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-emerald-950 tracking-tight">Experience</h3>
          </div>

          <InputField label="Business Experience" options={["None", "0-2 years", "3-5 years", "5+ years"]} value={profile.experience.businessExperience} onChange={(v: any) => setProfile({ ...profile, experience: { ...profile.experience, businessExperience: v } })} />
          <InputField label="Key Skills" value={profile.experience.skills} onChange={(v: any) => setProfile({ ...profile, experience: { ...profile.experience, skills: v } })} />
          <InputField label="Education" value={profile.experience.education} onChange={(v: any) => setProfile({ ...profile, experience: { ...profile.experience, education: v } })} />
        </div>

      </div>

      <div className="mt-16 flex justify-center">
        <MockDisclaimer text="Currently showing mock data • User profile integration pending" />
      </div>

    </div>
  );
};
