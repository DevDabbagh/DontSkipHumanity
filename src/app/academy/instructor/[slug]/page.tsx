import { notFound } from "next/navigation";
import { getInstructorProfile } from "@/lib/api";
import InstructorProfile from "./InstructorProfile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getInstructorProfile(slug);
  if (!profile) return { title: "Instructor Not Found — DSH" };
  return {
    title: `${profile.instructor.name} — DSH Academy`,
    description: profile.instructor.bio.slice(0, 160) || undefined,
    openGraph: profile.instructor.photoUrl ? { images: [profile.instructor.photoUrl] } : undefined,
  };
}

export default async function InstructorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getInstructorProfile(slug);
  if (!profile) notFound();
  return <InstructorProfile profile={profile} />;
}
