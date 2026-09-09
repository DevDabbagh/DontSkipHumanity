import { getPrograms } from "@/lib/api";
import { getAcademyHeader, getHeaderImagePools } from "@/lib/landing";

export const dynamic = "force-dynamic";
import AcademyListing from "./AcademyListing";

export const metadata = {
  title: "Academy — Don't Skip Humanity",
  description:
    "Courses, workshops, toolkits, and fellowships — education rooted in justice, craft, and collective liberation.",
};

export default async function AcademyPage() {
  /* The pools are every catalogue, not just this page's — a header may
     import film posters behind an Academy headline, and the editor should
     not need a developer for that. */
  const [programs, header, pools] = await Promise.all([
    getPrograms(),
    getAcademyHeader(),
    getHeaderImagePools(),
  ]);
  return <AcademyListing programs={programs} header={header} pools={pools} />;
}
