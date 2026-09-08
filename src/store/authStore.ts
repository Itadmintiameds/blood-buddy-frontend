"use client";

import { UserRole } from "@/types/authTypes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  login: (user: AuthUser) => void;
  setRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      setRole: (role) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                role,
              }
            : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "blood-buddy-auth",
    },
  ),
);
