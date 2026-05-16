"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase";
import { User, AuthError } from "@supabase/supabase-js";
import { useCartStore } from "./cartStore";

const getSiteUrl = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  return url.endsWith("/") ? url : `${url}/`;
};

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

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
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: getSiteUrl(),
            },
          });
          if (error) throw error;
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
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
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
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
          set({ error: (error as AuthError).message, isLoading: false });
        }
      },

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          set({ user, isLoading: false });

          if (user) {
            await useCartStore.getState().syncCartWithSupabase(user.id);
            // Dynamic import to avoid circular dependency issues if any
            const { useAddressStore } = await import("./addressStore");
            await useAddressStore.getState().fetchAddresses(user.id);
            const { useOrderStore } = await import("./orderStore");
            await useOrderStore.getState().fetchOrders(user.id);
          }
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
        }
      },
    }),
    {
      name: "organica-user-storage",
    },
  ),
);
