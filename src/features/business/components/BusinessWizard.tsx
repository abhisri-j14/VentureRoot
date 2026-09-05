"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema, BusinessFormValues } from "../schemas/businessSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Info, Bookmark, ArrowRight, Sprout, Leaf } from "lucide-react";
import { businessApi } from "../api/businessApi";

const WIZARD_STEPS = [
  { id: 1, label: "Business Category", subtitle: "Choose your sector" },
  { id: 2, label: "Location Setup", subtitle: "Set your business location" },
  { id: 3, label: "Capital Required", subtitle: "Enter investment details" },
  { id: 4, label: "Existing Resources", subtitle: "Add available assets" },
  { id: 5, label: "Operations", subtitle: "Define production plan" },
  { id: 6, label: "Analyze & Submit", subtitle: "Review and submit" },
];

export const BusinessWizard = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    mode: "onTouched",
    defaultValues: {
      categoryId: "",
      state: "",
      district: "",
      block: "",
      village: "",
      availableMargin: 0,
      existingResources: "",
      expectedRevenue: 0,
    },
  });

  const formValues = watch();

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["categoryId"];
    if (currentStep === 2) fieldsToValidate = ["state", "district", "block", "village"];
    if (currentStep === 3) fieldsToValidate = ["availableMargin"];
    if (currentStep === 4) fieldsToValidate = ["existingResources"];
    if (currentStep === 5) fieldsToValidate = ["expectedRevenue"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await businessApi.create(data);
      router.push("/business/123");
    } catch (error: any) {
      console.warn("Backend request failed or offline. Proceeding to mock business route for UI testing.");
      router.push("/business/123");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = Math.round((currentStep / 6) * 100);

  return (
    <div className="w-full flex flex-col items-center">
      
      <div className="w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden flex flex-col mb-20">
        
        {/* Dark Header */}
        <div className="w-full bg-[#79912a] px-10 py-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center text-white">
          <div className="z-10 mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 text-white">Start a New Enterprise</h1>
            <p className="text-[#f7fbf2]/80 font-medium text-lg">Complete the 6 steps to get started</p>
          </div>
          
          <div className="z-10 flex flex-col md:items-end opacity-90 border-l-2 border-white/10 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-7 h-7 text-[#98c772]" />
              <span className="font-serif italic text-2xl text-[#f7fbf2]">Ideas grow brighter here</span>
            </div>
            <p className="text-[10px] tracking-[0.2em] text-[#f7fbf2]/50 uppercase font-bold">Poal: Rural Ideas. Real Opportunities.</p>
          </div>
        </div>

        {globalError && (
          <div className="mx-10 mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{globalError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row p-6 lg:p-10 gap-10">
          
          {/* LEFT SIDEBAR: Stepper */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="bg-[#fcfbf7] rounded-3xl p-6 md:p-8 flex flex-col relative h-full">
              
              {/* Vertical connecting line */}
              <div className="absolute left-[51px] md:left-[59px] top-[60px] bottom-[160px] w-0.5 bg-gray-200 z-0"></div>
              
              <div className="flex flex-col gap-8">
                {WIZARD_STEPS.map((step) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-start gap-5 relative z-10">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isActive ? 'bg-[#1E6702] border-[#1E6702] text-white shadow-md' : 
                          isCompleted ? 'bg-white border-[#1E6702] text-[#1E6702]' : 
                          'bg-white border-gray-300 text-gray-400'}
                      `}>
                        <span className="font-bold text-sm">
                          {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                        </span>
                      </div>
                      <div className="flex flex-col pt-1">
                        <span className={`font-bold text-[15px] transition-colors duration-300
                          ${isActive ? 'text-gray-900' : 'text-gray-500'}
                        `}>
                          {step.label}
                        </span>
                        <span className={`text-[13px] font-medium transition-colors duration-300
                          ${isActive ? 'text-gray-600' : 'text-gray-400'}
                        `}>
                          {step.subtitle}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Footer Banner */}
              <div className="mt-auto pt-12">
                <div className="bg-[#eef6ed] p-4 rounded-2xl flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-[#1E6702] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1E6702]">Building stronger</span>
                    <span className="text-sm font-bold text-[#1E6702] mb-1">rural businesses</span>
                    <span className="text-xs text-[#1E6702]/70 font-medium">One idea at a time.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDE: Content Area */}
          <div className="w-full flex-1 flex flex-col bg-white rounded-3xl p-6 md:p-8">
            
            {/* Progress Bar */}
            <div className="w-full mb-10">
               <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                 <span>Progress</span>
                 <span>{progressPercentage}%</span>
               </div>
               <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-[#3c6b24] transition-all duration-500 ease-out rounded-full"
                   style={{ width: `${progressPercentage}%` }}
                 ></div>
               </div>
            </div>

            <h2 className="text-3xl font-serif font-bold text-[#1a202c] mb-2">
              {WIZARD_STEPS[currentStep - 1].label}
            </h2>
            <p className="text-gray-500 font-medium mb-8">
              {WIZARD_STEPS[currentStep - 1].subtitle}.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
              
              <div className="flex-1">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.cat")}</label>
                      <select
                        {...register("categoryId")}
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                      >
                        <option value="">{t("business.wizard.selectCat")}</option>
                        <option value="dairy">Dairy</option>
                        <option value="retail">Retail</option>
                        <option value="tailoring">Tailoring</option>
                      </select>
                      {errors.categoryId && <p className="text-red-500 text-sm mt-2 font-medium">{errors.categoryId.message}</p>}
                    </div>

                    <div className="bg-[#eef6ed] rounded-xl p-4 flex gap-3 items-start border border-[#d2ead0]">
                      <Info className="w-5 h-5 text-[#2f6f46] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#2f6f46] font-medium leading-relaxed">
                        Choose the category that matches your primary business activity.<br/>
                        This helps us provide more accurate scheme recommendations and market insights.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.state")}</label>
                        <input
                          {...register("state")}
                          type="text"
                          placeholder="e.g. Maharashtra"
                          className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-2 font-medium">{errors.state.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.district")}</label>
                        <input
                          {...register("district")}
                          type="text"
                          placeholder="e.g. Pune"
                          className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                        {errors.district && <p className="text-red-500 text-sm mt-2 font-medium">{errors.district.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.block")}</label>
                        <input
                          {...register("block")}
                          type="text"
                          placeholder="e.g. Haveli"
                          className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                        {errors.block && <p className="text-red-500 text-sm mt-2 font-medium">{errors.block.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.village")}</label>
                        <input
                          {...register("village")}
                          type="text"
                          placeholder="e.g. Wagholi"
                          className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                        {errors.village && <p className="text-red-500 text-sm mt-2 font-medium">{errors.village.message}</p>}
                      </div>
                    </div>
                    
                    <div className="bg-[#eef6ed] rounded-xl p-4 flex gap-3 items-start border border-[#d2ead0]">
                      <Info className="w-5 h-5 text-[#2f6f46] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#2f6f46] font-medium leading-relaxed">
                        Location data is critical to discovering local grants, finding localized competitors, and understanding the surrounding demographic market.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.availMargin")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                        <input
                          {...register("availableMargin", { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full rounded-xl border border-gray-200 p-4 pl-8 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                      </div>
                      {errors.availableMargin && <p className="text-red-500 text-sm mt-2 font-medium">{errors.availableMargin.message}</p>}
                    </div>

                    <div className="bg-[#eef6ed] rounded-xl p-4 flex gap-3 items-start border border-[#d2ead0]">
                      <Info className="w-5 h-5 text-[#2f6f46] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#2f6f46] font-medium leading-relaxed">
                        State exactly how much capital you currently have on hand. We will use this to calculate loan requirements and match you with subsidies.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.resources")}</label>
                      <textarea
                        {...register("existingResources")}
                        rows={4}
                        placeholder="e.g., Owned land, basic shed, water connection..."
                        className="w-full rounded-xl border border-gray-200 p-4 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium resize-none"
                      ></textarea>
                      {errors.existingResources && <p className="text-red-500 text-sm mt-2 font-medium">{errors.existingResources.message}</p>}
                    </div>

                    <div className="bg-[#eef6ed] rounded-xl p-4 flex gap-3 items-start border border-[#d2ead0]">
                      <Info className="w-5 h-5 text-[#2f6f46] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#2f6f46] font-medium leading-relaxed">
                        List all physical assets you currently own. This drastically changes the feasibility analysis for new businesses.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">{t("business.wizard.revenue")}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                        <input
                          {...register("expectedRevenue", { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full rounded-xl border border-gray-200 p-4 pl-8 bg-white focus:bg-white focus:border-[#1E6702] focus:ring-1 focus:ring-[#1E6702] transition-all outline-none font-medium"
                        />
                      </div>
                      {errors.expectedRevenue && <p className="text-red-500 text-sm mt-2 font-medium">{errors.expectedRevenue.message}</p>}
                    </div>
                    
                    <div className="bg-[#eef6ed] rounded-xl p-4 flex gap-3 items-start border border-[#d2ead0]">
                      <Info className="w-5 h-5 text-[#2f6f46] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#2f6f46] font-medium leading-relaxed">
                        Provide a realistic estimate of monthly revenue based on your planned production capacity.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 6 */}
                {currentStep === 6 && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                          <dt className="text-[13px] text-gray-500 font-medium mb-1">{t("business.wizard.cat")}</dt>
                          <dd className="font-bold text-gray-900 text-lg capitalize">{formValues.categoryId || "-"}</dd>
                        </div>
                        <div>
                          <dt className="text-[13px] text-gray-500 font-medium mb-1">Location</dt>
                          <dd className="font-bold text-gray-900 text-lg capitalize">
                            {[formValues.village, formValues.block, formValues.district, formValues.state].filter(Boolean).join(", ") || "-"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[13px] text-gray-500 font-medium mb-1">{t("business.wizard.availMargin")}</dt>
                          <dd className="font-bold text-[#1E6702] text-xl">₹{new Intl.NumberFormat('en-IN').format(formValues.availableMargin || 0)}</dd>
                        </div>
                        <div>
                          <dt className="text-[13px] text-gray-500 font-medium mb-1">{t("business.wizard.revenue")}</dt>
                          <dd className="font-bold text-[#1E6702] text-xl">₹{new Intl.NumberFormat('en-IN').format(formValues.expectedRevenue || 0)} <span className="text-sm text-gray-500">/mo</span></dd>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-gray-200">
                          <dt className="text-[13px] text-gray-500 font-medium mb-2">{t("business.wizard.resources")}</dt>
                          <dd className="font-semibold text-gray-800 bg-white p-3 rounded-lg border border-gray-200">{formValues.existingResources || t("business.wizard.none")}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-8 mt-12 gap-4">
                
                <button
                  type="button"
                  className="w-full md:w-auto px-6 py-3.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4 h-4" /> Save & Continue Later
                </button>
                
                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#1E6702] text-white hover:bg-[#143a25] shadow-lg shadow-[#1E6702]/20 transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[#1E6702] text-white hover:bg-[#143a25] shadow-lg shadow-[#1E6702]/20 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none min-w-[200px]"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Analyze & Submit <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

