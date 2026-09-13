import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="w-full min-h-screen p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-3.5 sm:gap-4 pb-8 max-w-full overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="font-heading text-xl sm:text-[24px] font-bold text-[#242424] tracking-tight leading-tight break-words">
          VentureRoot AI Advisor
        </h1>
        <p className="font-sans text-xs sm:text-[14px] text-slate-500 font-medium mt-0.5 break-words">
          Ask questions about your business opportunity, subsidy schemes, loan eligibility, or market risk.
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full min-w-0">
        <ChatWindow />
      </div>
    </div>
  );
}
