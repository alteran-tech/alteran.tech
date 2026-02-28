import { cn } from "@/lib/utils";

interface ShimmerBorderProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

/**
 * Container with an animated shimmer effect running along its border.
 * Uses a rotating conic-gradient on a pseudo-element behind the content.
 *
 * When active=false, displays a static teal border without animation.
 * prefers-reduced-motion disables shimmer via global CSS rule.
 *
 * Server Component -- CSS-only animation.
 */
export function ShimmerBorder({
  children,
  className,
  active = true,
}: ShimmerBorderProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        className,
      )}
    >
      {/* Animated gradient border layer */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-xl",
          active
            ? "bg-[conic-gradient(from_0deg,transparent_0%,rgba(113,215,180,0.6)_10%,transparent_20%,transparent_100%)] animate-[shimmer-rotate_4s_linear_infinite]"
            : "bg-[rgba(113,215,180,0.2)]",
        )}
        aria-hidden="true"
      />

      {/* Inner content container */}
      <div className="relative rounded-xl bg-ancient-bg m-[1px]">
        {children}
      </div>
    </div>
  );
}
