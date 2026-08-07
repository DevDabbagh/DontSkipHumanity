"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

const FOOTER_LINKS = {
  Films: [
    { label: "All films", href: "/films" },
    { label: "Beneath the Canopy", href: "/film/beneath-the-canopy" },
    { label: "Free Fish", href: "/film/free-fish" },
    { label: "The Classroom", href: "/film/the-classroom" },
  ],
  Studio: [
    { label: "Docuseries", href: "/studio" },
    { label: "Podcasts & Videocasts", href: "/studio" },
    { label: "Production Capacity", href: "/studio" },
  ],
  Academy: [
    { label: "All programs", href: "/academy" },
    { label: "Courses", href: "/academy" },
    { label: "Workshops", href: "/academy" },
    { label: "Toolkits", href: "/academy" },
  ],
  Read: [
    { label: "All articles", href: "/read" },
    { label: "Journalism", href: "/read" },
    { label: "Opinion", href: "/read" },
    { label: "Interviews", href: "/read" },
  ],
  Agenda: [
    { label: "All events", href: "/agenda" },
    { label: "Screenings", href: "/agenda" },
    { label: "Workshops", href: "/agenda" },
  ],
  Support: [
    { label: "Support the work", href: "/support" },
    { label: "About DSH", href: "/about" },
  ],
};

export default function Footer() {
  const footerRef = useReveal();

  return (
    <footer className="border-t border-white/5 bg-[#0A0A0A]" ref={footerRef}>
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Link columns */}
        <div className="reveal grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-6">
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs tracking-[0.2em] text-[#363636] uppercase mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#595C5C] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="reveal stagger-2 mt-10 sm:mt-16 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/ic_logo.png"
              alt="Don't Skip Humanity"
              width={120}
              height={32}
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-xs text-[#363636] text-center">
            Copyright 2026 &copy; Don&apos;t Skip Humanity – an independent media company. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              Cookie Policy
            </Link>
            <Link href="#" className="text-xs text-[#363636] hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
