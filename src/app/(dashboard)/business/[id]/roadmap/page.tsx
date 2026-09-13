"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import _MOCK_ACTION_ROADMAP from "@/data/roadmap.json";
import { RoadmapTimeline } from "@/features/roadmap/components/RoadmapTimeline";
import { Roadmap, ActionItem, RoadmapPhase } from "@/features/roadmap/types";
import {
  MapPin, Briefcase, ArrowLeft, FileText, CheckCircle2, Sparkles,
  Target, Compass, Calendar, ShieldAlert, IndianRupee, Layers, Check
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const MOCK_ACTION_ROADMAP = _MOCK_ACTION_ROADMAP as unknown as Roadmap;

// ── Sector Default Phases Fallback ───────────────────────────────────────────
function getDefaultSectorPhases(categoryName: string, locationStr: string): RoadmapPhase[] {
  const cat = (categoryName || "").toLowerCase();
  const isHealthcare = cat.includes("health") || cat.includes("hospital") || cat.includes("clinic") || cat.includes("medical");
  const isDairy = cat.includes("dairy") || cat.includes("milk");

  if (isHealthcare) {
    return [
      {
        phase: "Months 1–2",
        title: "Clinical Establishments Registration, Bio-Medical Waste NOC & Bank DPR",
        badge: "Foundation & Clearances",
        summary: `Formally establish the healthcare enterprise in ${locationStr}, submit Clinical Establishments Act Form-1 registration with the District Health Authority / CDMO, and execute SPCB Bio-Medical Waste contracts.`,
        actions: [
          `Submit Clinical Establishments Act application to Chief District Medical Officer (CDMO) with premises layout and doctor credentials.`,
          `Execute formal Bio-Medical Waste (BMW) management agreement with state SPCB-authorized common treatment facility vendor.`,
          `Obtain Fire Safety NOC from local fire authority and commercial establishment trade permit.`,
          `Engage chartered accountant to finalize Detailed Project Report (DPR) for priority sector term loan sanction.`
        ],
        financialTarget: "Deploy 10-15% promoter equity (₹2.5 Lakh) into escrow account. Obtain in-principle bank loan sanction for balance capex.",
        riskMitigation: "Statutory inspection delays: Pre-audit the facility layout against National Building Code (NBC) norms before CDMO inspection.",
        milestoneKpi: "Provisional Clinical Establishment Registration Certificate issued within 45 days."
      },
      {
        phase: "Months 3–4",
        title: "OT & Ward Infrastructure, Medical Gas Pipeline & Equipment Procurement",
        badge: "Clinical Infrastructure",
        summary: `Execute hospital interior partitioning, erect modular Minor Operation Theatre, install centralized oxygen and suction manifold pipelines, and procure verified diagnostic patient monitors.`,
        actions: [
          `Procure ICU/semi-fowler hospital beds, multipara patient monitors, anesthesia workstation, and autoclave sterilization units.`,
          `Install centralized medical gas pipeline system (MGPS) with automated manifold backup and oxygen cylinder bank.`,
          `Energize 25 HP commercial 3-phase industrial power connection with dedicated auto-start silent Diesel Generator (DG) set.`,
          `Disburse First Tranche of Bank Term Loan directly to medical equipment vendors against verified Delivery Challans.`
        ],
        financialTarget: "Disburse 60% of capital expenditure directly to medical equipment and civil infrastructure suppliers.",
        riskMitigation: "Equipment calibration delays: Contract OEMs with mandatory on-site testing, calibration certificate, and 24-month comprehensive AMC.",
        milestoneKpi: "15-20 inpatient beds, sterile Minor OT, and emergency triage unit fully erected and dry-tested."
      },
      {
        phase: "Months 5–6",
        title: "Medical Staffing, State Pharmacy License & Diagnostic Lab Commissioning",
        badge: "Staffing & Quality Protocols",
        summary: `Recruit Resident Medical Officers (RMOs), GNM nursing staff, and OT technicians; obtain State FDA retail pharmacy license; and commission the in-house automated diagnostic laboratory.`,
        actions: [
          `Recruit 2 full-time Resident Medical Officers (MBBS/BAMS), 6 registered GNM staff nurses, and 2 certified lab technicians for round-the-clock shift rotations.`,
          `Obtain 24x7 Retail Drug / Pharmacy License (Form 20/21) from State Food & Drug Administration (FDA) with a registered pharmacist.`,
          `Commission in-house basic diagnostic laboratory (fully automated biochemistry, hematology CBC analyzer, and urine analyzer).`,
          `Establish standard operating clinical protocols (ICU admission, infection control, crash cart checklist, biomedical segregation).`
        ],
        financialTarget: "Draw working capital line of ₹2.5 Lakh to procure essential emergency pharmaceuticals and initial staff payroll buffer.",
        riskMitigation: "Nursing and doctor attrition: Offer structured performance incentives on night-call duties and provide on-campus accommodation.",
        milestoneKpi: "Pharmacy license secured, 100% clinical staff onboarded, and successful clinical mock drill completed."
      },
      {
        phase: "Months 7–9",
        title: "Public Launch, Ayushman Bharat (PM-JAY) Empanelment & OPD Rollout",
        badge: "Go-To-Market & Revenue Ramp",
        summary: `Inaugurate 24x7 emergency and daily outpatient department (OPD), launch rural preventive health camps, initiate Ayushman Bharat PM-JAY empanelment, and commence monthly bank EMI repayments.`,
        actions: [
          `Launch daily morning and evening OPD consultations across General Medicine, Pediatrics, and Gynecology with transparent subsidized fees.`,
          `Submit online empanelment dossier under Ayushman Bharat (PM-JAY) and State Health Insurance Schemes to capture cashless beneficiaries.`,
          `Organize bi-weekly rural preventive health checkup camps in surrounding villages in collaboration with local Gram Panchayats.`,
          `Commence monthly bank EMI payments directly from operating revenues generated by pharmacy sales, OPD, and daycare admissions.`
        ],
        financialTarget: "Achieve daily average of 35-50 OPD consultations and generate monthly gross turnover exceeding ₹1,80,000.",
        riskMitigation: "Slow initial patient footfall: Partner with local general practitioners, community leaders, and rural cooperative societies for referral linkages.",
        milestoneKpi: "Active patient footfall reaching 40+ patients/day with positive operational cashflow sustained over 90 days."
      },
      {
        phase: "Months 10–12",
        title: "Inpatient Scaling (70% Occupancy), NABH Entry-Level Audit & Breakeven",
        badge: "Scale & Institutional Breakeven",
        summary: `Scale inpatient bed occupancy to sustainable breakeven threshold, complete National Accreditation Board for Hospitals (NABH) Entry-Level audit, and release government subsidy margin money.`,
        actions: [
          `Scale inpatient bed occupancy smoothly to 70–80% through routine minor surgical procedures, maternity deliveries, and medical stabilization.`,
          `Undergo formal assessment audit for NABH Entry-Level Hospital Certification, unlocking higher insurance reimbursement rates.`,
          `Submit DIC subsidy completion dossier and physical verification report to release PMEGP/MUDRA capital subsidy into Term Deposit Receipt (TDR).`,
          `Reinvest operational surplus into advanced diagnostic ultrasound and specialized visiting specialist OPD clinics.`
        ],
        financialTarget: "Achieve full operating breakeven with monthly gross billing exceeding ₹2,50,000 and debt-service coverage ratio (DSCR) exceeding 1.85x.",
        riskMitigation: "Insurance claim reimbursement delays: Implement dedicated TPA claims coordinator to ensure zero-deficiency claim submission within 48 hours.",
        milestoneKpi: "NABH Entry-Level accreditation awarded, 75% bed occupancy sustained, and net operating profitability achieved."
      }
    ];
  }

  // Agro & Food Processing default
  return [
    {
      phase: "Months 1–2",
      title: "Statutory Clearances, Bank DPR & PMEGP Credit Linkage",
      badge: "Foundation & Clearances",
      summary: `Establish the enterprise legal entity in ${locationStr}, secure Udyam MSME registration, finalize bank Detailed Project Report (DPR), and obtain provisional commercial trade clearances.`,
      actions: [
        `Complete Udyam MSME registration and secure Gram Panchayat commercial trade permit for site premises.`,
        `Engage certified CA to formulate bank DPR with 5-year projected debt-service coverage ratio (DSCR > 1.6x).`,
        `Submit credit subsidy application under PMEGP on KVIC e-portal to claim 25%–35% rural margin money grant.`,
        `Submit loan dossier to regional PSU/Rural Bank branch for formal term loan in-principle sanction.`
      ],
      financialTarget: "Deposit 10% promoter equity into escrow account. Obtain in-principle bank loan sanction for balance project cost.",
      riskMitigation: "Bank appraisal delay: Pre-verify collateral title documents and submit clear NOC from District Industries Center (DIC).",
      milestoneKpi: "Bank In-Principle Loan Sanction Letter issued within 45 days."
    },
    {
      phase: "Months 3–4",
      title: "Equipment Procurement, 3-Phase Power Utilities & Facility Setup",
      badge: "Infrastructure & Setup",
      summary: `Procure certified machinery from verified OEMs, install commercial 3-phase power load, and execute civil floor layout compliant with hygiene and pollution guidelines.`,
      actions: [
        `Issue Purchase Orders (PO) to shortlisted equipment OEMs with mandatory 12-month onsite warranty and commissioning terms.`,
        `Energize 15–25 HP commercial 3-phase power connection with state electricity distribution company (DISCOM).`,
        `Execute civil flooring, water storage, drainage, and waste management infrastructure compliant with SPCB green norms.`,
        `Draw down First Tranche of Bank Term Loan directly to machinery suppliers against Delivery Challans.`
      ],
      financialTarget: "Disburse 60% of capital expenditure to machinery and equipment suppliers.",
      riskMitigation: "Equipment delivery delay: Enforce a 10% performance hold-back payable only after successful onsite trial run.",
      milestoneKpi: "100% core processing machinery installed and dry-run tested on site."
    },
    {
      phase: "Months 5–6",
      title: "Raw Material Sourcing, Pilot Batch Run & Quality Certification",
      badge: "Validation & Standards",
      summary: `Contract local agrarian suppliers and FPOs, run pilot production test batches at 30% capacity, and obtain mandatory FSSAI food quality certifications.`,
      actions: [
        `Sign bilateral supply contracts with 15–25 local farmer groups or suppliers ensuring reliable input pricing.`,
        `Run controlled pilot production batches at 30% capacity to calibrate yield, wastage, and packaging integrity.`,
        `Send production samples to NABL-accredited laboratory for testing and obtain FSSAI State Manufacturing license.`,
        `Finalize consumer packaging with barcode, batch coding, and regulatory labeling.`
      ],
      financialTarget: "Deploy working capital buffer to fund initial 30 days of raw material inventory and labor.",
      riskMitigation: "Raw material quality inconsistency: Institute strict incoming batch testing protocols before accepting deliveries.",
      milestoneKpi: "Lab quality certification secured and zero-defect pilot production batch verified."
    },
    {
      phase: "Months 7–9",
      title: "Commercial Launch, Distribution Onboarding & Debt Servicing",
      badge: "Go-To-Market & Revenue",
      summary: `Officially roll out commercial operations, onboard retail and wholesale partners, and commence monthly bank EMI payments from operating cashflow.`,
      actions: [
        `Execute commercial rollout across direct retail and wholesale distribution networks with structured 7-day credit terms.`,
        `Onboard 30–50 retail partners in the district with point-of-sale branding and introductory trade margins.`,
        `Initiate monthly bank loan EMI repayments strictly from operational revenues.`,
        `Set up secondary distribution channel to nearby semi-urban towns to maintain steady weekly factory throughput.`
      ],
      financialTarget: "Achieve monthly turnover of ₹1,40,000+ and sustain debt-service coverage ratio (DSCR) above 1.75x.",
      riskMitigation: "Delayed payment cycles from retail partners: Enforce strict credit limits and offer a 2% cash discount for spot settlements.",
      milestoneKpi: "30+ active retail accounts onboarded and positive net operating cashflow achieved."
    },
    {
      phase: "Months 10–12",
      title: "Capacity Expansion (75%+), Capital Subsidy Release & Breakeven",
      badge: "Scale & Breakeven",
      summary: `Scale operations to 75%+ utilization, undergo District Industries Center (DIC) physical audit to release PMEGP capital subsidy grant, and reach full financial break-even.`,
      actions: [
        `Scale processing volume to 75–85% of rated machinery capacity to lower per-unit production overheads.`,
        `Host joint physical verification team from DIC and Financing Bank for PMEGP margin money inspection.`,
        `Release 25%–35% government capital subsidy into Term Deposit Receipt (TDR) to reduce loan principal.`,
        `Reinvest operating profit surplus into secondary product line expansion and automated vacuum packaging.`
      ],
      financialTarget: "Achieve full operating breakeven, sustain net profit margin above 22%, and lock in government subsidy grant.",
      riskMitigation: "Working capital stretch during harvest peak: Utilize bank cash credit (CC) limit rather than diverting operating profits.",
      milestoneKpi: "Breakeven achieved, capital subsidy released, and net positive profit sustained for 2 consecutive quarters."
    }
  ];
}

export default function ActionRoadmapPage() {
  const { t } = useTranslation();
  const params = useParams();
  const businessId = params.id as string;
  
  const [roadmap, setRoadmap] = useState<Roadmap>(MOCK_ACTION_ROADMAP);
  const [competitorInsights, setCompetitorInsights] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<"phases" | "tasks">("phases");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchRoadmap() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/businesses/${businessId}/roadmap`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data) {
            const rawPhases = json.data.phases || [];
            const bName = json.data.businessName || "Target Enterprise";
            const bLoc = json.data.location || "District Location";

            // If API phases empty, use rich sector-tailored phases
            const phases = rawPhases.length > 0
              ? rawPhases
              : getDefaultSectorPhases(bName, bLoc);

            setRoadmap({
              id: json.data.id || `roadmap-${businessId}`,
              businessId: json.data.businessId || businessId,
              businessName: bName,
              location: bLoc,
              actions: json.data.actions || MOCK_ACTION_ROADMAP.actions,
              phases,
            });

            if (json.data.competitorInsights) {
              setCompetitorInsights(json.data.competitorInsights);
            }
          }
        } else {
          // Fallback using default sector phases
          if (isMounted) {
            setRoadmap({
              ...MOCK_ACTION_ROADMAP,
              phases: getDefaultSectorPhases(MOCK_ACTION_ROADMAP.businessName, MOCK_ACTION_ROADMAP.location || "District"),
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic roadmap, using fallback:", err);
        if (isMounted) {
          setRoadmap({
            ...MOCK_ACTION_ROADMAP,
            phases: getDefaultSectorPhases(MOCK_ACTION_ROADMAP.businessName, MOCK_ACTION_ROADMAP.location || "District"),
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (businessId) {
      fetchRoadmap();
    }
    return () => {
      isMounted = false;
    };
  }, [businessId]);

  // Calculate stats
  const totalActions = roadmap.actions?.length || 0;
  const completedActions = roadmap.actions?.filter((a) => a.status === "COMPLETED").length || 0;
  const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 25;
  const phases = roadmap.phases || getDefaultSectorPhases(roadmap.businessName, roadmap.location || "District");

  return (
    <div className="w-full min-h-screen bg-[#f4fce8] max-w-full overflow-x-hidden">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col py-4 sm:py-8 px-3.5 sm:px-6 md:px-10 lg:px-14 min-w-0">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link 
            href={`/business/${businessId}`}
            className="inline-flex items-center gap-2 font-sans text-xs sm:text-[14px] font-medium text-secondary-muted hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {t("finance.backToBusiness") || "Back to Business Details"}
          </Link>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href={`/reports/${businessId}`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#301608] text-white font-medium rounded-xl hover:bg-[#301608]/90 transition-colors shadow-xs font-sans text-xs sm:text-[13px]"
            >
              <FileText className="w-4 h-4 text-[#f9fadc] shrink-0" />
              View DPR Report
            </Link>
            <Link
              href={`/business/${businessId}/feasibility`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 text-secondary font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-xs font-sans text-xs sm:text-[13px]"
            >
              <Compass className="w-4 h-4 text-slate-500 shrink-0" />
              {t("roadmap.viewReport") || "Feasibility Analysis"}
            </Link>
          </div>
        </div>

        {/* Header Context */}
        <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 relative z-10">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-bold mb-2 sm:mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Sector-Specific 12-Month Execution Roadmap</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-[32px] md:text-[36px] font-bold text-[#301608] leading-tight mb-2 break-words">
                {t("roadmap.title") || "Enterprise Action Roadmap"}
              </h1>
              <p className="font-sans text-xs sm:text-[15px] text-secondary-muted max-w-2xl break-words">
                Statutory clearances, machinery procurement, bank loan drawdowns, and revenue milestones engineered for your specific business.
              </p>
              
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 mt-4 sm:mt-5 font-sans text-xs sm:text-[14px] font-medium text-secondary">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 min-w-0">
                  <Briefcase className="w-4 h-4 text-[#1E6702] shrink-0" />
                  <span className="font-bold text-slate-800 truncate">{roadmap.businessName || "My Business Venture"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 min-w-0">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{roadmap.location || "Catchment Area"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 w-full md:w-auto md:min-w-[220px] shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-sans text-xs sm:text-[13px] font-bold text-secondary">{t("roadmap.progress") || "Execution Progress"}</span>
              </div>
              <div className="font-sans text-2xl sm:text-[28px] font-bold text-[#1E6702] mb-2">
                {progressPercent}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-[#1E6702] h-2 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <p className="font-sans text-[11px] sm:text-[12px] text-secondary-muted mt-2">
                {completedActions} of {totalActions} foundation milestones completed
              </p>
            </div>
          </div>
        </div>

        {/* Competitor Insights & Strategic Guidance Banner */}
        {competitorInsights && (
          <div className="bg-white border border-emerald-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm sm:text-base border-b border-emerald-100 pb-3">
              <Target className="w-5 h-5 text-[#1E6702] shrink-0" />
              <span>Strategic Competitor Analysis & Market Differentiation Suggestions</span>
            </div>

            {competitorInsights.marketGap && (
              <div className="p-3 sm:p-4 bg-emerald-50/60 rounded-xl sm:rounded-2xl border border-emerald-100 text-xs leading-relaxed text-emerald-950 break-words">
                <strong className="block text-emerald-900 font-bold mb-1">Observed Local Market Gap:</strong>
                {competitorInsights.marketGap}
              </div>
            )}

            {Array.isArray(competitorInsights.differentiationStrategy) && competitorInsights.differentiationStrategy.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Recommended Business Differentiation Strategies:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {competitorInsights.differentiationStrategy.map((strat: string, idx: number) => (
                    <div key={idx} className="p-3 sm:p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-800 flex items-start gap-2.5 break-words">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{strat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {competitorInsights.pricingTactics && (
              <div className="p-3 sm:p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 break-words">
                <Compass className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Competitive Pricing Recommendation: </strong>
                  <span>{competitorInsights.pricingTactics}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROADMAP VIEW TOGGLE TABS ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="grid grid-cols-2 p-1 sm:p-1.5 bg-slate-200/80 rounded-xl sm:rounded-2xl border border-slate-300/60 shadow-inner w-full sm:w-auto max-w-full">
            <button
              onClick={() => setActiveView("phases")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-sans text-xs sm:text-[13px] font-bold transition-all text-center leading-tight ${
                activeView === "phases"
                  ? "bg-white text-[#1E6702] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">12-Month Phases ({phases.length})</span>
            </button>
            <button
              onClick={() => setActiveView("tasks")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-sans text-xs sm:text-[13px] font-bold transition-all text-center leading-tight ${
                activeView === "tasks"
                  ? "bg-white text-[#1E6702] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Task Checklist ({totalActions})</span>
            </button>
          </div>
          <span className="font-sans text-[12px] text-slate-500 font-medium hidden sm:inline">
            Showing sector-authentic milestones for <strong className="text-gray-900">{roadmap.businessName}</strong>
          </span>
        </div>

        {/* ── VIEW 1: 12-MONTH 5-PHASE STRATEGIC EXECUTION ─────────── */}
        {activeView === "phases" && (
          <div className="space-y-6">
            {phases.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Phase Number Watermark */}
                <div className="absolute top-4 right-6 font-sans text-[64px] font-extrabold text-slate-100 select-none pointer-events-none">
                  0{idx + 1}
                </div>

                <div className="relative z-10">
                  {/* Badge & Timeline */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-extrabold rounded-lg uppercase tracking-wide">
                      {p.phase}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wide border border-slate-200">
                      {p.badge}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="font-heading text-[20px] sm:text-[22px] font-bold text-gray-950 mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="font-sans text-[14px] text-slate-600 leading-relaxed max-w-4xl mb-6">
                    {p.summary}
                  </p>

                  {/* Concrete Action Steps */}
                  <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Statutory & Operational Deliverables:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {p.actions.map((act, aIdx) => (
                        <div key={aIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phase Targets & KPIs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1">
                        <IndianRupee className="w-3.5 h-3.5" /> Financial Target
                      </span>
                      <p className="text-xs text-emerald-950 font-medium leading-snug">{p.financialTarget}</p>
                    </div>

                    <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Risk & Mitigation
                      </span>
                      <p className="text-xs text-amber-950 font-medium leading-snug">{p.riskMitigation}</p>
                    </div>

                    <div className="bg-cyan-50/50 p-3.5 rounded-xl border border-cyan-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5 mb-1">
                        <Target className="w-3.5 h-3.5" /> Milestone KPI
                      </span>
                      <p className="text-xs text-cyan-950 font-medium leading-snug">{p.milestoneKpi}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── VIEW 2: ACTIONABLE STEP-BY-STEP CHECKLIST ─────────────── */}
        {activeView === "tasks" && (
          <RoadmapTimeline actions={roadmap.actions} />
        )}
      </div>
    </div>
  );
}
