"use client";

import { cn } from "@/lib/utils";
import { useIntersection } from "@/hooks/use-intersection";

type Direction = "up" | "left" | "right";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Animation delay in ms. Default 0. */
  delay?: number;
  /** Direction to animate from. Default "up". */
  direction?: Direction;
  /** Additional class names. */
  className?: string;
}

const directionStyles: Record<Direction, string> = {
  up: "translate-y-8",
  left: "translate-x-8",
  right: "-translate-x-8",
};

/**
 * Wrapper component that reveals children with a fade + slide animation
 * when the element enters the viewport.
 *
 * Uses IntersectionObserver via useIntersection hook.
 * Respects `prefers-reduced-motion` (elements appear immediately).
 * CSS transitions only -- no JS animation frames.
 */
export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: ScrollRevealProps) {
  const { ref, isVisible } = useIntersection<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px",
  });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-x-0 translate-y-0"
          : cn("opacity-0", directionStyles[direction]),
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
