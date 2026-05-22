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
  const [error, setError] = useState(false);
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
      onError={() => setError(true)}
      {...props}
    />
  );
}
