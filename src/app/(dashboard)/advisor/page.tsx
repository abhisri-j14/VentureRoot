import { ChatWindow } from "@/features/advisor/components/ChatWindow";

export default function AdvisorPage() {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">
          VentureRoot AI Advisor
        </h1>
        <p className="text-secondary-muted mt-1">
          Ask about your business, market, financing, or next steps.
        </p>
      </div>

      <div className="mb-6 hidden md:flex gap-3 overflow-x-auto pb-2">
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-vr-violet hover:text-vr-violet hover:bg-vr-violet-light/10 transition-colors">
          Should I start this business here?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-vr-violet hover:text-vr-violet hover:bg-vr-violet-light/10 transition-colors">
          What are my biggest local risks?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-vr-violet hover:text-vr-violet hover:bg-vr-violet-light/10 transition-colors">
          How can I improve my market reach?
        </button>
        <button className="whitespace-nowrap px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-secondary-muted hover:border-vr-violet hover:text-vr-violet hover:bg-vr-violet-light/10 transition-colors">
          Which financing option suits me?
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ChatWindow />
      </div>
    </div>
  );
}
