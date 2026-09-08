"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileData } from "../schemas/profileSchema";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, Search, MapPin } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { motion } from "framer-motion";
import { profileApi } from "../api/profileApi";

import { getLocationHierarchy, useLocationSearch } from "@/lib/data/locations";

// Minimal Mock Data for UI interaction
const MOCK_LOCATION_DATA = getLocationHierarchy();

export const OnboardingFlow = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  
  // Location Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search Results for autocomplete
  const { data: MOCK_SEARCH_RESULTS } = useLocationSearch(searchTerm);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      experience: {
        businessExperience: "None",
      },
      financial: {
        availableCapital: 0,
        income: 0,
      }
    },
  });

  const handleSelectSearchResult = (result: typeof MOCK_SEARCH_RESULTS[0]) => {
    setValue("location.state", result.data.state, { shouldValidate: true });
    setValue("location.district", result.data.district, { shouldValidate: true });
    setValue("location.block", result.data.block, { shouldValidate: true });
    setValue("location.village", result.data.village, { shouldValidate: true });
    setSearchTerm(result.label);
    setShowSearchResults(false);
  };

  const validateStepAndProceed = async () => {
    let isValid = false;
    
    if (currentStep === 1) isValid = await trigger(["fullName", "email", "phone"]);
    if (currentStep === 2) isValid = await trigger(["location.state", "location.district", "location.block", "location.village"]);
    if (currentStep === 3) isValid = await trigger(["financial.availableCapital", "financial.income"]);
    if (currentStep === 4) isValid = await trigger(["experience.businessExperience", "experience.skills", "experience.education"]);

    if (isValid) setCurrentStep((p) => p + 1);
  };

  const onSubmit = async (data: ProfileData) => {
    setIsSubmitting(true);
    try {
      const formattedSkills = typeof data.experience?.skills === "string"
        ? (data.experience.skills as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(data.experience?.skills)
        ? data.experience.skills
        : [];

      const payload: any = {
        fullName: data.fullName,
        phone: data.phone?.trim() ? data.phone.trim() : undefined,
        location: {
          state: data.location.state,
          district: data.location.district,
          block: data.location.block?.trim() ? data.location.block.trim() : undefined,
          village: data.location.village?.trim() ? data.location.village.trim() : undefined,
        },
        financial: {
          availableCapital: Number(data.financial.availableCapital) || 0,
          income: Number(data.financial.income) || 0,
        },
        experience: {
          businessExperience: data.experience.businessExperience,
          skills: formattedSkills,
          education: data.experience.education?.trim() ? data.experience.education.trim() : undefined,
        },
      };

      await profileApi.updateProfile(payload);
      setIsSubmitting(false);
      router.push("/dashboard");
    } catch (error: any) {
      console.warn("Backend request failed or offline. Proceeding to dashboard for UI testing.");
      setIsSubmitting(false);
      router.push("/dashboard");
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-10 w-full px-2">
      {[1, 2, 3, 4, 5].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
              currentStep > step
                ? "bg-[#1E6702] text-white"
                : currentStep === step
                ? "bg-[#1E6702] text-white shadow-[0_0_0_4px_rgba(30,103,2,0.1)]"
                : "bg-black/5 text-black/30"
            }`}
          >
            {currentStep > step ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
          </div>
          {step < 5 && (
            <div
              className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${
                currentStep > step ? "bg-[#1E6702]" : "bg-black/5"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[540px] mx-auto bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(32,8,19,0.1),0_0_40px_rgba(32,8,19,0.03)] border border-black/[0.04] p-8 md:p-12 relative z-10"
    >
      <div className="text-center mb-10">
        <h2 className="font-heading text-[24px] font-medium text-[#200813] tracking-tight">{t("onboarding.title")}</h2>
        <p className="font-sans text-[14px] text-[#200813]/60 mt-3">
          {t("onboarding.subtitle")}
        </p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Basic Profile */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-heading text-[18px] font-semibold text-[#200813] border-b border-black/5 pb-3">{t("onboarding.basicInfo")}</h3>
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("auth.fullName")} <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register("fullName")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder="Ravi Kumar"
              />
              {errors.fullName && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("auth.email")}</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder={`ravi@example.com ${t("onboarding.optional")}`}
              />
              {errors.email && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("onboarding.mobile")}</label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder={`+91 9876543210 ${t("onboarding.optional")}`}
              />
              {errors.phone && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.phone.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-heading text-[18px] font-semibold text-[#200813] border-b border-black/5 pb-3">{t("onboarding.baseLoc")}</h3>
            <div className="p-3.5 bg-green-50/50 border border-green-100 rounded-xl font-sans text-[14px] text-[#1E6702]/80 mb-2 font-medium">
              {t("onboarding.locSearchDesc")}
            </div>

            <div className="relative z-10">
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("onboarding.searchLoc")}</label>
              <div className="flex items-center border border-black/5 rounded-xl p-3.5 bg-gray-50/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E6702]/10 focus-within:border-[#1E6702] transition-all shadow-sm">
                <Search className="w-4 h-4 text-[#200813]/40 mr-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(e.target.value.length > 1);
                  }}
                  onFocus={() => {
                    if (searchTerm.length > 1) setShowSearchResults(true);
                  }}
                  placeholder={t("onboarding.searchPlaceholder") as string}
                  className="w-full outline-none font-sans text-[14px] text-[#200813] bg-transparent font-medium"
                />
              </div>
              
              {showSearchResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/5 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-20">
                  <div className="p-3 font-sans text-[11px] uppercase tracking-wider font-semibold text-[#200813]/40 bg-gray-50 border-b border-black/5">
                    Mock API: /locations/search?q={searchTerm}
                  </div>
                  {MOCK_SEARCH_RESULTS.filter(r => r.label.toLowerCase().includes(searchTerm.toLowerCase())).map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-4 py-3 font-sans text-[14px] hover:bg-gray-50/80 border-b border-black/5 last:border-0 flex items-center gap-3 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-[#1E6702]/60 shrink-0" />
                      <span className="truncate font-medium text-[#200813]/80">{result.label}</span>
                    </button>
                  ))}
                  {MOCK_SEARCH_RESULTS.filter(r => r.label.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="px-4 py-4 font-sans text-[14px] text-[#200813]/50 text-center">{t("onboarding.noLocs")}</div>
                  )}
                </div>
              )}
            </div>

            <div className="relative mt-2 mb-1">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-black/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white font-sans text-[10px] text-[#200813]/40 uppercase tracking-widest font-semibold">{t("onboarding.enterManual")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("business.state")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register("location.state")}
                  className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                  placeholder="e.g. Maharashtra"
                />
                {errors.location?.state && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.location.state.message}</p>}
              </div>

              <div>
                <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("business.district")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register("location.district")}
                  className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                  placeholder="e.g. Pune"
                />
                {errors.location?.district && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.location.district.message}</p>}
              </div>

              <div>
                <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("business.block")}</label>
                <input
                  type="text"
                  {...register("location.block")}
                  className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                  placeholder={t("onboarding.optional") as string}
                />
              </div>

              <div>
                <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("business.village")}</label>
                <input
                  type="text"
                  {...register("location.village")}
                  className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                  placeholder={t("onboarding.optional") as string}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Financial Background */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-heading text-[18px] font-semibold text-[#200813] border-b border-black/5 pb-3">{t("onboarding.finContext")}</h3>
            <p className="font-sans text-[14px] text-[#200813]/60 -mt-2 leading-relaxed">{t("onboarding.finDesc")}</p>
            
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("profile.availCapital")}</label>
              <input
                type="number"
                {...register("financial.availableCapital", { valueAsNumber: true })}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder="e.g. 50000"
              />
              {errors.financial?.availableCapital && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.financial.availableCapital.message}</p>}
            </div>
            
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("profile.monthlyIncome")}</label>
              <input
                type="number"
                {...register("financial.income", { valueAsNumber: true })}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder="e.g. 15000"
              />
              {errors.financial?.income && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.financial.income.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 4: Experience & Background */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-heading text-[18px] font-semibold text-[#200813] border-b border-black/5 pb-3">{t("onboarding.expSkills")}</h3>
            
            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("profile.bizExp")}</label>
              <select
                {...register("experience.businessExperience")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm appearance-none"
              >
                <option value="None">None</option>
                <option value="0-2 years">0-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
              {errors.experience?.businessExperience && <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.experience.businessExperience.message}</p>}
            </div>

            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("profile.skills")} {t("onboarding.optional")}</label>
              <input
                type="text"
                {...register("experience.skills")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder="e.g. Agriculture, Carpentry, Sales"
              />
              {errors.experience?.skills && (
                <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.experience.skills.message}</p>
              )}
            </div>

            <div>
              <label className="block font-sans text-[14px] font-medium text-[#200813]/80 mb-1.5">{t("profile.education")} {t("onboarding.optional")}</label>
              <input
                type="text"
                {...register("experience.education")}
                className="w-full rounded-xl bg-gray-50/50 border border-black/5 p-3.5 font-sans text-[14px] transition-all outline-none focus:ring-4 focus:ring-[#1E6702]/10 focus:border-[#1E6702] focus:bg-white text-[#200813] font-medium shadow-sm"
                placeholder="e.g. 10th Pass, BA, Diploma"
              />
              {errors.experience?.education && (
                <p className="text-red-500 font-sans text-[12px] mt-1.5 font-medium">{errors.experience.education.message}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: Review */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="font-heading text-[18px] font-semibold text-[#200813] border-b border-black/5 pb-3">{t("onboarding.reviewTitle")}</h3>
            
            <div className="bg-gray-50/80 rounded-2xl p-6 border border-black/5 font-sans text-[14px] shadow-inner">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                <div>
                  <p className="text-[#200813]/50 font-medium mb-1">{t("auth.fullName")}</p>
                  <p className="text-[#200813] font-semibold">{watch("fullName")}</p>
                </div>
                <div>
                  <p className="text-[#200813]/50 font-medium mb-1">{t("profile.location")}</p>
                  <p className="text-[#200813] font-semibold">{watch("location.village")}, {watch("location.district")}</p>
                </div>
                <div>
                  <p className="text-[#200813]/50 font-medium mb-1">{t("profile.availCapital")}</p>
                  <p className="text-[#200813] font-semibold">₹{watch("financial.availableCapital")}</p>
                </div>
                <div>
                  <p className="text-[#200813]/50 font-medium mb-1">{t("profile.bizExp")}</p>
                  <p className="text-[#200813] font-semibold">{watch("experience.businessExperience")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex items-center justify-between border-t border-black/5 pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-1.5 px-2 py-2 font-sans text-[14px] font-medium text-[#200813]/40 hover:text-[#200813]/80 disabled:opacity-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> {t("common.back")}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={validateStepAndProceed}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E6702] text-white font-sans text-[14px] font-semibold rounded-xl hover:bg-[#154a01] transition-all shadow-[0_4px_14px_rgba(30,103,2,0.25)]"
            >
              {t("common.continue")} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#1E6702] text-white font-sans text-[14px] font-semibold rounded-xl hover:bg-[#154a01] transition-all shadow-[0_4px_14px_rgba(30,103,2,0.25)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : t("onboarding.complete")} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
};
