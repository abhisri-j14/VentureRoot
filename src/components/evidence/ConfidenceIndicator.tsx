import React from "react";
import { Gauge } from "lucide-react";

export const ConfidenceIndicator = ({
  score,
  level,
  reasons,
}: {
  score: number;
  level: "HIGH" | "MEDIUM" | "LOW";
  reasons?: string[];
}) => {
  const config = {
    HIGH: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
    MEDIUM: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    LOW: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  }[level];

  return (
    <div className={`flex flex-col gap-2 p-3 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 font-semibold ${config.color} text-sm`}>
          <Gauge className="w-4 h-4" />
          Confidence Score: {score}/100
        </div>
      </div>
      {reasons && reasons.length > 0 && (
        <ul className="text-xs text-slate-600 flex flex-col gap-1 mt-1">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
