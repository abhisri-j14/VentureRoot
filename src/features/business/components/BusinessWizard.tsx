"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessFormSchema, BusinessFormValues } from "../schemas/businessSchema";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { businessApi } from "../api/businessApi";

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

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSubmitting(true);
    setGlobalError(null);
    try {
      await businessApi.create(data);
      // TODO: BACKEND CONFIRMATION REQUIRED
      // We cannot extract the real business ID from the response yet because CreateBusinessResponse is unknown.
      // We must temporarily fall back to the mock route to keep UI navigation working, but the actual POST request is firing!
      router.push("/business/123");
    } catch (error: any) {
      console.warn("Backend request failed or offline. Proceeding to mock business route for UI testing.");
      router.push("/business/123");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-xl font-heading font-semibold text-secondary">
          {t("business.wizard.title")}
        </h2>
        <span className="text-sm font-medium text-secondary-muted bg-slate-100 px-3 py-1 rounded-full">
          {t("business.wizard.step")?.replace("{current}", currentStep.toString()).replace("{total}", "6")}
        </span>
      </div>

      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q1")}</h3>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.cat")}</label>
              <select
                {...register("categoryId")}
                className="w-full rounded-md border border-slate-300 p-2 mt-1 bg-white"
              >
                <option value="">{t("business.wizard.selectCat")}</option>
                <option value="dairy">Dairy</option>
                <option value="retail">Retail</option>
                <option value="tailoring">Tailoring</option>
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q2")}</h3>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.state")}</label>
              <input
                {...register("state")}
                type="text"
                placeholder="e.g. Maharashtra"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.district")}</label>
              <input
                {...register("district")}
                type="text"
                placeholder="e.g. Pune"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.block")}</label>
              <input
                {...register("block")}
                type="text"
                placeholder="e.g. Haveli"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.block && <p className="text-red-500 text-sm mt-1">{errors.block.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.village")}</label>
              <input
                {...register("village")}
                type="text"
                placeholder="e.g. Wagholi"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q3")}</h3>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.availMargin")}</label>
              <input
                {...register("availableMargin", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.availableMargin && <p className="text-red-500 text-sm mt-1">{errors.availableMargin.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q4")}</h3>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.resources")}</label>
              <textarea
                {...register("existingResources")}
                rows={4}
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              ></textarea>
              {errors.existingResources && <p className="text-red-500 text-sm mt-1">{errors.existingResources.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q5")}</h3>
            <div>
              <label className="block text-sm font-medium text-secondary-muted">{t("business.wizard.revenue")}</label>
              <input
                {...register("expectedRevenue", { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full rounded-md border border-slate-300 p-2 mt-1"
              />
              {errors.expectedRevenue && <p className="text-red-500 text-sm mt-1">{errors.expectedRevenue.message}</p>}
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-secondary">{t("business.wizard.q6")}</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-secondary-muted font-medium">{t("business.wizard.cat")}</dt>
                  <dd className="font-semibold text-secondary">{formValues.categoryId || "-"}</dd>
                </div>
                <div>
                  <dt className="text-secondary-muted font-medium">Location</dt>
                  <dd className="font-semibold text-secondary">
                    {[formValues.village, formValues.block, formValues.district, formValues.state].filter(Boolean).join(", ") || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-secondary-muted font-medium">{t("business.wizard.availMargin")}</dt>
                  <dd className="font-semibold text-secondary">₹{formValues.availableMargin}</dd>
                </div>
                <div>
                  <dt className="text-secondary-muted font-medium">{t("business.wizard.revenue")}</dt>
                  <dd className="font-semibold text-secondary">₹{formValues.expectedRevenue}/month</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-secondary-muted font-medium">{t("business.wizard.resources")}</dt>
                  <dd className="font-semibold text-secondary">{formValues.existingResources || t("business.wizard.none")}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 rounded-lg border border-slate-300 text-secondary hover:bg-slate-50 transition-colors font-medium"
            >
              {t("business.wizard.back")}
            </button>
          ) : (
            <div></div> // Placeholder to keep Next button on the right
          )}
          
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors font-medium"
            >
              {t("business.wizard.next")}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors font-medium disabled:opacity-70 flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t("business.wizard.analyze")
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
