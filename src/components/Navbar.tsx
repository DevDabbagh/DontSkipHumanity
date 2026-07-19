"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Studio", href: "/films" },
  { label: "Academy", href: "/academy" },
  { label: "Read", href: "/read" },
  { label: "About", href: "/#about" },
  { label: "Support", href: "/#support" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav-animate fixed top-0 left-0 right-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/ic_logo.png"
            alt="Don't Skip Humanity"
            width={140}
            height={40}
            className="h-6 sm:h-7 lg:h-8 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav — centered */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] tracking-wide text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side — hamburger */}
        <button
          className="p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile/expanded menu */}
      {menuOpen && (
        <div className="bg-[#0D0D0D]/98 backdrop-blur-md border-t border-white/5 px-5 sm:px-8 py-5 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block text-gray-300 hover:text-white transition-colors py-2.5 text-sm border-b border-white/5 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
