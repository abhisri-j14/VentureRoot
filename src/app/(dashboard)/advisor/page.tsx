import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-[22px] font-heading font-bold text-[#242424] tracking-tight leading-tight">
          VentureRoot AI Advisor
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Ask about your business, market, financing, or next steps.
        </p>
      </div>

      <div className="hidden md:flex gap-3 overflow-x-auto pb-2">
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors">
          Should I start this business here?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors">
          What are my biggest local risks?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors">
          How can I improve my market reach?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/10 transition-colors">
          Which financing option suits me?
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
