import { notFound } from "next/navigation";
import { getProgramBySlug } from "@/lib/api";
import LessonComplete from "./LessonComplete";

export const dynamic = "force-dynamic";

export default async function LessonCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const { slug } = await params;
  const { lesson } = await searchParams;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const lessonIndex = Number.parseInt(lesson ?? "0", 10) || 0;

  return <LessonComplete program={program} lessonIndex={lessonIndex} />;
}
