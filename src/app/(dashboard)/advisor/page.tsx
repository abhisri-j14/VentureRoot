import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-8">
      <div>
        <h1 className="font-heading text-[22px] font-bold text-[#242424] tracking-tight leading-tight">
          VentureRoot AI Advisor
        </h1>
        <p className="font-sans text-[14px] text-slate-500 font-medium mt-0.5">
          Ask about your business, market, financing, or next steps.
        </p>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-white font-sans text-[13px] sm:text-[14px] font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors shrink-0">
          Should I start this business here?
        </button>
        <button className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-white font-sans text-[13px] sm:text-[14px] font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors shrink-0">
          What are my biggest local risks?
        </button>
        <button className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-white font-sans text-[13px] sm:text-[14px] font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors shrink-0">
          How can I improve my market reach?
        </button>
        <button className="whitespace-nowrap px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 bg-white font-sans text-[13px] sm:text-[14px] font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors shrink-0">
          Which financing option suits me?
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
