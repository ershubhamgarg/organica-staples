import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHeader from "@/components/LegalPageHeader";

export const metadata: Metadata = {
  title: "Returns & Refund Policy | ANNVRIKSH",
  description:
    "Our policy for damaged, defective, or incorrect orders, cancellations, and refunds.",
};

export default function ReturnsAndRefundsPage() {
  return (
    <article>
      <LegalPageHeader
        title="Returns &"
        italicWord="Refunds"
        lastUpdated="August 26, 2026"
      />

      <div className="space-y-10 text-brand-brown/75 font-light leading-relaxed text-sm sm:text-base">
        <p>
          Because ANNVRIKSH products are food staples — grains, spices,
          pulses, and oils — hygiene and freshness are our top priority.
          This policy explains when a return, replacement, or refund is
          available, and how to request one.
        </p>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            1. Eligibility for Return or Replacement
          </h2>
          <p className="mb-3">
            As our products are consumable food items, we cannot accept
            returns simply for a change of mind, once a package has been
            opened. We do offer a replacement or refund if your order
            arrives:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Damaged, leaking, or with broken packaging</li>
            <li>Incorrect — a different product than what you ordered</li>
            <li>Short — missing items from your order</li>
            <li>
              Visibly spoiled, contaminated, or past its best-before date on
              arrival
            </li>
          </ul>
          <p className="mt-3">
            Please report any of the above within{" "}
            <span className="font-semibold text-brand-brown">
              48 hours of delivery
            </span>
            , along with clear photos or a short video of the product and
            packaging, and your order number.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            2. Non-Returnable Items
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Products that have been opened, used, or consumed (except
              where the issue is a quality defect reported within the
              48-hour window above)
            </li>
            <li>Products without their original packaging or labelling</li>
            <li>
              Items purchased under a promotional or ₹0 launch offer are not
              eligible for a return, unless the item received was damaged,
              incorrect, or defective
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            3. How to Request a Return or Replacement
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>
              Email us at{" "}
              <a
                href="mailto:care.annvriksh@gmail.com"
                className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
              >
                care.annvriksh@gmail.com
              </a>{" "}
              or message us on{" "}
              <a
                href="https://wa.me/918295433041"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
              >
                WhatsApp
              </a>{" "}
              with your order number, a description of the issue, and
              photos/video.
            </li>
            <li>Our team will review your request, usually within 1–2 business days.</li>
            <li>
              Once approved, we&apos;ll arrange a replacement, or a refund —
              whichever you prefer.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            4. Cancellations
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Orders can be cancelled free of charge any time before they are
              dispatched. Contact us as soon as possible and we&apos;ll
              cancel it and process a full refund.
            </li>
            <li>
              Once an order has been dispatched, it cannot be cancelled — you
              may return it for a refund only if it meets the conditions in
              Section 1 above.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            5. Refunds
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Approved refunds for online payments are credited to your
              original payment method (card, UPI, or net banking via
              Razorpay) within 5–7 business days of approval.
            </li>
            <li>
              For Cash on Delivery orders, refunds are made via UPI or bank
              transfer, using the details you provide us.
            </li>
            <li>
              Shipping charges are refunded only when the return is due to
              our error (damaged, incorrect, or defective item).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            6. Questions?
          </h2>
          <p>
            We want you to be happy with every order. If something isn&apos;t
            right, please reach out and we&apos;ll make it right. See our{" "}
            <Link
              href="/shipping-policy"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              Shipping Policy
            </Link>{" "}
            for delivery timelines.
          </p>
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
