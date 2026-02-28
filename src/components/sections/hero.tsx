import { StargateRing, ParticleField, HeroParallax } from "@/components/effects";
import { AncientText, GlowButton } from "@/components/ui";

/**
 * Full-screen hero section with Stargate ring animation, particle field,
 * developer name, tagline, and CTA button.
 *
 * Server Component -- CTA is a plain anchor link (no JS needed for smooth scroll;
 * CSS scroll-behavior: smooth is set globally or handled by Header client JS).
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center min-h-screen py-20 overflow-hidden"
    >
      {/* Particle background */}
      <ParticleField density="medium" />

      {/* Stargate ring -- positioned behind content, parallax scroll */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <HeroParallax speed={0.3}>
          <StargateRing
            size="hero"
            spinning
            className="opacity-30 sm:opacity-40 scale-75 sm:scale-90 md:scale-100"
          />
        </HeroParallax>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-4">
        {/* Decorative Alteran script */}
        <AncientText
          as="p"
          className="text-sm sm:text-base opacity-50 tracking-[0.3em]"
        >
          ascension protocol initiated
        </AncientText>

        {/* Company name */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="text-ancient-teal glow-text">alteran</span>
          <span className="text-ancient-aqua-light">.tech</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl md:text-2xl text-ancient-aqua/80 max-w-lg">
          Разработка элегантного и производительного программного обеспечения
        </p>

        {/* Glowing divider line */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-ancient-teal/60 to-transparent" />

        {/* CTA */}
        <a href="#projects">
          <GlowButton variant="secondary" size="lg">
            Смотреть проекты
          </GlowButton>
        </a>
      </div>

      {/* Bottom fade gradient for smooth transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ancient-bg to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
