import { create } from "zustand";
import { persist } from "zustand/middleware";
import usersData from "@/data/users.json";
import { getCurrentUser } from "@/lib/data/users";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  location?: string;
}

const getInitialUser = (): MockUser | null => {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE === "database") {
    return null;
  }
  return usersData.currentUser;
};

interface AuthState {
  token: string | null;
  user: MockUser | null;
  _hasHydrated: boolean;

  setHasHydrated: (val: boolean) => void;
  login: (token: string, user: MockUser) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: getInitialUser(),
      _hasHydrated: false,

      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),

      login: (token: string, user: MockUser) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("ventureroot_token", token);
          document.cookie = `ventureroot_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        }
        set({ token, user });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("ventureroot_token");
          localStorage.removeItem("ventureroot_user_name");
          localStorage.removeItem("ventureroot_user_email");
          localStorage.removeItem("ventureroot_user_id");
          localStorage.removeItem("ventureroot_auth_storage");
          document.cookie = "ventureroot_token=; path=/; max-age=0";
        }
        set({ token: null, user: null });
      },

      fetchUser: async () => {
        const user = await getCurrentUser();
        if (user) {
          set({ user });
        }
      },
    }),
    {
      name: "ventureroot_auth_storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
