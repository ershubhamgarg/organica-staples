import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Emergency switch: set NEXT_IMAGES_UNOPTIMIZED=true to serve every image
    // straight from its source, bypassing Vercel's optimizer. Use it if the
    // account's image-optimization quota is exhausted (the optimizer then
    // answers 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED and any uncached
    // image breaks). Off by default: unoptimized images are served at full
    // size, which is much heavier on mobile.
    unoptimized: process.env.NEXT_IMAGES_UNOPTIMIZED === "true",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "healthymiller.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "www.bakingbusiness.com",
      },
      {
        protocol: "https",
        hostname: "www.tastingtable.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "www.greendna.in",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "qdrkqtcbninswzieszfx.supabase.co",
      },
    ],
  },
};

export default nextConfig;
//test
