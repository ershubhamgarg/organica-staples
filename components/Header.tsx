"use client";

import Link from "next/link";
import Image from "next/image";
import LaunchOfferBanner from "@/components/LaunchOfferBanner";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { supabase } from "@/utils/supabase";
import {
  ShoppingCart,
  Menu,
  UserCircle,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToHomeTop } from "@/utils/scrollToHomeTop";

export default function Header() {
  const { getTotalItems } = useCartStore();
  const { user, signOut, fetchUser } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const totalItems = getTotalItems();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleHomeClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    setIsMobileMenuOpen(false);

    if (pathname === "/") {
      event.preventDefault();
      scrollToHomeTop();
    }
  };

  const handleSectionClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    setIsMobileMenuOpen(false);

    if (pathname === "/") {
      const target = document.getElementById(sectionId);

      if (target) {
        event.preventDefault();
        window.history.pushState(null, "", `/#${sectionId}`);
        target.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    // Initialize audio - Ultra-soft, minimal muffled click (Almost no treble)
    audioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2351/2351-preview.mp3",
    );
    audioRef.current.volume = 0.1;
  }, []);

  useEffect(() => {
    if (mounted && totalItems > 0) {
      const animFrame = requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Ignore audio play errors (usually due to user interaction policies)
        });
      }
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => {
        cancelAnimationFrame(animFrame);
        clearTimeout(timer);
      };
    }
  }, [totalItems, mounted]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });
    void fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        window.setTimeout(() => {
          void fetchUser();
        }, 0);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.cancelAnimationFrame(frame);
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchUser]);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-brand-cream border-b border-brand-gold/10 py-0 shadow-[0_10px_30px_-15px_rgba(60,54,42,0.15)]"
            : "bg-transparent py-0"
        }`}
      >
        <div className="max-w-[95rem] mx-auto px-6 sm:px-10 flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link
              href="/"
              className="relative z-50 transition-transform duration-700 origin-left"
              onClick={handleHomeClick}
            >
              <Image
                src="/logo-annvriksh-tight.jpeg"
                alt="ANNVRIKSH"
                width={112}
                height={112}
                className="h-20 w-20 object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                priority
              />
            </Link>
          </div>

          {/* Actions & Navigation - Right */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 lg:gap-8 flex-1">
            <nav className="hidden lg:flex items-center gap-8 mr-4">
              <Link
                href="/"
                onClick={handleHomeClick}
                className="group relative font-serif text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-brown hover:text-brand-green transition-colors"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link
                href="/#shop"
                onClick={(event) => handleSectionClick(event, "shop")}
                className="group relative font-serif text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-brown hover:text-brand-green transition-colors"
              >
                The Pantry
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-500 group-hover:w-full" />
              </Link>
              <Link
                href="/our-story"
                className="group relative font-serif text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-brown hover:text-brand-green transition-colors"
              >
                About us
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-500 group-hover:w-full" />
              </Link>

              <Link
                href="/#contact"
                onClick={(event) => handleSectionClick(event, "contact")}
                className="group relative font-serif text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-brown hover:text-brand-green transition-colors"
              >
                Contact Us
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            </nav>

            <div className="h-4 w-[1px] bg-brand-gold/20 hidden lg:block" />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-brand-brown hover:text-brand-green transition-all hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  <UserCircle size={24} strokeWidth={1.2} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-4 w-56 bg-brand-cream/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-brand-gold/10 py-3 z-50 animate-fade-in overflow-hidden">
                    <div className="absolute inset-0 bg-jute opacity-5 pointer-events-none" />
                    <Link
                      href="/profile"
                      className="relative block px-5 py-3 text-[10px] uppercase tracking-widest text-brand-brown font-bold hover:bg-brand-gold/5 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/profile#orders"
                      className="relative block px-5 py-3 text-[10px] uppercase tracking-widest text-brand-brown font-bold hover:bg-brand-gold/5 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/profile#addresses"
                      className="relative block px-5 py-3 text-[10px] uppercase tracking-widest text-brand-brown font-bold hover:bg-brand-gold/5 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Addresses
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsDropdownOpen(false);
                        router.push("/");
                      }}
                      className="relative w-full text-left px-5 py-3 text-[10px] uppercase tracking-widest text-brand-terracotta font-bold hover:bg-brand-terracotta/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-brand-brown hover:text-brand-green transition-all font-serif text-[13px] uppercase tracking-[0.16em] font-semibold min-w-[48px] min-h-[48px] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}

            <Link
              href="/cart"
              className="relative text-brand-brown hover:text-brand-green transition-all hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart size={24} strokeWidth={1.5} />
              {mounted && totalItems > 0 && (
                <span
                  className={`absolute -top-1 -right-1 bg-brand-terracotta text-white text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-lg border-2 border-brand-cream z-50 transition-all duration-300 ${
                    isAnimating
                      ? "scale-125 bg-brand-green shadow-brand-green/20"
                      : "scale-100"
                  }`}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-brand-brown hover:text-brand-green transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X size={24} strokeWidth={1.2} />
              ) : (
                <Menu size={24} strokeWidth={1.2} />
              )}
            </button>
          </div>
        </div>
      </header>
      <LaunchOfferBanner />

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-brand-cream z-40 transition-all duration-500 ease-in-out lg:hidden ${
          isMobileMenuOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-jute opacity-10 pointer-events-none" />
        <div className="flex flex-col h-full justify-center p-12 gap-10">
          <Link
            href="/"
            className="text-4xl font-serif text-brand-brown hover:text-brand-gold transition-colors tracking-tight"
            onClick={handleHomeClick}
          >
            Home
          </Link>
          <Link
            href="/#shop"
            className="text-4xl font-serif text-brand-brown hover:text-brand-gold transition-colors tracking-tight"
            onClick={(event) => handleSectionClick(event, "shop")}
          >
            Shop
          </Link>
          <Link
            href="/our-story"
            className="text-4xl font-serif text-brand-brown hover:text-brand-gold transition-colors tracking-tight"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Our Story
          </Link>
          <Link
            href="/#contact"
            className="text-4xl font-serif text-brand-brown hover:text-brand-gold transition-colors tracking-tight"
            onClick={(event) => handleSectionClick(event, "contact")}
          >
            Contact Us
          </Link>

          <div className="mt-12 pt-12 border-t border-brand-gold/20">
            <Link
              href={user ? "/profile" : "/login"}
              className="font-serif text-[13px] uppercase tracking-[0.16em] font-semibold text-brand-brown/60 hover:text-brand-brown"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user ? "Account" : "Login"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
