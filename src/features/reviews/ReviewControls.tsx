"use client";

import React, { useState } from "react";
import { Check, X, Edit3, MessageSquare, AlertCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";

export const ReviewControls = () => {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);
  const [comment, setComment] = useState("");

  if (role !== "MENTOR_ADVISOR") {
    return null;
  }

  return (
    <div className="bg-slate-50 border border-blue-200 rounded-2xl p-6 mb-8 mt-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-blue-800">
        <AlertCircle className="w-5 h-5" />
        <h3 className="text-lg font-heading font-semibold">{t("review.controls" as any)}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 text-secondary transition-colors group">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
            <Check className="w-5 h-5" />
          </div>
          <span className="font-medium">{t("review.approve" as any)}</span>
        </button>
        
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-red-500 hover:bg-red-50 text-secondary transition-colors group">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </div>
          <span className="font-medium">{t("review.reject" as any)}</span>
        </button>
        
        <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 text-secondary transition-colors group">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Edit3 className="w-5 h-5" />
          </div>
          <span className="font-medium">{t("review.modify" as any)}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-secondary-muted flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" />
          {t("review.comment" as any)}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("review.commentPlaceholder" as any)}
          className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white text-sm"
        />
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
          {t("review.submitReview" as any)}
        </button>
      </div>
    </div>
  );
};
