"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, MapPin, Map, Factory, PenTool, LayoutGrid, 
  AlertCircle, ArrowRight, Wallet, TrendingUp, AlertTriangle,
  Edit2, ArrowLeft, Box, Activity, ChevronRight, Check, X,
  ShieldAlert, BarChart3, PieChart
} from "lucide-react";
import { EditorialAreaChart, EditorialDonutChart } from "@/components/ui/charts";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { useUIStore } from "@/stores/useUIStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";
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

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatNumber = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "";
  return new Intl.NumberFormat('en-IN').format(value);
};

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
  const [isEditing, setIsEditing] = useState(false);
  const [business, setBusiness] = useState<BusinessDetails | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (fetchedBusiness) {
      setBusiness(fetchedBusiness);
    }
  }, [fetchedBusiness]);

  const handleSave = () => {
    console.log("Mock save business edit:", business);
    setIsEditing(false);
  };

  if (!business) return null;

  const InputField = ({ label, value, onChange, type = "text", editable = true, multiline = false, isCurrency = false, isNumber = false }: any) => {
    const labelStyle = "text-[13px] font-medium text-gray-600 mb-0.5";
    const valueStyle = "text-[18px] md:text-[20px] font-semibold text-gray-900 leading-none";
    const inputBg = "bg-white/50 text-gray-900 border border-gray-300";
    const notProvidedStyle = "text-[16px] italic font-medium text-gray-400";

    let displayValue = value;
    if (!isEditing) {
      if (isCurrency && typeof value === 'number') {
        displayValue = formatCurrency(value);
      } else if (isNumber && typeof value === 'number') {
        displayValue = formatNumber(value);
      }
    }

    return (
      <div className="flex flex-col w-full group relative mb-4">
        <label className={labelStyle}>
          {label}
        </label>
        
        {isEditing && editable ? (
          <div className={`w-full flex items-center rounded-md overflow-hidden transition-all focus-within:border-black ${inputBg} mt-1`}>
            {multiline ? (
               <textarea 
                 value={value}
                 onChange={(e) => onChange(e.target.value)}
                 className="w-full bg-transparent border-none outline-none p-2 text-[15px] font-medium resize-none min-h-[60px]"
                 rows={2}
               />
            ) : (
              <input 
                type={type} 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none p-2 text-[15px] font-medium"
              />
            )}
          </div>
        ) : (
          <div className={`w-full mt-1 ${displayValue ? valueStyle : notProvidedStyle}`}>
            {displayValue || "Not provided"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-white">
      
      {/* ── 1. ROW 1: Header Area ── */}
      <div className="w-full px-6 lg:px-16 xl:px-24 pt-8 pb-6 bg-[#f4fce8] relative z-10 border-b border-black/5">
        <div className="flex justify-between items-start md:items-center w-full max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {business.category} • {business.subcategory}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              {isEditing ? (
                <input 
                  type="text" 
                  value={business.name}
                  onChange={(e) => setBusiness({...business, name: e.target.value})}
                  className="bg-transparent border border-gray-300 focus:border-black outline-none p-2 text-3xl font-serif font-bold text-gray-900 rounded-md shadow-sm"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                  {business.name}
                </h1>
              )}
              <span className="px-3 py-0.5 text-[12px] font-semibold bg-[#dcfce7] text-[#166534] rounded-full">
                {business.status}
              </span>
            </div>
            {isEditing ? (
              <textarea 
                value={business.description}
                onChange={(e) => setBusiness({...business, description: e.target.value})}
                className="w-full max-w-2xl bg-transparent border border-gray-300 focus:border-black outline-none p-2 text-[14px] text-gray-700 rounded-md shadow-sm mt-2"
                rows={2}
              />
            ) : (
              <p className="text-[14px] text-gray-600 max-w-2xl mt-1">
                {business.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all text-[13px]">
                  Cancel
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition-all text-[13px]">
                  Save changes
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-black/5 flex items-center gap-2 transition-all text-[13px] shadow-sm bg-white/50">
                <Edit2 className="w-3.5 h-3.5" /> Edit business
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. ROW 2: Snapshot + Location (#ebfcb1) ── */}
      <div className="w-full px-6 lg:px-16 xl:px-24 pt-8 pb-12 bg-[#ebfcb1] relative z-10 border-b border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] mx-auto">
          
          {/* LEFT COLUMN: Business Snapshot */}
          <div className="lg:col-span-8 flex flex-col lg:pr-12 xl:pr-16 lg:border-r lg:border-black/10">
            <h2 className="text-[16px] md:text-[18px] font-bold uppercase tracking-widest text-gray-900 mb-6">Business Snapshot</h2>
            <div className="w-full border-t border-black/10 pt-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10">
              
              {/* Capital */}
              <div className="flex flex-col md:pr-6 pb-6 md:pb-0">
                <div className="flex items-center gap-2 mb-6">
                   <Wallet className="w-5 h-5 text-gray-900" />
                   <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900">Capital</h3>
                </div>
                <div className="flex flex-col">
                   <InputField label="Available equity" type="number" isCurrency={true} value={business.capital.availableMargin} onChange={(v:any) => setBusiness({...business, capital: {...business.capital, availableMargin: Number(v)}})} />
                   <InputField label="Expected investment" type="number" isCurrency={true} value={business.capital.expectedInvestment} onChange={(v:any) => setBusiness({...business, capital: {...business.capital, expectedInvestment: Number(v)}})} />
                </div>
              </div>

              {/* Operations */}
              <div className="flex flex-col md:px-6 py-6 md:py-0">
                <div className="flex items-center gap-2 mb-6">
                   <Activity className="w-5 h-5 text-gray-900" />
                   <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900">Operations</h3>
                </div>
                <div className="flex flex-col">
                   <InputField label="Target monthly revenue" type="number" isCurrency={true} value={business.operations.expectedRevenue} onChange={(v:any) => setBusiness({...business, operations: {...business.operations, expectedRevenue: Number(v)}})} />
                   <InputField label="Production volume" value={`${business.operations.productionQuantity || "0"} units / day`} onChange={(v:any) => setBusiness({...business, operations: {...business.operations, productionQuantity: parseInt(v) || 0}})} />
                </div>
              </div>

              {/* Resources */}
              <div className="flex flex-col md:pl-6 pt-6 md:pt-0">
                <div className="flex items-center gap-2 mb-6">
                   <Box className="w-5 h-5 text-gray-900" />
                   <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900">Resources</h3>
                </div>
                <div className="flex flex-col">
                   <InputField label="Land" value={business.resources.land} onChange={(v:any) => setBusiness({...business, resources: {...business.resources, land: v}})} />
                   <InputField label="Equipment" value={business.resources.equipment} onChange={(v:any) => setBusiness({...business, resources: {...business.resources, equipment: v}})} />
                </div>
              </div>

            </div>
          </div>
          
          {/* RIGHT COLUMN: Location */}
          <div className="lg:col-span-4 flex flex-col mt-12 lg:mt-0 lg:pl-12 xl:pl-16">
            <h2 className="text-[16px] md:text-[18px] font-bold uppercase tracking-widest text-gray-900 mb-6">Location</h2>
            <div className="w-full border-t border-black/10 pt-6 flex flex-col gap-3">
              <div className="text-[14px] text-gray-600">
                State <span className="text-gray-400 mx-1">•</span> <span className="text-gray-900 font-semibold">{business.location.state}</span>
              </div>
              <div className="text-[14px] text-gray-600">
                District <span className="text-gray-400 mx-1">•</span> <span className="text-gray-900 font-semibold">{business.location.district}</span>
              </div>
              <div className="text-[14px] text-gray-600">
                Block <span className="text-gray-400 mx-1">•</span> <span className="text-gray-900 font-semibold">{business.location.block || "not provided"}</span>
              </div>
              <div className="text-[14px] text-gray-600">
                Village <span className="text-gray-400 mx-1">•</span> <span className="text-gray-900 font-semibold">{business.location.village || "not provided"}</span>
              </div>
              
              <Link 
                href={`/business/${business.id}/feasibility`}
                className="text-[14px] font-bold text-[#1e40af] hover:underline mt-2 inline-flex items-center gap-1"
              >
                View intelligence map &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. ROW 3: Finance + Next Steps (#fdffd1) ── */}
      <div className="w-full px-6 lg:px-16 xl:px-24 pt-8 pb-16 bg-[#fdffd1] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 max-w-[1600px] mx-auto">
          
          {/* LEFT COLUMN: Financial Trajectory */}
          <div className="lg:col-span-8 flex flex-col lg:pr-12 xl:pr-16 lg:border-r lg:border-black/10">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[16px] md:text-[18px] font-bold uppercase tracking-widest text-gray-900">Financial Trajectory</h2>
              <span className="text-[13px] font-medium text-gray-600">Mock data</span>
            </div>
            
            <div className="bg-[#f4fce8] rounded-2xl p-6 md:p-8 shadow-sm border border-black/5 w-full grid grid-cols-1 md:grid-cols-2 gap-10">
              
              <div className="flex flex-col gap-5">
                <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900">Projected revenue, 6 months</h3>
                <div className="w-full h-[180px]">
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
                    tickFormatter={compactCurrencyFormatter}
                  />
                </div>
                <div className="flex justify-between text-[12px] text-gray-600 font-bold px-2">
                  <span>M1 - ₹15k</span>
                  <span>M6 - ₹60k</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-5">
                <h3 className="text-[17px] md:text-[19px] font-bold text-gray-900">Cost breakdown</h3>
                <div className="flex items-center gap-6 w-full h-[180px]">
                  <div className="w-[120px] h-[120px] shrink-0">
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
                      innerRadius={35}
                      outerRadius={55}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1">
                    {[
                      { name: 'Equipment', color: '#1E6702', value: 450000 },
                      { name: 'Raw material', color: '#144801', value: 150000 },
                      { name: 'Labor', color: '#4A8F29', value: 100000 },
                      { name: 'Marketing', color: '#A6C796', value: 50000 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[13px] font-bold text-gray-900">{item.name}</span>
                        <span className="text-[13px] font-bold text-gray-600">{compactCurrencyFormatter(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* RIGHT COLUMN: Next Steps */}
          <div className="lg:col-span-4 flex flex-col mt-12 lg:mt-0 lg:pl-12 xl:pl-16">
            <h2 className="text-[16px] md:text-[18px] font-bold uppercase tracking-widest text-gray-900 mb-6">Next Steps</h2>
            <div className="w-full border-t border-black/10 pt-6 flex flex-col gap-4">
              
              <Link 
                href={`/business/${business.id}/feasibility`}
                className="flex items-center justify-between p-4 rounded-xl hover:-translate-y-0.5 transition-transform shadow-sm bg-[#208a06] text-white"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 opacity-90" />
                  <span className="text-[16px] font-bold">Feasibility</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-70" />
              </Link>
              
              <Link 
                href={`/business/${business.id}/finance`}
                className="flex items-center justify-between p-4 rounded-xl hover:-translate-y-0.5 transition-transform shadow-sm bg-[#a4dade] text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 opacity-90" />
                  <span className="text-[16px] font-bold">Finance</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-70" />
              </Link>

              <Link 
                href={`/reports`}
                className="flex items-center justify-between p-4 rounded-xl hover:-translate-y-0.5 transition-transform shadow-sm bg-[#ebe1f0] text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 opacity-90" />
                  <span className="text-[16px] font-bold">Reports</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-70" />
              </Link>

              <Link 
                href={`/business/${business.id}/roadmap`}
                className="flex items-center justify-between p-4 rounded-xl hover:-translate-y-0.5 transition-transform shadow-sm bg-[#400225] text-white"
              >
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 opacity-90" />
                  <span className="text-[16px] font-bold">Roadmap</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-70" />
              </Link>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

