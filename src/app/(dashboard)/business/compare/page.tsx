import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessComparison } from "@/features/business/components/BusinessComparison";

export default function BusinessComparePage() {
  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="mb-5 flex justify-start">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-[#1b4e33] hover:text-[#112a1d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <BusinessComparison />
    </div>
  );
}
