import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BusinessComparison } from "@/features/business/components/BusinessComparison";

export default function BusinessComparePage() {
  return (
    <div className="w-full h-full p-2.5 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 max-w-full overflow-x-hidden">
      <div className="mb-2 sm:mb-4 flex justify-start">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-sans text-xs sm:text-[14px] font-semibold text-[#1b4e33] hover:text-[#112a1d] transition-colors bg-white/70 px-3 py-1.5 rounded-xl border border-[#1b4e33]/20 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Back to Dashboard
        </Link>
      </div>
      <BusinessComparison />
    </div>
  );
}
