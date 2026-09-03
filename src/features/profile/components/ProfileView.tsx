"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, MapPin, Wallet, Briefcase, Edit2, Check, X, ArrowLeft } from "lucide-react";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
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
    // UI-only mock update
    console.log("Mock profile update:", profile);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-secondary">{t("profile.title")}</h2>
            <p className="text-sm text-secondary-muted mt-1">{t("profile.subtitle")}</p>
          </div>
        
        {isEditing ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" /> {t("common.cancel")}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-md transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> {t("common.save")}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" /> {t("common.edit")}
          </button>
        )}
        </div>
      </div>

      <BentoGrid>
        {/* Personal Info */}
        <BentoCard className="col-span-12 md:col-span-6">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <User className="w-5 h-5" />
            <h3 className="font-semibold">{t("profile.personalInfo")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("auth.fullName")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => setProfile((p: any) => ({ ...p, fullName: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">{profile.fullName}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("auth.email")}</p>
              {isEditing ? (
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile((p: any) => ({ ...p, email: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">{profile.email || t("common.notProvided")}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.phone")}</p>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile((p: any) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">{profile.phone || t("common.notProvided")}</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Location */}
        <BentoCard className="col-span-12 md:col-span-6">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <MapPin className="w-5 h-5" />
            <h3 className="font-semibold">{t("profile.location")}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.state")}</p>
              <p className="font-medium text-secondary">{profile.location.state}</p>
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.district")}</p>
              <p className="font-medium text-secondary">{profile.location.district}</p>
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.block")}</p>
              <p className="font-medium text-secondary">{profile.location.block}</p>
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.village")}</p>
              <p className="font-medium text-secondary">{profile.location.village}</p>
            </div>
          </div>
          {isEditing && (
            <p className="text-xs text-orange-600 mt-4 bg-orange-50 p-2 rounded border border-orange-100">
              {t("profile.locEditWarn")}
            </p>
          )}
        </BentoCard>

        {/* Financial Context */}
        <BentoCard className="col-span-12 md:col-span-6">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <Wallet className="w-5 h-5" />
            <h3 className="font-semibold">{t("profile.financial")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.availCapital")}</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={profile.financial.availableCapital}
                  onChange={(e) => setProfile((p: any) => ({ ...p, financial: { ...p.financial, availableCapital: Number(e.target.value) } }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">₹{profile.financial.availableCapital.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.monthlyIncome")}</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={profile.financial.income}
                  onChange={(e) => setProfile((p: any) => ({ ...p, financial: { ...p.financial, income: Number(e.target.value) } }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">₹{profile.financial.income.toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Experience & Skills */}
        <BentoCard className="col-span-12 md:col-span-6">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-semibold">{t("profile.experience")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.bizExp")}</p>
              {isEditing ? (
                <select 
                  value={profile.experience.businessExperience}
                  onChange={(e) => setProfile((p: any) => ({ ...p, experience: { ...p.experience, businessExperience: e.target.value } }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                >
                  <option value="None">None</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              ) : (
                <p className="font-medium text-secondary">{profile.experience.businessExperience}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.skills")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.experience.skills}
                  onChange={(e) => setProfile((p: any) => ({ ...p, experience: { ...p.experience, skills: e.target.value } }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">{profile.experience.skills || t("profile.noneSpecified")}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("profile.education")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.experience.education}
                  onChange={(e) => setProfile((p: any) => ({ ...p, experience: { ...p.experience, education: e.target.value } }))}
                  className="w-full border border-slate-300 rounded p-1.5 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-medium text-secondary">{profile.experience.education || t("profile.noneSpecified")}</p>
              )}
            </div>
          </div>
        </BentoCard>

      </BentoGrid>
      <div className="flex justify-end mt-2">
        <MockDisclaimer text="Currently showing mock data • User profile integration pending" />
      </div>
    </div>
  );
};
