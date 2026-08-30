"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusCircle,
  MessageSquare,
  User,
  Briefcase,
  FileText,
  BarChart2,
  ClipboardCheck,
  Users,
  BookOpen,
  MapPinned,
  Layers,
  Brain,
  Database,
  Shield,
} from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";
import { LanguageSwitcher } from "@/features/i18n/components/LanguageSwitcher";
import { useAuthStore, UserRole } from "@/stores/useAuthStore";

interface NavItem {
  href: string;
  tKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ENTREPRENEUR: [
    { href: "/dashboard", tKey: "nav.dashboard", icon: Home },
    { href: "/profile", tKey: "nav.profile", icon: User },
    { href: "/business/123", tKey: "nav.myBusiness", icon: Briefcase },
    { href: "/business/create", tKey: "nav.newBusiness", icon: PlusCircle },
    { href: "/business/compare", tKey: "nav.compare", icon: BarChart2 },
    { href: "/reports", tKey: "nav.reports", icon: FileText },
    { href: "/advisor", tKey: "nav.advisor", icon: MessageSquare },
  ],
  MENTOR_ADVISOR: [
    { href: "/dashboard", tKey: "nav.dashboard", icon: Home },
    { href: "/reviews", tKey: "nav.businessReviews", icon: ClipboardCheck },
    { href: "/business/compare", tKey: "nav.compare", icon: BarChart2 },
    { href: "/reports", tKey: "nav.reports", icon: FileText },
    { href: "/advisor", tKey: "nav.advisor", icon: MessageSquare },
  ],
  ADMIN: [
    { href: "/dashboard", tKey: "nav.dashboard", icon: Home },
    { href: "/admin?tab=users", tKey: "nav.users", icon: Users },
    { href: "/admin?tab=schemes", tKey: "nav.schemes", icon: BookOpen },
    { href: "/admin?tab=categories", tKey: "nav.categories", icon: Layers },
    { href: "/admin?tab=geography", tKey: "nav.geography", icon: MapPinned },
    { href: "/admin?tab=ai", tKey: "nav.aiOversight", icon: Brain },
    { href: "/admin?tab=kb", tKey: "nav.knowledgeBase", icon: Database },
  ],
};

export const Sidebar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const role = useAuthStore((s) => s.role);

  const navItems = NAV_BY_ROLE[role];

  return (
    <aside className="w-64 bg-[#1E6702] border-r border-[#1E6702] h-screen flex flex-col p-4 shadow-xl z-20 rounded-r-[32px]">
      {/* Logo */}
      <div className="mb-10 px-3 pt-4">
        <Link href="/" className="block bg-white p-2 rounded-xl transition-transform duration-300 hover:scale-[1.02]">
          <img src="/logo-2.png" alt="VentureRoot" className="h-10 w-auto object-contain" />
        </Link>
        <p className="text-[11px] font-medium text-white/60 mt-3 tracking-wide uppercase">
          {role === "ADMIN" ? t("role.admin" as any) : role === "MENTOR_ADVISOR" ? t("role.mentorAdvisor" as any) : "Business Intelligence"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, tKey, icon: Icon }) => {
          const basePath = href.split("?")[0];
          const isActive =
            (basePath === "/dashboard" && pathname === "/dashboard") ||
            (basePath === "/profile" && pathname === "/profile") ||
            (basePath === "/admin" && pathname === "/admin") ||
            (basePath === "/reviews" && pathname === "/reviews") ||
            (basePath !== "/dashboard" &&
              basePath !== "/profile" &&
              basePath !== "/admin" &&
              basePath !== "/reviews" &&
              pathname.startsWith(basePath));

          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3.5 py-3 rounded-[14px] text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-[1.05]" />
              {t(tKey as any)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 mt-4 px-3 pb-2">
        <div className="text-white/80 hover:text-white transition-colors">
          <LanguageSwitcher />
        </div>
        <p className="text-[11px] text-white/40">v0.2.0 — 3-Role Architecture</p>
      </div>
    </aside>
  );
};
