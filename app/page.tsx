"use client";

import Image from "next/image";
import {
  ArrowRight,
  Award,
  BadgeIndianRupee,
  Circle,
  Flower2,
  Leaf,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Truck,
  Users,
  Wheat,
} from "lucide-react";
import ProductListing from "@/components/ProductListing";
import DesiHero from "@/components/DesiHero";
import ScrollReveal from "@/components/ScrollReveal";
import SpiceWheelImage from "@/components/SpiceWheelImage";
import WelcomeModal from "@/components/WelcomeModal";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

import ReviewCarousel from "@/components/ReviewCarousel";

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
      if (user.email && !formData.email) {
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            email: prev.email || user.email || "",
          }));
        }, 0);
      }
    }
  }, [user, syncCartWithSupabase, formData.email]);

  useEffect(() => {
    const scrollToHash = () => {
      const sectionId = window.location.hash.slice(1);

      if (sectionId !== "shop" && sectionId !== "contact") {
        return;
      }

      window.requestAnimationFrame(() => {
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const whatsappMessage = `
[ANNVRIKSH]
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
    <div className="flex flex-col min-h-screen bg-[#fbfaf7] animate-fade-in bg-mandala">
      <WelcomeModal />
      <DesiHero />

      {/* Trust Strip */}
      <section className="relative -mt-6 sm:-mt-10 lg:-mt-14 z-30 px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-brand-gold/10 rounded-3xl overflow-hidden border border-brand-gold/10 shadow-[0_30px_60px_-25px_rgba(60,54,42,0.25)]">
            {[
              {
                icon: Users,
                label: "500+ Farming Families",
                sub: "Partnered directly",
              },
              {
                icon: MapPin,
                label: "12+ States Sourced",
                sub: "Across Bharat's heartland",
              },
              {
                icon: ShieldCheck,
                label: "Every Batch Quality Checked",
                sub: "Purity you can trust",
              },
              {
                icon: Leaf,
                label: "Zero Synthetic Chemicals",
                sub: "Grown the honest way",
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white p-5 sm:p-7 flex flex-col items-center text-center gap-2 hover:bg-brand-cream/60 transition-colors duration-500"
                  style={{ animationDelay: `${idx * 120}ms` }}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-sand/60 flex items-center justify-center text-brand-gold mb-1">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-brand-brown leading-tight">
                    {stat.label}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-brand-brown/45 font-light tracking-wide">
                    {stat.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* Farm & Origin Section */}
      <section className="relative py-8 lg:py-12 bg-white overflow-hidden border-y border-brand-gold/10">
        {/* Decorative SVG Illustrations */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-jute">
          {/* Wheat Stalk - Top Left */}
          <div className="absolute top-6 left-[3%] animate-float-slow">
            <svg
              width="100"
              height="200"
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
            </svg>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-sand/10 skew-x-[-15deg] translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left: Illustration & Image */}
            <ScrollReveal className="relative w-full lg:w-5/12">
              <div className="relative aspect-[4/4.5] rounded-[2rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1627314129626-c5cf387f351b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Organic Farming in Bharat"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-brand-brown/10 mix-blend-multiply" />
              </div>

              {/* Floating Farmer Badge */}
              <div className="absolute right-4 sm:-right-4 -bottom-6 bg-brand-cream p-6 rounded-2xl shadow-xl border border-brand-gold/10 max-w-[200px] animate-float">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                    <Sprout size={20} />
                  </div>
                  <h4 className="text-base font-serif text-brand-brown leading-tight">
                    Farmer <span className="italic">Owned.</span>
                  </h4>
                </div>
                <p className="text-[10px] text-brand-brown/60 font-light leading-relaxed">
                  Supporting over 500+ marginal farming families across North
                  India.
                </p>
              </div>
            </ScrollReveal>

            {/* Right: Story Content */}
            <ScrollReveal
              animation="reveal-fade"
              delay={200}
              className="w-full lg:w-7/12 relative"
            >
              <div className="inline-flex items-center gap-4 mb-4">
                <span className="h-[1px] w-8 bg-brand-terracotta" />
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-terracotta">
                  Direct From Local Khets
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-brand-brown leading-[1.1] tracking-tight mb-6">
                Harvested by hands that <br />
                <span className="italic text-brand-gold">revere the soil.</span>
              </h2>
              <div className="space-y-5">
                <p className="text-brand-brown/70 font-light leading-relaxed text-base">
                  At ANNVRIKSH, we trace every grain back to the soil it grew
                  in. By partnering directly with small-scale Indian farmers, we
                  bypass the industrial complex to bring you the true bounty of
                  Bharat.
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1">
                    <h5 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                      Direct Sourcing
                    </h5>
                    <p className="text-[11px] text-brand-brown/70 font-light">
                      Fair value for the grower, unmatched purity for your
                      family.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[9px] uppercase tracking-widest font-black text-brand-brown">
                      Village Clusters
                    </h5>
                    <p className="text-[11px] text-brand-brown/70 font-light">
                      Small-batch processing to retain original nutrition.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Farm to Table Process */}
      <section className="relative bg-brand-cream py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-y border-brand-gold/10">
        <div className="absolute inset-0 bg-mandala pointer-events-none opacity-60" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal className="text-center mb-14 lg:mb-20 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                Our Process
              </span>
              <span className="h-[1px] w-8 bg-brand-gold" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-brand-brown tracking-tight leading-tight">
              From the khet to your{" "}
              <span className="italic text-brand-terracotta">kitchen.</span>
            </h2>
          </ScrollReveal>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-14 gap-x-8">
            <div className="hidden lg:block absolute top-[42px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-gold/0 via-brand-gold/30 to-brand-gold/0" />

            {[
              {
                icon: Sprout,
                step: "01",
                title: "Sourced Direct",
                body: "We partner with small growers across Bharat, paying fair value straight at the farm-gate.",
              },
              {
                icon: Wheat,
                step: "02",
                title: "Traditionally Processed",
                body: "Sun-dried, stone-ground, and cold-pressed using time-honoured methods that protect nutrition.",
              },
              {
                icon: ShieldCheck,
                step: "03",
                title: "Quality Checked",
                body: "Every batch is checked for purity, so what reaches you is free of adulteration or pesticides.",
              },
              {
                icon: Truck,
                step: "04",
                title: "Delivered Fresh",
                body: "Small-batch packed and shipped pan-India, carrying the same freshness as the harvest day.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <ScrollReveal
                  key={item.step}
                  delay={idx * 150}
                  className="relative flex flex-col items-center text-center gap-4"
                >
                  <div className="relative w-[84px] h-[84px] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-brand-gold/30 animate-spin-slow" />
                    <div className="relative w-16 h-16 rounded-full bg-white shadow-lg shadow-brand-brown/5 border border-brand-gold/10 flex items-center justify-center text-brand-gold">
                      <Icon size={26} strokeWidth={1.5} />
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/50">
                    Step {item.step}
                  </span>
                  <h3 className="text-lg font-serif text-brand-brown tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-brown/60 font-light leading-relaxed max-w-[220px]">
                    {item.body}
                  </p>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      <ProductListing />

      {/* Spices */}
      <section className="relative bg-brand-brown py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-jute opacity-[0.04] pointer-events-none" />
        <div
          className="absolute -top-24 -left-24 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-green-fresh/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "2.5s" }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left: Rotating Spice Wheel */}
            <SpiceWheelImage />

            {/* Right: Content */}
            <ScrollReveal animation="reveal-fade" delay={150}>
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="h-[1px] w-8 bg-brand-gold" />
                <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                  The Spice Story
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-serif text-brand-cream tracking-tight leading-[1.15] mb-6">
                Flavour, rooted in{" "}
                <span className="italic text-brand-gold">purity.</span>
              </h2>
              <p className="text-brand-cream/70 font-light leading-relaxed text-sm sm:text-base mb-4">
                Spices are more than seasoning — for generations, Indian
                kitchens have turned to turmeric, chilli, and coriander not
                just for flavour, but for the quiet wellness they carry in
                every pinch. Warming, digestive, and rich in natural
                compounds, spices are one of the oldest forms of everyday
                care.
              </p>
              <p className="text-brand-cream/70 font-light leading-relaxed text-sm sm:text-base mb-10">
                But that benefit only holds if the spice itself is honest.
                Ours are stone-ground and sun-dried in small batches, with
                nothing added and nothing taken away — so what reaches your
                masala dabba is exactly what left the farm.
              </p>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-7">
                {[
                  {
                    icon: Sparkles,
                    title: "Rich in Antioxidants",
                    body: "Turmeric's curcumin, chilli's capsaicin — compounds diluted or lost when spices are cut, aged, or over-processed.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Free From Adulteration",
                    body: "No artificial colour, no added starch or filler, no irradiation — just the spice, exactly as harvested.",
                  },
                  {
                    icon: Leaf,
                    title: "Grown Without Chemicals",
                    body: "No synthetic pesticides or fumigants at any stage, so nothing but the spice itself reaches your food.",
                  },
                  {
                    icon: Wheat,
                    title: "Stone-Ground, Slow-Dried",
                    body: "Traditional processing keeps the volatile oils intact — the difference between fragrant and flat.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-brand-gold">
                        <Icon size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-brand-cream mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-brand-cream/60 font-light leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <ReviewCarousel />

      {/* Story Behind the Name & Logo */}
      <section className="relative bg-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-y border-brand-gold/10">
        <div className="absolute inset-0 bg-mandala pointer-events-none opacity-70" />
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Section Header */}
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                Our Philosophy
              </span>
              <span className="h-[1px] w-8 bg-brand-gold" />
            </div>
            <h2 className="text-2xl md:text-4xl font-serif text-brand-brown tracking-tight leading-tight mb-5">
              The story behind the{" "}
              <span className="italic text-brand-terracotta">
                name &amp; logo.
              </span>
            </h2>
            <p className="text-sm text-brand-brown/60 font-light leading-relaxed text-balance">
              At ANNVRIKSH, we believe that true nourishment begins with
              nature — and that the finest things in life are often rooted in
              simplicity, balance and tradition. Even our name and logo carry
              this belief at their heart.
            </p>
          </ScrollReveal>

          {/* The Name */}
          <ScrollReveal className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                The Name
              </span>
              <span className="h-[1px] w-8 bg-brand-gold" />
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
              <div>
                <p className="font-devanagari text-3xl sm:text-4xl text-brand-gold mb-1">
                  अन्न
                </p>
                <p className="font-serif italic text-xl sm:text-2xl text-brand-brown">
                  Ann
                </p>
                <p className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black text-brand-brown/40">
                  Food · Nourishment
                </p>
              </div>
              <Plus
                size={18}
                className="text-brand-gold/40 mt-2"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-devanagari text-3xl sm:text-4xl text-brand-gold mb-1">
                  वृक्ष
                </p>
                <p className="font-serif italic text-xl sm:text-2xl text-brand-brown">
                  Vriksh
                </p>
                <p className="mt-1 text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black text-brand-brown/40">
                  Tree
                </p>
              </div>
            </div>

            <p className="text-brand-brown/70 font-light leading-relaxed text-sm sm:text-base mb-4 text-balance">
              ANNVRIKSH brings together two simple ideas —{" "}
              <span className="font-semibold text-brand-brown">Ann</span>,
              meaning food or nourishment, and{" "}
              <span className="font-semibold text-brand-brown">Vriksh</span>,
              meaning tree. Together, they represent our belief that good
              food, like a tree, should be deeply rooted in nature, nurtured
              with care and ultimately give something meaningful back to
              life.
            </p>
            <p className="text-brand-brown/70 font-light leading-relaxed text-sm sm:text-base text-balance">
              The name reflects our vision of bringing food closer to its
              natural roots — thoughtfully sourced, responsibly prepared and
              made for everyday nourishment.
            </p>
          </ScrollReveal>

          <div className="w-16 h-px bg-brand-gold/15 mx-auto my-16 lg:my-20" />

          {/* The Logo */}
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
            <ScrollReveal className="relative mx-auto max-w-sm lg:max-w-none w-full">
              <div className="absolute -inset-8 bg-brand-gold/10 rounded-[3rem] blur-3xl pointer-events-none" />
              <div className="relative aspect-[10/7] rounded-[2rem] overflow-hidden border-8 border-white shadow-[0_40px_80px_-20px_rgba(60,54,42,0.25)]">
                <Image
                  src="/logo-annvriksh-tight.jpeg"
                  alt="The ANNVRIKSH emblem — a blossoming flower of interwoven gold petals"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 90vw, 480px"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal
              animation="reveal-fade"
              delay={150}
              className="space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="h-[1px] w-8 bg-brand-gold" />
                  <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                    The Logo
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif text-brand-brown leading-tight tracking-tight mb-4">
                  A blossoming flower,{" "}
                  <span className="italic text-brand-terracotta">
                    rooted in meaning.
                  </span>
                </h3>
                <p className="text-brand-brown/70 font-light leading-relaxed text-sm sm:text-base">
                  Our symbol is inspired by the timeless beauty of a
                  blossoming flower. Its flowing petals come together in
                  harmony, representing the natural journey of food — from
                  the earth, through mindful cultivation, to the nourishment
                  of our homes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                {[
                  {
                    icon: Flower2,
                    title: "Interwoven Petals",
                    body: "The connection between nature, farmers, traditions and people — nothing in nature exists in isolation.",
                  },
                  {
                    icon: Circle,
                    title: "Quiet, Open Centre",
                    body: "Purity and authenticity at the heart of the symbol — the essence of food, kept untouched.",
                  },
                  {
                    icon: Sparkles,
                    title: "Golden Points",
                    body: "The little details that matter — careful sourcing, honest processes and respect for every ingredient.",
                  },
                  {
                    icon: ScrollText,
                    title: "Golden Form",
                    body: "The value we place on age-old wisdom, carried thoughtfully into today's homes.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-brand-sand/50 flex items-center justify-center text-brand-gold">
                        <Icon size={16} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-brand-brown mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-brand-brown/60 font-light leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>

          <div className="w-16 h-px bg-brand-gold/15 mx-auto my-16 lg:my-20" />

          {/* More Than a Logo */}
          <ScrollReveal className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-brand-gold" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-brand-gold">
                More Than A Logo
              </span>
              <span className="h-[1px] w-8 bg-brand-gold" />
            </div>
            <p className="text-brand-brown/60 font-light text-sm mb-7">
              Our symbol is a reminder of what ANNVRIKSH stands for:
            </p>
            <div className="space-y-2 mb-10">
              {[
                "Rooted in nature.",
                "Inspired by tradition.",
                "Created with care.",
                "Chosen for a better everyday.",
              ].map((line) => (
                <p
                  key={line}
                  className="font-serif text-xl sm:text-2xl text-brand-brown italic tracking-tight"
                >
                  {line}
                </p>
              ))}
            </div>
            <p className="text-sm text-brand-brown/50 font-light">
              This is the thought behind ANNVRIKSH —
            </p>
            <p className="mt-2 font-serif text-2xl sm:text-3xl text-brand-terracotta italic tracking-tight">
              Pure by nature. Essential by choice.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative bg-white py-10 lg:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/10 indian-border-pattern opacity-30" />
        {/* Decorative Leaf Backgrounds */}
        <div className="absolute top-10 left-0 w-48 h-48 bg-brand-green/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div
          className="absolute bottom-10 right-0 w-72 h-72 bg-brand-gold/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
          style={{ animationDelay: "2s" }}
        />

        <div className="absolute top-1/4 right-[5%] opacity-[0.02] pointer-events-none">
          <svg
            width="300"
            height="300"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 80C50 80 85 60 85 35C85 20 70 15 50 35C30 15 15 20 15 35C15 60 50 80 50 80Z"
              fill="#112C24"
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
                  body: "Grown with respect for the earth and free from synthetic chemicals.",
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
                        <Icon
                          size={20}
                          className="sm:hidden"
                          strokeWidth={1.5}
                        />
                        <Icon
                          size={24}
                          className="hidden sm:block"
                          strokeWidth={1.5}
                        />
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

      {/* Assurance Strip */}
      <section className="relative bg-white py-8 lg:py-10 px-4 sm:px-6 lg:px-8 border-b border-brand-gold/10">
        <ScrollReveal className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {[
            { icon: Truck, label: "Farm To Table" },
            { icon: Award, label: "Quality Assured" },
            { icon: Sprout, label: "100% Organic" },
            { icon: Lock, label: "Secure Payments" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 text-brand-brown/60"
              >
                <Icon size={18} className="text-brand-gold" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">
                  {item.label}
                </span>
              </div>
            );
          })}
        </ScrollReveal>
      </section>

      {/* Contact Us Section */}
      <section className="relative bg-brand-cream py-10 lg:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-brand-gold/10">
        <div className="absolute inset-0 bg-stone-texture pointer-events-none opacity-[0.05]" />
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/10 indian-border-pattern opacity-30" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-start relative z-10">
          <ScrollReveal className="lg:pt-2">
            <div
              id="contact"
              className="scroll-mt-24 lg:scroll-mt-32 inline-flex items-center gap-4 mb-4"
            >
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
