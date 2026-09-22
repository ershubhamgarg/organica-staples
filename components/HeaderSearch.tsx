"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Search icon in the header that expands into a search bar. Submitting
 * routes to the home page's pantry grid with the term in the URL
 * (?q=...#shop) — ProductListing reads it and jumps straight to matching
 * results, so a customer searching from anywhere on the site never has to
 * scroll to find what they typed.
 *
 * One entry point rather than three (a persistent desktop bar + a mobile
 * icon + a field inside the hamburger menu) — it works identically and
 * fits at every breakpoint without duplicating state.
 */
export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = term.trim();
    if (!trimmed) return;

    setIsOpen(false);
    setTerm("");
    router.push(`/?q=${encodeURIComponent(trimmed)}#shop`);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close search" : "Search products"}
        aria-expanded={isOpen}
        className="text-brand-brown hover:text-brand-green transition-all hover:scale-110 min-w-[48px] min-h-[48px] flex items-center justify-center"
      >
        {isOpen ? (
          <X size={22} strokeWidth={1.5} />
        ) : (
          <Search size={22} strokeWidth={1.5} />
        )}
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-3 w-[calc(100vw-3rem)] max-w-sm origin-top-right transition-all duration-200 sm:w-96 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 rounded-full border border-brand-gold/20 bg-white p-1.5 shadow-2xl shadow-brand-brown/15"
        >
          <Search
            size={15}
            strokeWidth={2}
            className="ml-2.5 shrink-0 text-brand-gold"
          />
          <input
            ref={inputRef}
            type="text"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search turmeric, dal, besan…"
            className="w-full bg-transparent py-2 text-sm text-brand-brown placeholder:text-brand-brown/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!term.trim()}
            className="shrink-0 rounded-full bg-brand-green px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-brand-cream transition-colors hover:bg-brand-green-light disabled:cursor-not-allowed disabled:opacity-40"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
