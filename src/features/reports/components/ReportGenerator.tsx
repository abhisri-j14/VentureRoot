"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Circle, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MOCK_GENERATION_STAGES } from "../constants/mockData";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

interface ReportGeneratorProps {
  onCancel: () => void;
  onComplete: () => void;
}

export const ReportGenerator = ({ onCancel, onComplete }: ReportGeneratorProps) => {
  const { t } = useTranslation();
  const [stages, setStages] = useState(MOCK_GENERATION_STAGES);
  const [isFailed, setIsFailed] = useState(false);
  
  useEffect(() => {
    let currentStage = 0;
    
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        // Simulate a tiny delay before complete
        setTimeout(() => {
          onComplete();
        }, 800);
        return;
      }
      
      setStages(prev => prev.map((stage, idx) => {
        if (idx < currentStage) return { ...stage, status: "COMPLETED" };
        if (idx === currentStage) return { ...stage, status: "IN_PROGRESS" };
        return stage;
      }));
      
      currentStage++;
    }, 1500); // simulated processing time per stage
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-heading font-bold text-secondary mb-2">
          {t("reports.generating.title") || "Generating Report"}
        </h2>
        <div className="flex justify-center w-full">
          <MockDisclaimer text="Currently showing mock data • Report generation API integration pending" />
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {stages.map((stage) => {
          const isCompleted = stage.status === "COMPLETED";
          const isInProgress = stage.status === "IN_PROGRESS";
          const isPending = stage.status === "PENDING";
          const isError = stage.status === "ERROR";

          return (
            <div 
              key={stage.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                isCompleted ? "bg-green-50 border-green-100" :
                isInProgress ? "bg-blue-50 border-blue-200 shadow-sm" :
                isError ? "bg-red-50 border-red-100" :
                "bg-slate-50 border-slate-100 opacity-60"
              }`}
            >
              <div className="shrink-0">
                {isCompleted && <CheckCircle className="w-6 h-6 text-green-600" />}
                {isInProgress && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
                {isPending && <Circle className="w-6 h-6 text-slate-300" />}
                {isError && <AlertCircle className="w-6 h-6 text-red-600" />}
              </div>
              <span className={`font-medium ${
                isCompleted ? "text-green-800" :
                isInProgress ? "text-blue-800" :
                isError ? "text-red-800" :
                "text-slate-500"
              }`}>
                {t(stage.label as any) || stage.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-secondary-muted hover:text-secondary font-medium transition-colors"
        >
          {t("common.cancel") || "Cancel"}
        </button>
      </div>
    </div>
  );
};
