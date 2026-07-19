import { MOCK_PROGRAMS } from "@/lib/mock-data";
import AcademyListing from "./AcademyListing";

export const metadata = {
  title: "Academy — Don't Skip Humanity",
  description: "Courses, workshops, toolkits, and fellowships — education rooted in justice, craft, and collective liberation.",
};

export default function AcademyPage() {
  const programs = MOCK_PROGRAMS.filter((p) => p.status === "published");
  return <AcademyListing programs={programs} />;
}
