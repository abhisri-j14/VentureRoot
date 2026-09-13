"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Briefcase, TrendingUp, MessageSquare, User } from "lucide-react";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { data: businesses } = useBusinessesComparison();
  const { t } = useTranslation();

  const businessMatch = pathname.match(/^\/business\/([^/?#]+)/);
  const routeBusinessId = businessMatch && businessMatch[1] !== "create" && businessMatch[1] !== "compare" ? businessMatch[1] : null;
  const activeBusiness = businesses?.[0];
  const selectedBusinessId = routeBusinessId || activeBusiness?.id;

  const businessBase = selectedBusinessId ? `/business/${selectedBusinessId}` : "/business";
  const financeBase = selectedBusinessId ? `/business/${selectedBusinessId}/finance` : "/business/create";

  const NAV_ITEMS = [
    {
      id: "mob-dashboard",
      href: "/dashboard",
      label: t("nav.dashboard" as any) || "Dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      id: "mob-analysis",
      href: "/analysis",
      label: t("nav.analysis" as any) || "Analysis",
      icon: BarChart2,
      isActive: pathname === "/analysis" || pathname.startsWith("/analysis/"),
    },
    {
      id: "mob-business",
      href: businessBase,
      label:
        t("nav.myBusiness" as any) === "My Business"
          ? "Business"
          : t("nav.myBusiness" as any) || "Business",
      icon: Briefcase,
      isActive:
        pathname.startsWith("/business") &&
        !pathname.startsWith("/business/create") &&
        !pathname.startsWith("/business/compare") &&
        !pathname.includes("/finance") &&
        !pathname.includes("/feasibility") &&
        !pathname.includes("/roadmap"),
    },
    {
      id: "mob-finance",
      href: financeBase,
      label: t("nav.finance" as any) || "Finance",
      icon: TrendingUp,
      isActive: pathname.includes("/finance"),
    },
    {
      id: "mob-advisor",
      href: "/advisor",
      label:
        t("nav.advisor" as any) === "AI Advisor"
          ? "Advisor"
          : t("nav.advisor" as any) || "Advisor",
      icon: MessageSquare,
      isActive: pathname === "/advisor" || pathname.startsWith("/advisor/"),
    },
    {
      id: "mob-profile",
      href: "/profile",
      label:
        t("nav.profile" as any) === "My Profile"
          ? "Profile"
          : t("nav.profile" as any) || "Profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5"
    >
      <div className="grid grid-cols-6 items-center w-full max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-200 active:scale-95 w-full min-w-0 ${
                active ? "text-[#1E6702]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-7 h-7 min-[380px]:w-7.5 min-[380px]:h-7.5 rounded-full transition-all duration-200 ${
                  active ? "bg-[#1E6702]/10" : ""
                }`}
              >
                <Icon className={`w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {active && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#1E6702]" />
                )}
              </div>
              <span
                className={`text-[8.5px] min-[360px]:text-[9px] min-[400px]:text-[9.5px] font-semibold mt-0.5 tracking-tight truncate max-w-full text-center px-0.5 ${
                  active ? "font-bold text-[#1E6702]" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
