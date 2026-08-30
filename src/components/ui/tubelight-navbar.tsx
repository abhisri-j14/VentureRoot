"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";

interface NavItem {
  name: string;
  url: string;
}

const navItems: NavItem[] = [
  { name: "Home", url: "#" },
  { name: "How It Works", url: "#how-it-works" },
  { name: "Insights", url: "#insights" },
  { name: "About", url: "#about" },
];

export function TubelightNavbar() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(navItems[0].name);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:pt-6 pointer-events-none">
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="pointer-events-auto flex items-center justify-between px-5 md:px-6 py-3 w-full max-w-5xl bg-white/70 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] border border-slate-200/50 rounded-full"
        >
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="VentureRoot Logo" className="h-7 w-auto md:h-8 object-contain mix-blend-multiply" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2 relative">
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <Link
                  key={item.name}
                  href={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-semibold rounded-full transition-colors",
                    isActive ? "text-primary" : "text-secondary hover:text-primary"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="tubelight"
                      className="absolute inset-0 bg-secondary/10 rounded-full -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-secondary rounded-full shadow-[0_0_8px_1px_rgba(32,8,19,0.4)]" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-5">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
              {t("auth.loginButton")}
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold bg-secondary/95 backdrop-blur-md text-white px-6 py-2.5 rounded-full hover:bg-secondary transition-all shadow-sm"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-secondary bg-white/50 rounded-full transition-colors hover:bg-white/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </motion.header>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md pt-28 px-6 md:hidden flex flex-col gap-6 animate-in fade-in duration-200">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => {
                setActiveTab(item.name);
                setIsMobileMenuOpen(false);
              }}
              className="text-xl font-semibold text-secondary"
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-slate-200/60 my-2" />
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-secondary">Language</span>
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
            className="text-xl font-bold bg-secondary/95 text-white px-5 py-4 rounded-xl text-center shadow-md"
          >
            Create Account
          </Link>
        </div>
      )}
    </>
  );
}
