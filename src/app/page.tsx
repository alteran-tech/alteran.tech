import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { Contact } from "@/components/sections/contact";
import { AlteranLetterField } from "@/components/effects";

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";

/** JSON-LD Organization structured data for the home page */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Alteran",
  url: siteUrl,
  description: "Software development company building performant, elegant products.",
};

/**
 * Public home page. Composes all sections:
 * Header (sticky) -> Hero -> About -> Projects Grid (from DB) -> Contact -> Footer.
 *
 * Server Component with ISR (revalidate = 3600).
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Barely-visible Alteran glyph field — fixed background layer */}
      <AlteranLetterField count={30} />

      <Header />

      <main id="main-content" role="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <About />
        <ProjectsGrid />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
