import Link from "next/link";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { GlassPanel, GlowButton } from "@/components/ui";

export const dynamic = "force-dynamic";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
}

/**
 * Admin Dashboard page (Server Component).
 * Shows project statistics from the database and links to management pages.
 */
export default async function AdminDashboard() {
  // Fetch stats in parallel
  const [allProjects, publishedCount, draftCount, featuredCount] =
    await Promise.all([
      db.select().from(projects).orderBy(desc(projects.createdAt)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.status, "published")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.status, "draft")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(eq(projects.featured, 1))),
    ]);

  const totalCount = allProjects.length;
  const recentProjects = allProjects.slice(0, 5);

  const stats: StatCard[] = [
    {
      label: "Всего проектов",
      value: totalCount,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
        </svg>
      ),
    },
    {
      label: "Опубликовано",
      value: publishedCount[0]?.count ?? 0,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      label: "Черновики",
      value: draftCount[0]?.count ?? 0,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
      ),
    },
    {
      label: "Избранные",
      value: featuredCount[0]?.count ?? 0,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-base)]">Панель управления</h1>
          <p className="text-sm text-ancient-aqua/60 mt-1">
            Обзор проектов портфолио
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/projects">
            <GlowButton variant="secondary" size="sm">
              Управление проектами
            </GlowButton>
          </Link>
          <Link href="/admin/projects/new">
            <GlowButton variant="primary" size="sm">
              + Новый проект
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <GlassPanel key={stat.label} variant="default" padding="md">
            <div className="flex items-center gap-4">
              <div className="text-ancient-teal/60">{stat.icon}</div>
              <div>
                <p className="text-3xl font-bold text-[var(--text-base)]">{stat.value}</p>
                <p className="text-sm text-ancient-aqua/60">{stat.label}</p>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Recent projects */}
      <GlassPanel variant="default" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-base)]">Последние проекты</h2>
          <Link
            href="/admin/projects"
            className="text-sm text-ancient-teal hover:text-ancient-aqua-light transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal"
          >
            Все проекты
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-ancient-aqua/50">Проектов пока нет.</p>
            <Link href="/admin/projects/new" className="text-sm text-ancient-teal hover:text-ancient-aqua-light mt-2 inline-block">
              Создать первый проект
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-ancient-bg/40 border border-ancient-teal/5 hover:border-ancient-teal/15 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-base)] truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-ancient-aqua/50 truncate">
                      {project.slug} &middot; {project.source}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      project.status === "published"
                        ? "bg-ancient-teal/15 text-ancient-teal border border-ancient-teal/20"
                        : "bg-white/5 text-ancient-aqua/50 border border-white/10"
                    }`}
                  >
                    {project.status}
                  </span>
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="text-xs text-ancient-teal hover:text-ancient-aqua-light transition-colors"
                  >
                    Ред.
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
