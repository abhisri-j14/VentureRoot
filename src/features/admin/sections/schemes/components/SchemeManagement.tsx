"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

export const SchemeManagement = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-secondary">{t("admin.schemes.title" as any)}</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> {t("admin.schemes.addScheme" as any)}
        </button>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-secondary-muted">
        Mock Scheme Data Table Placeholder
        <MockDisclaimer text="Currently showing mock data • Schemes API integration pending" className="justify-center mt-4" />
      </div>
    </div>
  );
};
