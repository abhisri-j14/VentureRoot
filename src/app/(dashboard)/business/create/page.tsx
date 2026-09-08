import { BusinessWizard } from "@/features/business/components/BusinessWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BusinessCreatePage() {
  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="mb-6 flex justify-start">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 font-sans text-[14px] font-semibold text-[#1E6702] hover:text-[#155201] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <BusinessWizard />
    </div>
  );
}

