import { create } from "zustand";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  location?: string;
}

import usersData from "@/data/users.json";
import { getCurrentUser } from "@/lib/data/users";

// Initialize carefully based on data source
const getInitialUser = (): MockUser | null => {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "database") {
    return null; // Must log in or fetch via backend
  }
  return usersData.currentUser;
};

interface AuthState {
  /** JWT token placeholder — will be populated during API phase */
  token: string | null;
  /** Current mock user */
  user: MockUser | null;

  /** Future: real login with backend token */
  login: (token: string, user: MockUser) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: getInitialUser(),

  login: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
  fetchUser: async () => {
    const user = await getCurrentUser();
    if (user) {
      set({ user });
    }
  }
}));
