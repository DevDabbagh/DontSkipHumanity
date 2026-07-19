"use client";

import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Academy", href: "/academy" },
  { label: "Read", href: "/read" },
  { label: "Agenda", href: "/agenda" },
];

export default function InternalNav({
  section,
  backLabel = "Home",
  backHref = "/",
}: {
  section?: string;
  backLabel?: string;
  backHref?: string;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Left: Logo + back */}
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/ic_logo.png"
              alt="DSH"
              width={100}
              height={28}
              className="h-5 sm:h-6 w-auto"
            />
          </Link>
          <span className="text-gray-700 hidden sm:inline">/</span>
          {backHref !== "/" && (
            <>
              <Link
                href={backHref}
                className="hidden sm:inline text-xs text-gray-400 hover:text-white transition-colors"
              >
                {backLabel}
              </Link>
              <span className="text-gray-700 hidden sm:inline">/</span>
            </>
          )}
          {section && (
            <span className="text-xs tracking-[0.15em] text-gray-500 uppercase">{section}</span>
          )}
        </div>

        {/* Right: nav links */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-xs tracking-wide transition-colors ${
                section?.toLowerCase() === link.label.toLowerCase()
                  ? "text-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile back */}
        <Link
          href={backHref}
          className="md:hidden text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
}
