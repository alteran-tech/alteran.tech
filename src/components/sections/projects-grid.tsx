import { desc, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { ChevronDivider, ScrollReveal } from "@/components/effects";
import { AncientText, GlassPanel } from "@/components/ui";
import { ProjectCard } from "@/components/project/project-card";

/**
 * Projects grid section. Loads published projects from the database,
 * sorted by featured first, then by sortOrder.
 *
 * Async Server Component -- direct DB access, no client JS.
 */
export async function ProjectsGrid() {
  let allProjects: (typeof projects.$inferSelect)[] = [];

  if (process.env.TURSO_DATABASE_URL) {
    try {
      allProjects = await db
        .select()
        .from(projects)
        .where(eq(projects.status, "published"))
        .orderBy(desc(projects.featured), asc(projects.sortOrder), desc(projects.createdAt));
    } catch {
      // DB query failed -- show empty state
    }
  }

  return (
    <section id="projects" className="py-16 sm:py-24">
      <ChevronDivider glowing />

      <div className="mt-12 sm:mt-16 space-y-12">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center space-y-3">
            <AncientText as="h2" glow>
              projects
            </AncientText>
            <p className="text-ancient-aqua/60 text-sm tracking-wider uppercase">
              Мои проекты
            </p>
          </div>
        </ScrollReveal>

        {/* Grid or empty state */}
        {allProjects.length > 0 ? (
          <ScrollReveal delay={100}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={100}>
            <GlassPanel variant="dark" padding="lg" className="max-w-md mx-auto text-center">
              <div className="space-y-3">
                <span className="font-alteran text-2xl text-ancient-teal/30 tracking-widest block">
                  awaiting data
                </span>
                <p className="text-sm text-ancient-aqua/40">
                  Проекты ещё не опубликованы. Загляните позже.
                </p>
              </div>
            </GlassPanel>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
