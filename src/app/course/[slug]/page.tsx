import { notFound } from "next/navigation";
import { getProgramBySlug, getPrograms } from "@/lib/api";
import CourseContent from "./CourseContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: "Course Not Found — DSH" };
  return {
    title: `${program.title} — DSH Academy`,
    description: program.description,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const allPrograms = await getPrograms();
  const relatedPrograms = allPrograms
    .filter((p) => p.slug !== program.slug)
    .slice(0, 3);

  return <CourseContent program={program} relatedPrograms={relatedPrograms} />;
}
