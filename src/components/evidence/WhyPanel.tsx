import React from "react";
import { HelpCircle } from "lucide-react";

export const WhyPanel = ({
  summary,
  factors,
}: {
  summary: string;
  factors: string[];
}) => {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 mt-4">
      <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm mb-1">
        <HelpCircle className="w-4 h-4" />
        Why did AI conclude this?
      </div>
      <p className="text-sm text-secondary mb-2">{summary}</p>
      {factors && factors.length > 0 && (
        <ul className="text-sm text-secondary-muted flex flex-col gap-1.5 pl-1">
          {factors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-indigo-400 mt-0.5">•</span>
              {factor}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
