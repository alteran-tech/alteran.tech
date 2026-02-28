import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type GlowButtonVariant = "primary" | "secondary" | "ghost";
type GlowButtonSize = "sm" | "md" | "lg";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: GlowButtonVariant;
  size?: GlowButtonSize;
}

const variantStyles: Record<GlowButtonVariant, string> = {
  primary: [
    "bg-ancient-teal text-ancient-bg font-semibold",
    "btn-glow-primary",
    "active:scale-[0.98]",
  ].join(" "),
  secondary: [
    "bg-transparent text-ancient-teal",
    "border border-ancient-teal/40",
    "hover:border-ancient-teal/80",
    "hover:bg-ancient-teal/5",
    "btn-glow-secondary",
    "active:scale-[0.98]",
  ].join(" "),
  ghost: [
    "bg-transparent text-ancient-teal",
    "hover:text-ancient-aqua-light",
    "btn-glow-ghost",
    "active:scale-[0.98]",
  ].join(" "),
};

const sizeStyles: Record<GlowButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-7 py-3 text-base rounded-xl",
};

/**
 * Glowing button with Alteran design language.
 * CSS-only hover effects (no JS needed for glow) -- Server Component.
 *
 * Variants: primary (solid teal), secondary (outlined), ghost (text-only).
 * Focus-visible outline for accessibility.
 */
export function GlowButton({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "font-medium transition-all duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal",
        "disabled:opacity-50 disabled:pointer-events-none",
        "cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
