import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sprout, Wheat, Heart } from "lucide-react";

export default function OurStory() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream py-24 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 organic-border translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green/5 organic-border-alt -translate-x-1/2 translate-y-1/2" />

      {/* Header Section */}
      <div className="max-w-[95rem] mx-auto w-full relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-32">
          <div className="inline-flex items-center gap-4 mb-8">
            <span className="h-[1px] w-12 bg-brand-gold" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-gold">
              Our Journey
            </span>
            <span className="h-[1px] w-12 bg-brand-gold" />
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-brand-brown mb-10 tracking-tight leading-[0.9]">
            The Story of <br />
            <span className="italic text-brand-terracotta">
              Amritya Organics
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-brand-brown/60 font-light leading-relaxed max-w-2xl mx-auto text-balance">
            Born from a lifelong bond and a shared vision to restore the purity
            of India&apos;s kitchens.
          </p>
        </div>

        {/* Story Blocks */}
        <div className="space-y-40">
          {/* Story Block 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="relative aspect-square w-full organic-border bg-brand-sand overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                <Image
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000"
                  alt="Two friends examining crops"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-brown/10 group-hover:bg-brand-brown/0 transition-colors duration-700" />
              </div>
              {/* Decorative SVG */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 organic-border-alt bg-brand-gold/20 backdrop-blur-md flex items-center justify-center text-brand-brown animate-float">
                <Heart size={40} strokeWidth={1} />
              </div>
            </div>

            <div className="max-w-xl">
              <div className="flex items-center gap-4 mb-6 text-brand-gold">
                <Sprout size={24} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                  A Seed of Friendship
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-brand-brown mb-8 tracking-tight">
                A Vision <br /> <span className="italic">Shared.</span>
              </h2>
              <p className="text-lg text-brand-brown/60 font-light leading-relaxed mb-8 text-balance">
                It began with two companions and a simple question over a
                morning brew: &quot;Why is the food of our land no longer as
                pure as the soil it springs from?&quot;
              </p>
              <p className="text-lg text-brand-brown/60 font-light leading-relaxed text-balance">
                Disillusioned by the industrialization of our staples, we
                journeyed into the heartlands of India to rediscover the ancient
                grains and unadulterated oils our ancestors thrived upon.
                Amritya was born to restore that pure bond.
              </p>
            </div>
          </div>

          {/* Story Block 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="lg:order-2 relative group">
              <div className="relative aspect-square w-full organic-border-alt bg-brand-sand overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
                  alt="Organic farming fields"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-brand-brown/10 group-hover:bg-brand-brown/0 transition-colors duration-700" />
              </div>
              {/* Decorative SVG */}
              <div className="absolute -top-10 -left-10 w-32 h-32 organic-border bg-brand-green/20 backdrop-blur-md flex items-center justify-center text-brand-green animate-float-slow">
                <Wheat size={40} strokeWidth={1} />
              </div>
            </div>

            <div className="max-w-xl lg:ml-auto">
              <div className="flex items-center gap-4 mb-6 text-brand-green">
                <Leaf size={24} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                  Direct from Soil
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-brand-brown mb-8 tracking-tight">
                True <br /> <span className="italic">Harvest.</span>
              </h2>
              <p className="text-lg text-brand-brown/60 font-light leading-relaxed mb-8 text-balance">
                Premium quality isn&apos;t found in a lab; it is cultivated with
                reverence. We built direct paths to indigenous farmers who treat
                their land as a temple.
              </p>
              <p className="text-lg text-brand-brown/60 font-light leading-relaxed text-balance">
                By honoring the people who nurture our soil, we ensure that
                every drop of cold-pressed oil and every grain of Khapli wheat
                carries the true potency and flavor of nature, delivered
                straight to your pantry.
              </p>
            </div>
          </div>

          {/* Values Callout */}
          <div className="relative py-24 px-12 md:px-24 bg-brand-brown text-brand-cream organic-border shadow-[0_50px_100px_-20px_rgba(60,54,42,0.4)] text-center overflow-hidden group">
            <div className="absolute inset-0 bg-jute opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/10 organic-border -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-serif mb-10 tracking-tight leading-[0.9]">
                Pure by Nature. <br />
                <span className="italic text-brand-gold">
                  Essential by Choice.
                </span>
              </h2>
              <p className="text-xl md:text-2xl font-light leading-relaxed mb-16 opacity-80 text-balance">
                We invite you to join our journey. Transform your daily meals
                into rituals of nourishment and experience the unparalleled
                difference of truly organic staples.
              </p>
              <Link
                href="/#shop"
                className="inline-flex items-center gap-4 bg-brand-cream text-brand-brown px-12 py-6 rounded-full text-[12px] uppercase tracking-[0.4em] font-black transition-all duration-500 hover:bg-brand-gold hover:text-brand-brown hover:translate-y-[-4px] shadow-2xl"
              >
                Explore Shop <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
