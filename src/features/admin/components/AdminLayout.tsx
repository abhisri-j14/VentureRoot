import React from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { Users, BookOpen, Layers, MapPinned, Brain, Database } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "users";

  const tabs = [
    { id: "users", label: t("nav.users" as any), icon: Users },
    { id: "schemes", label: t("nav.schemes" as any), icon: BookOpen },
    { id: "categories", label: t("nav.categories" as any), icon: Layers },
    { id: "geography", label: t("nav.geography" as any), icon: MapPinned },
    { id: "ai", label: t("nav.aiOversight" as any), icon: Brain },
    { id: "kb", label: t("nav.knowledgeBase" as any), icon: Database },
  ];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[800px]">
      <div className="flex flex-col p-6 pb-0 border-b border-slate-100 bg-slate-50/50">
        <div className="mb-4">
          <h2 className="text-xl font-heading font-bold text-secondary">{t("admin.title" as any)}</h2>
          <p className="text-sm text-secondary-muted mt-1">{t("admin.subtitle" as any)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
};
