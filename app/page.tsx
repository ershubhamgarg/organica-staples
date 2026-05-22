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
import DesiHero from "@/components/DesiHero";
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
      <DesiHero />

      {/* Product Grid Section */}
      <ProductListing />

      <HelpMeDecide />

      {/* Values Section */}
      <section className="relative bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-4 mb-4">
                <span className="h-[1px] w-12 bg-brand-gold" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold">
                  Our Promise
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-brown leading-[0.9] tracking-tight mb-4">
                Staples chosen <br /> with{" "}
                <span className="italic text-brand-terracotta">care.</span>
              </h2>
              <p className="text-sm text-brand-brown/60 font-light leading-relaxed text-balance">
                Quality, provenance, and purity are not just words to us—they
                are the foundations of every grain we curate for your home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: BadgeIndianRupee,
                  title: "Fairly Priced",
                  body: "Direct relationships with farmers ensure premium quality without the industrial markup.",
                },
                {
                  icon: Sprout,
                  title: "100% Organic",
                  body: "Certified organic goods, grown with respect for the earth and free from synthetic chemicals.",
                },
                {
                  icon: MapPin,
                  title: "Ethically Sourced",
                  body: "Ingredients harvested with integrity from the heartlands of Bharat.",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group p-10 bg-white border border-brand-gold/10 shadow-2xl shadow-brand-brown/5 transition-all duration-700 hover:translate-y-[-8px] rounded-2xl"
                  >
                    <div className="w-14 h-14 rounded-full bg-brand-sand flex items-center justify-center mb-10 text-brand-gold group-hover:bg-brand-brown group-hover:text-brand-cream transition-all duration-500">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif text-brand-brown mb-4 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-brand-brown/60 font-light leading-relaxed text-sm">
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
        className="relative bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-brand-gold/10"
      >
        <div className="absolute inset-0 bg-stone-texture pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start relative z-10">
          <div className="lg:pt-4">
            <div className="inline-flex items-center gap-4 mb-4">
              <MessageCircle size={20} className="text-brand-gold" />
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold">
                Customer Support
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-brand-brown mb-4 leading-[0.9] tracking-tight">
              Speak with <br /> the{" "}
              <span className="italic text-brand-terracotta">Team.</span>
            </h2>
            <p className="text-sm text-brand-brown/60 font-light leading-relaxed mb-6 max-w-md text-balance">
              Have a question about a product or an order? Send us a message and
              we&apos;ll respond with care on WhatsApp.
            </p>

            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-brand-gold/10 shadow-xl shadow-brand-brown/5 transition-transform hover:scale-[1.02]">
                <ShieldCheck
                  className="text-brand-gold"
                  size={20}
                  strokeWidth={1}
                />
                <p className="text-[9px] uppercase tracking-widest font-black text-brand-brown/60 leading-relaxed">
                  Support for products, orders, and gifting.
                </p>
              </div>
              <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-brand-gold/10 shadow-xl shadow-brand-brown/5 transition-transform hover:scale-[1.02]">
                <Leaf className="text-brand-green" size={20} strokeWidth={1} />
                <p className="text-[9px] uppercase tracking-widest font-black text-brand-brown/60 leading-relaxed">
                  Premium support, delivered with care.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-brand-gold/10 p-8 md:p-10 shadow-[0_50px_100px_-30px_rgba(60,54,42,0.15)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/40 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/40 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div className="mb-6 relative z-10">
              <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/40 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
                placeholder="How can we help?"
                required
              />
            </div>
            <div className="mb-8 relative z-10">
              <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/40 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/10 font-light px-4"
                placeholder="Share your thoughts with us..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full group relative flex items-center justify-center gap-4 bg-brand-brown text-brand-cream py-4 rounded-full text-[11px] uppercase tracking-[0.4em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-4px]"
            >
              <span className="relative z-10 flex items-center gap-4">
                Send Message
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </span>
              <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
