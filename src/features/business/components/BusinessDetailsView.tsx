"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Map, Activity, ArrowRight, TrendingUp, ChevronRight, Check,
  ShieldAlert, FileText, Compass, IndianRupee, Layers, BarChart2
} from "lucide-react";
import { EditorialAreaChart, EditorialDonutChart } from "@/components/ui/charts";
import { useBusinessDetails } from "@/lib/data/businesses";
import { useParams } from "next/navigation";
import { DashboardBackground } from "@/components/layout/DashboardBackground";

export interface BusinessDetails {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  status: "Draft" | "Analyzing" | "Ready";
  location: { state: string; district: string; block?: string; village?: string; };
  capital: { availableMargin: number; workingCapital?: number; expectedInvestment?: number; };
  operations: { expectedRevenue: number; expectedPrice?: number; productionQuantity?: number; };
  resources: { land?: string; equipment?: string; existingResources?: string; };
}

const compactCurrencyFormatter = (value: any) => {
  if (typeof value !== 'number') return value;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

export const BusinessDetailsView = () => {
  const params = useParams();
  const id = params?.id as string || "";
  const { data: fetchedBusiness, isLoading } = useBusinessDetails(id);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);

  useEffect(() => {
    if (fetchedBusiness) {
      const normalized: BusinessDetails = {
        ...fetchedBusiness,
        id: fetchedBusiness.id,
        name: fetchedBusiness.name || "Business Venture",
        category: (fetchedBusiness.category as any)?.name || fetchedBusiness.category || "General Enterprise",
        description: fetchedBusiness.description || "Enterprise details and feasibility analysis.",
        status: (fetchedBusiness.status as any) || "Draft",
        location: fetchedBusiness.location || { state: "Local", district: "Region" },
        capital: {
          availableMargin: fetchedBusiness.capital?.availableMargin ?? Number((fetchedBusiness as any).availableMargin) ?? 0,
          workingCapital: fetchedBusiness.capital?.workingCapital ?? Math.round((Number((fetchedBusiness as any).availableMargin) || 0) * 0.4),
          expectedInvestment: fetchedBusiness.capital?.expectedInvestment ?? Number((fetchedBusiness as any).availableMargin) ?? 0,
        },
        operations: {
          expectedRevenue: fetchedBusiness.operations?.expectedRevenue ?? Number((fetchedBusiness as any).expectedRevenue) ?? 0,
          expectedPrice: fetchedBusiness.operations?.expectedPrice ?? 50,
          productionQuantity: fetchedBusiness.operations?.productionQuantity ?? 1000,
        },
        resources: {
          existingResources: fetchedBusiness.resources?.existingResources ?? (fetchedBusiness as any).existingResources ?? "Facilities & equipment",
        },
      };
      setBusiness(normalized);
    }
  }, [fetchedBusiness]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-sm text-slate-500 font-medium">Loading venture details...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[450px]">
        <div className="max-w-md w-full bg-[#fffff5] rounded-2xl border border-gray-900/10 p-8 shadow-lg text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1E6702]/10 flex items-center justify-center text-[#1E6702]">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-[22px] font-bold text-slate-900">Venture Not Found</h2>
          <p className="font-sans text-sm text-slate-500">
            This venture plan could not be found or you haven't created a business plan yet.
          </p>
          <Link
            href="/business/create"
            className="mt-2 px-6 py-3 bg-[#1E6702] hover:bg-[#164e01] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          >
            Create New Venture
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 relative z-10">

      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* HEADER */}
        <div className="flex flex-col gap-2 w-full text-[#402a03] mb-4">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#402a03]/70">
            {business.category} • {business.subcategory || 'DAIRY FARMING'}
          </span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <h1 className="font-heading text-[24px] sm:text-[32px] font-bold text-[#402a03] tracking-tight leading-tight">
                {business.name}
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-[#402a03]/10 font-sans text-[12px] font-bold text-[#402a03] flex items-center gap-1.5 shadow-sm border border-[#402a03]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#402a03] animate-pulse"></div> {business.status}
              </span>
            </div>
          </div>
          <p className="font-sans text-[14px] text-[#402a03]/80 font-medium mt-0.5">
            {business.description || "A small-scale commercial dairy farm focusing on high-yield buffalo milk production for local cooperative supply."}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-2">

          {/* LEFT: BUSINESS SNAPSHOT */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Business Snapshot <span className="text-black mx-1">•</span> Key operational parameters
              </h2>
              <span className="font-sans text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">Live Model</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Capital Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-orange-50 text-orange-600"><IndianRupee className="w-4 h-4" /></div>
                    <span className="font-heading text-[20px] font-bold text-slate-800 tracking-tight">Capital</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-wider">FUNDED</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Available equity</span>
                      <span className="font-sans text-[12px] font-bold text-orange-600">Self-funded</span>
                    </div>
                    <span className="font-sans text-[24px] font-bold text-slate-900 tracking-tight">₹{business.capital.availableMargin?.toLocaleString('en-IN') || "1,50,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Expected investment</span>
                      <span className="font-sans text-[14px] font-bold text-slate-800 tracking-tight">₹{business.capital.expectedInvestment?.toLocaleString('en-IN') || "8,00,000"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-sans text-[11px] text-slate-400 font-medium">18.75% covered</span>
                      <span className="font-sans text-[11px] text-slate-400 font-medium">₹6.5L debt gap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operations Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#402a03]"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-[#402a03]/10 text-[#402a03]"><Activity className="w-4 h-4" /></div>
                    <span className="font-heading text-[20px] font-bold text-slate-800 tracking-tight">Operations</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-[#402a03] bg-[#402a03]/10 px-2 py-0.5 rounded border border-[#402a03]/20 tracking-wider">+12% baseline</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Target monthly revenue</span>
                    </div>
                    <span className="font-sans text-[24px] font-bold text-slate-900 tracking-tight">₹{business.operations.expectedRevenue?.toLocaleString('en-IN') || "45,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Production volume</span>
                    </div>
                    <span className="font-sans text-[14px] font-bold text-slate-800">{business.operations.productionQuantity || "30"} units / day</span>
                    <span className="font-sans text-[12px] text-slate-400 font-medium block mt-1">Buffalo milk (approx. 30 litres/day)</span>
                  </div>
                </div>
              </div>

              {/* Resources Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-50 text-blue-600"><Layers className="w-4 h-4" /></div>
                    <span className="font-heading text-[20px] font-bold text-slate-800 tracking-tight">Resources</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 tracking-wider">VERIFIED</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Land</span>
                      <span className="font-sans text-[12px] font-bold text-teal-600">Freehold</span>
                    </div>
                    <span className="font-sans text-[14px] font-bold text-slate-900">{business.resources.land || "0.5 Acre owned"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-sans text-[12px] font-medium text-slate-500">Equipment</span>
                      <span className="font-sans text-[12px] font-bold text-orange-500">Upgrade ready</span>
                    </div>
                    <span className="font-sans text-[14px] font-bold text-slate-800">{business.resources.equipment || "Basic shed exists"}</span>
                    <span className="font-sans text-[12px] text-slate-400 font-medium block mt-1">Ready for milking equipment install</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LOCATION */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col h-full justify-between transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-slate-500 block">Location <span className="text-slate-300 mx-1">•</span> Regional Cluster</span>
                <span className="font-sans text-[11px] font-bold text-slate-600 bg-slate-200/50 px-2 py-1 rounded-md">Western Ghats Belt</span>
              </div>
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[14px] text-slate-500 font-medium">State</span>
                  <span className="font-sans text-[14px] font-bold text-slate-900 flex items-center gap-1.5">{business.location.state} <Check className="w-3.5 h-3.5 text-[#402a03]" /></span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[14px] text-slate-500 font-medium">District</span>
                  <span className="font-sans text-[14px] font-bold text-slate-900">{business.location.district}</span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[14px] text-slate-500 font-medium">Block</span>
                  <span className="font-sans text-[14px] font-bold text-slate-900">{business.location.block || "Khed"}</span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-[14px] text-slate-500 font-medium">Village</span>
                  <span className="font-sans text-[13px] font-bold text-orange-500 flex items-center gap-1 cursor-pointer hover:underline">{business.location.village || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: FINANCIAL & NEXT STEPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-4">

          {/* LEFT: FINANCIAL TRAJECTORY */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 md:p-8 flex flex-col h-full transition-all duration-300">
              <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-6 block">Financial Trajectory <span className="text-slate-300 mx-1">•</span> Revenue & Cost Modeling</span>
              <div className="flex flex-col md:flex-row gap-8 h-full">

              {/* Area Chart */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-heading text-[20px] font-bold text-slate-900 tracking-tight">Projected revenue, 6 months</h3>
                  <span className="font-sans text-[12px] font-bold text-[#402a03] bg-[#402a03]/10 px-2 py-0.5 rounded border border-[#402a03]/20">+300% growth</span>
                </div>
                <p className="font-sans text-[12px] text-slate-500 mb-6">Target trajectory from initial lactation to peak cooperative distribution.</p>
                <div className="w-full h-[180px] flex-1">
                  <EditorialAreaChart
                    data={[
                      { month: 'M1', revenue: 15000 },
                      { month: 'M2', revenue: 18000 },
                      { month: 'M3', revenue: 23000 },
                      { month: 'M4', revenue: 35000 },
                      { month: 'M5', revenue: 45000 },
                      { month: 'M6', revenue: 60000 },
                    ]}
                    xKey="month"
                    yKey="revenue"
                    tickFormatter={compactCurrencyFormatter}
                  />
                </div>
                <div className="flex justify-between items-center text-[12px] font-bold px-2 mt-4">
                  <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#402a03]"></div> M1: ₹15,000 / mo</span>
                  <span className="text-slate-600">M6: <span className="text-[#402a03]">₹60,000 / mo</span> <span className="font-normal">(Cooperative direct)</span></span>
                </div>
              </div>

              <div className="w-px bg-slate-100 hidden md:block"></div>

              {/* Cost breakdown */}
              <div className="flex flex-col flex-1 md:max-w-[300px]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-heading text-[20px] font-bold text-slate-900 tracking-tight">Cost breakdown</h3>
                  <span className="font-sans text-[12px] font-bold text-slate-600">Total ₹8.00L</span>
                </div>
                <p className="font-sans text-[12px] text-slate-500 mb-6">Capital expenditure & launch reserves</p>

                <div className="flex items-center gap-6">
                  <div className="w-[120px] h-[120px] shrink-0 relative">
                    <EditorialDonutChart
                      data={[
                        { name: 'Equipment', value: 450000, fill: '#402a03' },
                        { name: 'Raw Material', value: 150000, fill: '#D97706' },
                        { name: 'Labor', value: 100000, fill: '#3B82F6' },
                        { name: 'Marketing', value: 50000, fill: '#9333EA' },
                        { name: 'Contingency', value: 50000, fill: '#64748B' },
                      ]}
                      nameKey="name"
                      valueKey="value"
                      innerRadius={35}
                      outerRadius={55}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="font-sans text-[10px] font-bold text-slate-400">CAPEX</span>
                      <span className="font-sans text-[14px] font-bold text-slate-800">₹8.0L</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    {[
                      { name: 'Equipment', color: '#402a03', value: 450000, pct: '56%' },
                      { name: 'Raw material', color: '#D97706', value: 150000, pct: '19%' },
                      { name: 'Labor', color: '#3B82F6', value: 100000, pct: '13%' },
                      { name: 'Marketing', color: '#9333EA', value: 50000, pct: '6%' },
                      { name: 'Contingency', color: '#64748B', value: 50000, pct: '6%' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="font-sans text-[12px] font-bold text-slate-700 leading-none">{item.name}</span>
                        </div>
                        <div className="flex flex-col items-end leading-none">
                          <span className="font-sans text-[13px] font-bold text-slate-900">{compactCurrencyFormatter(item.value)}</span>
                          <span className="font-sans text-[10px] text-slate-400 font-medium">{item.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              </div>

            </div>
          </div>

          {/* RIGHT: NEXT STEPS (PASTEL) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-wider text-black-500">
                Next Steps
              </h2>
              <span className="font-sans text-[11px] font-medium text-slate-500">4 Workstreams</span>
            </div>

            <div className="flex flex-col gap-3 h-full">
              {/* Compare */}
              <Link href={`/business/compare`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#234670] hover:bg-[#234670]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#f2f5d0]/10 rounded-xl group-hover:scale-110 transition-transform">
                    <BarChart2 className="w-5 h-5 text-[#f2f5d0]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#f2f5d0]">Compare</span>
                    <span className="font-sans text-[12px] text-[#f2f5d0]/80 font-medium">Compare multiple businesses</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#f2f5d0]/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Reports */}
              <Link href={`/reports`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#301608] hover:bg-[#301608]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#f9fadc]/10 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-[#f9fadc]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#f9fadc]">Get Reports</span>
                    <span className="font-sans text-[12px] text-[#f9fadc]/80 font-medium">Detailed Project Report ready</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#f9fadc]/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Roadmap */}
              <Link href={`/business/${business.id}/roadmap`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-[#5f9ea0] hover:bg-[#5f9ea0]/90 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#eff5df]/20 rounded-xl group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5 text-[#eff5df]" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="font-sans text-[16px] font-bold text-[#eff5df]">Roadmap</span>
                    <span className="font-sans text-[12px] text-[#eff5df]/80 font-medium">Phase 1 of 4 in progress</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#eff5df]/50 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
