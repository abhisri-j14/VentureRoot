"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const AccessDenied = () => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
      <ShieldAlert className="w-16 h-16 text-slate-300 mb-6" />
      <h2 className="text-2xl font-heading font-bold text-secondary mb-2">
        {t("access.denied" as any)}
      </h2>
      <p className="text-secondary-muted mb-8 max-w-md">
        {t("access.deniedDesc" as any)}
      </p>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
      >
        {t("access.backToDashboard" as any)}
      </Link>
    </div>
  );
};
