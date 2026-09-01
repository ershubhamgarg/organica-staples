import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHeader from "@/components/LegalPageHeader";
import { STANDARD_SHIPPING_RATE } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Order processing times, delivery timelines, shipping charges, and tracking information for ANNVRIKSH orders.",
};

export default function ShippingPolicyPage() {
  return (
    <article>
      <LegalPageHeader
        title="Shipping"
        italicWord="Policy"
        lastUpdated="August 26, 2026"
      />

      <div className="space-y-10 text-brand-brown/75 font-light leading-relaxed text-sm sm:text-base">
        <p>
          This Shipping Policy explains how we process, pack, and deliver
          your ANNVRIKSH order, and what to expect once you&apos;ve checked
          out. If anything here is unclear, reach out to us — we&apos;re
          happy to help.
        </p>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            1. Order Processing Time
          </h2>
          <p>
            Orders are typically processed and handed over to our courier
            partner within 1–2 business days of confirmation. Orders placed
            on Sundays or public holidays are processed on the next working
            day. During sale periods or high order volumes, processing may
            take slightly longer — we&apos;ll keep you informed by email or
            WhatsApp if there&apos;s a delay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            2. Delivery Timelines
          </h2>
          <p className="mb-3">
            We ship pan-India through our courier and logistics partners.
            Once dispatched, typical delivery timelines are:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Metro cities &amp; major towns: 3–5 business days</li>
            <li>Rest of India: 5–8 business days</li>
            <li>Remote or hard-to-reach pincodes: up to 10 business days</li>
          </ul>
          <p className="mt-3">
            These are estimates, not guarantees — actual delivery times can
            vary due to courier network conditions, weather, local
            restrictions, or other events outside our control.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            3. Shipping Charges
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Orders of ₹1,000 and above ship free.</li>
            <li>
              Orders below ₹1,000 are charged a flat shipping fee starting
              at ₹{STANDARD_SHIPPING_RATE}, calculated at checkout based on
              your delivery pincode and order weight.
            </li>
            <li>
              Cash on Delivery (COD) orders may attract a small additional
              COD handling fee, shown clearly at checkout before you place
              the order.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            4. Order Tracking
          </h2>
          <p>
            Once your order is dispatched, you&apos;ll receive a shipping
            confirmation with a tracking link by email. You can also view
            your order status anytime from{" "}
            <Link
              href="/profile"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              My Orders
            </Link>{" "}
            in your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            5. Serviceability
          </h2>
          <p>
            We aim to deliver across India. In rare cases, a pincode may not
            be serviceable by our courier partners at the time of ordering —
            if this happens, we will contact you to arrange an alternative
            delivery address or a full refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            6. Delays &amp; Exceptions
          </h2>
          <p>
            Occasionally, deliveries may be delayed due to circumstances
            beyond our control — extreme weather, courier network
            disruptions, regional restrictions, or public holidays. We
            appreciate your patience in these situations and will keep you
            updated on any significant delay to your order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            7. Damaged or Missing Packages
          </h2>
          <p>
            Please inspect your package on delivery. If it arrives visibly
            damaged, or if items are missing, contact us within 48 hours of
            delivery with your order number and photos, and we&apos;ll sort
            it out — see our{" "}
            <Link
              href="/returns-and-refunds"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              Returns &amp; Refund Policy
            </Link>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            8. Contact Us
          </h2>
          <p>Questions about a shipment? We&apos;re happy to help.</p>
          <div className="mt-4 rounded-2xl border border-brand-gold/10 bg-white p-5 sm:p-6 not-italic">
            <p className="font-serif text-lg text-brand-brown">ANNVRIKSH</p>
            <p className="mt-1 text-sm">Kirti Nagar, Sirsa, Haryana - 125055, India</p>
            <p className="mt-1 text-sm">
              Email:{" "}
              <a
                href="mailto:care.annvriksh@gmail.com"
                className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
              >
                care.annvriksh@gmail.com
              </a>
            </p>
            <p className="mt-1 text-sm">
              WhatsApp:{" "}
              <a
                href="https://wa.me/918295433041"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
              >
                +91 82954 33041
              </a>
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
