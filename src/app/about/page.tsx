import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSections from "./AboutSections";
import { getPageSections, sectionOfKind } from "@/lib/page-sections";

/* The page is assembled from a database table an editor can change at any
   moment, so it cannot be cached at build time — the same reason the other
   CMS-backed pages opt out. */
export const dynamic = "force-dynamic";

/**
 * The description search engines and link previews use follows the hero, so it
 * changes when an editor changes the page, and it is in the visitor's language.
 * Hard-coding it would have meant the shared card saying one thing while the
 * page said another.
 */
export async function generateMetadata(): Promise<Metadata> {
  const hero = sectionOfKind(await getPageSections("about"), "hero");
  const standfirst = typeof hero?.content.standfirst === "string" ? hero.content.standfirst : "";
  const headline = typeof hero?.content.headline === "string" ? hero.content.headline : "";

  return {
    title: "About",
    description: standfirst || headline || undefined,
  };
}

export default async function AboutPage() {
  const sections = await getPageSections("about");

  return (
    <main className="relative bg-[#0D0D0D]">
      <div className="film-grain" />
      <Navbar />
      <AboutSections sections={sections} />
      <Footer />
    </main>
  );
}
