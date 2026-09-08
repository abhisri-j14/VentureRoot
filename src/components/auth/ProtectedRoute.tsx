"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [token, hasHydrated, router, pathname]);

  if (!hasHydrated || !token) {
    return (
      <div className="min-h-screen w-full bg-[#FFFBE7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
