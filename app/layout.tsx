import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
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

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://annvriksh.com";
const SITE_TITLE = "ANNVRIKSH | Premium Organic Indian Staples & Spices";
const SITE_DESCRIPTION =
  "ANNVRIKSH brings you 100% organic, chemical-free Indian staples and spices — cold-pressed oils, atta, and more — ethically sourced direct from farms and delivered fresh to your door.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | ANNVRIKSH",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Annvriksh",
    "organic food",
    "organic staples",
    "organic spices India",
    "organic atta online",
    "cold pressed oil online",
    "buy organic food online India",
    "chemical free spices",
    "pure organic groceries",
  ],
  authors: [{ name: "ANNVRIKSH" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "ANNVRIKSH",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ANNVRIKSH — Pure by nature. Essential by choice.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/annvriksh_logo.png",
    apple: "/favicon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ANNVRIKSH",
  alternateName: "Annvriksh Organic Staples",
  url: SITE_URL,
  logo: `${SITE_URL}/annvriksh_logo.png`,
  slogan: "Pure by nature. Essential by choice.",
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kirti Nagar",
    addressLocality: "Sirsa",
    addressRegion: "Haryana",
    postalCode: "125055",
    addressCountry: "IN",
  },
  sameAs: ["https://www.instagram.com/annvriksh_in/"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ANNVRIKSH",
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${sans.variable} ${serif.variable} ${devanagari.variable} antialiased bg-brand-cream text-stone-900 flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <Header />

        <main className="flex-grow">{children}</main>

        <WhatsAppButton />
        <FloatingCart />

        <footer className="bg-white text-brand-brown/70 py-16 relative overflow-hidden border-t border-brand-gold/10">
          <div className="absolute inset-0 bg-organic-texture opacity-[0.03] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            <div className="space-y-8 flex flex-col items-center md:items-start">
              <Image
                src="/annvriksh_logo_no_bg.png"
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
            <div>
              <h4 className="text-brand-gold font-serif text-lg mb-6 tracking-wide">
                Visit Us
              </h4>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Kirti+Nagar%2C+Sirsa%2C+Haryana+125055"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-sm font-light hover:text-brand-gold transition-colors duration-300"
              >
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-brand-gold/70 group-hover:text-brand-gold transition-colors"
                />
                <span className="leading-relaxed">
                  ANNVRIKSH
                  <br />
                  Kirti Nagar, Sirsa,
                  <br />
                  Haryana - 125055
                </span>
              </a>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 mt-16 pt-8 border-t border-brand-gold/10 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3 mb-5 text-[9px] uppercase tracking-[0.18em] text-brand-brown/40 font-bold">
              <Link
                href="/privacy-policy"
                className="hover:text-brand-gold transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/shipping-policy"
                className="hover:text-brand-gold transition-colors"
              >
                Shipping Policy
              </Link>
              <Link
                href="/returns-and-refunds"
                className="hover:text-brand-gold transition-colors"
              >
                Returns &amp; Refunds
              </Link>
              <Link
                href="/terms-and-conditions"
                className="hover:text-brand-gold transition-colors"
              >
                Terms &amp; Conditions
              </Link>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-brown/40 text-center font-bold">
              &copy; {new Date().getFullYear()} ANNVRIKSH. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
