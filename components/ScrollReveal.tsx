"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: "reveal-up" | "reveal-down" | "reveal-fade";
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  animation = "reveal-up",
  delay = 0,
  className = "",
  threshold = 0.1,
  once = true,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  const animationClass = isVisible ? `animate-${animation}` : "reveal-hidden";

  return (
    <div
      ref={domRef}
      className={`${animationClass} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
