"use client";

import React from "react";
import Link from "next/link";
import {
  Map,
  MapPin,
  LineChart,
  Landmark,
  BrainCircuit,
  FileText,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Leaf,
  TrendingUp,
  Sparkles,
  Languages,
  Zap,
  Lightbulb,
  Target,
  CheckCircle2,
  Database,
  Check,
  Globe,
  Briefcase,
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { CleanNavbar } from "@/components/ui/clean-navbar";
import { RippleButton } from "@/components/ui/ripple-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { TextEffect } from "@/components/ui/text-effect";
import CloudLoader from "@/components/ui/quantum-cloud-loader";

// ── USP Carousel ──────────────────────────────────────────────────────────────

const USP_ITEMS = [
  {
    id: "local-check",
    category: "Feasibility",
    icon: MapPin,
    image: "/usp-2.png",       // farmer with tablet + data dashboard
    title: "Know if your idea can work here",
    description: "Understand local demand, nearby competition, market reach, and business opportunities before you invest.",
    points: ["Check demand around your location", "Understand nearby competition", "Spot local opportunities"],
  },
  {
    id: "financial-plan",
    category: "Finance",
    icon: Landmark,
    image: "/usp-1.png",       // farmer planning at desk in field
    title: "Plan your money before you spend",
    description: "See the likely investment, your contribution, possible borrowing, expected returns, and repayment pressure.",
    points: ["Understand total investment needed", "See your possible loan requirement", "Explore repayment scenarios"],
  },
  {
    id: "gov-schemes",
    category: "Schemes",
    icon: ShieldCheck,
    image: "/feature-3.jpg",
    title: "Find support that fits your business",
    description: "Discover relevant government schemes, subsidies, and loan opportunities based on your business profile.",
    points: ["Explore suitable schemes", "Compare support options", "Understand basic eligibility"],
  },
  {
    id: "what-if",
    category: "Simulator",
    icon: Zap,
    image: "/usp-3.png",       // person thinking with pros/cons
    title: "See what happens if things change",
    description: "Test different prices, costs, demand levels, and cash reserves before making a decision.",
    points: ["Try best-case and worst-case situations", "Understand possible profit changes", "Prepare for difficult months"],
  },
  {
    id: "advisor",
    category: "AI Advisor",
    icon: BrainCircuit,
    image: "/usp-4.png",       // person using phone / chat
    title: "Ask questions in simple language",
    description: "Get practical guidance about your business, market, money, risks, and next steps — in plain language.",
    points: ["Ask questions naturally", "Get guidance based on your business", "Understand complex findings easily"],
  },
  {
    id: "roadmap",
    category: "Action Plan",
    icon: Target,
    image: "/feature-4.jpg",
    title: "Know what to do next",
    description: "Turn your business plan into clear steps, from checking demand to preparing for launch.",
    points: ["Follow practical next steps", "Track what is completed", "Avoid feeling overwhelmed"],
  },
  {
    id: "report",
    category: "Report",
    icon: FileText,
    image: "/usp-5.png",       // clipboard with magnifier and charts
    title: "Get everything in one simple report",
    description: "Bring your market, finance, risks, opportunities, and next steps together in one easy-to-understand report.",
    points: ["Review the full business picture", "Understand important findings quickly", "Save for future reference"],
  },
];

function USPCarousel() {
  const [active, setActive] = React.useState(0);
  const total = USP_ITEMS.length;

  const prev = () => setActive(i => (i - 1 + total) % total);
  const next = () => setActive(i => (i + 1) % total);

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const current = USP_ITEMS[active];

  // Preview indices: previous and next items
  const prevIdx = (active - 1 + total) % total;
  const nextIdx = (active + 1) % total;

  return (
    <div className="w-full">
      {/* Main active item */}
      <div className="w-full bg-white rounded-3xl border border-[#1E6702]/20 shadow-[0_4px_30px_rgba(30,103,2,0.07)] overflow-hidden mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-[55fr_45fr]"
            style={{ minHeight: "340px" }}
          >
            {/* Left: text */}
            <div className="px-8 py-10 flex flex-col justify-center lg:border-r border-b lg:border-b-0 border-black/5">
              <div className="inline-flex items-center gap-2 mb-5 self-start">
                <div className="w-5 h-5 rounded-md bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center">
                  {React.createElement(current.icon, { className: "w-3 h-3 text-[#1E6702]" })}
                </div>
                <span className="text-[10px] font-bold text-[#1E6702] uppercase tracking-widest">{current.category}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-sans font-bold text-[#200813] leading-tight mb-3">
                {current.title}
              </h3>
              <p className="text-sm md:text-[15px] text-[#200813]/65 leading-relaxed mb-6 max-w-md">
                {current.description}
              </p>
              <ul className="flex flex-col gap-2">
                {current.points.map(pt => (
                  <li key={pt} className="flex items-center gap-2.5 text-sm text-[#200813]/75 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6702] shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: image — fixed uniform height, object-contain */}
            <div className="bg-[#fafdf6] flex items-center justify-center overflow-hidden" style={{ height: "340px" }}>
              <motion.img
                key={current.image}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={current.image!}
                alt={current.title}
                className="w-full h-full object-contain p-6"
              />
            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Preview strip + controls row */}
      <div className="flex items-center gap-3">
        {/* Prev button */}
        <button
          onClick={prev}
          aria-label="Previous feature"
          className="w-9 h-9 shrink-0 rounded-full border border-[#1E6702]/25 bg-white hover:bg-[#f4fce8] hover:border-[#1E6702]/50 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#1E6702]"
        >
          <ChevronRight className="w-4 h-4 text-[#1E6702] rotate-180" />
        </button>

        {/* Preview thumbnails (hidden on small mobile) */}
        <div className="flex-1 hidden sm:flex gap-2.5 overflow-hidden">
          {/* Prev preview */}
          <button
            onClick={prev}
            className="flex-1 min-w-0 bg-white/70 hover:bg-white border border-black/6 hover:border-[#1E6702]/30 rounded-2xl px-4 py-3 text-left transition-all group"
          >
            <div className="text-[9px] font-bold text-[#1E6702]/50 uppercase tracking-widest mb-0.5">{USP_ITEMS[prevIdx].category}</div>
            <div className="text-xs font-semibold text-[#200813]/70 group-hover:text-[#200813] truncate">{USP_ITEMS[prevIdx].title}</div>
          </button>

          {/* Pagination dots — centered */}
          <div className="flex items-center gap-1.5 shrink-0 px-2">
            {USP_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to feature ${i + 1}`}
                className={`rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[#1E6702] ${i === active
                    ? "w-5 h-2 bg-[#1E6702]"
                    : "w-2 h-2 bg-[#1E6702]/20 hover:bg-[#1E6702]/40"
                  }`}
              />
            ))}
          </div>

          {/* Next preview */}
          <button
            onClick={next}
            className="flex-1 min-w-0 bg-white/70 hover:bg-white border border-black/6 hover:border-[#1E6702]/30 rounded-2xl px-4 py-3 text-left transition-all group"
          >
            <div className="text-[9px] font-bold text-[#1E6702]/50 uppercase tracking-widest mb-0.5">{USP_ITEMS[nextIdx].category}</div>
            <div className="text-xs font-semibold text-[#200813]/70 group-hover:text-[#200813] truncate">{USP_ITEMS[nextIdx].title}</div>
          </button>
        </div>

        {/* Mobile: pagination dots only */}
        <div className="flex sm:hidden items-center gap-1.5 flex-1 justify-center">
          {USP_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to feature ${i + 1}`}
              className={`rounded-full transition-all ${i === active ? "w-5 h-2 bg-[#1E6702]" : "w-2 h-2 bg-[#1E6702]/20"
                }`}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          aria-label="Next feature"
          className="w-9 h-9 shrink-0 rounded-full border border-[#1E6702]/25 bg-white hover:bg-[#f4fce8] hover:border-[#1E6702]/50 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#1E6702]"
        >
          <ChevronRight className="w-4 h-4 text-[#1E6702]" />
        </button>
      </div>

      {/* Counter */}
      <p className="text-center text-xs text-[#200813]/40 font-medium mt-3">
        {active + 1} / {total}
      </p>
    </div>
  );
}

// ── How It Works — data + interactive component ──────────────────────────────


const HOW_IT_WORKS_FEATURES = [
  {
    id: "idea",
    icon: Lightbulb,
    label: "Business Idea",
    shortLabel: "Your Idea",
    title: "Tell us about your business idea",
    description: "Start by describing what you want to do, where you want to do it, and how much money you have. VentureRoot uses this to build a personalised analysis just for you.",
    points: [
      "Enter your village, block, or district",
      "Choose your business category",
      "Set your available starting capital",
    ],
    visual: (
      <div className="w-full h-full flex flex-col gap-3">
        <div className="text-xs font-bold text-[#1E6702]/60 uppercase tracking-widest mb-1">Business Profile</div>
        <div className="bg-white rounded-2xl border border-[#1E6702]/15 p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-[#1E6702]" /></div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Location</div>
              <div className="text-sm font-bold text-[#200813]">Kolhapur District, Maharashtra</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center shrink-0"><Briefcase className="w-4 h-4 text-[#1E6702]" /></div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Business Type</div>
              <div className="text-sm font-bold text-[#200813]">Dairy & Cattle Farming</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center shrink-0"><TrendingUp className="w-4 h-4 text-[#1E6702]" /></div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Starting Capital</div>
              <div className="text-sm font-bold text-[#200813]">₹2,50,000</div>
            </div>
          </div>
        </div>
        <div className="mt-auto bg-[#1E6702]/8 rounded-xl px-4 py-3 border border-[#1E6702]/15 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#1E6702] shrink-0" />
          <span className="text-xs font-semibold text-[#1E6702]">Ready to analyse your idea</span>
        </div>
      </div>
    ),
  },
  {
    id: "market",
    icon: MapPin,
    label: "Local Market",
    shortLabel: "Market",
    title: "Understand your local demand",
    description: "VentureRoot maps out how much demand there is for your product nearby, who your competitors are, and whether the market can support your business.",
    points: [
      "See local demand based on your area",
      "Know who your competitors are",
      "Understand your realistic customer reach",
    ],
    visual: (
      <div className="w-full h-full flex flex-col gap-3">
        <div className="text-xs font-bold text-[#1E6702]/60 uppercase tracking-widest mb-1">Market Snapshot</div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Local Demand", val: "High", color: "text-[#1E6702]", bg: "bg-[#f4fce8]" },
            { label: "Competition", val: "Medium", color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Market Reach", val: "5 km radius", color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Opportunity", val: "Strong", color: "text-[#1E6702]", bg: "bg-[#f4fce8]" },
          ].map(item => (
            <div key={item.label} className={`${item.bg} rounded-xl px-3 py-3 border border-black/5`}>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1">{item.label}</div>
              <div className={`text-sm font-black ${item.color}`}>{item.val}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 mt-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Nearby Bulk Buyers</div>
          {["Sweet shops (×12)", "Retail stores (×8)", "Restaurants (×5)"].map(b => (
            <div key={b} className="flex items-center gap-2 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1E6702] shrink-0" />
              <span className="text-xs text-[#200813] font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "finance",
    icon: Landmark,
    label: "Finance & Schemes",
    shortLabel: "Finance",
    title: "See your funding options clearly",
    description: "Understand how much money your business needs, what loans are available, which government schemes you qualify for, and whether the repayments are manageable.",
    points: [
      "See total capital needed and your contribution",
      "Compare available government funding schemes",
      "Check if repayments are affordable for your income",
    ],
    visual: (
      <div className="w-full h-full flex flex-col gap-3">
        <div className="text-xs font-bold text-[#1E6702]/60 uppercase tracking-widest mb-1">Funding Breakdown</div>
        <div className="flex gap-2.5">
          {[
            { label: "Total Needed", val: "₹6.5L", color: "bg-[#200813] text-white" },
            { label: "Your Share", val: "₹2.5L", color: "bg-[#f4fce8] text-[#1E6702] border border-[#1E6702]/20" },
            { label: "Loan", val: "₹4.0L", color: "bg-white text-[#200813] border border-slate-200" },
          ].map(item => (
            <div key={item.label} className={`flex-1 rounded-xl px-2.5 py-3 text-center ${item.color}`}>
              <div className="text-[10px] font-semibold opacity-70 mb-1">{item.label}</div>
              <div className="text-base font-black">{item.val}</div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Suitable Scheme</div>
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Landmark className="w-3.5 h-3.5 text-[#1E6702]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#200813]">NABARD DEDS</div>
              <div className="text-[11px] text-slate-500">Dairy Entrepreneurship Development Scheme · Back-end subsidy available</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#f4fce8] rounded-xl px-3 py-2.5 border border-[#1E6702]/15">
          <CheckCircle2 className="w-4 h-4 text-[#1E6702] shrink-0" />
          <span className="text-xs font-semibold text-[#1E6702]">Monthly surplus: +₹12,400 after EMI</span>
        </div>
      </div>
    ),
  },
  {
    id: "action",
    icon: Target,
    label: "Action Plan",
    shortLabel: "Action Plan",
    title: "Get your practical next steps",
    description: "VentureRoot gives you a clear, step-by-step action plan so you know exactly what to do first, second, and third — without any confusion.",
    points: [
      "Simple numbered steps, prioritised for you",
      "Track what you've completed",
      "Ask your AI Advisor anything at any point",
    ],
    visual: (
      <div className="w-full h-full flex flex-col gap-2.5">
        <div className="text-xs font-bold text-[#1E6702]/60 uppercase tracking-widest mb-1">Your Next Steps</div>
        {[
          { n: "01", text: "Validate local milk demand", status: "DONE" },
          { n: "02", text: "Compare fodder suppliers", status: "NEXT" },
          { n: "03", text: "Apply for NABARD scheme", status: "UPCOMING" },
          { n: "04", text: "Complete FSSAI registration", status: "UPCOMING" },
        ].map(step => (
          <div key={step.n} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 border ${step.status === "DONE" ? "bg-[#f4fce8] border-[#1E6702]/20 opacity-70" :
              step.status === "NEXT" ? "bg-white border-[#1E6702] shadow-[0_0_0_2px_rgba(30,103,2,0.1)]" :
                "bg-white border-slate-100"
            }`}>
            <span className={`text-xs font-black shrink-0 ${step.status === "DONE" ? "text-[#1E6702]" :
                step.status === "NEXT" ? "text-[#1E6702]" : "text-slate-300"
              }`}>{step.n}</span>
            <span className={`text-xs font-semibold flex-1 ${step.status === "DONE" ? "text-[#1E6702] line-through" :
                step.status === "NEXT" ? "text-[#200813]" : "text-slate-400"
              }`}>{step.text}</span>
            {step.status === "DONE" && <CheckCircle2 className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />}
            {step.status === "NEXT" && <span className="text-[10px] font-bold text-[#1E6702] bg-[#f4fce8] px-2 py-0.5 rounded-full shrink-0">Next</span>}
          </div>
        ))}
      </div>
    ),
  },
] as const;

// Helper type to access icon properly
type FeatureId = typeof HOW_IT_WORKS_FEATURES[number]["id"];

function HowItWorksSelector() {
  const [active, setActive] = React.useState<FeatureId>("idea");

  const current = HOW_IT_WORKS_FEATURES.find(f => f.id === active)!;

  return (
    <div>
      {/* Top selector row */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 mb-6 no-scrollbar" role="tablist" aria-label="How VentureRoot works">
        {HOW_IT_WORKS_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const isActive = active === feature.id;
          return (
            <button
              key={feature.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${feature.id}`}
              onClick={() => setActive(feature.id as FeatureId)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left shrink-0 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#1E6702] ${isActive
                  ? "bg-white border-[#1E6702] shadow-[0_0_0_1px_#1E6702,0_4px_16px_rgba(30,103,2,0.12)] text-[#200813]"
                  : "bg-white/60 border-black/8 text-[#200813]/60 hover:border-[#1E6702]/30 hover:bg-white hover:text-[#200813]/80"
                }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? "bg-[#f4fce8]" : "bg-slate-100"
                }`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#1E6702]" : "text-slate-400"}`} />
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-xs font-bold leading-tight ${isActive ? "text-[#200813]" : "text-[#200813]/60"}`}>
                  {feature.shortLabel}
                </span>
                {isActive && (
                  <span className="text-[9px] font-bold text-[#1E6702] uppercase tracking-widest">Active</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Large content panel */}
      <div
        id={`panel-${active}`}
        role="tabpanel"
        className="w-full bg-white rounded-3xl border border-black/6 shadow-[0_4px_30px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-[42fr_58fr] min-h-[380px]"
          >
            {/* Left: text */}
            <div className="px-8 py-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-black/5">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-[#f4fce8] border border-[#1E6702]/20 flex items-center justify-center">
                  {React.createElement(current.icon, { className: "w-3.5 h-3.5 text-[#1E6702]" })}
                </div>
                <span className="text-[10px] font-bold text-[#1E6702] uppercase tracking-widest">{current.label}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-sans font-bold text-[#200813] leading-tight mb-3">
                {current.title}
              </h3>
              <p className="text-sm md:text-base text-[#200813]/65 leading-relaxed mb-6 font-normal">
                {current.description}
              </p>

              <ul className="flex flex-col gap-2.5">
                {current.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-[#200813]/80 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#1E6702] mt-0.5 shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: visual */}
            <div className="bg-[#fafdf6] px-8 py-10 flex items-center justify-center">
              <div className="w-full max-w-sm">
                {current.visual}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { t } = useTranslation();

  const isAuthenticated = useAuthStore((state) => !!state.token);
  const [isPreloading, setIsPreloading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsPreloading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FFFBE7]"
          >
            <CloudLoader />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex items-center justify-center bg-[#FFFBE7]"
            >
              <img
                src="/logo-wordmark.png"
                alt="VentureRoot Logo"
                className="h-8 md:h-10 w-auto object-contain mix-blend-multiply opacity-90"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1 flex flex-col items-center w-full">
          {/* ── 1. Hero Section — Full Width, No Card ── */}
          <section className="relative w-full flex flex-col overflow-hidden" style={{ minHeight: "min(100svh, 700px)" }}>
            {/* Background illustration — covers lower 50% of hero */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/hero-card-bg.jpg"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-[center_bottom]"
              />
              {/* Soft gradient fade from top so sky reads clean behind text */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBE7]/80 via-[#FFFBE7]/20 to-transparent" />
            </div>

            {/* Navbar — transparent, integrated */}
            <CleanNavbar />

            {/* Hero Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-6 pt-4 pb-28 md:pb-36">
              <div className="flex flex-col items-center text-center max-w-[700px] mx-auto w-full">

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={isPreloading ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-[#1E6702]/20 shadow-sm"
                >
                  <Leaf className="w-3 h-3 text-[#1E6702]" />
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] text-[#1E6702]">
                    Local Business Intelligence
                  </span>
                </motion.div>

                {/* Heading — smaller, two natural lines */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={isPreloading ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-[30px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-heading font-semibold text-[#200813] leading-[1.06] tracking-tight [text-shadow:_0_2px_18px_rgba(255,251,231,1),_0_0_40px_rgba(255,251,231,0.8)]"
                >
                  Start and grow your local
                  <span className="block">business with clarity.</span>
                </motion.h1>

                {/* Description — frosted pill for legibility over illustration */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={isPreloading ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-5 px-5 py-3 rounded-2xl bg-white/55 backdrop-blur-sm border border-white/40 shadow-sm max-w-[520px]"
                >
                  <p className="text-[14px] md:text-[15px] text-[#200813]/80 font-normal leading-relaxed">
                    VentureRoot shows you local market demand, matches you with government support, and builds your step-by-step business plan.
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={isPreloading ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3 mt-7 w-full sm:w-auto justify-center"
                >
                  <RippleButton
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    rippleColor="bg-white/30"
                    className="bg-[#1E6702] text-white px-6 py-2.5 rounded-xl font-semibold text-[13px] md:text-sm hover:bg-[#185901] transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    Analyze Your Business <ArrowRight className="w-4 h-4" />
                  </RippleButton>
                  <RippleButton
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    rippleColor="bg-[#1E6702]/10"
                    className="bg-white/65 backdrop-blur-md border border-[#200813]/10 text-[#200813] px-6 py-2.5 rounded-xl font-semibold text-[13px] md:text-sm hover:bg-white/85 transition-all shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </RippleButton>
                </motion.div>
              </div>
            </div>
        </section>

        {/* ── 2. What We Offer — USP Carousel ── */}
        <section className="w-full bg-[#FFFBE7] pt-24 pb-0 border-y border-black/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">

            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-4 h-4 text-[#1E6702]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5A1832]">
                  WHAT VENTUREROOT OFFERS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-sans font-bold text-[#200813] tracking-tight mb-4">
                <TextEffect per='char' preset='fade' trigger={!isPreloading}>
                  Smart tools for your next local venture.
                </TextEffect>
              </h2>
              <p className="text-base md:text-lg text-[#200813]/70 max-w-2xl font-normal">
                Understand your opportunity, plan your money, and take the next step with confidence.
              </p>
            </div>

            {/* Carousel */}
            <USPCarousel />

          </div>

          {/* Trust/Value Strip */}
          <div className="w-full bg-[#1E6702] py-12 border-t border-black/10 mt-16">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 justify-center text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C8F89B] shrink-0 text-center md:text-left">
                BUILT FOR<br className="hidden md:block" />REAL-WORLD<br className="hidden md:block" />DECISIONS
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <div className="bg-[#C8F89B]/10 p-2.5 rounded-xl border border-[#C8F89B]/20 shadow-sm">
                    <MapPin className="w-4 h-4 text-[#C8F89B]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Hyper-Local</span>
                    <span className="text-xs text-white/70 font-medium">Insights around your location</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#C8F89B]/10 p-2.5 rounded-xl border border-[#C8F89B]/20 shadow-sm">
                    <LineChart className="w-4 h-4 text-[#C8F89B]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Data-Grounded</span>
                    <span className="text-xs text-white/70 font-medium">Decisions backed by evidence</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#C8F89B]/10 p-2.5 rounded-xl border border-[#C8F89B]/20 shadow-sm">
                    <Languages className="w-4 h-4 text-[#C8F89B]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Multilingual</span>
                    <span className="text-xs text-white/70 font-medium">Advice in your language</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-[#C8F89B]/10 p-2.5 rounded-xl border border-[#C8F89B]/20 shadow-sm">
                    <Zap className="w-4 h-4 text-[#C8F89B]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Action-Ready</span>
                    <span className="text-xs text-white/70 font-medium">Clear next steps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. How VentureRoot Works — Interactive Feature Selector ── */}
        <section id="how-it-works" className="relative w-full bg-[#FFFBE7] py-24 border-y border-black/5 overflow-hidden">

          <div className="relative max-w-7xl mx-auto px-6 z-10">

            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-14">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#1E6702]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1E6702]">HOW IT WORKS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-[#200813] tracking-tight mb-4">
                How VentureRoot Works
              </h2>
              <p className="text-base md:text-lg text-[#200813]/70 max-w-2xl font-normal">
                From a local business idea to a clear, actionable plan — in four steps.
              </p>
            </div>

            <HowItWorksSelector />

          </div>
        </section>

        {/* ── 4. Trust / Evidence Message (Dark Coffee Bean Chapter) ── */}
        <section className="w-full bg-[#200813] py-24 md:py-32 border-y border-[#3d1326]/40 relative overflow-hidden text-left">

          {/* Subtle background ambient glow */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1E6702]/10 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#C8F89B]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* LEFT: Illustration with subtle halo glow */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="lg:col-span-5 flex justify-center relative"
              >
                <div className="relative group w-full max-w-[420px]">
                  {/* Soft ambient backlight behind illustration */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#1E6702]/20 via-[#C8F89B]/15 to-transparent rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                  {/* Illustration card surface */}
                  <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-[#2a0e1c] to-[#1a0610] border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                    <motion.img
                      initial={{ y: 0 }}
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      src="/evidence-analysis.png"
                      alt="Verified Evidence and Analysis"
                      className="w-full h-auto object-contain max-h-[380px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* RIGHT: Content & Structured Points */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-7 flex flex-col items-start"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E6702]/25 border border-[#1E6702]/40 text-[#C8F89B] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C8F89B]" />
                  <span>DATA-BACKED VERIFICATION</span>
                </div>

                {/* Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-[#FFFBE7] tracking-tight leading-[1.15] mb-5">
                  Built on verified evidence, not guesswork.
                </h2>

                {/* Supporting text */}
                <p className="text-base md:text-lg text-[#FFFBE7]/75 leading-relaxed font-normal mb-8 max-w-2xl">
                  VentureRoot separates facts from estimates and predictions, using local data and verified sources to help you make more informed business decisions.
                </p>

                {/* 3 Compact Supporting Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2 [perspective:1000px]">

                  {/* Point 1 */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-[#FFFBE7] hover:bg-[#FFFFFF] border border-[#FFFBE7]/60 hover:border-[#1E6702]/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(200,248,155,0.2)] hover:-translate-y-2 hover:-rotate-1 transition-all duration-300 transform-gpu flex flex-col items-start text-left group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1E6702]/15 border border-[#1E6702]/25 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#1E6702] transition-all duration-300 shadow-sm">
                      <Check className="w-4 h-4 text-[#1E6702] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-[#200813] mb-1.5 flex items-center gap-1.5">
                      Local Data
                    </h3>
                    <p className="text-xs text-[#200813]/75 leading-relaxed font-normal">
                      Insights grounded in location-specific information.
                    </p>
                  </motion.div>

                  {/* Point 2 */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-[#FFFBE7] hover:bg-[#FFFFFF] border border-[#FFFBE7]/60 hover:border-[#1E6702]/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(200,248,155,0.2)] hover:-translate-y-2 hover:rotate-1 transition-all duration-300 transform-gpu flex flex-col items-start text-left group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1E6702]/15 border border-[#1E6702]/25 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#1E6702] transition-all duration-300 shadow-sm">
                      <Check className="w-4 h-4 text-[#1E6702] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-[#200813] mb-1.5 flex items-center gap-1.5">
                      Verified Sources
                    </h3>
                    <p className="text-xs text-[#200813]/75 leading-relaxed font-normal">
                      Government schemes &amp; financial data from trusted sources.
                    </p>
                  </motion.div>

                  {/* Point 3 */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-[#FFFBE7] hover:bg-[#FFFFFF] border border-[#FFFBE7]/60 hover:border-[#1E6702]/30 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.35),0_0_20px_rgba(200,248,155,0.2)] hover:-translate-y-2 hover:-rotate-1 transition-all duration-300 transform-gpu flex flex-col items-start text-left group cursor-default"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1E6702]/15 border border-[#1E6702]/25 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#1E6702] transition-all duration-300 shadow-sm">
                      <Check className="w-4 h-4 text-[#1E6702] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-[#200813] mb-1.5 flex items-center gap-1.5">
                      Transparent Insights
                    </h3>
                    <p className="text-xs text-[#200813]/75 leading-relaxed font-normal">
                      Clearly distinguish facts, estimates, and predictions.
                    </p>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── 5. What People Say About Us ── */}
        <section className="w-full bg-gradient-to-b from-[#def4fc] to-[#07294A] pt-24 pb-32 border-t border-black/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-sans font-bold text-[#200813] tracking-tight mb-4">
              What people say about us
            </h2>
            <p className="text-base md:text-lg text-[#200813]/70 font-normal">
              Entrepreneurs are building smarter with VentureRoot.
            </p>
          </div>

          <div className="relative w-full px-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">

            <motion.div
              className="flex -ml-4 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 40,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {/* Duplicate array for seamless looping */}
              {[
                { name: "Rajesh K.", role: "Agri-Tech Founder", quote: "VentureRoot provided the clarity I needed for local subsidies. The step-by-step breakdown is invaluable." },
                { name: "Priya S.", role: "Local Retailer", quote: "The market insights were completely game-changing for our new branch. We stopped guessing." },
                { name: "Anil D.", role: "Logistics Manager", quote: "A beautifully structured platform. We rely on this actual localized data for every new pivot." },
                { name: "Vikram P.", role: "Dairy Entrepreneur", quote: "The financial planner saved us months of painful calculations. Everything is so transparent." },
                { name: "Sneha M.", role: "Boutique Owner", quote: "I found 3 government schemes I was eligible for instantly. The AI advisor feels incredibly personalized." },
                // Duplicate
                { name: "Rajesh K.", role: "Agri-Tech Founder", quote: "VentureRoot provided the clarity I needed for local subsidies. The step-by-step breakdown is invaluable." },
                { name: "Priya S.", role: "Local Retailer", quote: "The market insights were completely game-changing for our new branch. We stopped guessing." },
                { name: "Anil D.", role: "Logistics Manager", quote: "A beautifully structured platform. We rely on this actual localized data for every new pivot." },
                { name: "Vikram P.", role: "Dairy Entrepreneur", quote: "The financial planner saved us months of painful calculations. Everything is so transparent." },
                { name: "Sneha M.", role: "Boutique Owner", quote: "I found 3 government schemes I was eligible for instantly. The AI advisor feels incredibly personalized." }
              ].map((t, i) => (
                <div key={i} className="basis-[350px] shrink-0 pl-4 group">
                  <div className="flex flex-col h-full justify-between p-8 rounded-3xl bg-white border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                    <p className="text-[#200813]/85 font-medium leading-relaxed mb-8">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#C8F89B]/30 border border-[#1E6702]/10 flex items-center justify-center font-bold text-[#1E6702]">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#200813]">{t.name}</h4>
                        <p className="text-xs text-[#200813]/60">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── 6. Full-Width Footer (#07294A) ── */}
      <footer id="footer" className="w-full bg-[#07294A] text-[#FFFBE7] pt-12 md:pt-16 pb-12 relative overflow-hidden">

        {/* Subtle background ambient light */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[#1E6702]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-[400px] h-[250px] bg-[#C8F89B]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 relative z-10"
        >

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10 text-left">

            {/* 1. LEFT BRAND AREA (Span 4) */}
            <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
              <Link href="/" className="inline-block mb-5">
                <div className="bg-[#FFFBE7] px-4 py-2 rounded-xl inline-flex items-center shadow-sm border border-[#FFFBE7]/20 hover:bg-white transition-colors">
                  <img
                    src="/logo-2.png"
                    alt="VentureRoot"
                    className="h-9 md:h-11 w-auto object-contain mix-blend-multiply"
                  />
                </div>
              </Link>

              <p className="text-base font-medium text-[#FFFBE7] mb-2 leading-snug">
                Local intelligence for better business decisions.
              </p>
              <p className="text-xs text-[#9bb3cc] leading-relaxed max-w-sm mb-6">
                Helping entrepreneurs turn local opportunities into viable, informed ventures.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="Twitter / X"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="GitHub"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 2. NAVIGATION (Span 2) */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8F89B] mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs text-[#9bb3cc]">
                <li>
                  <Link href="/" className="hover:text-[#FFFBE7] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#FFFBE7] transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#insights" className="hover:text-[#FFFBE7] transition-colors">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-[#FFFBE7] transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. QUICK LINKS (Span 2) */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8F89B] mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5 text-xs text-[#9bb3cc]">
                <li>
                  <Link href="/register" className="hover:text-[#FFFBE7] transition-colors">
                    Analyze Your Business
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#FFFBE7] transition-colors">
                    Sample Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/subsidies" className="hover:text-[#FFFBE7] transition-colors">
                    Government Schemes
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/advisor" className="hover:text-[#FFFBE7] transition-colors">
                    AI Business Advisor
                  </Link>
                </li>
              </ul>
            </div>

            {/* 4. EXPLORE / SERVICES (Span 2) */}
            <div className="lg:col-span-2 flex flex-col items-start">
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8F89B] mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 text-xs text-[#9bb3cc]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#FFFBE7] transition-colors">
                    Business Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/financials" className="hover:text-[#FFFBE7] transition-colors">
                    Financial Planning
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/market" className="hover:text-[#FFFBE7] transition-colors">
                    Market Insights
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/subsidies" className="hover:text-[#FFFBE7] transition-colors">
                    Scheme Discovery
                  </Link>
                </li>
              </ul>
            </div>

            {/* 5. ACTION AREA (Span 2) */}
            <div className="lg:col-span-2 flex flex-col items-start justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8F89B] mb-4">
                  Take Action
                </h4>
                <p className="text-xs text-[#9bb3cc] leading-relaxed mb-4">
                  Ready to test the viability of your business idea?
                </p>
              </div>

              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FFFBE7] hover:bg-white text-[#07294A] font-bold text-xs tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>Start Your Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#07294A]" />
              </Link>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7e9bb9]">
            <div>
              &copy; 2026 VentureRoot. All rights reserved.
            </div>

            <div className="text-center sm:text-right flex items-center gap-4">
              <span className="hidden md:inline text-[#9bb3cc]/60">Built for local entrepreneurs.</span>
              <span className="hidden md:inline text-white/10">|</span>
              <div className="flex gap-3">
                <Link href="#" className="hover:text-[#FFFBE7] transition-colors">Privacy Policy</Link>
                <span>·</span>
                <Link href="#" className="hover:text-[#FFFBE7] transition-colors">Terms of Use</Link>
              </div>
            </div>
          </div>

        </motion.div>
      </footer>
    </div >
    </>
  );
}

// ── Reusable mini-components for the landing page ──

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg transition-all flex flex-col gap-4">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-secondary">{title}</h4>
        <p className="text-sm text-secondary-muted mt-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-4xl font-heading font-black text-slate-200">{number}</span>
      <h4 className="text-lg font-bold text-secondary">{title}</h4>
      <p className="text-sm text-secondary-muted">{desc}</p>
    </div>
  );
}
