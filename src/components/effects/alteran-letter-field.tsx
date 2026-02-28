import { cn } from "@/lib/utils";

interface AlteranLetterFieldProps {
  count?: number;
  className?: string;
}

// Latin characters rendered as Alteran alien glyphs by the custom font
const ALTERAN_CHARS = "abcdefghijklmnopqrstuvwxyz".split("");

/**
 * Seed-based deterministic pseudo-random for consistent SSR rendering.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface LetterConfig {
  char: string;
  left: string;
  top: string;
  fontSize: string;
  opacity: number;
  rotation: number;
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  color: string;
}

function generateLetter(index: number): LetterConfig {
  const r1 = seededRandom(index * 7 + 100);
  const r2 = seededRandom(index * 13 + 200);
  const r3 = seededRandom(index * 19 + 300);
  const r4 = seededRandom(index * 23 + 400);
  const r5 = seededRandom(index * 29 + 500);
  const r6 = seededRandom(index * 31 + 600);
  const r7 = seededRandom(index * 37 + 700);

  const charIndex = Math.floor(r5 * ALTERAN_CHARS.length);
  const fontSize = 18 + r1 * 52; // 18-70px

  // Slight rotation for organic feel
  const rotation = (r4 - 0.5) * 50; // -25 to +25 degrees

  const animations = ["alteran-float-1", "alteran-float-2", "alteran-float-3"];
  const animIndex = Math.floor(r3 * 3);
  const duration = 10 + r6 * 18; // 10-28s — active drift

  // Alternate between teal and aqua (CSS vars resolve at runtime for theme-awareness)
  const isTeal = r7 > 0.5;
  const color = isTeal ? "var(--letter-color-teal)" : "var(--letter-color-aqua)";

  return {
    char: ALTERAN_CHARS[charIndex],
    left: `${r1 * 100}%`,
    top: `${r2 * 105}%`, // allow letters slightly below viewport for scrolling pages
    fontSize: `${fontSize}px`,
    opacity: 0.022 + r3 * 0.045, // 0.022–0.067
    rotation,
    animationName: animations[animIndex],
    animationDuration: `${duration}s`,
    animationDelay: `${-(r2 * duration)}s`, // staggered start
    color,
  };
}

/**
 * Decorative background layer of barely-visible Alteran script characters.
 * Uses the custom Alteran font (Latin chars rendered as alien glyphs).
 *
 * Server Component — deterministic rendering via seeded PRNG.
 * Fixed positioning covers the entire viewport across all scroll positions.
 * prefers-reduced-motion disables all animations via global CSS rule.
 */
export function AlteranLetterField({
  count = 30,
  className,
}: AlteranLetterFieldProps) {
  const letters = Array.from({ length: count }, (_, i) => generateLetter(i));

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-hidden pointer-events-none z-0",
        className,
      )}
      aria-hidden="true"
    >
      {letters.map((l, i) => (
        <span
          key={i}
          className="absolute select-none"
          style={{
            left: l.left,
            top: l.top,
            fontSize: l.fontSize,
            fontFamily: "var(--font-alteran)",
            color: l.color,
            opacity: l.opacity,
            // CSS custom props consumed by keyframes for per-element rotation & opacity
            ["--rot" as string]: `${l.rotation}deg`,
            ["--op" as string]: l.opacity,
            animationName: l.animationName,
            animationDuration: l.animationDuration,
            animationDelay: l.animationDelay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          {l.char}
        </span>
      ))}
    </div>
  );
}
