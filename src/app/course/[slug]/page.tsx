import { notFound } from "next/navigation";
import { getProgramBySlug, MOCK_PROGRAMS } from "@/lib/mock-data";
import CourseContent from "./CourseContent";

export function generateStaticParams() {
  return MOCK_PROGRAMS.filter((p) => p.status === "published").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) return { title: "Course Not Found — DSH" };
  return {
    title: `${program.title} — DSH Academy`,
    description: program.description,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  const relatedPrograms = MOCK_PROGRAMS
    .filter((p) => p.slug !== program.slug && p.status === "published")
    .slice(0, 3);

  return <CourseContent program={program} relatedPrograms={relatedPrograms} />;
}
