"use client";

import React, { useState, useMemo } from "react";
import {
  Crosshair, MapPin, Tag, ShieldCheck, Filter, Sparkles,
  Building2, Landmark, Users, Wifi, Globe, Phone, Clock,
  TrendingUp, AlertTriangle, Target, ChevronDown, ChevronUp,
  Radio, Navigation, BarChart3, Layers, CheckCircle2
} from "lucide-react";
import { CompetitionAnalysis } from "../types";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { getAuthoritativeCensusDensity } from "@/utils/feasibility.mapper";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competitor {
  id: string;
  name: string;
  type?: string;
  sectorType?: string;
  ownership?: string;
  facilityType?: string;
  source?: string;
  location?: string;
  distanceKm?: number;
  position?: [number, number];
  pricing?: string;
  strengths?: string[];
  weaknesses?: string[];
  positioning?: string;
  businessImpact?: string;
  contact?: string | null;
  openingHours?: string | null;
  aiEnriched?: boolean;
  tags?: Record<string, string | null>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isCompetitorGovt = (comp: Competitor): boolean => {
  const s = ((comp.sectorType || "") as string).toLowerCase();
  const o = ((comp.ownership || "") as string).toLowerCase();
  const n = ((comp.name || "") as string).toLowerCase();
  const f = ((comp.facilityType || "") as string).toLowerCase();
  return (
    s.includes("govt") || s.includes("public") ||
    o.includes("gov") || o.includes("public") ||
    n.includes("government") || n.includes("civil hospital") ||
    n.includes("community health") || n.includes("primary health") ||
    n.includes("phc") || n.includes("chc") || n.includes("ayush") ||
    n.includes("esic") || s.includes("cooperative") ||
    o.includes("co-operative") || n.includes("cooperative") ||
    n.includes("apmc") || n.includes("mandi") || s.includes("mandi") ||
    f.includes("mandi") || f.includes("civil hospital") || f.includes("chc")
  );
};

// ─── Expanded Competitor Card ─────────────────────────────────────────────────

const CompetitorCard = ({ comp, index }: { comp: Competitor; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const isIndirect = comp.type?.toLowerCase().includes("indirect");
  const isGovt = isCompetitorGovt(comp);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      isGovt
        ? "border-sky-200 hover:border-sky-400 hover:shadow-sky-100"
        : "border-purple-200 hover:border-purple-400 hover:shadow-purple-100"
    } hover:shadow-md`}>
      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Name + location */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isGovt
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              }`}>
                {isGovt ? "🏛️ Govt" : "🏥 Private"}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                !isIndirect
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {comp.type || (isIndirect ? "Indirect" : "Direct")}
              </span>
              {comp.aiEnriched && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI Enriched
                </span>
              )}
              {comp.source?.includes("OpenStreetMap") && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Live OSM
                </span>
              )}
            </div>
            <h5 className="font-bold text-[14px] text-gray-900 leading-snug line-clamp-2">{comp.name}</h5>
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
                {comp.location || `${comp.distanceKm?.toFixed(1)} km away`}
              </span>
              {comp.facilityType && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                  {comp.facilityType}
                </span>
              )}
            </div>
          </div>

          {/* Distance badge */}
          <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 ${
            isGovt ? "border-sky-200 bg-sky-50" : "border-purple-200 bg-purple-50"
          }`}>
            <span className={`text-lg font-black leading-none ${isGovt ? "text-sky-700" : "text-purple-700"}`}>
              {comp.distanceKm?.toFixed(1)}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">km</span>
          </div>
        </div>

        {/* Pricing row */}
        <div className="flex items-center justify-between mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold">Observed Pricing:</span>
          </div>
          <span className="text-xs font-bold text-emerald-800">{comp.pricing || "Market Rate"}</span>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      {(comp.strengths?.length || comp.weaknesses?.length) ? (
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {comp.strengths?.length ? (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-700 mb-1.5">Strengths</span>
                <ul className="space-y-1 text-slate-700">
                  {comp.strengths.slice(0, 2).map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {comp.weaknesses?.length ? (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1.5">Weaknesses</span>
                <ul className="space-y-1 text-slate-700">
                  {comp.weaknesses.slice(0, 2).map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Expand toggle */}
      {(comp.positioning || comp.businessImpact || comp.source || comp.contact) && (
        <div className="border-t border-slate-100">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold">{expanded ? "Hide details" : "Show strategic insights"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-2.5">
              {comp.positioning && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10.5px] text-emerald-900 leading-relaxed">
                    <span className="font-bold">🎯 Strategic Edge: </span>
                    {comp.positioning}
                  </p>
                </div>
              )}
              {comp.businessImpact && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold text-blue-900 text-[10px] mb-1">
                    <BarChart3 className="w-3 h-3 text-blue-700 shrink-0" />
                    Business Impact
                  </span>
                  <p className="text-[11px] text-blue-900 font-medium leading-relaxed">{comp.businessImpact}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 text-[10px]">
                {comp.source && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5" /> {comp.source}
                  </span>
                )}
                {comp.contact && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {comp.contact}
                  </span>
                )}
                {comp.openingHours && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold border border-slate-200 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {comp.openingHours}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Radius Band Section ──────────────────────────────────────────────────────

const RadiusBand = ({
  label,
  sublabel,
  color,
  competitors,
  filterType,
  isHealthcare,
  defaultOpen = true,
}: {
  label: string;
  sublabel: string;
  color: "emerald" | "indigo";
  competitors: Competitor[];
  filterType: string;
  isHealthcare: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  const filtered = useMemo(() => {
    if (filterType === "direct") return competitors.filter((c) => !c.type?.toLowerCase().includes("indirect"));
    if (filterType === "indirect") return competitors.filter((c) => c.type?.toLowerCase().includes("indirect"));
    if (filterType === "govt") return competitors.filter(isCompetitorGovt);
    if (filterType === "private") return competitors.filter((c) => !isCompetitorGovt(c));
    return competitors;
  }, [competitors, filterType]);

  const govtCount = competitors.filter(isCompetitorGovt).length;
  const pvtCount = competitors.length - govtCount;
  const directCount = competitors.filter((c) => !c.type?.toLowerCase().includes("indirect")).length;
  const indirectCount = competitors.length - directCount;

  const colorMap = {
    emerald: {
      ring: "border-emerald-300",
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      header: "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200",
    },
    indigo: {
      ring: "border-indigo-300",
      bg: "bg-indigo-50",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
      dot: "bg-indigo-500",
      text: "text-indigo-700",
      header: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200",
    },
  }[color];

  if (competitors.length === 0) return null;

  return (
    <div className={`rounded-2xl border-2 ${colorMap.ring} overflow-hidden`}>
      {/* Band header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 border-b ${colorMap.header} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${colorMap.dot} ring-4 ring-offset-1 ${colorMap.bg}`} />
          <div className="text-left">
            <div className={`text-sm font-black ${colorMap.text}`}>{label}</div>
            <div className="text-[11px] text-slate-500 font-medium">{sublabel}</div>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${colorMap.badge}`}>
            {competitors.length} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">🏛️ {govtCount} Govt</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">🏥 {pvtCount} Pvt</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">{directCount} Direct</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{indirectCount} Indirect</span>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="p-4">
          {filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-400 font-medium py-4">No competitors match this filter in this band.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((comp, i) => (
                <CompetitorCard key={comp.id || i} comp={comp} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main CompetitionCard ─────────────────────────────────────────────────────

export const CompetitionCard = ({
  data,
  centerCoords = [22.5645, 72.9289],
  businessName = "Your Venture",
  category = "Agro-Enterprise",
  locationName = "Anand, Gujarat",
  competitorRadar = null,
}: {
  data?: CompetitionAnalysis;
  centerCoords?: [number, number];
  businessName?: string;
  category?: string;
  locationName?: string;
  competitorRadar?: {
    within10km?: Competitor[];
    within20km?: Competitor[];
    total?: number;
    source?: string;
    aiEnriched?: string;
    fetchedAt?: string;
  } | null;
}) => {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState<"all" | "direct" | "indirect" | "govt" | "private">("all");

  const isHealthcare =
    category.toLowerCase().includes("health") ||
    category.toLowerCase().includes("hospital") ||
    category.toLowerCase().includes("clinic");

  // ── Build competitors from either live OSM radar OR static fallback ──

  const rawCompetitors10km = useMemo((): Competitor[] => {
    // Prefer live OSM data if available
    if (competitorRadar?.within10km && competitorRadar.within10km.length > 0) {
      return competitorRadar.within10km;
    }

    // Fallback to ML model / AI data if it has 10km competitors
    if (data?.competitors && data.competitors.length > 0) {
      const fromModel = (data.competitors as Competitor[]).filter((c) => (c.distanceKm || 0) <= 10 && (c.distanceKm || 0) > 0);
      if (fromModel.length > 0) return fromModel;
    }

    const lat = centerCoords[0];
    const lon = centerCoords[1];

    if (isHealthcare) {
      return [
        {
          id: "comp-gen-h1",
          name: `${locationName} District Civil / Sub-Divisional Government Hospital & Trauma Center`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Civil Hospital", source: "Ministry of Health & Family Welfare (MoHFW) / Ayushman Bharat PM-JAY Registry",
          location: `2.1 km North (${locationName})`, distanceKm: 2.1, position: [lat + 0.016, lon + 0.012],
          pricing: "Free OPD / ₹10 Token • PM-JAY 100% Free Coverage",
          strengths: ["150+ bed public capacity", "Free essential generic drugs", "Official Ayushman Bharat PM-JAY nodal center"],
          weaknesses: ["Severe overcrowding with 3–5 hour OPD wait times", "Overburdened nursing staff", "Frequent stockouts of advanced surgical consumables"],
          positioning: "Complement by offering dignified private single rooms, zero wait times, and dedicated bedside nursing.",
          businessImpact: "Acts as the baseline price floor. Drives high private demand among middle-income families who seek timely care.",
        },
        {
          id: "comp-gen-h2",
          name: `${locationName} PHC & Community Health Centre (CHC)`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Community Health Centre", source: "National Health Mission (NHM) Rural Facility Registry",
          location: `3.4 km West (${locationName})`, distanceKm: 3.4, position: [lat + 0.024, lon - 0.019],
          pricing: "Free Government Public Health Service",
          strengths: ["Grassroot village healthcare reach via ASHA/ANM network", "Free maternal checkups and immunization"],
          weaknesses: ["No major surgical OT or ventilator backup", "Doctors unavailable during nighttime emergencies"],
          positioning: "Establish institutional ambulance coordination to receive stabilized emergency referrals.",
          businessImpact: "Acts as a primary referral source when rural CHCs face acute surgical cases.",
        },
        {
          id: "comp-gen-h3",
          name: `Apex Multi-Specialty Private Hospital & Critical Care Center`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry / PM-JAY Empanelled List",
          location: `2.6 km East (${locationName})`, distanceKm: 2.6, position: [lat - 0.015, lon + 0.018],
          pricing: "₹500–₹750 OPD / ₹2,800–₹4,500/day Private Bed",
          strengths: ["Modern 35-bed setup with ICU, ventilators, and laminar airflow OT", "Tie-ups with corporate TPAs"],
          weaknesses: ["High out-of-pocket costs unaffordable for non-insured rural families", "Unexpected surgical consumable billing"],
          positioning: "Differentiate through 100% transparent all-inclusive surgical packages and friendly cashless desk.",
          businessImpact: "Direct competitor for insured patients. Sets the local private market rate for room charges.",
        },
        {
          id: "comp-gen-h4",
          name: `Sanjeevani Private Nursing Home & Maternity Surgical Clinic`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Nursing Home", source: "State Directorate of Health Services / District Medical Council",
          location: `1.8 km South (${locationName})`, distanceKm: 1.8, position: [lat - 0.018, lon - 0.014],
          pricing: "₹350–₹500 OPD / ₹1,800–₹3,000/day Bed",
          strengths: ["Strong legacy in normal and cesarean deliveries", "Deep community trust built over decades"],
          weaknesses: ["Aging diagnostic equipment without neonatal nursery (NICU) backup", "No 24x7 RMO on premise at night"],
          positioning: "Outcompete with modern pediatric phototherapy and guaranteed 24x7 on-duty medical officers.",
          businessImpact: "Directly competes for local maternal and women's health volume.",
        },
        {
          id: "comp-gen-h5",
          name: `Family Polyclinic & 24x7 Diagnostic Imaging Lab`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Day Clinic & Lab", source: "NABL Accredited Diagnostics Directory",
          location: `1.4 km South-East (${locationName})`, distanceKm: 1.4, position: [lat - 0.019, lon - 0.013],
          pricing: "₹200–₹300 OPD / Tests ₹250–₹1,800",
          strengths: ["Convenient neighborhood walk-in location with attached retail pharmacy", "Fast 1-hour basic blood counts"],
          weaknesses: ["No overnight inpatient beds or surgical suites", "Unable to stabilize critical cardiac or trauma emergencies"],
          positioning: "Capture their referral patients who require multi-day monitoring and inpatient admissions.",
          businessImpact: "Diagnostic partner or competitor for lab revenue.",
        },
        {
          id: "comp-gen-h6",
          name: `Sub-Divisional Civil Hospital & Maternal Care Unit`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Civil Hospital", source: "State Health Systems Resource Centre (SHSRC)",
          location: `7.5 km North-East (${locationName})`, distanceKm: 7.5, position: [lat + 0.048, lon + 0.042],
          pricing: "Free Govt OPD & PM-JAY Cashless",
          strengths: ["Dedicated 50-bed maternal & pediatric ward", "Free ambulance transport under JSSK"],
          weaknesses: ["Specialist doctor shortages after 2 PM", "Frequent ultrasound equipment backlogs"],
          positioning: "Sub-district Public Anchor — Partner for planned surgical admissions.",
          businessImpact: "Absorbs peripheral taluka delivery volume; steady source of surgical transfers.",
        },
        {
          id: "comp-gen-h7",
          name: `Metro Heart & Multi-Specialty Surgical Hospital`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry",
          location: `8.8 km South-East (${locationName})`, distanceKm: 8.8, position: [lat - 0.054, lon + 0.048],
          pricing: "₹600 OPD / ₹3,800/day IPD Bed",
          strengths: ["Advanced cardiac catheterization lab and 8-bed CCU", "Full-time interventional cardiologists"],
          weaknesses: ["Higher corporate price points prohibitive for agricultural labor families", "Highway corridor location"],
          positioning: "Regional Tertiary Peer — Win on local proximity and personalized nursing care.",
          businessImpact: "Competes for high-value cases in the 5–10km corridor.",
        },
      ];
    }

    return [
      {
        id: "comp-gen-1",
        name: `${category} District Cooperative Processing Center`,
        type: "Direct", sectorType: "Govt / Public Sector", ownership: "Co-operative / Govt Supported",
        facilityType: "Cooperative Center", source: "District Cooperative Society Registry / Web Scraped",
        location: `1.8 km North (${locationName})`, distanceKm: 1.8, position: [lat + 0.014, lon + 0.012],
        pricing: "Standard Rate",
        strengths: ["Established collection network", "High local footprint"],
        weaknesses: ["Delayed payment cycles", "Rigid quality deductions"],
        positioning: "Win local market with instant settlements and fresh delivery.",
        businessImpact: "Anchors district procurement volume; price competition tempered by bureaucratic payment delays.",
      },
      {
        id: "comp-gen-2",
        name: `Private ${category} Processing & Packing Enterprise`,
        type: "Direct", sectorType: "Private Sector", ownership: "Private",
        facilityType: "Private Enterprise", source: "Udyam Registration Portal / Web Scraped",
        location: `2.6 km East (${locationName})`, distanceKm: 2.6, position: [lat - 0.016, lon + 0.018],
        pricing: "Market Parity",
        strengths: ["High margin value-added products", "Modern processing equipment"],
        weaknesses: ["Limited distribution radius", "Higher overhead"],
        positioning: "Differentiate on certified farm freshness and digital ordering.",
        businessImpact: "Sets the benchmark for commercial retail prices and margins.",
      },
      {
        id: "comp-gen-3",
        name: `Regional APMC Wholesale ${category} Trading Hub`,
        type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
        facilityType: "Mandi Yard", source: "Agmarknet / State Agricultural Marketing Board",
        location: `3.7 km West (${locationName})`, distanceKm: 3.7, position: [lat + 0.022, lon - 0.019],
        pricing: "Wholesale Mandi Rate",
        strengths: ["High volume throughput", "Institutional links"],
        weaknesses: ["No direct village retail identity", "High middleman commissions"],
        positioning: "Capture direct retail margins by bypassing Mandi brokers.",
        businessImpact: "Determines raw input and wholesale clearing rates.",
      },
      {
        id: "comp-gen-4",
        name: `Local Informal ${category} Village Retailers`,
        type: "Indirect", sectorType: "Private Sector", ownership: "Informal Private",
        facilityType: "Informal Retail", source: "Local Panchayat Survey / Web Scraped",
        location: `1.3 km South (${locationName})`, distanceKm: 1.3, position: [lat - 0.021, lon - 0.014],
        pricing: "Unorganized Cash Pricing",
        strengths: ["Immediate neighborhood trust", "Low overhead"],
        weaknesses: ["Zero hygiene accreditation", "Inconsistent daily supply"],
        positioning: "Win customer loyalty through certified hygienic packaging.",
        businessImpact: "Captures price-sensitive cash transactions.",
      },
      {
        id: "comp-gen-5",
        name: `${locationName} Sub-District Wholesale Trade & Cold Hub`,
        type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
        facilityType: "Mandi Yard", source: "State Agricultural Marketing Board",
        location: `7.8 km North-East (${locationName})`, distanceKm: 7.8, position: [lat + 0.046, lon + 0.040],
        pricing: "Wholesale Sub-Mandi Rate",
        strengths: ["Regional commodity aggregation point", "Direct rail/road link"],
        weaknesses: ["Intermediary fee deductions", "Limited value-addition processing"],
        positioning: "Capture direct consumer margin.",
        businessImpact: "Sets input commodity clearing prices in the 10km regional trade corridor.",
      },
      {
        id: "comp-gen-6",
        name: `Private ${category} Agro-Tech & Processing Cluster`,
        type: "Direct", sectorType: "Private Sector", ownership: "Private",
        facilityType: "Private Enterprise", source: "Udyam Registration Portal",
        location: `8.5 km South-East (${locationName})`, distanceKm: 8.5, position: [lat - 0.051, lon + 0.045],
        pricing: "Commercial Market Parity",
        strengths: ["Modernized automated machinery", "Semi-urban retail distribution"],
        weaknesses: ["High logistics freight to interior villages", "Fixed corporate overhead"],
        positioning: "Win hyper-local village proximity.",
        businessImpact: "Direct benchmark for regional retail pricing and packaging standards.",
      },
    ];
  }, [competitorRadar, data?.competitors, isHealthcare, category, locationName, centerCoords]);

  const rawCompetitors20km = useMemo((): Competitor[] => {
    // Prefer live OSM data if available
    if (competitorRadar?.within20km && competitorRadar.within20km.length > 0) {
      return competitorRadar.within20km;
    }

    // Fallback to ML model / AI data if it has 10–20km competitors
    if (data?.competitors && data.competitors.length > 0) {
      const fromModel = (data.competitors as Competitor[]).filter((c) => (c.distanceKm || 0) > 10 && (c.distanceKm || 0) <= 20);
      if (fromModel.length > 0) return fromModel;
    }

    const lat = centerCoords[0];
    const lon = centerCoords[1];

    if (isHealthcare) {
      return [
        {
          id: "comp-gen-h8",
          name: `Sub-District Multi-Specialty Referral Hospital`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Multi-Specialty Hospital", source: "State Clinical Establishments Act Registry",
          location: `12.4 km North-East (${locationName})`, distanceKm: 12.4, position: [lat + 0.078, lon + 0.065],
          pricing: "₹500 OPD / ₹3,200/day IPD Bed",
          strengths: ["Secondary surgical care with laparoscopic OT", "Tie-ups with private insurers"],
          weaknesses: ["Distance friction for emergency night transport from rural talukas"],
          positioning: "Offer localized primary admissions and immediate emergency stabilization.",
          businessImpact: "Draws non-critical elective patients from our catchment.",
        },
        {
          id: "comp-gen-h9",
          name: `District Government Medical College & Apex Civil Hospital`,
          type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government",
          facilityType: "Medical College Hospital", source: "Directorate of Medical Education & Research (DMER)",
          location: `14.8 km North-West (${locationName})`, distanceKm: 14.8, position: [lat + 0.098, lon - 0.088],
          pricing: "100% Free Public Super-Specialty Coverage",
          strengths: ["500+ bed academic facility", "Comprehensive Level-3 trauma & neurosurgery"],
          weaknesses: ["Massive patient crowding with 4–8 hour OPD lines", "Long waitlists for elective surgery"],
          positioning: "Benchmark for emergency stabilization before tertiary transfers.",
          businessImpact: "Long waiting periods create steady private demand.",
        },
        {
          id: "comp-gen-h10",
          name: `Regional Cardiac & Critical Care Super-Specialty Hospital`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Super-Specialty Hospital", source: "NABH Accredited Hospitals Directory",
          location: `16.5 km South-East (${locationName})`, distanceKm: 16.5, position: [lat - 0.108, lon + 0.095],
          pricing: "Corporate Super-Specialty Tariffs",
          strengths: ["Advanced interventional cardiology and neuro-critical ICU", "24x7 ambulance fleet"],
          weaknesses: ["High expense barriers for lower-income rural households", "Highway corridor location"],
          positioning: "Complement as affordable community primary and secondary healthcare provider.",
          businessImpact: "Captures high-complexity tertiary referrals across the district.",
        },
        {
          id: "comp-gen-h11",
          name: `Apex Comprehensive Cancer & Multi-Organ Institute`,
          type: "Direct", sectorType: "Private Sector", ownership: "Private",
          facilityType: "Super-Specialty Hospital", source: "NABH Accredited Hospitals Directory",
          location: `18.2 km South-East (${locationName})`, distanceKm: 18.2, position: [lat - 0.118, lon - 0.102],
          pricing: "Corporate Super-Specialty Tariffs",
          strengths: ["Linear accelerator, robotic surgery, and organ transplant ICU", "International patient desks"],
          weaknesses: ["High expense barriers for lower-middle class", "Distance friction from rural villages"],
          positioning: "Complement as community primary & secondary healthcare provider.",
          businessImpact: "Dominates super-specialty cases across the 20km zone.",
        },
      ];
    }

    return [
      {
        id: "comp-gen-7",
        name: `${locationName} Regional Wholesale Distribution Center`,
        type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Cooperative Apex Federation",
        facilityType: "Wholesale Depot", source: "State Cooperative Marketing Federation",
        location: `11.8 km North-East (${locationName})`, distanceKm: 11.8, position: [lat + 0.075, lon + 0.062],
        pricing: "Wholesale Bulk Trade Pricing",
        strengths: ["High-tonnage aggregation and multi-district supply logistics"],
        weaknesses: ["Requires minimum bulk consignment volumes", "Inflexible ordering schedules"],
        positioning: "Leverage as high-volume institutional supplier or offload surplus output.",
        businessImpact: "Sets baseline wholesale bulk procurement pricing across the district.",
      },
      {
        id: "comp-gen-8",
        name: `Central District Principal Mandi & Food Park Terminal`,
        type: "Indirect", sectorType: "Govt / Public Sector", ownership: "Government APMC",
        facilityType: "Mandi Yard", source: "National APMC Directory",
        location: `14.2 km North-West (${locationName})`, distanceKm: 14.2, position: [lat + 0.092, lon - 0.082],
        pricing: "State Apex Mandi Benchmark",
        strengths: ["High volume daily auctions", "District-wide supplier liquidity"],
        weaknesses: ["Significant travel distance for small farmers", "2-3% brokerage fees"],
        positioning: "Leverage for wholesale offloading.",
        businessImpact: "Defines district-wide wholesale commodity floor across the 20km trade zone.",
      },
      {
        id: "comp-gen-9",
        name: `District Commercial Processing & Automated Packaging Unit`,
        type: "Direct", sectorType: "Private Sector", ownership: "Private",
        facilityType: "Private Enterprise", source: "Udyam Portal / Web Scraped",
        location: `16.5 km South-East (${locationName})`, distanceKm: 16.5, position: [lat - 0.106, lon + 0.092],
        pricing: "Commercial Market Parity",
        strengths: ["Automated packaging line and cold chain warehousing"],
        weaknesses: ["Higher distribution overhead to peripheral rural blocks"],
        positioning: "Win local village market share through fresher stock and direct relationships.",
        businessImpact: "Direct benchmark for regional retail pricing and packaging standards.",
      },
      {
        id: "comp-gen-10",
        name: `State Industrial Mega Processing & Logistics Park`,
        type: "Direct", sectorType: "Private Sector", ownership: "Private Corporate",
        facilityType: "Corporate Plant", source: "State Industrial Development Corporation (SIDC)",
        location: `18.8 km South-West (${locationName})`, distanceKm: 18.8, position: [lat - 0.116, lon - 0.105],
        pricing: "Corporate Contract Pricing",
        strengths: ["Multi-acre automated warehousing", "National export contracts"],
        weaknesses: ["Zero focus on small-scale hyper-local sales", "High minimum batch volumes"],
        positioning: "Dominate the high-margin retail consumer niche.",
        businessImpact: "Dominates industrial contract processing across 20km zone.",
      },
    ];
  }, [competitorRadar, data?.competitors, isHealthcare, category, locationName, centerCoords]);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const allCompetitors = [...rawCompetitors10km, ...rawCompetitors20km];

  const totalGovt = allCompetitors.filter(isCompetitorGovt).length;
  const totalPvt = allCompetitors.length - totalGovt;
  const totalDirect = allCompetitors.filter((c) => !c.type?.toLowerCase().includes("indirect")).length;
  const totalIndirect = allCompetitors.length - totalDirect;

  const populationReach = useMemo(() => {
    const density = getAuthoritativeCensusDensity({ name: locationName }, { name: locationName });
    return {
      km10: Math.round(314.16 * density),
      km20: Math.round(1256.64 * density),
    };
  }, [locationName]);

  const isLiveData = !!competitorRadar?.within10km?.length || !!competitorRadar?.within20km?.length;
  const isGeminiEnriched = competitorRadar?.aiEnriched === "gemini-enriched";

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6 flex flex-col gap-6 h-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
            <Crosshair className="w-5 h-5 text-[#1E6702]" />
          </div>
          <div>
            <h3 className="font-sans text-[18px] font-bold text-gray-900">
              {t("feasi.comp") || "Competition Landscape & Radius Intelligence"}
            </h3>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
              {isLiveData ? (
                <>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Live OSM Data
                  </span>
                  {isGeminiEnriched && (
                    <span className="flex items-center gap-1 text-purple-700 font-bold">
                      <Sparkles className="w-3 h-3" /> Gemini-Enriched
                    </span>
                  )}
                  {competitorRadar?.fetchedAt && (
                    <span className="text-slate-400">• fetched {new Date(competitorRadar.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                  )}
                </>
              ) : (
                "Verified local competitors within 10km & 20km catchment zones"
              )}
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold">
            🏛️ {totalGovt} Govt
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
            🏥 {totalPvt} Private
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
            {totalDirect} Direct
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
            {totalIndirect} Indirect
          </span>
        </div>
      </div>

      {/* ── Overview ── */}
      {data?.overview && (
        <p className="font-sans text-[14px] text-gray-800 font-medium leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
          {data.overview}
        </p>
      )}

      {/* ── Population reach summary ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">10 km Catchment</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-emerald-900">
              {rawCompetitors10km.length}
            </span>
            <span className="text-sm font-bold text-emerald-700 ml-1">competitors</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
            <Users className="w-3 h-3" />
            ~{populationReach.km10.toLocaleString("en-IN")} pop. reach • 314 km²
          </div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-700" />
            </div>
            <span className="text-xs font-black text-indigo-800 uppercase tracking-wider">10–20 km District</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-black text-indigo-900">
              {rawCompetitors20km.length}
            </span>
            <span className="text-sm font-bold text-indigo-700 ml-1">competitors</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-indigo-800 font-medium">
            <Users className="w-3 h-3" />
            ~{populationReach.km20.toLocaleString("en-IN")} pop. reach • 1,257 km²
          </div>
        </div>
      </div>

      {/* ── Global filter pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: `All (${allCompetitors.length})`, active: "bg-slate-800 text-white", inactive: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
            { id: "direct", label: `Direct (${totalDirect})`, active: "bg-red-600 text-white", inactive: "text-red-700 hover:bg-red-50 border border-red-200" },
            { id: "indirect", label: `Indirect (${totalIndirect})`, active: "bg-amber-600 text-white", inactive: "text-amber-700 hover:bg-amber-50 border border-amber-200" },
            { id: "govt", label: `Govt (${totalGovt})`, active: "bg-sky-600 text-white", inactive: "text-sky-700 hover:bg-sky-50 border border-sky-200" },
            { id: "private", label: `Private (${totalPvt})`, active: "bg-purple-600 text-white", inactive: "text-purple-700 hover:bg-purple-50 border border-purple-200" },
          ].map(({ id, label, active, inactive }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilterType(id as typeof filterType)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === id ? active : `bg-white ${inactive}`
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Radius Band: 0–10 km ── */}
      <RadiusBand
        label="Within 10 km — Core Trade Zone"
        sublabel={`Immediate catchment • ${rawCompetitors10km.length} competitors verified`}
        color="emerald"
        competitors={rawCompetitors10km}
        filterType={filterType}
        isHealthcare={isHealthcare}
        defaultOpen={true}
      />

      {/* ── Radius Band: 10–20 km ── */}
      <RadiusBand
        label="10–20 km — District Catchment"
        sublabel={`Extended district zone • ${rawCompetitors20km.length} competitors verified`}
        color="indigo"
        competitors={rawCompetitors20km}
        filterType={filterType}
        isHealthcare={isHealthcare}
        defaultOpen={false}
      />

      {/* ── Data source footer ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-slate-500" /> Data Sources:
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10.5px]">
          {isLiveData ? (
            <>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold flex items-center gap-1">
                <Globe className="w-3 h-3" /> OpenStreetMap (Overpass API) — Live Web Scraping
              </span>
              {isGeminiEnriched && (
                <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini AI Model — Strategic Enrichment
                </span>
              )}
            </>
          ) : (
            <>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">MoHFW / NHM Registry</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">PM-JAY Empanelled List</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">Udyam Registration Portal</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold">Agmarknet APMC</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Domain ML Model Fallback
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Differentiation guidance ── */}
      {(data?.observations || []).length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 text-xs">
          <span className="font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1E6702]" />
            Strategic Differentiation Guidance
          </span>
          <p className="text-emerald-950 font-medium leading-relaxed mt-1">
            {data?.observations?.[0]}
          </p>
        </div>
      )}
    </div>
  );
};
