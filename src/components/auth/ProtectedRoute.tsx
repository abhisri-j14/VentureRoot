"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated (token exists)
    if (!token) {
      // If not, redirect to login with a redirect intent
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setIsChecking(false);
    }
  }, [token, router, pathname]);

  if (isChecking) {
    // A minimal, subtle loading state to prevent layout flashes
    return (
      <div className="min-h-screen w-full bg-[#FFFBE7] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#1E6702]/30 border-t-[#1E6702] rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
