import { getPrograms } from "@/lib/api";
import { getLandingConfig, buildAcademySlides } from "@/lib/landing";

export const dynamic = "force-dynamic";
import AcademyListing from "./AcademyListing";

export const metadata = {
  title: "Academy — Don't Skip Humanity",
  description: "Courses, workshops, toolkits, and fellowships — education rooted in justice, craft, and collective liberation.",
};

export default async function AcademyPage() {
  const [programs, cms] = await Promise.all([getPrograms(), getLandingConfig()]);
  const slides = buildAcademySlides(cms.academy_slider, programs);
  return <AcademyListing programs={programs} slides={slides} />;
}
