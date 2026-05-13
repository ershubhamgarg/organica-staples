import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amritya Organics | Premium Organic Goods",
  description:
    "Discover our curated selection of premium organic staples, directly sourced for your wellbeing.",
  icons: {
    icon: "/favicon.png",
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
        className={`${inter.variable} ${playfair.variable} antialiased bg-brand-cream text-stone-900 flex flex-col min-h-screen`}
      >
        <Header />

        <main className="flex-grow">{children}</main>

        <footer className="bg-stone-900 text-stone-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Image
                src="/logo-white.png"
                alt="Amritya Organics"
                width={250}
                height={10}
              />
              {/* <p className="text-sm text-stone-400 max-w-xs">
                Curating the finest organic goods for your everyday nourishment.
              </p> */}
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Shop All
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pantry
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Grains & Seeds
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.instagram.com/organicastaples/"
                    className="hover:text-white transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:bilonanaturals@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 text-xs text-stone-500 text-center">
            &copy; {new Date().getFullYear()} Amritya Organics. All rights
            reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
