"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, ChevronRight, Shield, ChevronDown, LogOut, Settings, Globe } from "lucide-react";
import { useAuthStore, UserRole } from "@/stores/useAuthStore";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_CONFIG, AVAILABLE_ROLES } from "@/features/auth/config/roles";
import { motion, AnimatePresence } from "framer-motion";

export const TopNav = () => {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const switchRole = useAuthStore((s) => s.switchRole);
  const { t } = useTranslation();
  const pathname = usePathname();

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) setIsRoleOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRoleOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Simple breadcrumb logic based on pathname
  let breadcrumb = t("nav.dashboard");
  if (pathname.includes("/profile")) breadcrumb = t("nav.profile");
  else if (pathname.includes("/business/create")) breadcrumb = t("nav.newBusiness");
  else if (pathname.includes("/business/compare")) breadcrumb = t("nav.compare");
  else if (pathname.includes("/business/") && pathname.includes("/feasibility")) breadcrumb = t("nav.feasibility");
  else if (pathname.includes("/business/") && pathname.includes("/finance")) breadcrumb = t("nav.finance");
  else if (pathname.includes("/business/") && pathname.includes("/roadmap")) breadcrumb = t("nav.roadmap");
  else if (pathname.includes("/business/")) breadcrumb = t("nav.myBusiness");
  else if (pathname.includes("/reports")) breadcrumb = t("nav.reports");
  else if (pathname.includes("/advisor")) breadcrumb = t("nav.advisor");
  else if (pathname.includes("/reviews")) breadcrumb = t("nav.businessReviews" as any);
  else if (pathname.includes("/admin")) breadcrumb = t("nav.adminConsole" as any);

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setIsRoleOpen(false);
    const landingRoute = ROLE_CONFIG[newRole].landingRoute;
    router.push(landingRoute);
  };

  const activeRoleLabel = AVAILABLE_ROLES.find((r) => r.id === role)?.label || "Role";

  return (
    <header className="h-20 bg-[#f4fce8] border-b border-[#200813]/[0.03] flex items-center justify-between px-8 z-30 relative">
      {/* Left — page context */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-[#200813] hover:text-[#1E6702] transition-all duration-300 font-heading font-bold text-xl hover:scale-105 tracking-wide origin-left">
          Dashboard
        </Link>
        {pathname !== "/dashboard" && pathname !== "/role-selection" && (
          <>
            <ChevronRight className="w-4 h-4 text-[#200813]/30" />
            <span className="font-semibold text-[#200813] tracking-wide text-sm">{breadcrumb}</span>
          </>
        )}
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-4">
        {/* Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-black/5 px-3 py-2 hover:border-[#1E6702]/30 hover:bg-[#FFFBE7]/50 transition-all focus:outline-none"
            aria-expanded={isRoleOpen}
            aria-haspopup="true"
          >
            <Shield className="w-3.5 h-3.5 text-[#1E6702]" />
            <span className="text-xs font-bold text-[#200813]">{activeRoleLabel}</span>
            <motion.div animate={{ rotate: isRoleOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5 text-[#200813]/40" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {isRoleOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_-10px_rgba(32,8,19,0.12)] border border-black/5 overflow-hidden z-50"
              >
                <div className="py-1">
                  {AVAILABLE_ROLES.map((r, i) => (
                    <motion.button
                      key={r.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.15 }}
                      onClick={() => handleRoleChange(r.id)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                        r.id === role 
                          ? "bg-[#FFFBE7] text-[#1E6702]" 
                          : "text-[#200813]/70 hover:bg-[#FFFBE7]/50 hover:text-[#200813]"
                      }`}
                    >
                      {r.label}
                      {r.id === role && <div className="w-1.5 h-1.5 rounded-full bg-[#1E6702]" />}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative border-l border-black/5 pl-5 ml-1" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 group focus:outline-none"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-[#1E6702] flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-[1.04]">
              <User className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[#200813] group-hover:text-[#1E6702] transition-colors">
                {user?.name || "Guest"}
              </span>
              <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5 text-[#200813]/30 group-hover:text-[#1E6702]/50 transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-56 bg-white/80 backdrop-blur-xl rounded-[20px] shadow-[0_12px_45px_-10px_rgba(32,8,19,0.15)] border border-white/50 overflow-hidden z-50 p-1"
              >
                <div className="px-4 py-3 border-b border-black/5">
                  <p className="text-sm font-bold text-[#200813]">{user?.name || "Guest"}</p>
                  <p className="text-xs font-medium text-[#200813]/50 mt-0.5">{activeRoleLabel}</p>
                </div>
                
                <div className="py-1">
                  <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-colors">
                    <User className="w-3.5 h-3.5" /> {t("nav.profile" as any) || "My Profile"}
                  </Link>
                  <button onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-colors">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-[#200813]/70 hover:bg-[#FFFBE7] hover:text-[#1E6702] rounded-xl transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Language
                  </button>
                </div>
                
                <div className="py-1 border-t border-black/5 mt-1">
                  <Link href="/login" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-xs font-semibold text-[#200813]/60 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
