import { getPrograms } from "@/lib/api";
import AcademyListing from "./AcademyListing";

export const metadata = {
  title: "Academy — Don't Skip Humanity",
  description: "Courses, workshops, toolkits, and fellowships — education rooted in justice, craft, and collective liberation.",
};

export default async function AcademyPage() {
  const programs = await getPrograms();
  return <AcademyListing programs={programs} />;
}
