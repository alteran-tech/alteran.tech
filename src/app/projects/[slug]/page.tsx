import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { renderMarkdown } from "@/lib/markdown";
import { GlassPanel, AncientText, GlowButton } from "@/components/ui";
import { normalizeImageUrl } from "@/lib/utils";
import { StargateRing } from "@/components/effects";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

export async function generateStaticParams() {
  try {
    const published = await db
      .select({ slug: projects.slug })
      .from(projects)
      .where(eq(projects.status, "published"));

    return published.map((p) => ({ slug: p.slug }));
  } catch {
    // DB not available at build time (e.g., missing TURSO_DATABASE_URL)
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";

  return {
    title: project.title,
    description: project.description ?? `${project.title} -- a project by Igor Gerasimov`,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      type: "article",
      url: `${siteUrl}/projects/${project.slug}`,
      ...(project.imageUrl && {
        images: [{ url: project.imageUrl, width: 1200, height: 630, alt: project.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description ?? undefined,
      ...(project.imageUrl && { images: [project.imageUrl] }),
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const techStack: string[] = project.techStack
    ? JSON.parse(project.techStack)
    : [];

  const githubTopics: string[] = project.githubTopics
    ? JSON.parse(project.githubTopics)
    : [];

  const contentHtml = project.content ? renderMarkdown(project.content) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alteran.tech";
  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description ?? undefined,
    url: `${siteUrl}/projects/${project.slug}`,
    author: {
      "@type": "Person",
      name: "Igor Gerasimov",
      url: siteUrl,
    },
    ...(project.sourceUrl && { codeRepository: project.sourceUrl }),
    ...(project.liveUrl && { installUrl: project.liveUrl }),
    ...(project.githubLanguage && { programmingLanguage: project.githubLanguage }),
    applicationCategory: project.category ?? "DeveloperApplication",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />

      <Header />

      <main id="main-content" role="main" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen pt-24 pb-16">
        {/* Back button */}
        <div className="mb-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-ancient-aqua/60 hover:text-ancient-teal transition-colors duration-200 group"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Projects
        </Link>
      </div>

      {/* Hero area */}
      <div className="relative mb-12">
        {/* Background decoration */}
        <div className="absolute -top-20 -right-20 pointer-events-none opacity-15 hidden lg:block">
          <StargateRing size="md" spinning={false} />
        </div>

        {/* Project image */}
        {project.imageUrl && (
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-8 border border-ancient-teal/10">
            <Image
              src={normalizeImageUrl(project.imageUrl)!}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ancient-bg/60 to-transparent" />
          </div>
        )}

        {/* Title and meta */}
        <div className="space-y-4">
          <AncientText as="h1" glow className="!text-3xl sm:!text-4xl md:!text-5xl">
            {project.title}
          </AncientText>

          {project.description && (
            <p className="text-lg sm:text-xl text-ancient-aqua/70 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="primary" size="md">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  Live Demo
                </GlowButton>
              </a>
            )}
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="secondary" size="md">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Source Code
                </GlowButton>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content and sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
        {/* Main content */}
        <div>
          {contentHtml && (
            <GlassPanel variant="default" padding="lg">
              <div
                className="prose-alteran"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </GlassPanel>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Tech Stack */}
          {techStack.length > 0 && (
            <GlassPanel variant="dark" padding="md">
              <h2 className="text-sm uppercase tracking-wider text-ancient-teal/70 font-medium mb-3">
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-block px-2.5 py-1 text-xs rounded-md bg-ancient-teal/10 text-ancient-aqua/70 border border-ancient-teal/15"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* GitHub Info */}
          {(project.githubStars !== null && project.githubStars > 0 || project.githubLanguage) && (
            <GlassPanel variant="dark" padding="md">
              <h2 className="text-sm uppercase tracking-wider text-ancient-teal/70 font-medium mb-3">
                Repository
              </h2>
              <div className="space-y-2">
                {project.githubLanguage && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-ancient-teal/60" />
                    <span className="text-ancient-aqua/70">{project.githubLanguage}</span>
                  </div>
                )}
                {project.githubStars !== null && project.githubStars > 0 && (
                  <div className="flex items-center gap-2 text-sm text-ancient-aqua/70">
                    <svg className="w-4 h-4 text-ancient-teal/60" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {project.githubStars} stars
                  </div>
                )}
              </div>
            </GlassPanel>
          )}

          {/* Topics */}
          {githubTopics.length > 0 && (
            <GlassPanel variant="dark" padding="md">
              <h2 className="text-sm uppercase tracking-wider text-ancient-teal/70 font-medium mb-3">
                Topics
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {githubTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-block px-2 py-0.5 text-[11px] rounded-full bg-ancient-blue/20 text-ancient-aqua/60 border border-ancient-blue/30"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Category */}
          {project.category && (
            <GlassPanel variant="dark" padding="md">
              <h2 className="text-sm uppercase tracking-wider text-ancient-teal/70 font-medium mb-2">
                Category
              </h2>
              <p className="text-sm text-ancient-aqua/70">{project.category}</p>
            </GlassPanel>
          )}
        </aside>
      </div>
      </main>

      <Footer />
    </>
  );
}
