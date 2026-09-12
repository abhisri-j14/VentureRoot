"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown, LogOut, Settings, Globe, Menu, X, Home, Briefcase, PlusCircle, BarChart2, FileText, MessageSquare, TrendingUp, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useProfile } from "@/lib/data/users";
import { useBusinessesComparison } from "@/lib/data/businesses";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export const TopNav = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: profileData } = useProfile();
  const { data: businesses } = useBusinessesComparison();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeBusiness = businesses?.[0];
  const businessBase = activeBusiness?.id ? `/business/${activeBusiness.id}` : "/business/create";
  const financeBase = activeBusiness?.id ? `/business/${activeBusiness.id}/finance` : "/business/create";
  const feasibilityBase = activeBusiness?.id ? `/business/${activeBusiness.id}/feasibility` : "/business/create";

  const NAV_ITEMS = [
    { id: "nav-dashboard",    href: "/dashboard",     tKey: "nav.dashboard",   icon: Home },
    { id: "nav-my-business",  href: businessBase,     tKey: "nav.myBusiness",  icon: Briefcase },
    { id: "nav-finance",      href: financeBase,      tKey: "nav.finance",     icon: TrendingUp },
    { id: "nav-feasibility",  href: feasibilityBase,  tKey: "nav.feasibility", icon: ShieldAlert },
    { id: "nav-new-business", href: "/business/create", tKey: "nav.newBusiness", icon: PlusCircle },
    { id: "nav-advisor",      href: "/advisor",       tKey: "nav.advisor",     icon: MessageSquare },
  ];

  const displayName = profileData?.fullName || user?.name || "Entrepreneur";
  const activeRoleLabel = "Entrepreneur";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 w-full z-50"
    >
      <nav className="w-full bg-[#1E6702] rounded-none py-2.5 px-3 sm:px-6 md:px-10 flex items-center justify-between shadow-md border-b border-[#144a01]/60 relative z-50">
        
        {/* Ambient Hover Light (Soft Localized Highlight) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        </div>

        {/* Left: Logo */}
        <div className="flex items-center relative z-10">
          <Link 
            href="/" 
            className="group bg-[#FFFBE7] px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-[12px] flex items-center justify-center shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05),0_2px_5px_rgba(0,0,0,0.1)] border border-black/5 hover:-translate-y-[1px] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-[0.98]"
          >
            <img src="/logo-wordmark.png" alt="VentureRoot Logo" className="h-4 md:h-[18px] w-auto object-contain mix-blend-multiply group-hover:brightness-95 transition-all duration-300" />
          </Link>
        </div>

        {/* Center: Nav Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 relative z-10" onMouseLeave={() => setHoveredIndex(null)}>
          {NAV_ITEMS.map((link, idx) => {
            const basePath = link.href.split("?")[0];
            const isActive =
              (basePath === "/dashboard" && pathname === "/dashboard") ||
              (basePath === "/profile" && pathname === "/profile") ||
              (basePath !== "/dashboard" && basePath !== "/profile" && pathname.startsWith(basePath));

            return (
              <Link 
                key={link.id}
                href={link.href} 
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`group relative px-4 py-2 text-[13px] font-semibold transition-all duration-300 active:scale-[0.97] flex items-center gap-2 rounded-full ${isActive ? "text-[#FFFBE7]" : "text-white/80 hover:text-white"}`}
              >
                {/* Active state Tubelight pill */}
                {isActive && (
                  <motion.div
                    layoutId="dashboard-navbar-active-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#FFFBE7] rounded-t-full shadow-[0_0_12px_3px_rgba(255,251,231,0.4)]" />
                    <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-3 h-[1px] bg-[#FFFBE7]/50 rounded-b-full shadow-[0_0_8px_1px_rgba(255,251,231,0.2)]" />
                  </motion.div>
                )}
                
                {/* Hover state pill (only for inactive items) */}
                {hoveredIndex === idx && !isActive && (
                  <motion.div
                    layoutId="dashboard-navbar-hover-pill"
                    className="absolute inset-0 bg-white/5 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className={`w-[15px] h-[15px] relative z-10 transition-transform duration-300 ${!isActive && hoveredIndex === idx ? "scale-110" : ""}`} />
                <span className={`relative z-10 transition-transform duration-300 ${!isActive && hoveredIndex === idx ? "scale-[1.02]" : ""}`}>{t(link.tKey as any)}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-1.5 sm:gap-3 relative z-10">
          <div className="block transition-all duration-300 hover:-translate-y-[1px] hover:scale-[1.01] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg">
            <LanguageSwitcher />
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 md:gap-2.5 group focus:outline-none bg-[#FFFBE7] border border-black/5 px-2 py-1.5 md:pl-2 md:pr-3 rounded-full shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05),0_2px_5px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 active:scale-[0.98]"
              aria-expanded={isProfileOpen}
            >
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#1E6702] flex items-center justify-center text-white shadow-inner transition-transform duration-300 group-hover:scale-[1.04]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden md:flex items-center gap-1">
                <span className="text-[13px] font-bold text-[#200813] truncate max-w-[100px] group-hover:text-[#1E6702] transition-colors duration-300">
                  {displayName}
                </span>
                <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3 h-3 text-[#200813]/40 group-hover:text-[#1E6702] transition-colors duration-300" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-[20px] shadow-[0_12px_45px_-10px_rgba(32,8,19,0.15)] border border-white/50 overflow-hidden z-50 p-1.5 origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-sm font-bold text-[#200813] truncate">{displayName}</p>
                    <p className="text-xs font-medium text-[#200813]/50 mt-0.5">{activeRoleLabel}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-all duration-200">
                      <User className="w-[15px] h-[15px]" /> {t("nav.profile" as any) || "My Profile"}
                    </Link>
                    <button onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-all duration-200">
                      <Settings className="w-[15px] h-[15px]" /> Settings
                    </button>
                    <button onClick={() => setIsProfileOpen(false)} className="md:hidden flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-all duration-200">
                      <Globe className="w-[15px] h-[15px]" /> Language
                    </button>
                  </div>
                  
                  <div className="py-1 border-t border-black/5 mt-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                        router.push("/login");
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 text-[13px] font-semibold text-[#200813]/60 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    >
                      <LogOut className="w-[15px] h-[15px]" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-md transition-colors active:scale-95"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.div animate={{ rotate: isMobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden absolute top-[76px] left-4 right-4 bg-[#1E6702] rounded-[20px] shadow-[inset_0px_1px_0px_rgba(255,255,255,0.15),0px_12px_35px_-5px_rgba(0,0,0,0.2)] border border-[#144a01]/60 overflow-hidden z-40"
          >
            <div className="px-3 py-4 flex flex-col gap-1.5">
              {NAV_ITEMS.map((link, idx) => {
                const basePath = link.href.split("?")[0];
                const isActive =
                  (basePath === "/dashboard" && pathname === "/dashboard") ||
                  (basePath === "/profile" && pathname === "/profile") ||
                  (basePath !== "/dashboard" && basePath !== "/profile" && pathname.startsWith(basePath));

                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-[14px] text-sm font-semibold transition-all duration-300 ${
                        isActive ? "bg-[#FFFBE7] text-[#1E6702] shadow-[0_2px_8px_rgba(0,0,0,0.1)]" : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <link.icon className={`w-[18px] h-[18px] ${isActive ? "text-[#1E6702]" : "text-white/70"}`} />
                      {t(link.tKey as any)}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
