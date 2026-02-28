import { cn } from "@/lib/utils";

type ParticleDensity = "low" | "medium" | "high";

interface ParticleFieldProps {
  density?: ParticleDensity;
  className?: string;
}

const densityCount: Record<ParticleDensity, number> = {
  low: 8,
  medium: 15,
  high: 22,
};

/**
 * Seed-based deterministic pseudo-random for consistent SSR rendering.
 * Returns value in [0, 1).
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface ParticleConfig {
  left: string;
  top: string;
  width: string;
  height: string;
  opacity: number;
  animationName: string;
  animationDuration: string;
  animationDelay: string;
  backgroundColor: string;
}

function generateParticle(index: number): ParticleConfig {
  const r1 = seededRandom(index * 7 + 1);
  const r2 = seededRandom(index * 13 + 2);
  const r3 = seededRandom(index * 19 + 3);
  const r4 = seededRandom(index * 23 + 4);

  const size = 2 + r1 * 4; // 2-6px
  const animations = ["particle-float-1", "particle-float-2", "particle-float-3"];
  const animIndex = Math.floor(r3 * 3);
  const duration = 10 + r4 * 15; // 10-25s

  // Alternate between teal and aqua tones (CSS vars resolve at runtime for theme-awareness)
  const isTeal = index % 2 === 0;
  const color = isTeal ? "var(--particle-color-1)" : "var(--particle-color-2)";

  return {
    left: `${r1 * 100}%`,
    top: `${r2 * 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.3 + r3 * 0.4,
    animationName: animations[animIndex],
    animationDuration: `${duration}s`,
    animationDelay: `${-(r2 * duration)}s`, // Negative delay for staggered start
    backgroundColor: color,
  };
}

/**
 * Decorative floating particle field for background ambience.
 * CSS-only particles using divs with @keyframes animations.
 *
 * Particles are absolutely positioned and do not affect layout.
 * prefers-reduced-motion makes particles static via global CSS rule.
 *
 * Server Component -- deterministic rendering (seeded PRNG for SSR consistency).
 */
export function ParticleField({
  density = "medium",
  className,
}: ParticleFieldProps) {
  const count = densityCount[density];
  const particles = Array.from({ length: count }, (_, i) => generateParticle(i));

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
      aria-hidden="true"
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            opacity: p.opacity,
            backgroundColor: p.backgroundColor,
            animationName: p.animationName,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
