import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHeader from "@/components/LegalPageHeader";

export const metadata: Metadata = {
  title: "Terms & Conditions | ANNVRIKSH",
  description:
    "The terms and conditions governing your use of annvriksh.com and purchases made through it.",
};

export default function TermsAndConditionsPage() {
  return (
    <article>
      <LegalPageHeader
        title="Terms &"
        italicWord="Conditions"
        lastUpdated="August 26, 2026"
      />

      <div className="space-y-10 text-brand-brown/75 font-light leading-relaxed text-sm sm:text-base">
        <p>
          Welcome to ANNVRIKSH. These Terms &amp; Conditions
          (&ldquo;Terms&rdquo;) govern your access to and use of
          annvriksh.com and any purchases you make through it. By using our
          website, you agree to be bound by these Terms. Please read them
          carefully.
        </p>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            1. About Us
          </h2>
          <p>
            ANNVRIKSH is an online store selling organic staples — grains,
            spices, pulses, and cold-pressed oils — sourced directly from
            farmers across India, operating from Kirti Nagar, Sirsa,
            Haryana - 125055.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            2. Eligibility &amp; Accounts
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              You must be at least 18 years old, or using our website under
              the supervision of a parent or guardian, to place an order.
            </li>
            <li>
              You are responsible for maintaining the confidentiality of
              your account credentials and for all activity under your
              account.
            </li>
            <li>
              You agree to provide accurate, current, and complete
              information when creating an account or placing an order.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            3. Products &amp; Pricing
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
            <li>
              We make every effort to display product information, images,
              and pricing accurately; however, actual product appearance
              (such as colour or texture of natural produce) may vary
              slightly from images shown.
            </li>
            <li>
              We reserve the right to correct pricing or listing errors, and
              to limit order quantities, at our discretion.
            </li>
            <li>
              Product availability is not guaranteed and may change without
              notice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            4. Orders &amp; Payment
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Orders can be paid online via credit/debit card, UPI, or net
              banking through Razorpay, or via Cash on Delivery (COD) where
              available.
            </li>
            <li>
              An order is confirmed only once payment is successfully
              processed (or, for COD, once the order is placed).
            </li>
            <li>
              We reserve the right to cancel any order in cases of suspected
              fraud, pricing errors, or unavailability of stock — in which
              case any amount paid will be refunded in full.
            </li>
            <li>
              Promotional offers and discount codes are subject to their own
              terms, may be withdrawn or modified at any time, and are
              limited to one use per customer unless stated otherwise.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            5. Shipping, Returns &amp; Refunds
          </h2>
          <p>
            Delivery timelines and charges are described in our{" "}
            <Link
              href="/shipping-policy"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              Shipping Policy
            </Link>
            . Our approach to returns, replacements, and refunds is
            described in our{" "}
            <Link
              href="/returns-and-refunds"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              Returns &amp; Refund Policy
            </Link>
            . Both form part of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            6. Intellectual Property
          </h2>
          <p>
            All content on this website — including the ANNVRIKSH name, logo,
            product photography, text, and design — is the property of
            ANNVRIKSH and protected by applicable intellectual property laws.
            You may not reproduce, distribute, or use our branding or content
            without our prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            7. Acceptable Use
          </h2>
          <p className="mb-3">When using our website, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the site for any unlawful purpose or in violation of these Terms.</li>
            <li>Attempt to gain unauthorised access to our systems or another user&apos;s account.</li>
            <li>
              Misuse promotional offers — for example, by creating multiple
              accounts to claim an offer more than once.
            </li>
            <li>Interfere with the proper functioning of the website.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            8. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, ANNVRIKSH shall not be
            liable for any indirect, incidental, or consequential damages
            arising from your use of our website or products. Our total
            liability for any claim relating to an order shall not exceed
            the amount you paid for that order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            9. Grievance Redressal
          </h2>
          <p>
            If you have a complaint or grievance regarding any order,
            product, or content on our website, please write to us at{" "}
            <a
              href="mailto:care.annvriksh@gmail.com"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              care.annvriksh@gmail.com
            </a>{" "}
            with your order details. We aim to acknowledge grievances within
            48 hours and resolve them within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            10. Governing Law
          </h2>
          <p>
            These Terms are governed by the laws of India. Any disputes
            arising out of or relating to these Terms or your use of our
            website shall be subject to the exclusive jurisdiction of the
            courts at Sirsa, Haryana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            11. Changes to These Terms
          </h2>
          <p>
            We may revise these Terms from time to time. Changes take effect
            as soon as they are posted on this page, with the &ldquo;Last
            updated&rdquo; date reflecting the most recent revision.
            Continued use of our website after changes are posted
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            12. Contact Us
          </h2>
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
