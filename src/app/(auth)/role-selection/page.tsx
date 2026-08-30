"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/stores/useAuthStore";
import { ROLE_CONFIG, AVAILABLE_ROLES } from "@/features/auth/config/roles";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const switchRole = useAuthStore((s) => s.switchRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>("ENTREPRENEUR"); // Kisan default

  const handleContinue = () => {
    switchRole(selectedRole);
    const landingRoute = ROLE_CONFIG[selectedRole].landingRoute;
    router.push(landingRoute);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-heading font-bold text-secondary">
          Welcome to VentureRoot
        </h1>
        <p className="text-secondary-muted text-lg">
          Choose how you want to continue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AVAILABLE_ROLES.map((role) => {
          const isSelected = selectedRole === role.id;
          
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`
                relative flex flex-col p-6 rounded-3xl border-2 transition-all cursor-pointer
                ${isSelected 
                  ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50"}
              `}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-200">
                  <CheckCircle2 className="w-6 h-6 fill-primary/10" />
                </div>
              )}
              
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center mb-4
                ${isSelected ? "bg-primary text-white" : "bg-slate-100 text-secondary-muted"}
              `}>
                <role.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-secondary mb-2">
                {role.id === "ENTREPRENEUR" ? "🌱 " : ""}{role.label}
              </h3>
              <p className="text-sm text-secondary-muted flex-grow">
                {role.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleContinue}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
        >
          Continue as {ROLE_CONFIG[selectedRole].label}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
