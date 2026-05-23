"use client";

import Link from "next/link";
import { Sparkles, LockKeyhole, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/utils/supabase";

export default function LaunchOfferBanner() {
  const { user } = useUserStore();
  const [claimedUserId, setClaimedUserId] = useState<string | null>(null);
  const hasClaimed = Boolean(user?.id && claimedUserId === user.id);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchClaim = async () => {
      const { data, error } = await supabase
        .from("launch_offer_claims")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.id) {
        setClaimedUserId(user.id);
      }
    };

    void fetchClaim();
  }, [user?.id]);

  return (
    <div className="relative z-40 border-y border-white/15 bg-[#111827] text-white shadow-[0_12px_30px_rgba(17,24,39,0.22)]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#111827_0%,#7f1d1d_48%,#facc15_120%)] opacity-95" />
      <div className="relative mx-auto flex max-w-[95rem] flex-col items-center justify-between gap-3 px-5 py-3 text-center sm:flex-row sm:text-left lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#7f1d1d] shadow-lg">
            {hasClaimed ? (
              <CheckCircle2 size={20} strokeWidth={1.8} />
            ) : user ? (
              <Sparkles size={20} strokeWidth={1.8} />
            ) : (
              <LockKeyhole size={20} strokeWidth={1.8} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.32em] text-yellow-200">
              Launch Story Offer
            </p>
            <p className="mt-0.5 text-sm font-semibold leading-snug sm:text-base">
              {hasClaimed
                ? "You have already claimed your one-time launch offer."
                : "Signed-in customers get any 2 products at ₹0 product cost."}
            </p>
          </div>
        </div>

        <Link
          href={hasClaimed ? "/profile#orders" : user ? "/cart" : "/login"}
          className="inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-full border border-white/30 bg-white px-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#111827] shadow-lg transition-transform hover:scale-[1.02]"
        >
          {hasClaimed ? "View Orders" : user ? "Claim In Cart" : "Sign In To Claim"}
        </Link>
      </div>
    </div>
  );
}
