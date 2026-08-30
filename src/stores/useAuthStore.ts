import { create } from "zustand";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  location?: string;
}

/** Pre-configured mock user for development testing */
const MOCK_USER: MockUser = {
  id: "user-ent-001",
  name: "Ravi Kumar",
  email: "ravi@example.com",
  roleLabel: "Entrepreneur",
  location: "Bankura, West Bengal",
};

interface AuthState {
  /** JWT token placeholder — will be populated during API phase */
  token: string | null;
  /** Current mock user */
  user: MockUser | null;

  /** Future: real login with backend token */
  login: (token: string, user: MockUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: MOCK_USER,

  login: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));
