import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { BusinessComparison } from "@/features/business/components/BusinessComparison";

export default function BusinessComparePage() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-heading font-bold text-secondary">
          Compare Business Ideas
        </h1>
        <p className="text-secondary-muted mt-1">
          Compare potential enterprises side by side before making a decision.
        </p>
      </div>

      <BentoGrid>
        <BentoCard className="col-span-12 p-6 md:p-8">
          <BusinessComparison />
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
