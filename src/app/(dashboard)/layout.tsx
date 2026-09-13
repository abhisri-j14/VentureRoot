import React from "react";

import { TopNav } from "@/components/layout/TopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DashboardBackground } from "@/components/layout/DashboardBackground";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageFooter } from "@/components/layout/PageFooter";

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
          <main className="flex-1 w-full relative z-10 flex flex-col justify-between">
            <div className="flex-1 w-full">{children}</div>
            <PageFooter className="mt-auto py-5" />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
