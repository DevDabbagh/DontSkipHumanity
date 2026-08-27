"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLocaleHref, useT } from "@/contexts/LocaleContext";

/* Each entry carries the string key; the English word beside it is only the
   React key and the last-resort label. Film titles are content, not interface
   text, so they stay as written — they are names, not labels. */
const FOOTER_LINKS: {
  heading: string;
  headingLabel: string;
  links: { key?: string; label: string; href: string }[];
}[] = [
  {
    heading: "nav.films",
    headingLabel: "Films",
    links: [
      { key: "footer.allFilms", label: "All films", href: "/films" },
      { label: "Beneath the Canopy", href: "/film/beneath-the-canopy" },
      { label: "Free Fish", href: "/film/free-fish" },
      { label: "The Classroom", href: "/film/the-classroom" },
    ],
  },
  {
    heading: "nav.studio",
    headingLabel: "Studio",
    links: [
      { key: "footer.docuseries", label: "Docuseries", href: "/studio" },
      { key: "footer.podcasts", label: "Podcasts & Videocasts", href: "/studio" },
      { key: "footer.productionCapacity", label: "Production Capacity", href: "/studio" },
    ],
  },
  {
    heading: "nav.academy",
    headingLabel: "Academy",
    links: [
      { key: "footer.allPrograms", label: "All programs", href: "/academy" },
      { key: "footer.courses", label: "Courses", href: "/academy" },
      { key: "footer.workshops", label: "Workshops", href: "/academy" },
      { key: "footer.toolkits", label: "Toolkits", href: "/academy" },
    ],
  },
  {
    heading: "nav.read",
    headingLabel: "Read",
    links: [
      { key: "footer.allArticles", label: "All articles", href: "/read" },
      { key: "footer.journalism", label: "Journalism", href: "/read" },
      { key: "footer.opinion", label: "Opinion", href: "/read" },
      { key: "footer.interviews", label: "Interviews", href: "/read" },
    ],
  },
  {
    heading: "footer.agenda",
    headingLabel: "Agenda",
    links: [
      { key: "footer.allEvents", label: "All events", href: "/agenda" },
      { key: "footer.screenings", label: "Screenings", href: "/agenda" },
      { key: "footer.workshops", label: "Workshops", href: "/agenda" },
    ],
  },
  {
    heading: "nav.support",
    headingLabel: "Support",
    links: [
      { key: "footer.supportWork", label: "Support the work", href: "/support" },
      { key: "footer.aboutDsh", label: "About DSH", href: "/about" },
    ],
  },
];

export default function Footer() {
  const footerRef = useReveal();
  const href = useLocaleHref();
  const t = useT();

  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A]" ref={footerRef}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Link columns */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-6">
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs tracking-[0.2em] text-[#363636] uppercase mb-4">
                {t(col.heading) || col.headingLabel}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.key ?? link.label}>
                    <Link
                      href={href(link.href)}
                      className="text-sm text-[#595C5C] hover:text-white transition-colors"
                    >
                      {link.key ? t(link.key) : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="reveal stagger-2 mt-10 sm:mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <Link href={href("/")} className="flex items-center gap-3">
            <Image
              src="/images/ic_logo_navbar.svg"
              alt="Don't Skip Humanity"
              width={100}
              height={41}
              className="w-[100px] h-auto"
              unoptimized
            />
          </Link>
          {/* The year is substituted rather than concatenated, so a translator
              can move it — Arabic puts it in a different place. */}
          <p className="text-xs text-[#363636] text-center">
            {t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              {t("footer.cookies")}
            </Link>
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
