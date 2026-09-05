import React from "react";
import { ActionItem } from "../types";
import { ActionCard } from "./ActionCard";

interface RoadmapTimelineProps {
  actions: ActionItem[];
}

export const RoadmapTimeline = ({ actions }: RoadmapTimelineProps) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-300 rounded-3xl text-center">
        <p className="text-secondary-muted">No actions available in this roadmap.</p>
      </div>
    );
  }

  // Sort by order just in case
  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8">
      {/* Background timeline line for desktop - hidden on small mobile */}
      <div className="absolute left-8 md:left-[3.25rem] top-12 bottom-12 w-0.5 bg-slate-200 hidden sm:block"></div>
      
      <div className="flex flex-col gap-6 relative z-10">
        {sortedActions.map((action, index) => (
          <div key={action.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full group">
            {/* Timeline node visualization */}
            <div className="hidden sm:flex flex-col items-center shrink-0 w-8 md:w-12 pt-5 relative">
              <div className="w-4 h-4 rounded-full border-[3px] border-primary bg-white shadow-sm z-10 group-hover:scale-125 transition-transform" />
            </div>
            
            <div className="flex-1 w-full">
              <ActionCard action={action} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
