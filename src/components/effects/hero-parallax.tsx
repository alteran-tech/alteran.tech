"use client";

import { useEffect, useRef } from "react";

interface HeroParallaxProps {
  children: React.ReactNode;
  /** Parallax speed factor. Default 0.3 (moves at 30% of scroll speed). */
  speed?: number;
}

/**
 * Client component wrapper that applies a subtle parallax translateY
 * to its children based on scroll position.
 *
 * Uses requestAnimationFrame for smooth 60fps updates.
 * Respects `prefers-reduced-motion` -- disables parallax entirely.
 */
export function HeroParallax({ children, speed = 0.3 }: HeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    let rafId: number;

    function onScroll() {
      rafId = requestAnimationFrame(() => {
        if (ref.current) {
          const scrollY = window.scrollY;
          ref.current.style.transform = `translateY(${scrollY * speed}px)`;
        }
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return (
    <div ref={ref} className="will-change-transform">
      {children}
    </div>
  );
}
