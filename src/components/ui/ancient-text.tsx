import { cn } from "@/lib/utils";

type AncientTextTag = "h1" | "h2" | "h3" | "p" | "span";

interface AncientTextProps {
  children: React.ReactNode;
  as?: AncientTextTag;
  glow?: boolean;
  className?: string;
}

const tagStyles: Record<AncientTextTag, string> = {
  h1: "text-4xl sm:text-5xl md:text-6xl",
  h2: "text-3xl sm:text-4xl md:text-5xl",
  h3: "text-2xl sm:text-3xl md:text-4xl",
  p: "text-base sm:text-lg",
  span: "",
};

/**
 * Decorative text rendered in the Alteran font (public/fonts/alteran.ttf).
 * Use for headings, labels, and accent text -- NOT for body copy.
 *
 * Supports polymorphic rendering via the `as` prop and optional teal glow.
 * Server Component -- CSS-only styling.
 */
export function AncientText({
  children,
  as: Tag = "span",
  glow = false,
  className,
}: AncientTextProps) {
  return (
    <Tag
      className={cn(
        "font-alteran tracking-wider text-ancient-teal",
        tagStyles[Tag],
        glow && [
          "text-shadow-[0_0_10px_rgba(113,215,180,0.6)]",
          "text-shadow-[0_0_20px_rgba(113,215,180,0.4)]",
          "text-shadow-[0_0_40px_rgba(113,215,180,0.2)]",
          "glow-text",
        ],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
