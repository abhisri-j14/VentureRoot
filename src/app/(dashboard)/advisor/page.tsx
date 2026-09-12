import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="w-full h-full p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-4 pb-8">
      <div>
        <h1 className="font-heading text-[20px] sm:text-[24px] font-bold text-[#242424] tracking-tight leading-tight">
          VentureRoot AI Advisor
        </h1>
        <p className="font-sans text-[13px] sm:text-[14px] text-slate-500 font-medium mt-0.5">
          Ask questions about your business opportunity, subsidy schemes, loan eligibility, or market risk.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
