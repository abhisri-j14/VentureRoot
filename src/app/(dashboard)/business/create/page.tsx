import { BusinessWizard } from "@/features/business/components/BusinessWizard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BusinessCreatePage() {
  return (
    <div className="w-full px-6 lg:px-16 xl:px-24 py-8 max-w-[1800px] mx-auto">
      <div className="mb-6 flex justify-start">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E6702] hover:text-[#155201] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <BusinessWizard />
    </div>
  );
}

