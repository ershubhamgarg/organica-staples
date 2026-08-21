import type { Metadata } from "next";
import Link from "next/link";
import {
  Plus_Jakarta_Sans,
  Fraunces,
  Noto_Sans_Devanagari,
} from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCart from "@/components/FloatingCart";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["SOFT"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://annvriksh.com",
  ),
  title: "ANNVRIKSH | Premium Organic Goods",
  description:
    "Discover our curated selection of premium organic staples, directly sourced for your wellbeing.",
  icons: {
    icon: "/logo-annvriksh-new.jpeg",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sans.variable} ${serif.variable} ${devanagari.variable} antialiased bg-brand-cream text-stone-900 flex flex-col min-h-screen`}
      >
        <Header />

        <main className="flex-grow">{children}</main>

        <WhatsAppButton />
        <FloatingCart />

        <footer className="bg-white text-brand-brown/70 py-16 relative overflow-hidden border-t border-brand-gold/10">
          <div className="absolute inset-0 bg-organic-texture opacity-[0.03] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="space-y-8 flex flex-col items-center md:items-start">
              <Image
                src="/ann_logo_header.png"
                alt="ANNVRIKSH"
                width={636}
                height={212}
                className="h-auto w-56 sm:w-64 object-contain"
              />
              {/* <p className="text-sm text-brand-brown/60 max-w-xs font-light leading-relaxed text-center md:text-left italic">
                "Purity in every grain, harvest in every heart."
              </p> */}
            </div>
            <div>
              <h4 className="text-brand-gold font-serif text-lg mb-6 tracking-wide">
                Pauranik Explore
              </h4>
              <ul className="space-y-3 text-sm font-light">
                <li>
                  <Link
                    href="/#shop"
                    className="hover:text-brand-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:w-3" />
                    Our Pantry
                  </Link>
                </li>
                <li>
                  <Link
                    href="/our-story"
                    className="hover:text-brand-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:w-3" />
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="hover:text-brand-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:w-3" />
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-brand-gold font-serif text-lg mb-6 tracking-wide">
                Connect
              </h4>
              <ul className="space-y-3 text-sm font-light">
                <li>
                  <a
                    href="https://www.instagram.com/annvriksh_in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:w-3" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:care.annvriksh@gmail.com"
                    className="hover:text-brand-gold transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-[1px] w-0 bg-brand-gold transition-all duration-300 group-hover:w-3" />
                    Email Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mt-16 pt-8 border-t border-brand-gold/10 text-[10px] uppercase tracking-[0.2em] text-brand-brown/40 text-center relative z-10 font-bold">
            &copy; {new Date().getFullYear()} ANNVRIKSH. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
