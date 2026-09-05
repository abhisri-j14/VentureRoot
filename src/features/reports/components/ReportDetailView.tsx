"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Report } from "../types";
import { 
  ArrowLeft, Download, Printer, Loader2, AlertTriangle, 
  CheckCircle, Info, FileText, Target, MapPin, Users,
  Shield, Landmark, TrendingUp, HandCoins, ListChecks, 
  Briefcase, Database, Lightbulb, AlertOctagon, XCircle,
  Check
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { reportApi } from "../api/reportApi";
import businessesData from "@/data/businesses.json";

interface ReportDetailViewProps {
  report: Report;
}

// ── Sidebar Navigation Item ───────────────────────────────────────────────
const NavItem = ({ 
  number, 
  title, 
  isActive, 
  onClick 
}: { 
  number: number; 
  title: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 py-3 px-4 rounded-xl transition-all duration-300 text-left ${
      isActive ? "bg-[#1E6702]/5 text-[#1E6702]" : "hover:bg-gray-50 text-gray-500 hover:text-gray-900"
    }`}
  >
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
      isActive ? "bg-[#1E6702] text-white shadow-md shadow-[#1E6702]/20" : "bg-gray-100 text-gray-400"
    }`}>
      {number}
    </div>
    <span className={`text-[13px] font-semibold tracking-wide ${isActive ? "text-[#1E6702]" : ""}`}>
      {title}
    </span>
  </button>
);

// ── Section heading ───────────────────────────────────────────────────────
const SectionHeading = ({ number, title, icon: Icon }: { number: number; title: string; icon: any }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-xl bg-[#1E6702]/10 flex items-center justify-center text-[#1E6702]">
      <Icon className="w-5 h-5" />
    </div>
    <h2 className="text-2xl font-serif font-bold text-gray-900">
      {number}. {title}
    </h2>
  </div>
);

export const ReportDetailView = ({ report }: ReportDetailViewProps) => {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState(1);

  // Data mapping
  const fd = report.feasibilityData as any;
  const capital = businessesData.details.capital;
  const operations = businessesData.details.operations;

  // Scroll spy logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id^='section-']");
      let currentActive = 1;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3 && rect.bottom >= 0) {
          const id = section.id.replace("section-", "");
          currentActive = parseInt(id, 10);
        }
      });
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: number) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await reportApi.download(report.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VentureRoot_Report_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Backend request failed or offline. Cannot download report.");
      alert("Report download is currently unavailable (Backend offline).");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!fd) {
    return (
      <div className="w-full max-w-4xl mx-auto pb-12">
        <div className="mb-6">
          <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E6702] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Info className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h2>
          <p className="text-gray-500">No detailed analysis data is available for this report yet.</p>
        </div>
      </div>
    );
  }

  const opp = fd.opportunity || {};
  const comp = fd.competition || {};
  const swot = fd.swot || {};
  const risks = fd.risks || [];
  const pricing = fd.pricing || {};
  const market = fd.market || {};
  const primaryRisk = risks[0];

  const SECTIONS = [
    { id: 1, title: "Business Overview", icon: Briefcase },
    { id: 2, title: "Market & Positioning", icon: MapPin },
    { id: 3, title: "SWOT & Key Risks", icon: Shield },
    { id: 4, title: "Financial Outlook", icon: Landmark },
    { id: 5, title: "Action Plan & Verdict", icon: Target },
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 lg:px-6 py-6 pb-20 print:max-w-none print:px-0">
      
      {/* ── ACTION BAR ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 print:hidden">
        <Link href="/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E6702] hover:underline transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1.5 bg-green-100 text-green-800 text-[11px] font-bold uppercase tracking-wider rounded-lg mr-2">
            Status: {report.status}
          </span>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm"
          >
            <Printer className="w-4 h-4 text-gray-500" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1E6702] text-white font-semibold rounded-xl hover:bg-[#155201] transition-all shadow-md shadow-[#1E6702]/20 text-sm disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ── SIDEBAR ──────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-6 print:hidden">
          <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1 px-2">Report Navigation</h3>
            <p className="text-[12px] text-gray-500 mb-4 px-2">Quick jump to sections</p>
            
            <div className="relative flex flex-col gap-1">
              <div className="absolute left-[1.125rem] top-4 bottom-4 w-[2px] bg-gray-100 -z-10" />
              {SECTIONS.map((s) => (
                <NavItem 
                  key={s.id} 
                  number={s.id} 
                  title={s.title} 
                  isActive={activeSection === s.id} 
                  onClick={() => scrollTo(s.id)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT CANVAS ──────────────────────────────────── */}
        <main className="flex-1 w-full bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-0 print:rounded-none">
          
          {/* HEADER BANNER - Reduced Size & White Text */}
          <div className="relative bg-[#1E6702] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2a8706] via-[#1E6702] to-[#124201] px-6 py-8 sm:px-10 sm:py-10 text-white overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {report.type}
                </span>
                <span className="text-[12px] text-white/70 font-mono">ID: {report.id}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2 leading-tight">
                {report.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[13px] text-white/90">
                <span className="font-semibold">Prepared for {report.businessName}</span>
                <span className="flex items-center gap-1.5 opacity-80"><MapPin className="w-3.5 h-3.5" /> {report.location}</span>
                <span className="opacity-80 flex items-center gap-1.5" suppressHydrationWarning>
                  <FileText className="w-3.5 h-3.5" /> 
                  {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* SECTIONS BODY - Merged & Condensed */}
          <div className="p-6 sm:p-10 flex flex-col gap-10">
            
            {/* 1. BUSINESS OVERVIEW (Merged Snapshot & Exec Summary) */}
            <section id="section-1" className="scroll-mt-6">
              <SectionHeading number={1} title="Business Overview" icon={Briefcase} />
              
              <div className="flex flex-col xl:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <p className="text-[18px] text-gray-800 font-medium leading-relaxed mb-4">
                    {opp.summary || "No summary available."}
                  </p>
                  <p className="text-[15px] text-gray-600 leading-relaxed">
                    {comp.why?.summary || ""} {opp.why?.summary || ""}
                  </p>
                </div>
                
                {/* Snapshot Grid */}
                <div className="w-full xl:w-[400px] bg-blue-50/50 rounded-2xl border border-blue-100 p-5 shrink-0 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-blue-800/60 font-bold uppercase tracking-wider mb-1">Market Segment</p>
                    <p className="text-[15px] font-bold text-blue-900">{pricing.marketValue || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-800/60 font-bold uppercase tracking-wider mb-1">Confidence</p>
                    <p className="text-[15px] font-bold text-blue-900">{market.confidence?.score || 0}%</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-blue-100">
                    <p className="text-[11px] text-blue-800/60 font-bold uppercase tracking-wider mb-1">Key Concept</p>
                    <p className="text-[14px] font-medium text-blue-900 italic">"A clear opportunity to bring better services to the community."</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-t-2 border-black" />

            {/* 2. MARKET & POSITIONING (Merged Market & Competition) */}
            <section id="section-2" className="scroll-mt-6">
              <SectionHeading number={2} title="Market & Positioning" icon={MapPin} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Market Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[15px] font-bold text-indigo-900 mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" /> What we found
                    </h3>
                    <p className="text-[15px] text-gray-700 leading-relaxed pl-4 border-l-2 border-indigo-100">{opp.demandOpportunity}</p>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-rose-900 mb-1 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> What's missing locally
                    </h3>
                    <p className="text-[15px] text-gray-700 leading-relaxed pl-4 border-l-2 border-rose-100">{opp.unmetNeed}</p>
                  </div>
                </div>

                {/* Competition Details */}
                <div className="bg-purple-50/50 rounded-2xl border border-purple-100 p-5">
                  <h3 className="text-[14px] font-bold uppercase tracking-wider text-purple-900 mb-2 border-b border-purple-200/50 pb-2">Landscape & Advantage</h3>
                  <p className="text-[14px] text-gray-700 leading-relaxed mb-3"><span className="font-semibold text-purple-900">Current:</span> {comp.overview}</p>
                  <p className="text-[14px] text-gray-700 leading-relaxed"><span className="font-semibold text-purple-900">Advantage:</span> {opp.localBusinessOpportunity}</p>
                  
                  {comp.observations && comp.observations.length > 0 && (
                     <div className="mt-4 p-3 bg-white rounded-xl border border-purple-100 shadow-sm flex items-start gap-3">
                       <Target className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                       <p className="text-[13px] text-gray-700"><span className="font-bold text-gray-900">Key Insight:</span> {comp.observations[0]}</p>
                     </div>
                  )}
                </div>
              </div>
            </section>

            <hr className="border-t-2 border-black" />

            {/* 3. SWOT & KEY RISKS (Merged) */}
            <section id="section-3" className="scroll-mt-6">
              <SectionHeading number={3} title="SWOT & Key Risks" icon={Shield} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SWOT Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                    <p className="text-[13px] font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Strengths</p>
                    <ul className="space-y-2">{(swot.strengths || []).slice(0, 2).map((s: string, i: number) => <li key={i} className="text-[14px] text-gray-700 leading-snug">• {s}</li>)}</ul>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                    <p className="text-[13px] font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><AlertOctagon className="w-4 h-4" /> Challenges</p>
                    <ul className="space-y-2">{(swot.weaknesses || []).slice(0, 2).map((w: string, i: number) => <li key={i} className="text-[14px] text-gray-700 leading-snug">• {w}</li>)}</ul>
                  </div>
                  <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-5">
                    <p className="text-[13px] font-bold text-cyan-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Opportunities</p>
                    <ul className="space-y-2">{(swot.opportunities || []).slice(0, 2).map((o: string, i: number) => <li key={i} className="text-[14px] text-gray-700 leading-snug">• {o}</li>)}</ul>
                  </div>
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                    <p className="text-[13px] font-bold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Threats</p>
                    <ul className="space-y-2">{(swot.threats || []).slice(0, 2).map((t: string, i: number) => <li key={i} className="text-[14px] text-gray-700 leading-snug">• {t}</li>)}</ul>
                  </div>
                </div>

                {/* Primary Risk */}
                {primaryRisk && (
                  <div className="bg-red-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><AlertTriangle className="w-32 h-32" /></div>
                    <h4 className="text-[12px] font-bold text-red-200 uppercase tracking-wider mb-2">Critical Risk</h4>
                    <p className="text-[18px] font-bold mb-2 leading-tight">{primaryRisk.title}</p>
                    <p className="text-[14px] text-red-100 mb-4 font-light leading-relaxed">{primaryRisk.explanation}</p>
                    <div className="bg-white/10 rounded-xl p-3 border border-white/20 mt-auto">
                      <p className="text-[11px] text-red-200 uppercase font-bold tracking-wider mb-1">Mitigation</p>
                      <p className="text-[13px] font-medium leading-snug">{primaryRisk.mitigationAdvisory}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <hr className="border-t-2 border-black" />

            {/* 4. FINANCIAL OUTLOOK (Merged Money, Earnings, Funding) */}
            <section id="section-4" className="scroll-mt-6">
              <SectionHeading number={4} title="Financial Outlook" icon={Landmark} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Capital & Revenue Summary */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Capital Requirements</p>
                    <div className="flex justify-between items-center mb-2"><span className="text-[14px] text-gray-600">To Start</span><span className="text-[16px] font-bold text-gray-900">₹{(capital.expectedInvestment / 100000).toFixed(1)}L</span></div>
                    <div className="flex justify-between items-center mb-2"><span className="text-[14px] text-gray-600">Margin/Savings</span><span className="text-[16px] font-bold text-gray-900">₹{(capital.availableMargin / 100000).toFixed(1)}L</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200"><span className="text-[14px] font-bold text-gray-900">Funding Gap</span><span className="text-[18px] font-bold text-orange-600">₹{((capital.expectedInvestment - capital.availableMargin) / 100000).toFixed(1)}L</span></div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-3">Revenue Potential</p>
                    <div className="flex justify-between items-center mb-2"><span className="text-[14px] text-gray-600">Selling Price</span><span className="text-[15px] font-bold text-gray-900">₹{pricing.expectedLocalPrice}/u</span></div>
                    <div className="flex justify-between items-center mb-2"><span className="text-[14px] text-gray-600">Market Range</span><span className="text-[15px] font-bold text-gray-900">₹{pricing.priceRange?.min}-{pricing.priceRange?.max}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200"><span className="text-[14px] font-bold text-gray-900">Exp. Monthly</span><span className="text-[18px] font-bold text-green-600">₹{(operations.expectedRevenue / 1000).toFixed(0)}K</span></div>
                  </div>
                </div>

                {/* Funding Options */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5">
                  <h4 className="text-[14px] font-bold text-orange-900 flex items-center gap-2 mb-4"><HandCoins className="w-5 h-5 text-orange-600" /> Funding Options</h4>
                  <div className="space-y-4">
                    <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                      <p className="text-[13px] font-bold text-gray-900 mb-1">SCA / Govt Loan</p>
                      <p className="text-[12px] text-gray-600 leading-snug">Target up to 90% financing through subsidized state programs.</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                      <p className="text-[13px] font-bold text-gray-900 mb-1">Mudra / PMEGP</p>
                      <p className="text-[12px] text-gray-600 leading-snug">Ideal for investments under ₹10L with partial grants.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-t border-gray-100" />

            {/* 5. ACTION PLAN & VERDICT (Merged Next Steps, Recommendation, Evidence) */}
            <section id="section-5" className="scroll-mt-6">
              <SectionHeading number={5} title="Action Plan & Verdict" icon={Target} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Action Steps */}
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Immediate Next Steps</h3>
                  <div className="space-y-3">
                    {[
                      { title: "Secure Supply Chain", desc: primaryRisk?.mitigationAdvisory },
                      { title: "Consult Local Bank", desc: "Carry this report. Ask about SCA and Mudra schemes." },
                      { title: "Test the Market", desc: comp.observations?.[0] }
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="w-6 h-6 rounded-full bg-[#1E6702] text-white flex items-center justify-center text-[12px] font-bold shrink-0">{idx + 1}</div>
                        <div>
                          <p className="text-[14px] font-bold text-gray-900">{step.title}</p>
                          <p className="text-[13px] text-gray-600 mt-0.5">{step.desc || "Analyze local gaps before committing fully."}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Verdict & Evidence */}
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-[#1E6702] to-[#124201] text-white rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-center">
                    <h3 className="text-[16px] font-bold mb-2">Final Recommendation</h3>
                    <p className="text-[18px] font-serif font-bold text-[#a8e063] mb-2 leading-tight">
                      {swot.why?.summary || "Favorable local conditions."}
                    </p>
                    <p className="text-[14px] text-white/80 leading-relaxed font-light">
                      {opp.summary}
                    </p>
                  </div>
                  
                  {/* Compact Data Confidence */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-wrap gap-2 text-[11px]">
                    <span className="font-bold text-gray-500 uppercase w-full mb-1">Data Confidence Scores</span>
                    {[
                      { l: "Market", c: market.confidence?.score },
                      { l: "Opportunity", c: opp.confidence?.score },
                      { l: "Comp.", c: comp.confidence?.score },
                      { l: "SWOT", c: swot.confidence?.score }
                    ].map((d, idx) => (
                      <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-700 font-medium shadow-sm">
                        {d.l}: <span className="font-bold text-gray-900">{d.c || 0}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
          </div>
        </main>

      </div>
    </div>
  );
};
