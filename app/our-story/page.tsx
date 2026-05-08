import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

export default function OurStory() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream animate-fade-in pt-12 pb-20">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto px-4 text-center mb-20">
        <Leaf
          className="text-brand-green mb-6 fill-brand-green/20 mx-auto"
          size={40}
        />
        <h1 className="text-4xl md:text-5xl font-serif text-brand-brown mb-6 leading-tight">
          Our Story: <br />
          Curating the Best of <br />
          Amritya Organics
        </h1>
        <p className="text-xl md:text-2xl text-stone-600 font-light leading-relaxed">
          Rooted in friendship, driven by a vision. How two lifelong companions
          set out to redefine what it means to eat clean, organic staples.
        </p>
      </div>

      {/* Main Story Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Story Block 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
          <div className="w-full md:w-1/2 relative aspect-square bg-stone-200">
            <Image
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000"
              alt="Two friends examining crops"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-serif text-brand-brown mb-6">
              A Shared Vision
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              It started with a simple question between two friends over a cup
              of morning tea: "Why is it so difficult to find food that is as
              pure as nature intended?"
            </p>
            <p className="text-stone-600 font-light leading-relaxed">
              Disillusioned by the sprawling aisles of heavily processed,
              artificially enhanced groceries, we embarked on a journey across
              the heartlands of India. We sought to rediscover the ancient
              grains, the unadulterated oils, and the vibrant spices that our
              ancestors thrived upon. Amritya Organics was born not just as a
              brand, but as a commitment to restoring the sanctity of the
              kitchen pantry.
            </p>
          </div>
        </div>

        {/* Story Block 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16 mb-32">
          <div className="w-full md:w-1/2 relative aspect-[4/3] bg-stone-200">
            <Image
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
              alt="Organic farming fields"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-serif text-brand-brown mb-6">
              Direct from the Soil
            </h2>
            <p className="text-stone-600 font-light leading-relaxed mb-6">
              True premium quality cannot be manufactured in a lab; it must be
              cultivated from the earth. We spent years building direct,
              fair-trade relationships with indigenous farmers who treat their
              land with reverence.
            </p>
            <p className="text-stone-600 font-light leading-relaxed">
              By bypassing the convoluted supply chains and middlemen, we ensure
              that the people who nurture our soil are compensated fairly, while
              you receive staples that are unmatched in flavor, nutrition, and
              purity. Every grain of Khapli wheat, every drop of cold-pressed
              oil, is a testament to this harmonious partnership between man and
              nature.
            </p>
          </div>
        </div>

        {/* Values Callout */}
        <div className="bg-brand-brown text-brand-cream p-12 md:p-20 text-center rounded-sm">
          <h2 className="text-3xl md:text-5xl font-serif mb-8">
            Pure by Nature. Essential by Choice.
          </h2>
          <p className="text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed mb-10 opacity-90">
            We invite you to join our journey. Transform your daily meals into
            rituals of nourishment and experience the unparalleled difference of
            truly organic staples.
          </p>
          <Link
            href="/#shop"
            className="inline-flex items-center gap-3 bg-brand-gold hover:bg-white text-brand-brown px-8 py-4 transition-all duration-300 font-medium uppercase tracking-widest text-sm"
          >
            Explore Our Collection <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
