import Link from "next/link";
import Image from "next/image";
import { cn, normalizeImageUrl } from "@/lib/utils";
import { GlassPanel } from "@/components/ui";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
}

/**
 * Project card displaying title, description, tech stack tags, and GitHub stars.
 * Links to /projects/[slug] detail page. CSS-only hover shimmer effect.
 *
 * Server Component -- no client JS needed.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  const techStack: string[] = project.techStack
    ? JSON.parse(project.techStack)
    : [];

  const isFeatured = project.featured === 1;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group block rounded-xl transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(113,215,180,0.12)]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ancient-teal",
      )}
    >
      <GlassPanel
        variant={isFeatured ? "accent" : "default"}
        padding="none"
        className="h-full overflow-hidden"
      >
        {/* Image */}
        {project.imageUrl ? (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={normalizeImageUrl(project.imageUrl)!}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ancient-bg/80 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-ancient-blue-deep/60 to-ancient-surface-solid/60 flex items-center justify-center">
            <span className="font-alteran text-3xl text-ancient-teal/20 tracking-widest">
              {project.title.slice(0, 3).toLowerCase()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Featured badge */}
          {isFeatured && (
            <span className="inline-block text-[10px] uppercase tracking-widest text-ancient-teal font-semibold px-2 py-0.5 rounded-md bg-ancient-teal/10 border border-ancient-teal/20">
              Избранное
            </span>
          )}

          {/* Title */}
          <h3 className="text-lg font-semibold text-[var(--text-base)] group-hover:text-ancient-teal transition-colors duration-200 line-clamp-1">
            {project.title}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-ancient-aqua/60 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Bottom row: tech stack + stats */}
          <div className="flex items-end justify-between gap-3 pt-1">
            {/* Tech tags */}
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {techStack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="inline-block px-2 py-0.5 text-[11px] rounded-md bg-ancient-teal/8 text-ancient-aqua/60 border border-ancient-teal/10 truncate max-w-[100px]"
                  >
                    {tech}
                  </span>
                ))}
                {techStack.length > 3 && (
                  <span className="text-[11px] text-ancient-aqua/40">
                    +{techStack.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* GitHub stars */}
            {project.githubStars && project.githubStars > 0 && (
              <span className="flex items-center gap-1 text-xs text-ancient-aqua/50 shrink-0">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {project.githubStars}
              </span>
            )}
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}
