"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const WHATSAPP_NUMBER = "918295433041"; // Replace with actual Amritya number
const DEFAULT_MESSAGE = "Hey Amritya team, I would like to know more.";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // On cart and checkout pages, lift the button slightly higher to avoid overlapping the new floating checkout bars
  const isCartOrCheckout = pathname === "/cart" || pathname === "/checkout";
  const hasFloatingCart = mounted && totalItems > 0 && !isCartOrCheckout;
  const bottomOffset = isCartOrCheckout
    ? "bottom-[108px]"
    : hasFloatingCart
      ? "bottom-[104px]"
      : "bottom-6";

  return (
    <div
      className={`fixed right-0 z-[9999] whatsapp-mobile-only items-center transition-all duration-300 ease-out ${bottomOffset} ${isOpen
          ? "translate-x-[-16px]" // float nicely off the right edge when open
          : "translate-x-[34px]" // tuck away, leaving only a peeking tab visible
        }`}
    >
      {!isOpen ? (
        /* Interactive Peeking Tab */
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open WhatsApp support"
          className="flex items-center justify-start pl-3.5 w-14 h-14 rounded-l-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 hover:pl-4 transition-all duration-300 active:scale-95 animate-pulse-slow"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      ) : (
        /* Full Expanded Support Pill */
        <div className="flex items-center gap-3.5 bg-[#25D366] text-white shadow-2xl p-2 rounded-full border border-white/20 animate-reveal-fade">
          {/* Main Chat Link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 pl-3 py-1.5 font-black text-[9px] uppercase tracking-[0.25em]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>Chat With Us</span>
          </a>

          {/* Close Handle / Tuck Button */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Tuck WhatsApp support away"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-90 transition-all duration-200 mr-1"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
