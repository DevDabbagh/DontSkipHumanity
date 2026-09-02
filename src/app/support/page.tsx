import type { Metadata } from "next";
import SupportContent from "./SupportContent";
import { getPageSections, sectionOfKind } from "@/lib/page-sections";

/* Editable at any moment from the dashboard, and it reads the donation mode
   per request, so it cannot be baked at build time. */
export const dynamic = "force-dynamic";

/**
 * The page's own words describe it, in the visitor's language — so the link
 * preview and the page can never say two different things.
 */
export async function generateMetadata(): Promise<Metadata> {
  const hero = sectionOfKind(await getPageSections("support"), "hero");
  const standfirst = typeof hero?.content.standfirst === "string" ? hero.content.standfirst : "";

  return {
    title: "Support",
    description:
      standfirst ||
      "Fund independent films, free courses and fellowships. No ads, no algorithms, no sponsors shaping what gets told.",
  };
}

/**
 * Support is split in two on purpose.
 *
 * This half is a server component so the page's copy can be read from the
 * database and translated before anything reaches the browser. The other half
 * has to be a client component — it reads the query string and talks to the
 * checkout — and a client component can do neither of those first two things.
 */
export default async function SupportPage() {
  const sections = await getPageSections("support");
  return <SupportContent sections={sections} />;
}
