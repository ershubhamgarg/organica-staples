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
  // Three stages per src: 0 = through Next's optimizer, 1 = the original
  // file directly, 2 = give up and show the placeholder.
  //
  // Stage 1 exists because the optimizer can fail while the file is fine —
  // in production Vercel answers 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
  // once the account's image-optimization quota is used, which breaks every
  // uncached image even though the Supabase URL itself loads. Falling back to
  // the raw URL keeps images showing (larger, but visible) until that clears.
  //
  // State is keyed by src rather than a bare flag, so an image that failed
  // once (e.g. it was still uploading) recovers as soon as the src changes.
  const [attempt, setAttempt] = useState<{ src: string; stage: number }>({
    src,
    stage: 0,
  });
  const stage = attempt.src === src ? attempt.stage : 0;
  const error = stage >= 2;
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
      {...props}
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      unoptimized={stage === 1 || props.unoptimized}
      onError={() => setAttempt({ src, stage: stage + 1 })}
    />
  );
}
