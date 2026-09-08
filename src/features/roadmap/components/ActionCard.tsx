"use client";

import React, { useState } from "react";
import { ActionItem, ActionStatus } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { ChevronDown, ChevronUp, Clock, AlertTriangle, Target, CheckCircle2, Circle, Clock4 } from "lucide-react";
import { WhyPanel } from "@/components/evidence/WhyPanel";
import { ConfidenceIndicator } from "@/components/evidence/ConfidenceIndicator";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";

interface ActionCardProps {
  action: ActionItem;
}

export const ActionCard = ({ action }: ActionCardProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState<ActionStatus>(action.status);

  // Cycle through statuses for the frontend demo
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localStatus === "NOT_STARTED") setLocalStatus("IN_PROGRESS");
    else if (localStatus === "IN_PROGRESS") setLocalStatus("COMPLETED");
    else setLocalStatus("NOT_STARTED");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-50 text-red-700 border-red-200";
      case "MEDIUM": return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: ActionStatus) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "IN_PROGRESS": return <Clock4 className="w-5 h-5 text-blue-500" />;
      case "NOT_STARTED": return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusLabelKey = (status: ActionStatus) => {
    switch (status) {
      case "COMPLETED": return "roadmap.status.completed";
      case "IN_PROGRESS": return "roadmap.status.inProgress";
      case "NOT_STARTED": return "roadmap.status.notStarted";
    }
  };

  const getPriorityKey = (priority: string) => {
    switch (priority) {
      case "HIGH": return "roadmap.priority.high";
      case "MEDIUM": return "roadmap.priority.medium";
      case "LOW": return "roadmap.priority.low";
      default: return priority;
    }
  };

  const isCompleted = localStatus === "COMPLETED";

  return (
    <div className={`bg-white border rounded-2xl transition-all ${isExpanded ? 'shadow-soft border-primary' : 'hover:shadow-sm hover:border-primary/50 border-slate-200'} ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Header section (Always visible) */}
      <div 
        className="p-5 flex items-start gap-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-sans text-[14px] font-bold text-slate-500">
            {action.order}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
            <h3 className={`font-sans text-[16px] md:text-[18px] font-bold leading-tight transition-colors group-hover:text-primary ${isCompleted ? 'text-slate-500 line-through' : 'text-gray-900'}`}>
              {action.title}
            </h3>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-1 font-sans text-[11px] font-bold uppercase tracking-wider rounded border ${getPriorityColor(action.priority)}`}>
                {t(getPriorityKey(action.priority) as any) || action.priority}
              </span>
            </div>
          </div>
          
          <p className="font-sans text-[14px] text-secondary-muted line-clamp-2 pr-8">
            {action.description}
          </p>

          <div className="mt-3 flex items-center gap-4 font-sans text-[12px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{action.timeframe}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>{t(`roadmap.category.${action.category.toLowerCase()}` as any) || action.category}</span>
            </div>
            
            <button 
              onClick={handleStatusToggle}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              {getStatusIcon(localStatus)}
              <span className={localStatus === "COMPLETED" ? "text-green-700" : localStatus === "IN_PROGRESS" ? "text-blue-700" : ""}>
                {t(getStatusLabelKey(localStatus) as any) || localStatus}
              </span>
            </button>
          </div>
        </div>

        <div className="shrink-0 mt-1 text-slate-400">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Details section */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/50 rounded-b-2xl flex flex-col gap-6 animate-in slide-in-from-top-2 duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("roadmap.whatToDo") || "What to do"}
              </h4>
              <p className="font-sans text-[14px] text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                {action.whatToDo}
              </p>
            </div>
            
            <div>
              <h4 className="font-sans text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                {t("roadmap.expectedOutcome") || "Expected Outcome"}
              </h4>
              <p className="font-sans text-[14px] text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                {action.expectedOutcome}
              </p>
            </div>
          </div>

          {(action.why || action.confidence || action.evidence) && (
            <div className="flex flex-col gap-4 pt-4 border-t border-slate-200/60">
              {action.why && (
                <WhyPanel 
                  summary={action.why.summary}
                  factors={action.why.factors}
                />
              )}
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                {action.confidence && (
                  <ConfidenceIndicator 
                    score={action.confidence.score}
                    level={action.confidence.level}
                    reasons={action.confidence.reasons}
                  />
                )}

                {action.evidence && action.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {action.evidence.map((ev, idx) => (
                      <EvidenceBadge 
                        key={idx}
                        type={ev.type}
                        label={ev.label}
                        confidence={ev.confidenceScore}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
