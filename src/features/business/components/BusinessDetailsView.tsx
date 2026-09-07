"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Map, Activity, ArrowRight, TrendingUp, ChevronRight, Check,
  ShieldAlert, FileText, Compass, IndianRupee, Layers
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
  const id = params?.id as string || "123";
  const { data: fetchedBusiness, isLoading } = useBusinessDetails(id);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);

  useEffect(() => {
    if (fetchedBusiness) {
      setBusiness(fetchedBusiness);
    }
  }, [fetchedBusiness]);

  if (!business) return null;

  return (
    <div className="w-full h-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
      
      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* HEADER */}
        <div className="flex flex-col gap-2 w-full bg-[#402a03] text-[#fffbe6] p-6 md:p-8 rounded-2xl shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#fffbe6]/70">
            {business.category} • {business.subcategory || 'DAIRY FARMING'}
          </span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-[22px] font-heading font-bold text-[#fffbe6] tracking-tight leading-tight">
                {business.name}
              </h1>
              <span className="px-2.5 py-1 rounded-full bg-[#fffbe6]/10 text-[#fffbe6] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm border border-[#fffbe6]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fffbe6] animate-pulse"></div> {business.status}
              </span>
            </div>
          </div>
          <p className="text-sm text-[#fffbe6]/70 font-medium mt-0.5">
            {business.description || "A small-scale commercial dairy farm focusing on high-yield buffalo milk production for local cooperative supply."}
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-2">

          {/* LEFT: BUSINESS SNAPSHOT */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-black-500">
                Business Snapshot <span className="text-black mx-1">•</span> Key operational parameters
              </h2>
              <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">Live Model</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
              {/* Capital Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-orange-400"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-orange-50 text-orange-600"><IndianRupee className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-800 text-[15px]">Capital</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">FUNDED</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Available equity</span>
                      <span className="text-[12px] font-semibold text-orange-600">Self-funded</span>
                    </div>
                    <span className="text-[24px] font-bold text-slate-900">₹{business.capital.availableMargin?.toLocaleString('en-IN') || "1,50,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Expected investment</span>
                      <span className="text-[13px] font-bold text-slate-800">₹{business.capital.expectedInvestment?.toLocaleString('en-IN') || "8,00,000"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[11px] text-slate-400 font-medium">18.75% covered</span>
                      <span className="text-[11px] text-slate-400 font-medium">₹6.5L debt gap</span>
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
                    <span className="font-bold text-slate-800 text-[15px]">Operations</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#402a03] bg-[#402a03]/10 px-2 py-0.5 rounded border border-[#402a03]/20">+12% baseline</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Target monthly revenue</span>
                    </div>
                    <span className="text-[24px] font-bold text-slate-900">₹{business.operations.expectedRevenue?.toLocaleString('en-IN') || "45,000"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Production volume</span>
                    </div>
                    <span className="text-[15px] font-bold text-slate-800">{business.operations.productionQuantity || "30"} units / day</span>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">Buffalo milk (approx. 30 litres/day)</span>
                  </div>
                </div>
              </div>

              {/* Resources Card */}
              <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-5 flex flex-col relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400"></div>
                <div className="flex items-center justify-between mb-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-blue-50 text-blue-600"><Layers className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-800 text-[15px]">Resources</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">VERIFIED</span>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Land</span>
                      <span className="text-[12px] font-semibold text-teal-600">Freehold</span>
                    </div>
                    <span className="text-[16px] font-bold text-slate-900">{business.resources.land || "0.5 Acre owned"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] font-medium text-slate-500">Equipment</span>
                      <span className="text-[12px] font-semibold text-orange-500">Upgrade ready</span>
                    </div>
                    <span className="text-[15px] font-bold text-slate-800">{business.resources.equipment || "Basic shed exists"}</span>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">Ready for milking equipment install</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LOCATION */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-black-500">
                Location <span className="text-black-300 mx-1">•</span> Regional Cluster
              </h2>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/50 px-2 py-1 rounded-md">Western Ghats Belt</span>
            </div>

            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 flex flex-col h-full justify-between transition-all duration-300">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-slate-500 font-medium">State</span>
                  <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">{business.location.state} <Check className="w-3.5 h-3.5 text-[#402a03]" /></span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-slate-500 font-medium">District</span>
                  <span className="text-[14px] font-bold text-slate-900">{business.location.district}</span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-slate-500 font-medium">Block</span>
                  <span className="text-[14px] font-bold text-slate-900">{business.location.block || "Khed"}</span>
                </div>
                <div className="w-full h-px bg-slate-50"></div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-slate-500 font-medium">Village</span>
                  <span className="text-[13px] font-semibold text-orange-500 flex items-center gap-1 cursor-pointer hover:underline">{business.location.village || "Not provided + Add"}</span>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-between bg-[#402a03] hover:bg-[#402a03]/90 text-[#fffbe6] p-3 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-[#fffbe6]/10 p-1.5 rounded-lg shadow-sm">
                    <Map className="w-4 h-4 text-[#fffbe6]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[13px] font-bold">View intelligence map</span>
                    <span className="text-[11px] text-[#fffbe6]/80 font-medium">Cooperative collection hub: 4.2 km</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: FINANCIAL & NEXT STEPS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch mt-4">

          {/* LEFT: FINANCIAL TRAJECTORY */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-black-500">
                Financial Trajectory <span className="text-black-300 mx-1">•</span> Revenue & Cost Modeling
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/50 px-2 py-1 rounded-md">Mock data</span>
                <div className="flex bg-white shadow-sm border border-slate-100 rounded-md overflow-hidden text-[11px] font-bold">
                  <button className="px-3 py-1 bg-slate-100 text-slate-800">6M</button>
                  <button className="px-3 py-1 text-slate-400 hover:bg-slate-50">1Y</button>
                  <button className="px-3 py-1 text-slate-400 hover:bg-slate-50">3Y</button>
                </div>
              </div>
            </div>

            <div className="bg-[#fffff5] rounded-xl border border-gray-900/8 shadow-[0_4px_24px_rgb(0,0,0,0.05)] p-6 md:p-8 flex flex-col md:flex-row gap-8 h-full transition-all duration-300">

              {/* Area Chart */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[16px] font-bold text-slate-900">Projected revenue, 6 months</h3>
                  <span className="text-[12px] font-bold text-[#402a03] bg-[#402a03]/10 px-2 py-0.5 rounded border border-[#402a03]/20">+300% growth</span>
                </div>
                <p className="text-[12px] text-slate-500 mb-6">Target trajectory from initial lactation to peak cooperative distribution.</p>
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
                  <h3 className="text-[16px] font-bold text-slate-900">Cost breakdown</h3>
                  <span className="text-[12px] font-bold text-slate-600">Total ₹8.00L</span>
                </div>
                <p className="text-[12px] text-slate-500 mb-6">Capital expenditure & launch reserves</p>

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
                      <span className="text-[10px] font-bold text-slate-400">CAPEX</span>
                      <span className="text-[14px] font-bold text-slate-800">₹8.0L</span>
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
                          <span className="text-[12px] font-bold text-slate-700 leading-none">{item.name}</span>
                        </div>
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[13px] font-bold text-slate-900">{compactCurrencyFormatter(item.value)}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: NEXT STEPS (PASTEL) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-black-500">
                Next Steps
              </h2>
              <span className="text-[11px] font-medium text-slate-500">4 Workstreams</span>
            </div>

            <div className="flex flex-col gap-3 h-full">
              {/* Feasibility - Pastel Yellow */}
              <Link href={`/business/${business.id}/feasibility`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-yellow-50 hover:bg-yellow-100 border border-yellow-100/50 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-yellow-100/80 rounded-xl group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[16px] font-bold text-yellow-900">Feasibility</span>
                    <span className="text-[12px] text-yellow-800/80 font-medium">Score: 84/100 (Strong viable)</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-yellow-700/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Finance - Pastel Blue */}
              <Link href={`/business/${business.id}/finance`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-blue-50 hover:bg-blue-100 border border-blue-100/50 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-100/80 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[16px] font-bold text-blue-900">Finance</span>
                    <span className="text-[12px] text-blue-800/80 font-medium">3 Loan schemes matched (NABARD)</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-700/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Reports - Pastel Pink */}
              <Link href={`/reports`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-pink-50 hover:bg-pink-100 border border-pink-100/50 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-pink-100/80 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-pink-700" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[16px] font-bold text-pink-900">Reports</span>
                    <span className="text-[12px] text-pink-800/80 font-medium">Detailed Project Report ready</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-pink-700/50 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Roadmap - Pastel Orange */}
              <Link href={`/business/${business.id}/roadmap`} className="group flex items-center justify-between p-4 rounded-2xl transition-all shadow-sm bg-orange-50 hover:bg-orange-100 border border-orange-100/50 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-orange-100/80 rounded-xl group-hover:scale-110 transition-transform">
                    <Compass className="w-5 h-5 text-orange-700" />
                  </div>
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[16px] font-bold text-orange-900">Roadmap</span>
                    <span className="text-[12px] text-orange-800/80 font-medium">Phase 1 of 4 in progress</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-orange-700/50 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
