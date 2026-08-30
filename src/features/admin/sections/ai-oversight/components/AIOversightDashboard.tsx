"use client";

import React from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

export const AIOversightDashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-secondary">{t("admin.ai.title" as any)}</h3>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-secondary-muted">
        Mock AI Oversight Dashboard Placeholder
        <MockDisclaimer text="Currently showing mock data • AI oversight dashboard integration pending" className="justify-center mt-4" />
      </div>
    </div>
  );
};
