"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useCartStore } from "./cartStore";

const getSiteUrl = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000");

  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  return url.endsWith("/") ? url : `${url}/`;
};

const getAuthErrorMessage = (error: unknown) => {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Please check your connection and try again.";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("invalid login credentials")) {
      return "The email or password you entered is incorrect.";
    }

    if (message.includes("email not confirmed")) {
      return "Please confirm your email address before signing in.";
    }

    if (
      message.includes("failed to fetch") ||
      message.includes("network") ||
      message.includes("fetch")
    ) {
      return "We could not reach the authentication server. Please try again.";
    }

    if (error.message.trim()) {
      return error.message;
    }
  }

  return "Something went wrong while signing you in. Please try again.";
};

interface UserState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      clearError: () => set({ error: null }),

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, isLoading: false });

          if (data.user) {
            await useCartStore.getState().syncCartWithSupabase(data.user.id);
            const { useAddressStore } = await import("./addressStore");
            await useAddressStore.getState().fetchAddresses(data.user.id);
            const { useOrderStore } = await import("./orderStore");
            await useOrderStore.getState().fetchOrders(data.user.id);
          }
          return true;
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          return false;
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${getSiteUrl()}auth/callback?next=/`,
              queryParams: {
                access_type: "offline",
                prompt: "select_account",
              },
            },
          });
          if (error) throw error;
          return true;
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          return false;
        }
      },

      signUp: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, isLoading: false });
          return Boolean(data.user);
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          await supabase.auth.signOut();
          set({ user: null, isLoading: false });
          useCartStore.getState().clearCart();
          const { useAddressStore } = await import("./addressStore");
          useAddressStore.getState().clearAddresses();
          const { useOrderStore } = await import("./orderStore");
          useOrderStore.getState().clearOrders();
        } catch (error) {
          set({ error: getAuthErrorMessage(error), isLoading: false });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          set({ user, isLoading: false, isInitialized: true });

          if (user) {
            await useCartStore.getState().syncCartWithSupabase(user.id);
            // Dynamic import to avoid circular dependency issues if any
            const { useAddressStore } = await import("./addressStore");
            await useAddressStore.getState().fetchAddresses(user.id);
            const { useOrderStore } = await import("./orderStore");
            await useOrderStore.getState().fetchOrders(user.id);
          }
        } catch (error) {
          set({
            error: getAuthErrorMessage(error),
            isLoading: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: "organica-user-storage",
    },
  ),
);
