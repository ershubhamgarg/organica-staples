"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { useUserStore } from "@/store/userStore";

const getSafeNextPath = (next: string | null) => {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
};

const getCallbackErrorMessage = (message: string | null) => {
  if (!message) {
    return "Google sign in could not be completed. Please try again.";
  }

  if (message.toLowerCase().includes("access_denied")) {
    return "Google sign in was cancelled before it finished.";
  }

  return message;
};

export default function AuthCallbackPage() {
  const router = useRouter();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const setJustSignedIn = useUserStore((state) => state.setJustSignedIn);
  const [message, setMessage] = useState("Finishing secure sign in...");

  useEffect(() => {
    const finishSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const next = getSafeNextPath(params.get("next"));
      const providerError =
        params.get("error_description") ?? params.get("error");

      if (providerError) {
        router.replace(
          `/login?authError=${encodeURIComponent(
            getCallbackErrorMessage(providerError),
          )}`,
        );
        return;
      }

      const code = params.get("code");

      if (!code) {
        router.replace(
          "/login?authError=Google%20sign%20in%20could%20not%20be%20completed.%20Please%20try%20again.",
        );
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        router.replace(
          `/login?authError=${encodeURIComponent(
            getCallbackErrorMessage(error.message),
          )}`,
        );
        return;
      }

      setMessage("Sign in complete. Taking you to the store...");
      await fetchUser();
      setJustSignedIn(true);
      router.replace(next);
    };

    void finishSignIn();
  }, [fetchUser, router, setJustSignedIn]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4">
      <section className="flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-brand-gold/15 bg-white p-8 text-center shadow-xl">
        <LoaderCircle
          className="h-8 w-8 animate-spin text-brand-green"
          aria-hidden="true"
        />
        <h1 className="font-serif text-xl text-brand-brown">Signing You In</h1>
        <p className="text-sm text-brand-brown/70">{message}</p>
      </section>
    </main>
  );
}
