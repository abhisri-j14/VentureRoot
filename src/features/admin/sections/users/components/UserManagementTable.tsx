"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const UserManagementTable = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-secondary">{t("admin.users.title" as any)}</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> {t("admin.users.addUser" as any)}
        </button>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 font-medium text-secondary-muted">{t("admin.users.name" as any)}</th>
              <th className="px-6 py-3 font-medium text-secondary-muted">{t("admin.users.email" as any)}</th>
              <th className="px-6 py-3 font-medium text-secondary-muted">{t("admin.users.role" as any)}</th>
              <th className="px-6 py-3 font-medium text-secondary-muted">{t("admin.users.status" as any)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-secondary">Ravi Kumar</td>
              <td className="px-6 py-4 text-secondary-muted">ravi@example.com</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Entrepreneur</span></td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">Active</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-secondary">Ananya Sharma</td>
              <td className="px-6 py-4 text-secondary-muted">ananya@ventureroot.in</td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">Mentor</span></td>
              <td className="px-6 py-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
