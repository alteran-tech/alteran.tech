import Link from "next/link";
import { getProjects } from "@/lib/actions/projects";
import { GlassPanel, GlowButton } from "@/components/ui";
import { ProjectActions } from "./project-actions";

export const dynamic = "force-dynamic";

/**
 * Admin projects list page (Server Component).
 * Shows all projects (including drafts) with management actions.
 */
export default async function AdminProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-base)]">Проекты</h1>
          <p className="text-sm text-ancient-aqua/60 mt-1">
            Управление проектами портфолио
          </p>
        </div>
        <Link href="/admin/projects/new">
          <GlowButton variant="primary" size="sm">
            + Новый проект
          </GlowButton>
        </Link>
      </div>

      {/* Projects table */}
      <GlassPanel variant="default" padding="none">
        {allProjects.length === 0 ? (
          <div className="text-center py-16 px-6">
            <span className="font-alteran text-2xl text-ancient-teal/30 tracking-widest block mb-3">
              no projects
            </span>
            <p className="text-sm text-ancient-aqua/50 mb-4">
              Проектов пока нет. Создайте первый проект, чтобы начать.
            </p>
            <Link href="/admin/projects/new">
              <GlowButton variant="primary" size="sm">
                Создать проект
              </GlowButton>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ancient-teal/10">
                  <th className="text-left text-xs uppercase tracking-wider text-ancient-aqua/50 font-medium px-6 py-3">
                    Название
                  </th>
                  <th className="text-left text-xs uppercase tracking-wider text-ancient-aqua/50 font-medium px-6 py-3">
                    Статус
                  </th>
                  <th className="text-left text-xs uppercase tracking-wider text-ancient-aqua/50 font-medium px-6 py-3 hidden sm:table-cell">
                    Источник
                  </th>
                  <th className="text-left text-xs uppercase tracking-wider text-ancient-aqua/50 font-medium px-6 py-3 hidden md:table-cell">
                    Звёзды
                  </th>
                  <th className="text-right text-xs uppercase tracking-wider text-ancient-aqua/50 font-medium px-6 py-3">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ancient-teal/5">
                {allProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-ancient-teal/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-base)] truncate max-w-[250px]">
                          {project.title}
                        </p>
                        <p className="text-xs text-ancient-aqua/40 truncate max-w-[250px]">
                          /{project.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          project.status === "published"
                            ? "bg-ancient-teal/15 text-ancient-teal border border-ancient-teal/20"
                            : "bg-white/5 text-ancient-aqua/50 border border-white/10"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-ancient-aqua/50">
                        {project.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-ancient-aqua/50">
                        {project.githubStars ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ProjectActions
                        projectId={project.id}
                        projectTitle={project.title}
                        currentStatus={project.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
