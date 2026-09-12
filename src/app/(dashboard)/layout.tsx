import React from "react";

import { TopNav } from "@/components/layout/TopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DashboardBackground } from "@/components/layout/DashboardBackground";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#f4fce8] relative">
        <DashboardBackground />
        <div className="flex-1 flex flex-col relative z-10 w-full mx-auto pb-20 md:pb-0">
          <TopNav />
          <main className="flex-1 w-full relative z-10">{children}</main>
        </div>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
