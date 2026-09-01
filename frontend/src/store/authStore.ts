import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CurrentUser } from "../types/auth";

interface AuthState {
  token: string | null;
  tokenType: string | null;
  userId: number | null;
  currentUser: CurrentUser | null;
  setAuth: (token: string, tokenType: string, userId: number) => void;
  setCurrentUser: (user: CurrentUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tokenType: null,
      userId: null,
      currentUser: null,

      setAuth: (token, tokenType, userId) =>
        set({ token, tokenType, userId }),

      setCurrentUser: (user) => set({ currentUser: user }),

      clearAuth: () =>
        set({ token: null, tokenType: null, userId: null, currentUser: null }),
    }),
    {
      name: "auth-storage", // ใช้ localStorage โดยอัตโนมัติ
    }
  )
);
