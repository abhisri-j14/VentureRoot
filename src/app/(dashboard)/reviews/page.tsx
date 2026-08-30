"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useAuthStore } from "@/stores/useAuthStore";
import { AccessDenied } from "@/components/layout/AccessDenied";

export default function ReviewsPage() {
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);

  if (role !== "MENTOR_ADVISOR") {
    return <AccessDenied />;
  }

  const reviews = [
    { id: "123", entrepreneur: "Ravi Kumar", business: "Dairy Processing Unit", location: "Bankura, WB", status: "pending", date: "2026-08-28" },
    { id: "202", entrepreneur: "Meera Devi", business: "Organic Fertilizer", location: "Purulia, WB", status: "inReview", date: "2026-08-27" },
    { id: "203", entrepreneur: "Arjun Singh", business: "Poultry Farm", location: "Birbhum, WB", status: "approved", date: "2026-08-25" },
    { id: "204", entrepreneur: "Sunita Rani", business: "Handloom Weaving", location: "Murshidabad, WB", status: "rejected", date: "2026-08-20" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />;
      case "inReview": return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "inReview": return "bg-blue-100 text-blue-800";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col py-8 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {t("access.backToDashboard" as any)}
        </Link>
        <h1 className="text-3xl font-heading font-bold text-secondary">
          {t("review.title" as any)}
        </h1>
        <p className="text-secondary-muted mt-1">
          {t("review.subtitle" as any)}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-medium text-secondary-muted">{t("review.entrepreneur" as any)}</th>
                <th className="px-6 py-4 text-sm font-medium text-secondary-muted">{t("review.business" as any)}</th>
                <th className="px-6 py-4 text-sm font-medium text-secondary-muted">{t("review.location" as any)}</th>
                <th className="px-6 py-4 text-sm font-medium text-secondary-muted">{t("review.submitted" as any)}</th>
                <th className="px-6 py-4 text-sm font-medium text-secondary-muted">{t("review.status" as any)}</th>
                <th className="px-6 py-4 text-right font-medium text-secondary-muted"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-secondary">{review.entrepreneur}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{review.business}</td>
                  <td className="px-6 py-4 text-sm text-secondary-muted">{review.location}</td>
                  <td className="px-6 py-4 text-sm text-secondary-muted">{review.date}</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBg(review.status)}`}>
                      {getStatusIcon(review.status)}
                      {t(`review.${review.status}` as any)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/business/${review.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      {t("review.openReview" as any)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
