import { notFound } from "next/navigation";
import { getPrograms } from "@/lib/api";
import { slugifyName } from "@/lib/slug";
import InstructorProfile from "./InstructorProfile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programs = await getPrograms();
  const match = programs.find((p) => slugifyName(p.whoLeads) === slug);
  if (!match) return { title: "Instructor Not Found — DSH" };
  return { title: `${match.whoLeads} — DSH Academy` };
}

export default async function InstructorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programs = await getPrograms();
  const theirPrograms = programs.filter((p) => slugifyName(p.whoLeads) === slug);

  if (theirPrograms.length === 0) notFound();

  return <InstructorProfile name={theirPrograms[0].whoLeads} programs={theirPrograms} />;
}
