"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Map, 
  Factory, 
  PenTool, 
  LayoutGrid, 
  AlertCircle, 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  AlertTriangle,
  Edit2, 
  ArrowLeft, 
  Box, 
  Activity, 
  ChevronRight, 
  Check, 
  X,
  ShieldAlert
} from "lucide-react";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { BentoCard } from "@/components/layout/BentoCard";
import { EditorialAreaChart, EditorialDonutChart } from "@/components/ui/charts";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useUIStore } from "@/stores/useUIStore";
import { LocationIntelligenceMap } from "@/features/location/components/LocationIntelligenceMap";
import { useAuthStore } from "@/stores/useAuthStore";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";

export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  status: "Draft" | "Analyzing" | "Ready";
  location: {
    state: string;
    district: string;
    block?: string;
    village?: string;
  };
  capital: {
    availableMargin: number;
    workingCapital?: number;
    expectedInvestment?: number;
  };
  operations: {
    expectedRevenue: number;
    expectedPrice?: number;
    productionQuantity?: number;
  };
  resources: {
    land?: string;
    equipment?: string;
    existingResources?: string;
  };
}

import { useBusinessDetails } from "@/lib/data/businesses";
import { useParams } from "next/navigation";

export const BusinessDetailsView = () => {
  const params = useParams();
  const id = params?.id as string || "123";
  const { data: fetchedBusiness, isLoading } = useBusinessDetails(id);
  const [isEditing, setIsEditing] = useState(false);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);

  useEffect(() => {
    if (fetchedBusiness) {
      setBusiness(fetchedBusiness);
    }
  }, [fetchedBusiness]);
  const { t } = useTranslation();

  // State for toggling evidence view in simple mode
  const [showEvidence, setShowEvidence] = useState(false);

  const handleSave = () => {
    console.log("Mock save business edit:", business);
    setIsEditing(false);
  };

  if (!business) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      {/* ── 1. Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-muted hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> {t("business.back")}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-heading font-bold text-secondary">{business.name}</h1>
            <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full border border-green-200">
              {business.status}
            </span>
          </div>
          <p className="text-secondary-muted font-medium flex items-center gap-2">
            {business.category} {business.subcategory && <span className="text-slate-300">•</span>} {business.subcategory}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" /> {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-light rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" /> {t("common.save")}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" /> {t("business.edit")}
            </button>
          )}
        </div>
      </div>


      <BentoGrid>
        {/* ── 2. Business Overview & 7. Input Summary Grouping ── */}
        <BentoCard className="col-span-12 md:col-span-7">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Factory className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">{t("business.overview")}</h3>
          </div>
          
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.desc")}</p>
              {isEditing ? (
                <textarea 
                  value={business.description}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, description: e.target.value }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary min-h-[80px]"
                />
              ) : (
                <p className="text-secondary leading-relaxed">{business.description || t("business.noDesc")}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-secondary-muted font-medium text-xs uppercase tracking-wider mb-1">{t("business.category")}</p>
                <p className="font-medium text-secondary">{business.category}</p>
              </div>
              <div>
                <p className="text-secondary-muted font-medium text-xs uppercase tracking-wider mb-1">{t("business.subcategory")}</p>
                <p className="font-medium text-secondary">{business.subcategory || "N/A"}</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* ── 6. Business Location Summary ── */}
        <BentoCard className="col-span-12 md:col-span-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-orange-600">
            <MapPin className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">{t("business.location")}</h3>
          </div>
          
          <div className="flex flex-col gap-3 flex-1 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-muted font-medium">{t("business.state")}</span>
              <span className="font-semibold text-secondary">{business.location.state}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-muted font-medium">{t("business.district")}</span>
              <span className="font-semibold text-secondary">{business.location.district}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-muted font-medium">{t("business.block")}</span>
              <span className={`font-semibold ${business.location.block ? "text-secondary" : "text-slate-400 italic"}`}>
                {business.location.block || t("business.notProvided")}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-muted font-medium">{t("business.villageLoc")}</span>
              <span className={`font-semibold ${business.location.village ? "text-secondary" : "text-slate-400 italic"}`}>
                {business.location.village || t("business.unknownLoc")}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link 
              href={`/business/${business.id}/feasibility`}
              className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors group text-orange-800"
            >
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                <span className="font-semibold text-sm">{t("business.map")}</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </BentoCard>

        {/* ── 3. Capital & Investment ── */}
        <BentoCard className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2 mb-4 text-green-600">
            <Wallet className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">{t("business.capital")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">
                {t("business.simple.equity")}
              </p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={business.capital.availableMargin}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, capital: { ...p.capital, availableMargin: Number(e.target.value) } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="text-lg font-bold text-secondary" suppressHydrationWarning>₹{business.capital.availableMargin.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">
                {t("business.simple.investment")}
              </p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={business.capital.expectedInvestment || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, capital: { ...p.capital, expectedInvestment: Number(e.target.value) } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                  placeholder="Optional"
                />
              ) : (
                <p className="font-semibold text-secondary" suppressHydrationWarning>{business.capital.expectedInvestment ? `₹${business.capital.expectedInvestment.toLocaleString('en-IN')}` : t("business.notSpec")}</p>
              )}
            </div>

          </div>
        </BentoCard>

        {/* ── 4. Expected Business Parameters ── */}
        <BentoCard className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2 mb-4 text-purple-600">
            <Activity className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">{t("business.expectedParams")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">
                {t("business.simple.revenue")}
              </p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={business.operations.expectedRevenue}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, operations: { ...p.operations, expectedRevenue: Number(e.target.value) } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="text-lg font-bold text-secondary" suppressHydrationWarning>₹{business.operations.expectedRevenue.toLocaleString('en-IN')}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.targetPrice")}</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={business.operations.expectedPrice || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, operations: { ...p.operations, expectedPrice: Number(e.target.value) } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-semibold text-secondary">{business.operations.expectedPrice ? `₹${business.operations.expectedPrice.toLocaleString('en-IN')}` : t("business.notSpec")}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.prod")}</p>
              {isEditing ? (
                <input 
                  type="number" 
                  value={business.operations.productionQuantity || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, operations: { ...p.operations, productionQuantity: Number(e.target.value) } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-semibold text-secondary">{business.operations.productionQuantity || t("business.notSpec")}</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* ── 5. Resources & Capabilities ── */}
        <BentoCard className="col-span-12 md:col-span-4">
          <div className="flex items-center gap-2 mb-4 text-teal-600">
            <Box className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">{t("business.resources")}</h3>
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.land")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={business.resources.land || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, resources: { ...p.resources, land: e.target.value } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-semibold text-secondary">{business.resources.land || t("business.notSpec")}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.equip")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={business.resources.equipment || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, resources: { ...p.resources, equipment: e.target.value } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-semibold text-secondary">{business.resources.equipment || t("business.notSpec")}</p>
              )}
            </div>
            <div>
              <p className="text-secondary-muted font-medium mb-1">{t("business.otherRes")}</p>
              {isEditing ? (
                <input 
                  type="text" 
                  value={business.resources.existingResources || ""}
                  onChange={(e) => setBusiness(p => p ? ({ ...p, resources: { ...p.resources, existingResources: e.target.value } }) : null)}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-primary"
                />
              ) : (
                <p className="font-semibold text-secondary">{business.resources.existingResources || t("business.notSpec")}</p>
              )}
            </div>
          </div>
        </BentoCard>

        {/* ── 6. Financial Visualizations ── */}
        <BentoCard className="col-span-12 md:col-span-8 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">Revenue Trends</h3>
          </div>
          <div className="flex-1 w-full h-[220px]">
            <EditorialAreaChart 
              data={[
                { month: 'M1', revenue: 10000 },
                { month: 'M2', revenue: 15000 },
                { month: 'M3', revenue: 18000 },
                { month: 'M4', revenue: 25000 },
                { month: 'M5', revenue: 32000 },
                { month: 'M6', revenue: 45000 },
              ]}
              xKey="month"
              yKey="revenue"
            />
          </div>
        </BentoCard>

        <BentoCard className="col-span-12 md:col-span-4 flex flex-col min-h-[300px]">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Box className="w-5 h-5" />
            <h3 className="font-semibold text-secondary">Cost Breakdown</h3>
          </div>
          <div className="flex-1 w-full h-[220px]">
            <EditorialDonutChart 
              data={[
                { name: 'Equipment', value: 450000 },
                { name: 'Raw Material', value: 150000 },
                { name: 'Labor', value: 100000 },
                { name: 'Marketing', value: 50000 },
                { name: 'Licenses', value: 50000 },
              ]}
              nameKey="name"
              valueKey="value"
            />
          </div>
        </BentoCard>
      </BentoGrid>
      <div className="flex justify-end mt-2">
        <MockDisclaimer text="Currently showing mock data • Business profile API integration pending" />
      </div>

      {/* ── 9. Next Analysis Actions ── */}
      <div className="mt-8">
        <h2 className="text-lg font-heading font-bold text-secondary mb-4 border-b border-slate-200 pb-2">{t("business.analysis")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link 
            href={`/business/${business.id}/feasibility`}
            className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-secondary mb-1">{t("business.feasiMarket")}</h4>
            <p className="text-sm text-secondary-muted">{t("business.feasiDesc")}</p>
          </Link>
          
          <Link 
            href={`/business/${business.id}/finance`}
            className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-secondary mb-1">{t("business.finPlan")}</h4>
            <p className="text-sm text-secondary-muted">{t("business.finDesc")}</p>
          </Link>

          <Link 
            href={`/business/compare`}
            className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 hover:shadow-md hover:border-purple-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-secondary mb-1">Compare Ideas</h4>
            <p className="text-sm text-secondary-muted">Side-by-side analysis of multiple businesses</p>
          </Link>

          <Link 
            href={`/reports`}
            className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <Box className="w-5 h-5 text-slate-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-secondary mb-1">Business Reports</h4>
            <p className="text-sm text-secondary-muted">View bank-ready generated reports</p>
          </Link>

          <Link 
            href={`/business/${business.id}/roadmap`}
            className="flex flex-col p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:shadow-md hover:border-amber-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-secondary mb-1">Action Roadmap</h4>
            <p className="text-sm text-secondary-muted">Step-by-step launch plan and tasks</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
