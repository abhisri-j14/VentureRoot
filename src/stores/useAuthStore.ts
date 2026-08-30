import { create } from "zustand";

export type UserRole = "ENTREPRENEUR" | "MENTOR_ADVISOR" | "ADMIN";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  location?: string;
}

/** Pre-configured mock users for development testing */
const MOCK_USERS: Record<UserRole, MockUser> = {
  ENTREPRENEUR: {
    id: "user-ent-001",
    name: "Ravi Kumar",
    email: "ravi@example.com",
    role: "ENTREPRENEUR",
    roleLabel: "Entrepreneur / Kisan",
    location: "Bankura, West Bengal",
  },
  MENTOR_ADVISOR: {
    id: "user-adv-001",
    name: "Ananya Sharma",
    email: "ananya@ventureroot.in",
    role: "MENTOR_ADVISOR",
    roleLabel: "Mentor / Advisor",
    location: "Kolkata, West Bengal",
  },
  ADMIN: {
    id: "user-adm-001",
    name: "System Admin",
    email: "admin@ventureroot.in",
    role: "ADMIN",
    roleLabel: "Administrator",
  },
};

interface AuthState {
  /** JWT token placeholder — will be populated during API phase */
  token: string | null;
  /** Active user role */
  role: UserRole;
  /** Current mock user */
  user: MockUser | null;

  /** Future: real login with backend token */
  login: (token: string, user: MockUser) => void;
  logout: () => void;
  /** Development-only: switch between roles to test all 3 interfaces */
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: "ENTREPRENEUR",
  user: MOCK_USERS.ENTREPRENEUR,

  login: (token, user) => set({ token, user, role: user.role }),
  logout: () => set({ token: null, user: null, role: "ENTREPRENEUR" }),
  switchRole: (role) => set({ role, user: MOCK_USERS[role] }),
}));
