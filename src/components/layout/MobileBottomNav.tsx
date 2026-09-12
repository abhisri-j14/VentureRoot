"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, TrendingUp, MessageSquare, User } from "lucide-react";
import { useBusinessesComparison } from "@/lib/data/businesses";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const { data: businesses } = useBusinessesComparison();
  const { t } = useTranslation();

  const activeBusiness = businesses?.[0];
  const businessBase = activeBusiness?.id ? `/business/${activeBusiness.id}` : "/business/create";
  const financeBase = activeBusiness?.id ? `/business/${activeBusiness.id}/finance` : "/business/create";

  const NAV_ITEMS = [
    {
      id: "mob-dashboard",
      href: "/dashboard",
      label: t("nav.dashboard" as any) || "Dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      id: "mob-business",
      href: businessBase,
      label: t("nav.myBusiness" as any) || "Venture",
      icon: Briefcase,
      isActive: pathname.startsWith("/business") && !pathname.includes("/finance"),
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
      label: t("nav.advisor" as any) || "Advisor",
      icon: MessageSquare,
      isActive: pathname === "/advisor",
    },
    {
      id: "mob-profile",
      href: "/profile",
      label: t("nav.profile" as any) || "Profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                active ? "text-[#1E6702]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                  active ? "bg-[#1E6702]/10" : ""
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                {active && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#1E6702]" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold mt-0.5 tracking-tight truncate max-w-[58px] ${
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
