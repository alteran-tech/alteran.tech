import { cn } from "@/lib/utils";

type StargateRingSize = "sm" | "md" | "lg" | "hero";

interface StargateRingProps {
  size?: StargateRingSize;
  className?: string;
  spinning?: boolean;
}

const sizeMap: Record<StargateRingSize, number> = {
  sm: 200,
  md: 300,
  lg: 400,
  hero: 560,
};

/**
 * Generates evenly-spaced positions around a circle for Ancient-style glyphs.
 */
function getGlyphPositions(count: number, radius: number, center: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      rotation: (i * 360) / count,
    };
  });
}

/**
 * Simple geometric glyphs inspired by Ancient/Alteran symbols.
 * Each is a small SVG path rendered at a position around the ring.
 */
function AncientGlyph({ x, y, rotation, index }: { x: number; y: number; rotation: number; index: number }) {
  const glyphSize = 8;
  const glyphs = [
    // Chevron / arrow shape
    <path
      key="chevron"
      d={`M${-glyphSize},${glyphSize / 2} L0,${-glyphSize} L${glyphSize},${glyphSize / 2}`}
      fill="none"
      stroke="rgba(113, 215, 180, 0.7)"
      strokeWidth="1.5"
    />,
    // Diamond
    <path
      key="diamond"
      d={`M0,${-glyphSize} L${glyphSize},0 L0,${glyphSize} L${-glyphSize},0 Z`}
      fill="none"
      stroke="rgba(113, 215, 180, 0.6)"
      strokeWidth="1.2"
    />,
    // Circle with dot
    <>
      <circle key="circle-outer" r={glyphSize * 0.7} fill="none" stroke="rgba(113, 215, 180, 0.5)" strokeWidth="1.2" />
      <circle key="circle-inner" r={2} fill="rgba(113, 215, 180, 0.8)" />
    </>,
    // Triple lines
    <>
      <line key="line1" x1={-glyphSize} y1={-4} x2={glyphSize} y2={-4} stroke="rgba(113, 215, 180, 0.5)" strokeWidth="1.2" />
      <line key="line2" x1={-glyphSize * 0.6} y1={0} x2={glyphSize * 0.6} y2={0} stroke="rgba(113, 215, 180, 0.6)" strokeWidth="1.2" />
      <line key="line3" x1={-glyphSize} y1={4} x2={glyphSize} y2={4} stroke="rgba(113, 215, 180, 0.5)" strokeWidth="1.2" />
    </>,
    // Triangle
    <path
      key="triangle"
      d={`M0,${-glyphSize} L${glyphSize * 0.87},${glyphSize * 0.5} L${-glyphSize * 0.87},${glyphSize * 0.5} Z`}
      fill="none"
      stroke="rgba(113, 215, 180, 0.65)"
      strokeWidth="1.2"
    />,
    // Cross
    <>
      <line key="v" x1={0} y1={-glyphSize} x2={0} y2={glyphSize} stroke="rgba(113, 215, 180, 0.55)" strokeWidth="1.5" />
      <line key="h" x1={-glyphSize} y1={0} x2={glyphSize} y2={0} stroke="rgba(113, 215, 180, 0.55)" strokeWidth="1.5" />
    </>,
  ];

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {glyphs[index % glyphs.length]}
    </g>
  );
}

/**
 * Decorative Stargate-inspired ring with rotating concentric circles
 * and Ancient geometric glyphs.
 *
 * Outer ring rotates clockwise (30s), inner ring counter-clockwise (60s).
 * Pure CSS animation -- Server Component, no client JS.
 * Decorative: aria-hidden="true".
 *
 * prefers-reduced-motion disables rotation via global CSS rule.
 */
export function StargateRing({
  size = "md",
  className,
  spinning = true,
}: StargateRingProps) {
  const dim = sizeMap[size];
  const center = dim / 2;
  const outerRadius = dim * 0.44;
  const innerRadius = dim * 0.34;
  const glyphRadius = dim * 0.39;

  const outerGlyphs = getGlyphPositions(9, glyphRadius, center);
  const innerGlyphPositions = getGlyphPositions(6, innerRadius * 0.85, center);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      aria-hidden="true"
    >
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        {/* Outer glow filter */}
        <defs>
          <filter id="glyph-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer ring -- spins clockwise */}
        <g
          className={cn(
            spinning && "animate-[stargate-spin_30s_linear_infinite]",
          )}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {/* Outer ring circle */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke="rgba(113, 215, 180, 0.25)"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 6}
            stroke="rgba(113, 215, 180, 0.1)"
            strokeWidth="1"
            fill="none"
          />

          {/* Outer glyphs */}
          <g filter="url(#glyph-glow)">
            {outerGlyphs.map((pos, i) => (
              <AncientGlyph
                key={`outer-${i}`}
                x={pos.x}
                y={pos.y}
                rotation={pos.rotation}
                index={i}
              />
            ))}
          </g>

          {/* Tick marks between glyphs */}
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10 * Math.PI) / 180;
            const r1 = outerRadius - 3;
            const r2 = outerRadius + 3;
            return (
              <line
                key={`tick-${i}`}
                x1={center + r1 * Math.cos(angle)}
                y1={center + r1 * Math.sin(angle)}
                x2={center + r2 * Math.cos(angle)}
                y2={center + r2 * Math.sin(angle)}
                stroke="rgba(113, 215, 180, 0.15)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Inner ring -- spins counter-clockwise */}
        <g
          className={cn(
            spinning && "animate-[stargate-spin-reverse_60s_linear_infinite]",
          )}
          style={{ transformOrigin: `${center}px ${center}px` }}
        >
          {/* Inner ring circle */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke="rgba(113, 215, 180, 0.2)"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Inner glyphs (smaller, fewer) */}
          <g filter="url(#glyph-glow)">
            {innerGlyphPositions.map((pos, i) => (
              <AncientGlyph
                key={`inner-${i}`}
                x={pos.x}
                y={pos.y}
                rotation={pos.rotation + 180}
                index={i + 3}
              />
            ))}
          </g>
        </g>

        {/* Center element -- static */}
        <circle
          cx={center}
          cy={center}
          r={dim * 0.08}
          fill="rgba(113, 215, 180, 0.05)"
          stroke="rgba(113, 215, 180, 0.3)"
          strokeWidth="1"
        />
        <circle
          cx={center}
          cy={center}
          r={dim * 0.03}
          fill="rgba(113, 215, 180, 0.4)"
        />
      </svg>
    </div>
  );
}
