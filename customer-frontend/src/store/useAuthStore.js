import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      authLoading: false,

      signupCustomer: async ({ name, email, password }) => {
        set({ authLoading: true });
        try {
          const response = await axios.post("/api/customer/auth/signup", {
            name,
            email,
            password
          });
          set({
            token: response.data.token,
            user: response.data.user
          });
          return response.data;
        } finally {
          set({ authLoading: false });
        }
      },

      loginCustomer: async ({ email, password }) => {
        set({ authLoading: true });
        try {
          const response = await axios.post("/api/customer/auth/login", {
            email,
            password
          });
          set({
            token: response.data.token,
            user: response.data.user
          });
          return response.data;
        } finally {
          set({ authLoading: false });
        }
      },

      hydrateCustomer: async () => {
        const token = get().token;
        if (!token) {
          return;
        }

        try {
          const response = await axios.get("/api/customer/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });

          set({ user: response.data.user });
        } catch (_error) {
          set({ token: null, user: null });
        }
      },

      logoutCustomer: () => {
        set({ token: null, user: null });
      }
    }),
    {
      name: "customer-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
);
