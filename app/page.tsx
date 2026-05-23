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
import ScrollReveal from "@/components/ScrollReveal";
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

      {/* Farm & Origin Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Decorative SVG Illustrations */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          {/* Wheat Stalk - Top Left */}
          <div className="absolute top-10 left-[5%] animate-float-slow">
            <svg
              width="120"
              height="240"
              viewBox="0 0 100 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 200V50M50 50C50 50 20 40 10 20M50 70C50 70 80 60 90 40M50 90C50 90 20 80 10 60M50 110C50 110 80 100 90 80M50 130C50 130 20 120 10 100"
                stroke="#C29F64"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="20" r="3" fill="#C29F64" />
              <circle cx="90" cy="40" r="3" fill="#C29F64" />
              <circle cx="10" cy="60" r="3" fill="#C29F64" />
              <circle cx="90" cy="80" r="3" fill="#C29F64" />
              <circle cx="10" cy="100" r="3" fill="#C29F64" />
            </svg>
          </div>

          {/* Scattered Grains - Bottom Right */}
          <div className="absolute bottom-20 right-[10%] animate-pulse-slow">
            <svg
              width="150"
              height="100"
              viewBox="0 0 150 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="20"
                cy="30"
                rx="6"
                ry="3"
                transform="rotate(45 20 30)"
                fill="#D4AF37"
                opacity="0.6"
              />
              <ellipse
                cx="50"
                cy="10"
                rx="6"
                ry="3"
                transform="rotate(-20 50 10)"
                fill="#D4AF37"
                opacity="0.4"
              />
              <ellipse
                cx="80"
                cy="40"
                rx="6"
                ry="3"
                transform="rotate(10 80 40)"
                fill="#D4AF37"
                opacity="0.5"
              />
              <ellipse
                cx="110"
                cy="20"
                rx="6"
                ry="3"
                transform="rotate(60 110 20)"
                fill="#D4AF37"
                opacity="0.3"
              />
              <ellipse
                cx="40"
                cy="60"
                rx="6"
                ry="3"
                transform="rotate(-45 40 60)"
                fill="#D4AF37"
                opacity="0.5"
              />
              <ellipse
                cx="130"
                cy="50"
                rx="6"
                ry="3"
                transform="rotate(30 130 50)"
                fill="#D4AF37"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* Traditional Plough - Center Right */}
          <div className="absolute top-1/2 right-[5%] -translate-y-1/2 opacity-10">
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 80C20 80 40 75 80 75M30 80L30 40M30 50L60 50M60 50V75"
                stroke="#3C362A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-sand/10 skew-x-[-15deg] translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* Left: Illustration & Image */}
            <ScrollReveal className="relative w-full lg:w-1/2">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000"
                  alt="Organic Farming in Bharat"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-brand-brown/10 mix-blend-multiply" />
              </div>

              {/* Floating Farmer Badge */}
              <div className="absolute right-4 sm:-right-8 -bottom-8 bg-brand-cream p-8 rounded-3xl shadow-2xl border border-brand-gold/10 max-w-xs animate-float">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <Sprout size={24} />
                  </div>
                  <h4 className="text-lg font-serif text-brand-brown leading-tight">
                    Farmer <span className="italic">Owned.</span>
                  </h4>
                </div>
                <p className="text-[11px] text-brand-brown/60 font-light leading-relaxed">
                  Supporting over 500+ marginal farming families across the
                  fertile plains of North India.
                </p>
              </div>
            </ScrollReveal>

            {/* Right: Story Content */}
            <ScrollReveal animation="reveal-fade" delay={200} className="w-full lg:w-1/2 relative">
              {/* Floating Sprout Icon */}
              <div className="absolute -top-12 -right-4 opacity-10 rotate-12 pointer-events-none hidden lg:block">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 90V60M50 60C50 60 20 50 10 30M50 60C50 60 80 50 90 30"
                    stroke="#2D3A26"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="inline-flex items-center gap-4 mb-6">
                <span className="h-[1px] w-8 bg-brand-terracotta" />
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-terracotta">
                  From the Village Altar
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-brand-brown leading-[1.1] tracking-tight mb-8">
                Harvested by hands that <br />
                <span className="italic text-brand-gold">know the earth.</span>
              </h2>
              <div className="space-y-6">
                <p className="text-brand-brown/70 font-light leading-relaxed text-lg">
                  Every staple at Amritya Organics tells a story of a small
                  village farm, where tradition is preserved and nature is
                  respected. We work directly with farmers who still use the
                  ancient wisdom of their ancestors.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-brand-brown">
                      Direct Sourcing
                    </h5>
                    <p className="text-xs text-brand-brown/50 font-light">
                      Eliminating middlemen to ensure farmers get the fair price
                      they deserve.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-brand-brown">
                      Village Hubs
                    </h5>
                    <p className="text-xs text-brand-brown/50 font-light">
                      Processed in small batches within village clusters to
                      retain peak nutrition.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <ProductListing />

      <HelpMeDecide />

      {/* Values Section */}
      <section className="relative bg-brand-cream py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Leaf Backgrounds */}
        <div className="absolute top-20 left-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div
          className="absolute bottom-20 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute top-1/4 right-[5%] opacity-[0.03] pointer-events-none">
          <svg
            width="300"
            height="300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 80C50 80 85 60 85 35C85 20 70 15 50 35C30 15 15 20 15 35C15 60 50 80 50 80Z"
              fill="#2D3A26"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
            <ScrollReveal className="max-w-xl">
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
            </ScrollReveal>

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
                  <ScrollReveal
                    key={item.title}
                    delay={idx * 150}
                    className="group p-5 sm:p-10 bg-white border border-brand-gold/10 shadow-2xl shadow-brand-brown/5 transition-all duration-700 hover:translate-y-[-8px] rounded-2xl"
                  >
                    <div className="flex items-center gap-4 sm:block">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full bg-brand-sand flex items-center justify-center sm:mb-10 text-brand-gold group-hover:bg-brand-brown group-hover:text-brand-cream transition-all duration-500">
                        <Icon size={20} className="sm:hidden" strokeWidth={1.5} />
                        <Icon size={24} className="hidden sm:block" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-xl font-serif text-brand-brown mb-1 sm:mb-4 tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-brand-brown/60 font-light leading-relaxed text-xs sm:text-sm">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
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
          <ScrollReveal className="lg:pt-4">
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
          </ScrollReveal>

          <ScrollReveal animation="reveal-fade" delay={300} className="w-full">
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
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-4"
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
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-4"
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
                  className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-4"
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
                  className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-2 text-sm focus:outline-none focus:border-brand-brown transition-colors resize-none placeholder:text-brand-brown/50 font-light px-4"
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
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
