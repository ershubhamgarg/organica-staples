"use client";

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { Package } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackText?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackText,
  className,
  fill,
  ...props
}: ImageWithFallbackProps) {
  // Remember *which* src failed rather than a bare boolean. A plain flag
  // stays true forever, so an image that 404'd once (e.g. it was still being
  // uploaded) kept showing "Image unavailable" even after the file existed
  // or the product's image was changed; this recovers as soon as the src is
  // different from the one that failed.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const error = failedSrc === src;
  const fallbackClassName = `${fill ? "absolute inset-0 h-full w-full" : ""} ${className || ""}`;

  if (error || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-brand-sand text-brand-brown/40 ${fallbackClassName}`}>
        <Package size={48} className="mb-2 opacity-50" />
        <span className="text-xs font-medium px-4 text-center">
          {fallbackText || alt || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setFailedSrc(src)}
      {...props}
    />
  );
}
