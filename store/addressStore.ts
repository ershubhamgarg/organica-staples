"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/utils/supabase";

export interface Address {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: (userId: string) => Promise<void>;
  addAddress: (userId: string, addressData: Omit<Address, "id" | "user_id">) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  clearAddresses: () => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      error: null,

      fetchAddresses: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching addresses:", error);
            // Don't throw if the table doesn't exist yet during development, just set empty
            if (error.code === '42P01') { // relation does not exist
              set({ addresses: [], isLoading: false });
              return;
            }
            throw error;
          }

          set({ addresses: data || [], isLoading: false });
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false });
        }
      },

      addAddress: async (userId: string, addressData: Omit<Address, "id" | "user_id">) => {
        set({ isLoading: true, error: null });
        try {
          // Generate a temporary ID for optimistic UI update, or let DB generate
          const tempId = crypto.randomUUID();
          
          const newAddress = {
            user_id: userId,
            ...addressData,
          };

          const { data, error } = await supabase
            .from("addresses")
            .insert([newAddress])
            .select()
            .single();

          if (error) {
            // In case table is missing during dev, fallback to local state with a random id
            if (error.code === '42P01') {
              console.warn("Addresses table missing. Saving to local state only.");
              const localAddr = { id: tempId, ...newAddress };
              set({ addresses: [localAddr, ...get().addresses], isLoading: false });
              return;
            }
            throw error;
          }

          set({
            addresses: [data, ...get().addresses],
            isLoading: false,
          });
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false });
        }
      },

      removeAddress: async (addressId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("addresses")
            .delete()
            .eq("id", addressId);

          if (error && error.code !== '42P01') throw error;

          set({
            addresses: get().addresses.filter((a) => a.id !== addressId),
            isLoading: false,
          });
        } catch (error) {
          set({ error: getErrorMessage(error), isLoading: false });
        }
      },

      clearAddresses: () => {
        set({ addresses: [], error: null });
      }
    }),
    {
      name: "organica-address-storage",
    }
  )
);
