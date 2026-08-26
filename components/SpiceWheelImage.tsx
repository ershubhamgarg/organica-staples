"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import ScrollReveal from "@/components/ScrollReveal";

export default function SpiceWheelImage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const applyRotation = () => {
      rafRef.current = null;

      const wrapper = wrapperRef.current;
      const rotator = rotatorRef.current;
      if (!wrapper || !rotator) return;

      const rect = wrapper.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      // Degrees of rotation per pixel the section sits away from viewport centre.
      const rotation = (viewportCenter - elementCenter) * 0.09;

      rotator.style.transform = `rotate(${rotation}deg)`;
    };

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(applyRotation);
    };

    applyRotation();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <ScrollReveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div
        ref={wrapperRef}
        className="relative aspect-square w-full max-w-md mx-auto"
      >
        {/* Ambient glow */}
        <div className="absolute -inset-10 bg-brand-gold/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Slow decorative ring, independent of scroll rotation */}
        <div
          className="absolute -inset-6 rounded-full border border-dashed border-brand-gold/20 animate-spin-slow pointer-events-none"
          style={{ animationDuration: "50s" }}
        />

        {/* Scroll-rotated spice wheel */}
        <div
          ref={rotatorRef}
          className="absolute inset-0 will-change-transform"
          style={{ transition: "transform 120ms ease-out" }}
        >
          <Image
            src="/spice-wheel.png"
            alt="An ANNVRIKSH organic spice sampler — turmeric, chilli, coriander, cumin, and more, arranged in a wooden wheel"
            fill
            className="object-contain drop-shadow-[0_50px_80px_rgba(0,0,0,0.5)]"
            sizes="(max-width: 1024px) 90vw, 560px"
            priority
          />
        </div>
      </div>
    </ScrollReveal>
  );
}
