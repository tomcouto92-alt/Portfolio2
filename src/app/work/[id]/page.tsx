import { notFound } from "next/navigation";
import { getProjects, getProjectByIdOrSlug } from "@/lib/supabase";
import CaseStudyPage from "./CaseStudyPage";

export const dynamic = "force-dynamic";

export default async function WorkPage({ params }: { params: { id: string } }) {
  const [project, allProjects] = await Promise.all([
    getProjectByIdOrSlug(params.id),
    getProjects(),
  ]);

  if (!project) notFound();

  const sorted = [...allProjects].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((p) => p.id === project.id);
  const prevProject = idx > 0 ? sorted[idx - 1] : null;
  const nextProject = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <CaseStudyPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
