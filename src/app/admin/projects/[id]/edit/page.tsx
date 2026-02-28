import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/actions/projects";
import { EditProjectForm } from "./edit-form";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit project page (Server Component wrapper).
 * Loads project data by ID and passes it to the client form.
 */
export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-base)]">Edit Project</h1>
        <p className="text-sm text-ancient-aqua/60 mt-1">
          Editing &ldquo;{project.title}&rdquo;
        </p>
      </div>

      <EditProjectForm project={project} />
    </div>
  );
}
