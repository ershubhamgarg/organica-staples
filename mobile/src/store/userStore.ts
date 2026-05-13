import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/services/supabase";
import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

async function hydrateUserData(userId: string) {
  await useCartStore.getState().syncCartWithSupabase(userId);
  await useAddressStore.getState().fetchAddresses(userId);
  await useOrderStore.getState().fetchOrders(userId);
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          set({ user: data.user, isLoading: false });
          if (data.user) await hydrateUserData(data.user.id);
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
        }
      },

      signUp: async (email, password) => {
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
        await supabase.auth.signOut();
        useCartStore.getState().clearCart();
        useAddressStore.getState().clearAddresses();
        useOrderStore.getState().clearOrders();
        set({ user: null, isLoading: false });
      },

      fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          set({ user, isLoading: false });
          if (user) await hydrateUserData(user.id);
        } catch (error) {
          set({ error: (error as AuthError).message, isLoading: false });
        }
      },
    }),
    {
      name: "amritya-mobile-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
