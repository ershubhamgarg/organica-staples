"use client";

import Image from "next/image";
import { ArrowRight, Leaf } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-brand-cream animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://qdrkqtcbninswzieszfx.supabase.co/storage/v1/object/sign/images/ChatGPT%20Image%20May%207,%202026,%2009_51_47%20AM.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YWMzMTk3Ny0wZTk5LTQ1NjQtODM2OC1iM2IzZTQzMzIyNDQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvQ2hhdEdQVCBJbWFnZSBNYXkgNywgMjAyNiwgMDlfNTFfNDcgQU0ucG5nIiwiaWF0IjoxNzc4MTI3NzIyLCJleHAiOjE4MDk2NjM3MjJ9.wG0Mdodjvtd8fKToIpBI2z3mRjfgi4ZnxXWxNwb3wFI"
            alt="Organic farming"
            fill
            className="object-cover object-center brightness-[0.45]"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-20">
          <div className="flex items-center gap-2 mb-6 text-brand-cream opacity-90">
            <div className="h-[1px] w-12 bg-current"></div>
            <span className="uppercase tracking-[0.2em] text-sm font-medium">
              Est. 2026
            </span>
            <div className="h-[1px] w-12 bg-current"></div>
          </div>
          <h1 className="md:text-5xl font-serif text-white font-bold mb-6 drop-shadow-md">
            Pure by nature <br />
            Essential by choice
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-10 max-w-2xl font-light leading-relaxed drop-shadow-sm">
            Discover our curated collection of ethically sourced, premium
            organic staples designed to nourish your body and elevate your
            everyday meals.
          </p>
          <a
            href="#shop"
            className="inline-flex items-center gap-3 bg-brand-brown hover:bg-brand-brown-light text-white px-8 py-4 transition-all duration-300 font-medium uppercase tracking-widest text-sm shadow-lg hover:shadow-xl"
          >
            Shop the Collection <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Featured Banner */}
      <div className="bg-brand-green text-white py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-[scroll_20s_linear_infinite]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 mx-8 text-sm uppercase tracking-widest font-medium"
            >
              <span>100% Organic</span>
              <Leaf size={14} className="fill-white/50" />
              <span>Sustainably Sourced</span>
              <Leaf size={14} className="fill-white/50" />
              <span>Premium Quality</span>
              <Leaf size={14} className="fill-white/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Grid Section */}
      <ProductListing />

      <HelpMeDecide />

      {/* Values Section */}
      <section className="bg-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-t border-brand-cream">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-brand-cream flex items-center justify-center mb-8 text-brand-green group-hover:scale-110 transition-transform duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">
              Fairly Priced
            </h3>
            <p className="text-stone-500 font-light leading-relaxed">
              Direct relationships with farmers ensure premium quality without
              the premium markup. Fair to them, fair to you.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-brand-cream flex items-center justify-center mb-8 text-brand-green group-hover:scale-110 transition-transform duration-500">
              <Leaf size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">
              100% Organic
            </h3>
            <p className="text-stone-500 font-light leading-relaxed">
              Certified organic goods, grown with respect for the earth and free
              from synthetic pesticides or fertilizers.
            </p>
          </div>
          <div className="flex flex-col items-center group">
            <div className="w-20 h-20 bg-brand-cream flex items-center justify-center mb-8 text-brand-green group-hover:scale-110 transition-transform duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-brand-brown mb-4">
              Ethically Sourced
            </h3>
            <p className="text-stone-500 font-light leading-relaxed">
              We partner with communities worldwide to bring you ingredients
              that are harvested with integrity and care.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="bg-brand-cream pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Leaf
              className="text-brand-green mb-4 mx-auto fill-brand-green/20"
              size={32}
            />
            <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">
              Get in Touch
            </h2>
            <p className="text-stone-600 max-w-lg mx-auto font-light leading-relaxed">
              Have a question or feedback? We&apos;d love to hear from you. Send
              us a message and we&apos;ll respond shortly.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-brand-cream p-8 md:p-12"
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
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
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
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
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
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
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
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all resize-none"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-brand-brown hover:bg-brand-brown-light text-white px-8 py-4 rounded-xl transition-all duration-300 font-medium uppercase tracking-widest text-sm shadow-lg hover:shadow-xl"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
