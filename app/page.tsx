import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000"
            alt="Organic farming"
            fill
            className="object-cover object-center brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white font-bold tracking-tight mb-6">
            Purity in Every Grain
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-2xl font-light leading-relaxed">
            Discover our curated collection of ethically sourced, premium
            organic staples designed to nourish your body and elevate your
            everyday meals.
          </p>
          <a
            href="#shop"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-full transition-all duration-300 font-medium"
          >
            Shop the Collection <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Product Grid Section */}
      <section
        id="shop"
        className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif text-stone-800 mb-2">
              Our Essentials
            </h2>
            <p className="text-stone-500">
              The foundation of a wholesome pantry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-200 rounded-lg mb-4">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-xs font-medium px-3 py-1 rounded-full text-stone-800 shadow-sm">
                  {product.category}
                </div>
              </div>
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-medium text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-lg font-medium text-stone-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-stone-500 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-auto pt-2 border-t border-stone-200 flex items-center justify-between text-sm">
                  <span className="text-emerald-700 font-medium group-hover:underline">
                    View Details
                  </span>
                  <span className="text-stone-400">{product.weight}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-stone-200 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              Fairly Priced
            </h3>
            <p className="text-stone-600 text-sm">
              Direct relationships with farmers ensure premium quality without
              the premium markup.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              100% Organic
            </h3>
            <p className="text-stone-600 text-sm">
              Certified organic goods, grown without synthetic pesticides or
              fertilizers.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-stone-900 mb-2">
              Ethically Sourced
            </h3>
            <p className="text-stone-600 text-sm">
              We partner with communities worldwide to bring you ingredients
              with integrity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
