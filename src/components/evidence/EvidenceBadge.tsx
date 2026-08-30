import React from "react";
import { CheckCircle2, TrendingUp, Sparkles, AlertCircle } from "lucide-react";

export type EvidenceType = "FACT" | "ESTIMATE" | "PREDICTION" | "UNKNOWN";

export const EvidenceBadge = ({
  type,
  label,
  confidence,
}: {
  type: EvidenceType;
  label: string;
  confidence?: number;
}) => {
  const config = {
    FACT: {
      color: "bg-emerald-50 text-accent-fact border-emerald-200",
      icon: CheckCircle2,
    },
    ESTIMATE: {
      color: "bg-amber-50 text-accent-estimate border-amber-200",
      icon: TrendingUp,
    },
    PREDICTION: {
      color: "bg-indigo-50 text-accent-predict border-indigo-200",
      icon: Sparkles,
    },
    UNKNOWN: {
      color: "bg-rose-50 text-accent-gap border-rose-200",
      icon: AlertCircle,
    },
  }[type];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[14px] font-semibold border ${config.color}`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {confidence && (
        <span className="opacity-75 font-medium ml-1">({confidence}%)</span>
      )}
    </span>
  );
};
