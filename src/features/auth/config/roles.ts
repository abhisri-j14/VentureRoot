import { Sprout, Users, Shield } from "lucide-react";
import { UserRole } from "@/stores/useAuthStore";

export interface RoleMetadata {
  id: UserRole;
  label: string;
  description: string;
  icon: any;
  landingRoute: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleMetadata> = {
  ENTREPRENEUR: {
    id: "ENTREPRENEUR",
    label: "Kisan",
    description: "Explore and plan your business opportunity",
    icon: Sprout,
    landingRoute: "/dashboard",
  },
  MENTOR_ADVISOR: {
    id: "MENTOR_ADVISOR",
    label: "Advisor / Mentor",
    description: "Support and review entrepreneur opportunities",
    icon: Users,
    landingRoute: "/dashboard",
  },
  ADMIN: {
    id: "ADMIN",
    label: "Administrator",
    description: "Manage VentureRoot platform data",
    icon: Shield,
    landingRoute: "/dashboard",
  },
};

export const AVAILABLE_ROLES = Object.values(ROLE_CONFIG);
