"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase, PlusCircle, ArrowRight, MapPin, BarChart2,
  CircleDollarSign, Compass, Layers, ShieldCheck, ChevronRight,
  Building2, TrendingUp, Sparkles, Landmark
} from "lucide-react";
import { motion } from "framer-motion";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useProfile } from "@/lib/data/users";

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

export default function MyBusinessPage() {
  const { data: businesses, isLoading } = useBusinessesComparison();
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-9 h-9 border-3 border-[#1E6702] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Retrieving your registered ventures...</p>
      </div>
    );
  }

  const hasBusinesses = businesses && businesses.length > 0;

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1E6702] text-xs font-bold border border-emerald-200">
              Enterprise Management
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {hasBusinesses ? `${businesses.length} Registered ${businesses.length === 1 ? "Venture" : "Ventures"}` : "0 Ventures"}
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            My Registered Businesses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {hasBusinesses
              ? "Authoritative venture dossiers, census demographic reach, and financing structures for your rural enterprises."
              : "Register and connect your rural enterprise to calculate live feasibility, scheme subsidies, and bankable DPRs."}
          </p>
        </div>

        <Link
          href="/business/create"
          className="self-start sm:self-auto px-5 py-2.5 bg-[#1E6702] hover:bg-[#165201] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-emerald-950/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Register New Business</span>
        </Link>
      </div>

      {/* ─── Business List or Empty State ─── */}
      {hasBusinesses ? (
        <div className="flex flex-col gap-6">
          
          {/* Portfolio summary bar if multiple businesses exist */}
          {businesses.length > 1 && (
            <div className="bg-emerald-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-emerald-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-300 block">
                    Enterprise Portfolio ({businesses.length} Active Ventures)
                  </span>
                  <p className="text-xs text-emerald-100">
                    Switch between ventures to inspect individual feasibility, capex, and operational roadmaps.
                  </p>
                </div>
              </div>
              <Link
                href="/business/compare"
                className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Side-by-Side Compare</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Business Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businesses.map((biz: any, idx: number) => {
              const capexEst = (
                Number(biz.expectedRevenue ? biz.expectedRevenue * 0.4 : biz.availableMargin * 3 || 100000) / 100000
              ).toFixed(1);
              const marginAmt = Number(biz.availableMargin || 0);
              const revenueAmt = Number(biz.expectedRevenue || 0);
              const categoryName = biz.category?.name || biz.category || "Agro & Rural Enterprise";
              const locationStr = biz.location?.district
                ? `${biz.location.district}, ${biz.location.state || ""}`
                : biz.location?.state || "Local District";

              return (
                <motion.div
                  key={biz.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08, ease: EASE_OUT_EXPO }}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md p-6 flex flex-col justify-between gap-5 transition-all relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#1E6702] text-xs font-extrabold tracking-wide border border-emerald-200">
                          Venture {idx + 1}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {biz.status || "Active / Verified"}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <div>
                      <h2 className="font-heading text-xl font-bold text-slate-900 group-hover:text-[#1E6702] transition-colors line-clamp-1">
                        {biz.name || `Business ${idx + 1}`}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-semibold text-[11px] border border-amber-200/60">
                          {categoryName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{locationStr}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {biz.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {biz.description}
                      </p>
                    )}

                    {/* Financial Telemetry Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Promoter Margin
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{marginAmt.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Capex Scale
                        </span>
                        <span className="font-bold text-[#1E6702] text-sm">
                          ₹{capexEst} Lakhs
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col gap-0.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                          Target Revenue
                        </span>
                        <span className="font-bold text-blue-900 text-sm">
                          {revenueAmt > 0 ? `₹${revenueAmt.toLocaleString("en-IN")}/mo` : "₹1.2L/mo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                    <Link
                      href={`/business/${biz.id}/feasibility`}
                      className="text-center py-2 px-2 rounded-xl bg-[#1E6702]/10 hover:bg-[#1E6702]/20 text-[#1E6702] text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Feasibility</span>
                    </Link>
                    <Link
                      href={`/business/${biz.id}/finance`}
                      className="text-center py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>Finance</span>
                    </Link>
                    <Link
                      href={`/business/${biz.id}`}
                      className="text-center py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Overview</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      ) : (
        /* ─── Zero Business Dedicated Empty State ─── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
          className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-14 text-center flex flex-col items-center gap-6 max-w-xl mx-auto shadow-sm my-8"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1E6702] shadow-inner">
            <Building2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              No Business Registered Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              You haven&apos;t registered any rural enterprise under your account yet. Register your business now to calculate real-time Census demographics, unlock PMEGP/MUDRA subsidy eligibility, and generate AI feasibility roadmaps.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/business/create"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#1E6702] hover:bg-[#165201] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-emerald-900/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Your First Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/analysis"
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Explore Feasibility Calculator</span>
            </Link>
          </div>
        </motion.div>
      )}

    </div>
  );
}
