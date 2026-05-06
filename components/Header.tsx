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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-brand-cream/95 backdrop-blur-md shadow-sm py-4" : "bg-brand-cream py-6"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden flex-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-800 hover:text-brand-green transition-colors p-2 -ml-2"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1">
            <Link
              href="/#shop"
              className="text-stone-800 hover:text-brand-green transition-colors text-sm uppercase tracking-widest font-medium"
            >
              Shop
            </Link>
            <Link
              href="/our-story"
              className="text-stone-800 hover:text-brand-green transition-colors text-sm uppercase tracking-widest font-medium"
            >
              Our Story
            </Link>
          </nav>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center flex-[2] md:flex-none">
            <Link
              href="/"
              className="flex flex-col items-center group relative pt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {/* Text: ORGANICA */}
              <span className="text-xl md:text-2xl font-sans text-brand-brown tracking-[0.35em] uppercase leading-none pl-[0.35em] font-light group-hover:text-brand-brown-light transition-colors">
                Organica
              </span>

              {/* Text: STAPLES */}
              <div className="flex items-center gap-2 mt-1">
                <div className="h-[0.5px] w-6 bg-brand-gold opacity-70"></div>
                <span className="text-[8px] md:text-[9px] font-sans text-brand-gold tracking-[0.4em] uppercase pl-[0.4em]">
                  Staples
                </span>
                <div className="h-[0.5px] w-6 bg-brand-gold opacity-70"></div>
              </div>

              {/* Tagline */}
              <span className="text-[5px] md:text-[6px] text-brand-brown tracking-[0.25em] uppercase mt-1 hidden md:block opacity-80">
                Pure By Nature &bull; Essential By Choice
              </span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-6 flex-1">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-stone-800 hover:text-brand-green transition-colors flex items-center gap-2"
                >
                  <UserCircle size={24} />
                  <ChevronDown
                    size={16}
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
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-red-600 transition-colors"
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
                <span className="hidden md:block text-sm uppercase tracking-widest font-medium">
                  Sign In
                </span>
              </Link>
            )}
            <Link
              href="/cart"
              className="text-stone-800 hover:text-brand-green relative flex items-center justify-center transition-colors p-2 -mr-2 md:m-0"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCart size={24} strokeWidth={1.5} />
              {mounted && items.length > 0 && (
                <span className="absolute top-0 right-0 md:-top-2 md:-right-2 bg-brand-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {items.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-brand-cream z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ top: "80px" }} // Start below header
      >
        <div className="flex flex-col p-8 gap-8">
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
