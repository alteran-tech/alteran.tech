"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionOptions {
  /** Visibility threshold (0-1). Default 0.1 = 10% visible. */
  threshold?: number;
  /** Root margin for early/late triggering. */
  rootMargin?: string;
  /** If true, unobserve after first intersection. Default true. */
  triggerOnce?: boolean;
}

/**
 * Custom hook wrapping IntersectionObserver.
 * Returns a ref to attach and a boolean indicating visibility.
 *
 * Respects `prefers-reduced-motion`: if the user prefers reduced motion,
 * the element is treated as always visible (no animation delay).
 */
export function useIntersection<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionOptions = {},
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}
