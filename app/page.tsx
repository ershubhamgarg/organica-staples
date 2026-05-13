"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeIndianRupee,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import HelpMeDecide from "@/components/HelpMeDecide";
import ProductListing from "@/components/ProductListing";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

export default function Home() {
  const syncCartWithSupabase = useCartStore(
    (state) => state.syncCartWithSupabase,
  );
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      syncCartWithSupabase(user.id);
    }
  }, [user, syncCartWithSupabase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const whatsappMessage = `
[Amritya Organics]
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}
Message: ${formData.message}
    `.trim();

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/918295433041?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfaf7] animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] w-full flex items-end overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://qdrkqtcbninswzieszfx.supabase.co/storage/v1/object/sign/images/ChatGPT%20Image%20May%207,%202026,%2009_51_47%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YWMzMTk3Ny0wZTk5LTQ1NjQtODM2OC1iM2IzZTQzMzIyNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvQ2hhdEdQVCBJbWFnZSBNYXkgNywgMjAyNiwgMDlfNTFfNDcgQU0ucG5nIiwiaWF0IjoxNzc4MTI3NzIyLCJleHAiOjE4MDk2NjM3MjJ9.wG0Mdodjvtd8fKToIpBI2z3mRjfgi4ZnxXWxNwb3wFI"
            alt="Organic farming"
            fill
            className="object-cover object-center opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,22,17,0.86)_0%,rgba(20,22,17,0.58)_48%,rgba(20,22,17,0.25)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#fbfaf7_0%,rgba(251,250,247,0)_100%)]" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-20 pt-40">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 mb-7 text-brand-cream/90">
                <span className="h-px w-10 bg-brand-gold" />
                <span className="uppercase tracking-[0.28em] text-xs font-semibold">
                  Est. 2026 · Organic pantry staples
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white font-semibold mb-7 leading-[0.95] drop-shadow-md">
                Pure by nature.
                <span className="block text-brand-cream">
                  Essential by choice.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-stone-100 mb-10 max-w-2xl font-light leading-relaxed drop-shadow-sm">
                Discover ethically sourced, premium organic staples designed to
                nourish everyday meals with a quieter kind of luxury.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#shop"
                  className="inline-flex items-center justify-center gap-3 bg-brand-gold hover:bg-[#d0ae73] text-stone-950 px-8 py-4 transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-xl"
                >
                  Shop the Collection <ArrowRight size={18} />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-3 border border-white/35 bg-white/10 text-white px-8 py-4 transition-all duration-300 font-bold uppercase tracking-widest text-xs backdrop-blur hover:bg-white/20"
                >
                  Talk to us <MessageCircle size={17} />
                </a>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-3 max-w-2xl border-y border-white/20 divide-x divide-white/20 text-white/90">
              {[
                ["100%", "organic focus"],
                ["Farm", "direct sourcing"],
                ["₹500+", "free shipping"],
              ].map(([value, label]) => (
                <div key={label} className="py-5 px-3 first:pl-0">
                  <p className="font-serif text-2xl text-white">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-brand-cream/75">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Banner */}
      <div className="bg-[#23281e] text-brand-cream py-5 overflow-hidden border-y border-brand-gold/20">
        <div className="flex whitespace-nowrap animate-[scroll_26s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 mx-8 text-xs uppercase tracking-[0.24em] font-semibold"
            >
              <span>100% Organic</span>
              <Leaf size={14} className="fill-brand-gold/40 text-brand-gold" />
              <span>Sustainably Sourced</span>
              <Leaf size={14} className="fill-brand-gold/40 text-brand-gold" />
              <span>Premium Quality</span>
              <Leaf size={14} className="fill-brand-gold/40 text-brand-gold" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid Section */}
      <ProductListing />

      <HelpMeDecide />

      {/* Values Section */}
      <section className="bg-[#f4efe6] py-24 px-4 sm:px-6 lg:px-8 border-y border-brand-brown/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-14 items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] font-bold text-brand-green mb-4">
                Our promise
              </p>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-brown leading-tight">
                Staples chosen with restraint, care, and provenance.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border border-brand-brown/10 bg-[#fbfaf7] shadow-[0_24px_80px_-55px_rgba(45,36,32,0.55)]">
              {[
                {
                  icon: BadgeIndianRupee,
                  title: "Fairly Priced",
                  body: "Direct relationships with farmers ensure premium quality without the premium markup. Fair to them, fair to you.",
                },
                {
                  icon: Sprout,
                  title: "100% Organic",
                  body: "Certified organic goods, grown with respect for the earth and free from synthetic pesticides or fertilizers.",
                },
                {
                  icon: MapPin,
                  title: "Ethically Sourced",
                  body: "We partner with communities worldwide to bring you ingredients that are harvested with integrity and care.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group p-8 md:p-10 border-b md:border-b-0 md:border-r last:border-0 border-brand-brown/10"
                  >
                    <div className="w-12 h-12 bg-brand-cream flex items-center justify-center mb-8 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors">
                      <Icon size={25} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif text-brand-brown mb-4">
                      {item.title}
                    </h3>
                    <p className="text-stone-600 font-light leading-relaxed text-sm">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section
        id="contact"
        className="bg-[#fbfaf7] py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
          <div className="lg:pt-8">
            <div className="inline-flex items-center gap-3 text-brand-green mb-5">
              <MessageCircle size={24} strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-[0.28em] font-bold">
                Concierge support
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-5 leading-tight">
              Get in touch with the pantry team.
            </h2>
            <p className="text-stone-600 max-w-md font-light leading-relaxed mb-8">
              Have a question or feedback? We&apos;d love to hear from you. Send
              us a message and we&apos;ll respond shortly on WhatsApp.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-w-md">
              <div className="flex items-center gap-4 border border-brand-brown/10 bg-white p-5">
                <ShieldCheck className="text-brand-green" size={22} />
                <p className="text-sm text-stone-600">
                  Guidance for staples, orders, and gifting.
                </p>
              </div>
              <div className="flex items-center gap-4 border border-brand-brown/10 bg-white p-5">
                <Leaf className="text-brand-green" size={22} />
                <p className="text-sm text-stone-600">
                  Premium organic pantry support, without the rush.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-[0_28px_90px_-60px_rgba(45,36,32,0.6)] border border-brand-brown/10 p-6 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-200 bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-stone-200 bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-200 bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all"
                placeholder="How can we help?"
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-stone-200 bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-all resize-none"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-3 bg-brand-brown hover:bg-brand-brown-light text-white px-8 py-4 transition-all duration-300 font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-xl"
            >
              Send Message <ArrowRight size={17} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
