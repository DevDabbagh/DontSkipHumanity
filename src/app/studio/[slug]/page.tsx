import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getStudioProjectBySlug, getStudioProjects } from "@/lib/api";
import StudioProjectContent from "./StudioProjectContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) return { title: "Not found — DSH" };
  return {
    title: `${project.title} — Don't Skip Humanity`,
    description: project.synopsisShort || project.oneLineDescription,
  };
}

export default async function StudioProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) notFound();

  /* "other suggestions" — same format first, then anything else */
  const all = await getStudioProjects();
  const others = all.filter((p) => p.slug !== project.slug);
  const suggestions = [
    ...others.filter((p) => p.format === project.format),
    ...others.filter((p) => p.format !== project.format),
  ].slice(0, 2);

  return <StudioProjectContent project={project} suggestions={suggestions} />;
}
