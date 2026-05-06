"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Product } from "@/lib/data";
import ImageWithFallback from "@/components/ImageWithFallback";

interface ProductImageCarouselProps {
  product: Product;
  sizes: string;
  priority?: boolean;
  imageClassName?: string;
}

function getProductImages(product: Product): string[] {
  const imageSet = new Set<string>();
  const productImages =
    typeof product.images === "string"
      ? parseImageList(product.images)
      : product.images;

  if (Array.isArray(productImages)) {
    productImages.forEach((image) => {
      if (image) {
        imageSet.add(image);
      }
    });
  }

  if (product.image) {
    imageSet.add(product.image);
  }

  return Array.from(imageSet).slice(0, 5);
}

function parseImageList(images: string): string[] {
  try {
    const parsedImages = JSON.parse(images);

    if (Array.isArray(parsedImages)) {
      return parsedImages.filter((image): image is string => Boolean(image));
    }
  } catch {
    return images
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);
  }

  return [];
}

export default function ProductImageCarousel({
  product,
  sizes,
  priority = false,
  imageClassName = "object-cover",
}: ProductImageCarouselProps) {
  const images = useMemo(() => getProductImages(product), [product]);
  const imageCount = images.length;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoplay = useRef(
    Autoplay({
      delay: 3200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: imageCount > 1 },
    [autoplay.current],
  );

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    handleSelect();
    emblaApi.on("select", handleSelect);
    emblaApi.on("reInit", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
      emblaApi.off("reInit", handleSelect);
    };
  }, [emblaApi]);

  if (imageCount <= 1) {
    return (
      <ImageWithFallback
        src={images[0] || product.image}
        alt={product.name}
        fill
        className={imageClassName}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {images.map((image, index) => {
          const slideNumber = index + 1;

          return (
            <div
              className="relative h-full min-w-0 flex-[0_0_100%]"
              key={`${image}-${index}`}
            >
              <ImageWithFallback
                src={image}
                alt={`${product.name} view ${slideNumber}`}
                fill
                className={imageClassName}
                priority={priority && index === 0}
                sizes={sizes}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
        {images.map((image, index) => (
          <button
            type="button"
            aria-label={`Show product image ${index + 1}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              scrollTo(index);
            }}
            key={`${image}-dot-${index}`}
            className={`h-1 w-5 shadow-sm transition-colors duration-300 ${
              selectedIndex === index
                ? "bg-brand-cream"
                : "bg-brand-cream/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
