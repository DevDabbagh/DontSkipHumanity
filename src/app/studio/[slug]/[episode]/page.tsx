import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getStudioProjectBySlug, getStudioProjects } from "@/lib/api";
import EpisodeContent from "./EpisodeContent";

/** Episodes may not carry an explicit slug — fall back to the array index. */
function findEpisode(
  episodes: Awaited<ReturnType<typeof getStudioProjectBySlug>> extends infer P
    ? P extends { episodes: infer E }
      ? E
      : never
    : never,
  key: string
) {
  const list = episodes as { slug?: string; number?: number }[];
  const bySlug = list.findIndex((e) => e.slug === key);
  if (bySlug !== -1) return bySlug;
  const byNumber = list.findIndex((e) => String(e.number) === key);
  if (byNumber !== -1) return byNumber;
  const asIndex = Number(key);
  if (Number.isInteger(asIndex) && asIndex >= 1 && asIndex <= list.length) {
    return asIndex - 1;
  }
  return -1;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}) {
  const { slug, episode } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) return { title: "Not found — DSH" };
  const i = findEpisode(project.episodes, episode);
  if (i === -1) return { title: "Not found — DSH" };
  const ep = project.episodes[i];
  return {
    title: `${ep.title} — ${project.title} — Don't Skip Humanity`,
    description: ep.description,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string; episode: string }>;
}) {
  const { slug, episode } = await params;
  const project = await getStudioProjectBySlug(slug);
  if (!project) notFound();

  const index = findEpisode(project.episodes, episode);
  if (index === -1) notFound();

  /* "other suggestions" — same format first, then anything else */
  const all = await getStudioProjects();
  const others = all.filter((p) => p.slug !== project.slug);
  const suggestions = [
    ...others.filter((p) => p.format === project.format),
    ...others.filter((p) => p.format !== project.format),
  ].slice(0, 2);

  return (
    <EpisodeContent
      project={project}
      episode={project.episodes[index]}
      suggestions={suggestions}
    />
  );
}
