import { getPrograms } from "@/lib/api";
import { getAcademyHeader } from "@/lib/landing";

export const dynamic = "force-dynamic";
import AcademyListing from "./AcademyListing";

export const metadata = {
  title: "Academy — Don't Skip Humanity",
  description:
    "Courses, workshops, toolkits, and fellowships — education rooted in justice, craft, and collective liberation.",
};

export default async function AcademyPage() {
  const [programs, header] = await Promise.all([getPrograms(), getAcademyHeader()]);
  return <AcademyListing programs={programs} header={header} />;
}
