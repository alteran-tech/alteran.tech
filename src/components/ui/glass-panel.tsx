import { cn } from "@/lib/utils";

type GlassPanelVariant = "default" | "dark" | "accent";
type GlassPanelPadding = "none" | "sm" | "md" | "lg";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: GlassPanelVariant;
  padding?: GlassPanelPadding;
}

const variantStyles: Record<GlassPanelVariant, string> = {
  default: [
    "bg-[var(--glass-bg)]",
    "backdrop-blur-[12px]",
    "border border-[var(--glass-border)]",
  ].join(" "),
  dark: [
    "bg-[var(--glass-bg-strong)]",
    "backdrop-blur-[12px]",
    "border border-[var(--glass-border)]",
  ].join(" "),
  accent: [
    "bg-[var(--glass-bg)]",
    "backdrop-blur-[12px]",
    "border border-[var(--glass-border-accent)]",
    "glass-panel-accent-shadow",
  ].join(" "),
};

const paddingStyles: Record<GlassPanelPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-6",
  lg: "p-8",
};

/**
 * Glassmorphism container inspired by Alteran/Ancient technology surfaces.
 * Semi-transparent panel with backdrop blur and optional teal glow border.
 *
 * Server Component -- no client JS required.
 */
export function GlassPanel({
  children,
  className,
  variant = "default",
  padding = "md",
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}
