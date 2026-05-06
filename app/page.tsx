import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { ArrowRight, Leaf, Star } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import QuickAddButton from "@/components/QuickAddButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://www.bakingbusiness.com/ext/resources/2024/01/16/0116-AdobeStock1.webp?height=667&t=1764179383&width=1080"
            alt="Organic farming"
            fill
            className="object-cover object-center brightness-[0.65]"
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
      <section
        id="shop"
        className="py-32 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto"
      >
        <div className="flex flex-col items-center text-center mb-20">
          <Leaf
            className="text-brand-green mb-4 fill-brand-green/20"
            size={32}
          />
          <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-4">
            Our Essentials
          </h2>
          <p className="text-stone-600 max-w-lg mx-auto font-light leading-relaxed">
            The foundation of a wholesome pantry. Each product is carefully
            selected to bring the highest nutritional value to your table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {products.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 mb-6 group-hover:shadow-xl transition-shadow duration-500">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/5 transition-colors duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[10px] uppercase tracking-widest font-bold px-3 py-1 text-brand-brown shadow-sm">
                  {product.category}
                </div>
              </div>
              <div className="flex flex-col flex-grow text-center">
                <div className="flex justify-center items-center gap-1 mb-2 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-500" />
                  ))}
                </div>
                <h3 className="text-xl font-serif text-stone-900 group-hover:text-brand-brown transition-colors mb-2">
                  {product.name}
                </h3>
                <span className="text-lg text-brand-green mb-4">
                  ₹{product.price.toFixed(2)}{" "}
                  <span className="text-sm text-stone-400 font-light">
                    / {product.weight}
                  </span>
                </span>
                <p className="text-sm text-stone-500 mb-6 line-clamp-2 font-light px-4">
                  {product.description}
                </p>
                <QuickAddButton product={product} />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-20 flex justify-center">
          <button className="border border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white px-10 py-3 transition-colors uppercase tracking-widest text-sm font-medium">
            View All Products
          </button>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-32 px-4 sm:px-6 lg:px-8 border-t border-brand-cream">
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
    </div>
  );
}
