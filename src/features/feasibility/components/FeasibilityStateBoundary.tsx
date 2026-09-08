"use client";

import React from "react";
import { Loader2, AlertCircle, FileSearch } from "lucide-react";
import { BentoCard } from "@/components/layout/BentoCard";

interface FeasibilityStateBoundaryProps {
  status: "LOADING" | "SUCCESS" | "ERROR" | "EMPTY";
  children: React.ReactNode;
}

export const FeasibilityStateBoundary = ({ status, children }: FeasibilityStateBoundaryProps) => {
  if (status === "SUCCESS") {
    return <>{children}</>;
  }

  return (
    <BentoCard className="col-span-12 flex flex-col items-center justify-center p-12 text-center h-[400px]">
      {status === "LOADING" && (
        <>
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <h3 className="font-heading text-[20px] font-bold text-secondary">Analyzing Local Feasibility</h3>
          <p className="font-sans text-[14px] text-secondary-muted mt-2 max-w-md">
            Our AI models are processing market data, surveying competitors, and assessing geographic dynamics...
          </p>
        </>
      )}

      {status === "EMPTY" && (
        <>
          <FileSearch className="w-10 h-10 text-slate-400 mb-4" />
          <h3 className="font-heading text-[20px] font-bold text-secondary">No Analysis Available Yet</h3>
          <p className="font-sans text-[14px] text-secondary-muted mt-2 max-w-md">
            The feasibility analysis for this business has not been generated. Please provide more business details and request an analysis.
          </p>
        </>
      )}

      {status === "ERROR" && (
        <>
          <AlertCircle className="w-10 h-10 text-vr-red-dark mb-4" />
          <h3 className="font-heading text-[20px] font-bold text-secondary">Analysis Failed</h3>
          <p className="font-sans text-[14px] text-secondary-muted mt-2 max-w-md">
            We encountered an issue while generating the intelligence report. Please try again later.
          </p>
        </>
      )}
    </BentoCard>
  );
};
