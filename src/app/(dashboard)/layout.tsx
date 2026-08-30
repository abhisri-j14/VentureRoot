import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DashboardBackground } from "@/components/layout/DashboardBackground";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f4fce8] relative">
        <DashboardBackground />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6 relative z-10">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
