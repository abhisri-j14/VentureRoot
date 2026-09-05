import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 lg:px-6 h-full flex flex-col pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">
          VentureRoot AI Advisor
        </h1>
        <p className="text-secondary-muted mt-1">
          Ask about your business, market, financing, or next steps.
        </p>
      </div>

      <div className="mb-6 hidden md:flex gap-3 overflow-x-auto pb-2">
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
