import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "@/services/supabase";
import { Address } from "@/types/domain";

type AddressInput = Omit<Address, "id" | "user_id">;

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: (userId: string) => Promise<void>;
  addAddress: (userId: string, addressData: AddressInput) => Promise<Address>;
  removeAddress: (addressId: string) => Promise<void>;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      error: null,

      fetchAddresses: async (userId) => {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          if (error.code === "42P01") {
            set({ addresses: [], isLoading: false });
            return;
          }
          set({ error: error.message, isLoading: false });
          return;
        }

        set({ addresses: (data || []) as Address[], isLoading: false });
      },

      addAddress: async (userId, addressData) => {
        set({ isLoading: true, error: null });
        const payload = { user_id: userId, ...addressData };
        const { data, error } = await supabase
          .from("addresses")
          .insert([payload])
          .select()
          .single();

        if (error) {
          if (error.code === "42P01") {
            const localAddress = {
              id: Math.random().toString(36).slice(2),
              ...payload,
            };
            set({
              addresses: [localAddress, ...get().addresses],
              isLoading: false,
            });
            return localAddress;
          }
          set({ error: error.message, isLoading: false });
          throw error;
        }

        const address = data as Address;
        set({ addresses: [address, ...get().addresses], isLoading: false });
        return address;
      },

      removeAddress: async (addressId) => {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from("addresses")
          .delete()
          .eq("id", addressId);

        if (error && error.code !== "42P01") {
          set({ error: error.message, isLoading: false });
          return;
        }

        set({
          addresses: get().addresses.filter((address) => address.id !== addressId),
          isLoading: false,
        });
      },

      clearAddresses: () => set({ addresses: [], error: null }),
    }),
    {
      name: "amritya-mobile-addresses",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
