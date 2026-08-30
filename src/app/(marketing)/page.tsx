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
  Globe
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { CleanNavbar } from "@/components/ui/clean-navbar";
import { RippleButton } from "@/components/ui/ripple-button";
import { useAuthStore } from "@/stores/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { TextEffect } from "@/components/ui/text-effect";
import CloudLoader from "@/components/ui/quantum-cloud-loader";

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
        {/* ── 1. Hero Section (Card Layout) ── */}
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
          <section className="relative w-full rounded-[2rem] overflow-hidden bg-background shadow-lg shadow-secondary/5 border border-secondary/10 min-h-[85vh] flex flex-col">
            {/* Full Bleed Background Illustration */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img
                src="/hero-card-bg.jpg"
                alt="Rural Landscape"
                className="w-full h-full object-cover object-[center_top]"
              />
              {/* Subtle top gradient to ensure text readability on the sky if needed */}
              {/* Very soft localized radial gradient on the left to guarantee text contrast without covering the whole image */}
            </div>

            {/* Navbar integrated into the card */}
            <CleanNavbar />

            {/* Hero Content */}
            <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pt-0 md:pt-4 pb-40 flex flex-col justify-start">

              <div className="flex-1 flex flex-col items-center text-center max-w-full md:max-w-3xl lg:max-w-4xl mx-auto pt-4 md:pt-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isPreloading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mb-5 inline-flex items-center px-3 py-1 rounded-full bg-secondary/5 border border-secondary/10 text-secondary text-[10px] md:text-[11px] font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm"
                >
                  {t("landing.tagline")}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={isPreloading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-[46px] lg:text-[50px] font-heading font-semibold text-secondary leading-tight tracking-tight [text-shadow:_0_2px_15px_rgba(255,255,255,0.8)] max-w-[800px]"
                >
                  {t("landing.hero1")}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isPreloading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-[15px] md:text-[16px] text-secondary/80 mt-5 font-normal leading-relaxed max-w-full lg:max-w-[650px] [text-shadow:_0_1px_10px_rgba(255,255,255,1)]"
                >
                  {t("landing.heroSub")}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isPreloading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-3.5 mt-8 w-full sm:w-auto justify-center"
                >
                  <RippleButton
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    rippleColor="bg-white/30"
                    className="bg-secondary text-background px-6 py-2.5 rounded-xl font-semibold text-[13px] md:text-sm hover:bg-secondary/90 transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    {t("landing.analyzeBtn")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </RippleButton>
                  <RippleButton
                    href={isAuthenticated ? "/dashboard" : "/register"}
                    rippleColor="bg-secondary/15"
                    className="bg-white/50 backdrop-blur-md border border-secondary/10 text-secondary px-6 py-2.5 rounded-xl font-semibold text-[13px] md:text-sm hover:bg-white/80 transition-all shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    {t("nav.dashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </RippleButton>
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        {/* ── 2. What We Offer (Cards) ── */}
        <section className="w-full bg-[#FFFBE7] pt-24 border-y border-black/5">
          <div className="max-w-7xl mx-auto px-6">

            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-16">
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
                Everything you need to understand your market, plan your finances, and move from idea to action.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">

              {/* Card 1 */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group">
                <img
                  src="/feature-1.jpg"
                  alt="Hyper-Local Feasibility"
                  className="w-full aspect-[4/3] object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-[#200813] mb-2 leading-tight">Hyper-Local Feasibility</h3>
                <p className="text-sm font-semibold text-[#200813] mb-3 leading-snug">Understand the opportunity around you.</p>
                <p className="text-sm text-[#200813]/70 leading-relaxed font-normal">
                  Analyze local demand, competition, market reach, and potential risks for your chosen business.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group">
                <img
                  src="/feature-2.jpg"
                  alt="Financial Planning"
                  className="w-full aspect-[4/3] object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-[#200813] mb-2 leading-tight">Financial Planning</h3>
                <p className="text-sm font-semibold text-[#200813] mb-3 leading-snug">Know what your business needs to succeed.</p>
                <p className="text-sm text-[#200813]/70 leading-relaxed font-normal">
                  Explore revenue, margins, capital requirements, and repayment scenarios before you commit.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group">
                <img
                  src="/feature-3.jpg"
                  alt="Government Schemes"
                  className="w-full aspect-[4/3] object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-[#200813] mb-2 leading-tight">Government Schemes</h3>
                <p className="text-sm font-semibold text-[#200813] mb-3 leading-snug">Find support that fits your business.</p>
                <p className="text-sm text-[#200813]/70 leading-relaxed font-normal">
                  Discover relevant subsidies, government schemes, and financing options based on your business profile.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-start text-left group">
                <img
                  src="/feature-4.jpg"
                  alt="AI Business Advisor"
                  className="w-full aspect-[4/3] object-cover rounded-2xl mb-6"
                />
                <h3 className="text-xl font-bold text-[#200813] mb-2 leading-tight">AI Business Advisor</h3>
                <p className="text-sm font-semibold text-[#200813] mb-3 leading-snug">Turn insights into your next step.</p>
                <p className="text-sm text-[#200813]/70 leading-relaxed font-normal">
                  Ask questions, refine your strategy, and get practical guidance grounded in your business data.
                </p>
              </div>
            </div>
          </div>

          {/* Trust/Value Strip */}
          <div className="w-full bg-[#1E6702] py-12 border-t border-black/10">
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

        {/* ── 3. How VentureRoot Works ── */}
        <section id="how-it-works" className="relative w-full bg-gradient-to-b from-[#FFFBE7] to-[#b4fad0] py-24 border-y border-black/5 overflow-hidden">

          <div className="relative max-w-7xl mx-auto px-6 z-10">

            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-sans font-bold text-[#200813] tracking-tight mb-4">
                How VentureRoot Works
              </h2>
              <p className="text-base md:text-lg text-[#200813]/70 max-w-2xl font-normal">
                From a local business idea to a clear, actionable plan.
              </p>
            </div>

            {/* Steps Container */}
            <div className="relative mb-24">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden lg:block absolute top-[6rem] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-[#1E6702]/20 to-transparent"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

                {/* Step 01 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="relative bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center group hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7.5rem] font-bold text-[#200813]/[0.04] z-0 leading-none select-none group-hover:text-[#1E6702]/[0.06] transition-colors duration-500">
                    01
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-16 h-16 rounded-full bg-[#E5EEFF]/80 flex items-center justify-center mb-6 shadow-sm z-10 relative group-hover:scale-110 transition-transform duration-500 mt-2"
                  >
                    <Lightbulb className="w-7 h-7 text-[#1E6702]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[#200813] mb-3 relative z-10">Tell us about your idea</h3>
                  <p className="text-sm text-[#200813]/70 leading-relaxed font-normal relative z-10">
                    Enter your village/block, business category, and available capital.
                  </p>
                </motion.div>

                {/* Step 02 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="relative bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center group hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7.5rem] font-bold text-[#200813]/[0.04] z-0 leading-none select-none group-hover:text-[#1E6702]/[0.06] transition-colors duration-500">
                    02
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-16 h-16 rounded-full bg-[#C8F89B]/50 flex items-center justify-center mb-6 shadow-sm z-10 relative group-hover:scale-110 transition-transform duration-500 mt-2"
                  >
                    <MapPin className="w-7 h-7 text-[#1E6702]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[#200813] mb-3 relative z-10">Understand your local market</h3>
                  <p className="text-sm text-[#200813]/70 leading-relaxed font-normal relative z-10">
                    VentureRoot analyses local demand, market reach, competition, and business opportunities.
                  </p>
                </motion.div>

                {/* Step 03 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="relative bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center group hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7.5rem] font-bold text-[#200813]/[0.04] z-0 leading-none select-none group-hover:text-[#1E6702]/[0.06] transition-colors duration-500">
                    03
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="w-16 h-16 rounded-full bg-[#E5EEFF]/80 flex items-center justify-center mb-6 shadow-sm z-10 relative group-hover:scale-110 transition-transform duration-500 mt-2"
                  >
                    <Landmark className="w-7 h-7 text-[#1E6702]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[#200813] mb-3 relative z-10">Structure your finances</h3>
                  <p className="text-sm text-[#200813]/70 leading-relaxed font-normal relative z-10">
                    Explore investment needs, suitable government schemes, and financing scenarios.
                  </p>
                </motion.div>

                {/* Step 04 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="relative bg-white rounded-3xl p-8 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col items-center text-center group hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[7.5rem] font-bold text-[#200813]/[0.04] z-0 leading-none select-none group-hover:text-[#1E6702]/[0.06] transition-colors duration-500">
                    04
                  </div>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="w-16 h-16 rounded-full bg-[#C8F89B]/50 flex items-center justify-center mb-6 shadow-sm z-10 relative group-hover:scale-110 transition-transform duration-500 mt-2"
                  >
                    <Target className="w-7 h-7 text-[#1E6702]" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-[#200813] mb-3 relative z-10">Get your action plan</h3>
                  <p className="text-sm text-[#200813]/70 leading-relaxed font-normal relative z-10">
                    Receive practical recommendations and refine your plan with the AI Business Advisor.
                  </p>
                </motion.div>

              </div>
            </div>

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
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#1E6702]/40 border border-white/10 hover:border-[#C8F89B]/30 flex items-center justify-center text-[#9bb3cc] hover:text-[#FFFBE7] transition-all duration-300"
                  aria-label="GitHub"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
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
    </div>
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
