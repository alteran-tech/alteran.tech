import { cn } from "@/lib/utils";

interface ChevronDividerProps {
  glowing?: boolean;
  className?: string;
}

/**
 * Horizontal divider with a Stargate-style chevron symbol at center.
 * Inline SVG for full styling control. Optional animated glow effect.
 *
 * prefers-reduced-motion disables glow animation via global CSS rule.
 * Server Component -- CSS-only.
 */
export function ChevronDivider({
  glowing = false,
  className,
}: ChevronDividerProps) {
  return (
    <div
      className={cn("flex items-center gap-4 w-full py-4", className)}
      aria-hidden="true"
    >
      {/* Left line */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ancient-teal/30 to-ancient-teal/50" />

      {/* Center chevron */}
      <svg
        width="40"
        height="24"
        viewBox="0 0 40 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "shrink-0",
          glowing && "animate-[chevron-glow_3s_ease-in-out_infinite]",
        )}
      >
        {/* Outer chevron shape */}
        <path
          d="M4 20L20 4L36 20"
          stroke="rgba(113, 215, 180, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Inner chevron accent */}
        <path
          d="M10 18L20 8L30 18"
          stroke="rgba(113, 215, 180, 0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center dot */}
        <circle
          cx="20"
          cy="14"
          r="2"
          fill="rgba(113, 215, 180, 0.5)"
        />
      </svg>

      {/* Right line */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-ancient-teal/30 to-ancient-teal/50" />
    </div>
  );
}
