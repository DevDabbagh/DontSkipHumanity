import { notFound } from "next/navigation";
import { getProgramBySlug } from "@/lib/api";
import CoursePlayer from "./CoursePlayer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Course Not Found — DSH" };
  return { title: `${program.title} — DSH Academy` };
}

export default async function LearnPage({
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

  return <CoursePlayer program={program} lessonIndex={lessonIndex} />;
}
