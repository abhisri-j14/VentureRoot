"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { motion } from "framer-motion";

export function CleanNavbar() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      <nav className="w-full bg-transparent py-4 px-6 md:px-12 z-50 relative flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="bg-[#FFFBE7]/90 backdrop-blur-sm px-3 py-1.5 md:px-3 md:py-1.5 rounded-lg flex items-center justify-center shadow-sm border border-black/5 hover:bg-white transition-all active:scale-[0.98]"
          >
            <img src="/logo-wordmark.png" alt="VentureRoot Logo" className="h-5 md:h-[22px] w-auto object-contain mix-blend-multiply" />
          </Link>
        </div>

        {/* Center/Right: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-2" onMouseLeave={() => setHoveredIndex(null)}>
          {[
            { name: t("nav.home"), href: "/" },
            { name: t("nav.howItWorks"), href: "#how-it-works" },
            { name: t("nav.contactUs"), href: "#footer" },
          ].map((link, idx) => (
            <Link 
              key={link.name}
              href={link.href} 
              onMouseEnter={() => setHoveredIndex(idx)}
              className="relative px-4 py-2 text-sm font-semibold text-secondary transition-colors active:scale-[0.97]"
            >
              {hoveredIndex === idx && (
                <motion.div
                  layoutId="navbar-pill"
                  className="absolute inset-0 bg-[#1E6702]/10 rounded-full"
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Right: Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-semibold text-secondary hover:text-primary transition-colors">
            {t("auth.loginButton")}
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-bold bg-secondary text-white px-5 py-2 rounded-lg hover:bg-secondary/90 transition-all shadow-sm"
          >
            {t("auth.registerTitle")}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-secondary hover:bg-secondary/5 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col gap-6">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.howItWorks")}
          </Link>
          <Link
            href="#footer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary"
          >
            {t("nav.contactUs")}
          </Link>
          <div className="h-px bg-secondary/10 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-secondary">{t("nav.language")}</span>
            <LanguageSwitcher />
          </div>
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-semibold text-secondary mt-2"
          >
            {t("auth.loginButton")}
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-xl font-bold bg-secondary text-white px-5 py-4 rounded-xl text-center shadow-md"
          >
            {t("auth.registerTitle")}
          </Link>
        </div>
      )}
    </>
  );
}
