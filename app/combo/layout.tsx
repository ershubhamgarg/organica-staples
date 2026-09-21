import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build Your Own Combo",
  description:
    "Assemble your own sampler pack of ANNVRIKSH organic staples. Pick small 100g packs of spices and seeds and try the range without committing to full sizes.",
  alternates: { canonical: "/combo" },
};

export default function ComboLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
