import type { Metadata } from "next";
import Link from "next/link";
import LegalPageHeader from "@/components/LegalPageHeader";

export const metadata: Metadata = {
  title: "Privacy Policy | ANNVRIKSH",
  description:
    "How ANNVRIKSH collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <LegalPageHeader
        title="Privacy"
        italicWord="Policy"
        lastUpdated="August 26, 2026"
      />

      <div className="space-y-10 text-brand-brown/75 font-light leading-relaxed text-sm sm:text-base">
        <p>
          ANNVRIKSH (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
          respects your privacy and is committed to protecting the personal
          information you share with us when you visit annvriksh.com or
          purchase our products. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have.
          By using our website, you agree to the practices described here.
        </p>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            1. Information We Collect
          </h2>
          <p className="mb-3">We collect information that you provide directly to us, such as:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Contact details — name, email address, phone number, and
              delivery/billing address, provided when you create an account,
              place an order, or contact customer support.
            </li>
            <li>
              Account information — if you sign in with email/password or
              Google, we receive your name and email address from the
              authentication provider.
            </li>
            <li>
              Order information — the products you purchase, order value,
              payment method, and delivery status.
            </li>
            <li>
              Communications — messages you send us via WhatsApp, email, or
              the review and contact forms on our website.
            </li>
          </ul>
          <p className="mt-3">
            We also automatically collect limited technical information
            (such as browser type, device information, and pages visited)
            through standard website analytics to help us improve the
            shopping experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To process, pack, and deliver your orders.</li>
            <li>
              To communicate with you about your orders, account, or
              customer support requests.
            </li>
            <li>
              To send order confirmations, shipping updates, and, where you
              have opted in, occasional updates about new products or offers.
            </li>
            <li>To improve our website, products, and customer service.</li>
            <li>
              To detect and prevent fraud, abuse, or misuse of promotional
              offers.
            </li>
            <li>To comply with applicable legal and tax obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            3. Sharing Your Information
          </h2>
          <p className="mb-3">
            We do not sell your personal information. We share it only with
            trusted service providers who help us run our business, and only
            to the extent necessary:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="font-semibold text-brand-brown">
                Payment processing
              </span>{" "}
              — Razorpay, to securely process online payments. We do not
              store your card, UPI, or net-banking credentials on our
              servers.
            </li>
            <li>
              <span className="font-semibold text-brand-brown">
                Shipping &amp; logistics
              </span>{" "}
              — our courier and logistics partners, to deliver your order
              and provide tracking updates.
            </li>
            <li>
              <span className="font-semibold text-brand-brown">
                Account &amp; data hosting
              </span>{" "}
              — our authentication and database infrastructure provider, to
              securely store your account and order information.
            </li>
          </ul>
          <p className="mt-3">
            We may also disclose information where required by law, or to
            protect the rights, property, or safety of ANNVRIKSH, our
            customers, or others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            4. Cookies
          </h2>
          <p>
            Our website uses cookies and similar technologies to keep you
            signed in, remember items in your cart, and understand how
            visitors use our site. You can control or disable cookies through
            your browser settings, though some parts of the website may not
            function properly without them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            5. Data Security
          </h2>
          <p>
            We use reasonable technical and organisational measures —
            including encrypted connections and access-controlled systems —
            to protect your personal information. However, no method of
            transmission or storage over the internet is completely secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            6. Data Retention
          </h2>
          <p>
            We retain your personal information for as long as your account
            is active or as needed to provide you services, comply with our
            legal obligations, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            7. Your Rights &amp; Choices
          </h2>
          <p className="mb-3">You can, at any time:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Request access to the personal information we hold about you.</li>
            <li>Ask us to correct inaccurate or incomplete information.</li>
            <li>
              Request deletion of your account and personal data, subject to
              our legal obligations (such as order and tax records).
            </li>
            <li>
              Opt out of marketing communications at any time by contacting
              us or using the unsubscribe option in our emails.
            </li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, write to us at{" "}
            <a
              href="mailto:care.annvriksh@gmail.com"
              className="text-brand-green underline underline-offset-2 hover:text-brand-brown transition-colors"
            >
              care.annvriksh@gmail.com
            </a>
            . We will respond within a reasonable timeframe.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            8. Children&apos;s Privacy
          </h2>
          <p>
            Our website and services are intended for use by individuals who
            are 18 years of age or older. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            9. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or for legal reasons. The &ldquo;Last
            updated&rdquo; date at the top of this page indicates when the
            policy was last revised. We encourage you to review this page
            periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-brand-brown mb-3 tracking-tight">
            10. Contact Us
          </h2>
          <p>
            If you have any questions or concerns about this Privacy Policy
            or how we handle your data, please reach out to us:
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

        <p className="text-xs text-brand-brown/40 pt-4 border-t border-brand-gold/10">
          See also our{" "}
          <Link
            href="/terms-and-conditions"
            className="underline underline-offset-2 hover:text-brand-brown transition-colors"
          >
            Terms &amp; Conditions
          </Link>
          ,{" "}
          <Link
            href="/shipping-policy"
            className="underline underline-offset-2 hover:text-brand-brown transition-colors"
          >
            Shipping Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/returns-and-refunds"
            className="underline underline-offset-2 hover:text-brand-brown transition-colors"
          >
            Returns &amp; Refund Policy
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
