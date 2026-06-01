"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  Camera,
  CheckCircle2,
  LockKeyhole,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useLaunchOfferClaimStatus } from "@/lib/useLaunchOfferClaimStatus";

export default function LaunchOfferBanner() {
  const { user } = useUserStore();
  const [hasRevealDelayElapsed, setHasRevealDelayElapsed] = useState(false);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { hasClaimed } = useLaunchOfferClaimStatus(user);

  const primaryCtaHref = hasClaimed
    ? "/profile#orders"
    : user
      ? "/#shop"
      : "/login";
  const primaryCtaLabel = hasClaimed
    ? "View Order Status"
    : user
      ? "Claim Offer"
      : "Login To Claim";

  useEffect(() => {
    const revealTimer = window.setTimeout(() => {
      setHasRevealDelayElapsed(true);
    }, 1400);

    return () => {
      window.clearTimeout(revealTimer);
    };
  }, []);

  useEffect(() => {
    if (!showOfferDetails) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showOfferDetails]);

  if (isDismissed || !hasRevealDelayElapsed || hasClaimed) {
    return null;
  }

  return (
    <>
      <div
        className={`animate-reveal-down relative z-40 border-y text-white shadow-[0_12px_30px_rgba(17,24,39,0.22)] ${
          hasClaimed
            ? "border-brand-green/20 bg-brand-green"
            : "border-white/15 bg-[#111827]"
        }`}
      >
        <div
          className={`absolute inset-0 opacity-95 ${
            hasClaimed
              ? "bg-[linear-gradient(90deg,#112C24_0%,#153128_55%,#E8D090_140%)]"
              : "bg-[linear-gradient(90deg,#112C24_0%,#7f1d1d_48%,#F8C878_120%)]"
          }`}
        />
        <div className="relative mx-auto flex max-w-[95rem] flex-col items-center justify-between gap-3 px-5 py-3 text-center sm:flex-row sm:text-left lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-lg ${
                hasClaimed ? "text-brand-green" : "text-[#7f1d1d]"
              }`}
            >
              {hasClaimed ? (
                <CheckCircle2 size={20} strokeWidth={1.8} />
              ) : user ? (
                <Sparkles size={20} strokeWidth={1.8} />
              ) : (
                <LockKeyhole size={20} strokeWidth={1.8} />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[12px] font-semibold uppercase tracking-[0.28em] text-brand-gold-accent sm:text-[13px]">
                Launch Story Offer
              </p>
              <p className="mt-0.5 font-serif text-lg font-medium leading-tight tracking-normal text-white sm:text-xl">
                {hasClaimed
                  ? "Congratulations on claiming the launch offer. Our team is working on fulfilment."
                  : "Registered customers get any 2 products at ₹0 cost."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOfferDetails(true)}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white px-5 text-[9px] font-black uppercase tracking-[0.22em] text-[#111827] shadow-lg transition-transform hover:scale-[1.02]"
            >
              {hasClaimed ? "View Status" : "Learn More"}{" "}
              <ArrowRight size={13} strokeWidth={2} />
            </button>
            {hasClaimed && (
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-brand-brown"
                aria-label="Hide launch offer banner"
              >
                <X size={16} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showOfferDetails && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-brown/70 px-3 py-3 backdrop-blur-md sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-offer-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close launch offer details"
            onClick={() => setShowOfferDetails(false)}
          />

          <div className="relative w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-brand-gold/25 bg-brand-cream shadow-[0_40px_120px_-35px_rgba(17,24,39,0.85)] sm:rounded-[2rem]">
            <div className="absolute inset-0 bg-organic-texture opacity-40" />
            <div className="absolute left-0 top-0 h-1.5 w-full bg-[linear-gradient(90deg,#7f1d1d,#E8D090,#112C24)]" />

            <div className="relative p-4 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-gold shadow-xl sm:h-12 sm:w-12 ${
                      hasClaimed
                        ? "bg-brand-green shadow-brand-green/20"
                        : "bg-[#7f1d1d] shadow-[#7f1d1d]/20"
                    }`}
                  >
                    {hasClaimed ? (
                      <CheckCircle2 size={22} strokeWidth={1.7} />
                    ) : (
                      <Sparkles size={22} strokeWidth={1.7} />
                    )}
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.24em] text-brand-gold sm:text-[9px]">
                      {hasClaimed
                        ? "Launch Story Offer Claimed"
                        : "Limited Launch Story Offer"}
                    </p>
                    <h2
                      id="launch-offer-title"
                      className="mt-1 text-2xl font-serif leading-none tracking-tight text-brand-brown sm:text-3xl"
                    >
                      {hasClaimed
                        ? "Your claim is confirmed"
                        : "Any 2 products at ₹0 product cost"}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfferDetails(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/15 bg-white text-brand-brown/50 transition-colors hover:text-brand-terracotta"
                  aria-label="Close launch offer details"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              <p className="max-w-2xl text-xs font-light leading-relaxed text-brand-brown/70 sm:text-sm">
                {hasClaimed
                  ? "Your one-time launch offer claim is confirmed. Our team is working toward fulfilment and will process it after verification."
                  : "Choose exactly 2 different products, keep quantity 1 each, and place a ₹0 launch order. Share the receipt on Instagram Story and tag @urbankisan.co for verification."}
              </p>

              {!hasClaimed && (
                <>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      {
                        icon: ShoppingBag,
                        title: "Pick 2 Products",
                        body: "Two different products, one unit each.",
                      },
                      {
                        icon: BadgeIndianRupee,
                        title: "Pay ₹0",
                        body: "Product cost is waived for the offer order.",
                      },
                      {
                        icon: Camera,
                        title: "Story Tag",
                        body: "Upload receipt and tag @urbankisan.co.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-brand-gold/10 bg-white/70 p-3 shadow-sm"
                      >
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-terracotta/10 text-brand-terracotta">
                          <item.icon size={15} strokeWidth={1.7} />
                        </div>
                        <h3 className="text-[8px] font-black uppercase tracking-[0.12em] text-brand-brown sm:text-[9px]">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[10px] font-light leading-snug text-brand-brown/60 sm:text-xs">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-brand-terracotta/15 bg-brand-terracotta/5 p-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.22em] text-brand-terracotta sm:text-[9px]">
                      Important Rules
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-light leading-snug text-brand-brown/70 sm:text-xs">
                      <p>One claim per signed-in email.</p>
                      <p>Exactly 2 products in cart.</p>
                      <p>Quantity must be 1 each.</p>
                      <p>Inventory checked at order placement.</p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={primaryCtaHref}
                  onClick={() => setShowOfferDetails(false)}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-3 rounded-full bg-brand-brown px-6 text-[9px] font-black uppercase tracking-[0.2em] text-brand-cream shadow-xl shadow-brand-brown/15 transition-transform hover:translate-y-[-1px]"
                >
                  {primaryCtaLabel} <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowOfferDetails(false)}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-brand-gold/20 bg-white px-6 text-[9px] font-black uppercase tracking-[0.18em] text-brand-brown transition-colors hover:border-brand-brown/20"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
