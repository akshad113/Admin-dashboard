import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { requestApi } from "../lib/api";
import type { AuthResponse, AuthUser, MeResponse } from "../lib/types";

type AuthStore = {
  token: string | null;
  user: AuthUser | null;
  authLoading: boolean;
  signupCustomer: (input: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  loginCustomer: (input: { email: string; password: string }) => Promise<AuthResponse>;
  hydrateCustomer: () => Promise<void>;
  logoutCustomer: () => void;
};

// Create the customer auth store with persisted token and user data.
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      authLoading: false,

      // Register a customer account and store the returned session.
      signupCustomer: async (input) => {
        set({ authLoading: true });

        try {
          const response = await requestApi<AuthResponse>("/api/customer/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          });

          set({ token: response.token, user: response.user });
          return response;
        } finally {
          set({ authLoading: false });
        }
      },

      // Log a customer in and store the returned session.
      loginCustomer: async (input) => {
        set({ authLoading: true });

        try {
          const response = await requestApi<AuthResponse>("/api/customer/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          });

          set({ token: response.token, user: response.user });
          return response;
        } finally {
          set({ authLoading: false });
        }
      },

      // Refresh the stored user profile from the backend when a token already exists.
      hydrateCustomer: async () => {
        const token = get().token;

        if (!token) {
          return;
        }

        try {
          const response = await requestApi<MeResponse>("/api/customer/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          set({ user: response.user });
        } catch {
          set({ token: null, user: null });
        }
      },

      // Clear all auth state after logout.
      logoutCustomer: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: "customer-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
