"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import {
  ShoppingCart,
  Menu,
  Search,
  Leaf,
  User,
  LogOut,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { items } = useCartStore();
  const { user, signOut } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      // Transition over 120px for extra smoothness
      const progress = Math.min(scrollY / 120, 1);
      setScrollProgress(progress);
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
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-brand-cream/95 backdrop-blur-md shadow-sm py-2" : "bg-brand-cream py-3"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 md:h-14">
          {/* Logo - Smoothly animated based on scroll progress */}
          <div className="flex items-center flex-1">
            <Link
              href="/"
              className="relative z-50 hover:scale-105 transition-transform duration-300"
              style={{
                marginBottom: `${(1 - scrollProgress) * -56}px`, // Transition from -56px to 0
                transform: `translateY(${(1 - scrollProgress) * 10}px)`, // Slight upward lift as it hangs
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: `${128 - scrollProgress * 80}px`, // 128px (32) to 48px (12)
                  height: `${128 - scrollProgress * 80}px`,
                  transition: "none", // Remove CSS transition to link directly to scroll
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Amritya Organics"
                  fill
                  className="object-contain"
                  style={{
                    filter: `drop-shadow(0 4px 6px rgba(0,0,0,${(1 - scrollProgress) * 0.15}))`,
                  }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/"
              className="text-stone-800 hover:text-brand-green transition-colors text-xs uppercase tracking-[0.2em] font-medium"
            >
              Home
            </Link>
            <Link
              href="/#shop"
              className="text-stone-800 hover:text-brand-green transition-colors text-xs uppercase tracking-[0.2em] font-medium"
            >
              Shop
            </Link>
            <Link
              href="/our-story"
              className="text-stone-800 hover:text-brand-green transition-colors text-xs uppercase tracking-[0.2em] font-medium"
            >
              Our Story
            </Link>
          </nav>

          {/* Actions - Right Aligned */}
          <div className="flex items-center justify-end gap-5 md:gap-8 flex-1">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-stone-800 hover:text-brand-green transition-colors flex items-center gap-2"
                >
                  <UserCircle size={22} />
                  <ChevronDown
                    size={14}
                    className={
                      isDropdownOpen
                        ? "rotate-180 transition-transform"
                        : "transition-transform"
                    }
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-brand-brown transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Account
                      </div>
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        setIsDropdownOpen(false);
                        router.push("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} />
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-stone-800 hover:text-brand-green transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                <span className="hidden md:block text-xs uppercase tracking-[0.2em] font-medium">
                  Sign In
                </span>
              </Link>
            )}
            <Link
              href="/cart"
              className="text-stone-800 hover:text-brand-green relative flex items-center justify-center transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {mounted && items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-800 hover:text-brand-green transition-colors md:hidden"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-brand-cream z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: isScrolled ? "64px" : "80px" }} // Start below header
      >
        <div className="flex flex-col p-8 gap-8">
          <Link
            href="/"
            className="text-2xl font-serif text-brand-brown hover:text-brand-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/#shop"
            className="text-2xl font-serif text-brand-brown hover:text-brand-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/our-story"
            className="text-2xl font-serif text-brand-brown hover:text-brand-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Our Story
          </Link>
          {/* <Link 
            href="#" 
            className="text-2xl font-serif text-brand-brown hover:text-brand-gold transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Journal
          </Link> */}
        </div>
      </div>
    </>
  );
}
