import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessComparison } from "@/features/business/components/BusinessComparison";

export default function BusinessComparePage() {
  return (
    <div className="w-full px-6 lg:px-10 xl:px-16 py-8 pb-12">
      <div className="mb-5 flex justify-start">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b4e33] hover:text-[#112a1d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <BusinessComparison />
    </div>
  );
}
