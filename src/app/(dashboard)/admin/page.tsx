"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { UserManagementTable } from "@/features/admin/sections/users/components/UserManagementTable";
import { SchemeManagement } from "@/features/admin/sections/schemes/components/SchemeManagement";
import { CategoryManagement } from "@/features/admin/sections/categories/components/CategoryManagement";
import { GeographyManagement } from "@/features/admin/sections/geography/components/GeographyManagement";
import { AIOversightDashboard } from "@/features/admin/sections/ai-oversight/components/AIOversightDashboard";
import { KnowledgeBaseManagement } from "@/features/admin/sections/knowledge-base/components/KnowledgeBaseManagement";
import { useAuthStore } from "@/stores/useAuthStore";
import { AccessDenied } from "@/components/layout/AccessDenied";

export default function AdminPage() {
  const role = useAuthStore((s) => s.role);
  const searchParams = useSearchParams();

  if (role !== "ADMIN") {
    return <AccessDenied />;
  }

  const tab = searchParams.get("tab") || "users";

  return (
    <div className="h-full">
      <AdminLayout>
        {tab === "users" && <UserManagementTable />}
        {tab === "schemes" && <SchemeManagement />}
        {tab === "categories" && <CategoryManagement />}
        {tab === "geography" && <GeographyManagement />}
        {tab === "ai" && <AIOversightDashboard />}
        {tab === "kb" && <KnowledgeBaseManagement />}
      </AdminLayout>
    </div>
  );
}
