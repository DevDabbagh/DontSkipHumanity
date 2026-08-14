"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const NAV_ACTIVE_COLOR = "#B23495";

function isNavLinkActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false; // anchor links never count as a page match
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NAV_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Studio", href: "/studio" },
  { label: "Academy", href: "/academy" },
  { label: "Read", href: "/read" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

const MENU_LINKS = NAV_LINKS;

const DEFAULT_SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/dontskiphumanity" },
  { label: "YouTube", href: "https://youtube.com/@dontskiphumanity" },
  { label: "Newsletter", href: "/#newsletter" },
];

const SOCIAL_KEY_TO_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, loading, signOut } = useAuth();
  const isLoggedIn = !!user;

  const [scrolled, setScrolled] = useState(false);
  const [socialLinks, setSocialLinks] = useState(DEFAULT_SOCIAL_LINKS);

  // Fetch social links from Supabase
  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "social_links")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed: Record<string, string> =
              typeof data.value === "string" ? JSON.parse(data.value) : data.value;
            const links = Object.entries(parsed)
              .filter(([, url]) => url && url.trim() !== "")
              .map(([key, url]) => ({
                label: SOCIAL_KEY_TO_LABEL[key] ?? key,
                href: url,
              }));
            // Always keep Newsletter link at the end
            links.push({ label: "Newsletter", href: "/#newsletter" });
            if (links.length > 1) setSocialLinks(links);
          } catch {
            // keep defaults
          }
        }
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <nav className={`nav-animate fixed top-0 left-0 right-0 z-40 bg-[#0D0D0D]/70 backdrop-blur-md ${
        scrolled ? "shadow-2xl shadow-black/30" : ""
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-[128px] grid grid-cols-[auto_1fr_auto] items-center">
          {/* Logo — fixed 127x52 SVG, no shrink on scroll */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/ic_logo_navbar.svg"
              alt="Don't Skip Humanity"
              width={127}
              height={52}
              className="w-[127px] h-[52px]"
              priority
            />
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden lg:flex items-center justify-center gap-7">
            {NAV_LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[13px] font-medium tracking-wide transition-colors ${active ? "" : "text-dsh-nav hover:text-dsh-nav-hover"}`}
                  style={active ? { color: NAV_ACTIVE_COLOR } : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="lg:hidden" />

          {/* Right side — Auth + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : !isLoggedIn ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-[13px] font-medium tracking-wide text-dsh-nav hover:text-dsh-nav-hover transition-colors"
              >
                Login
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#9B59B6] to-[#1ABC9C] border-2 border-transparent hover:border-white/50 transition-all focus:outline-none"
                >
                  {profile?.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="" width={36} height={36} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-xs sm:text-sm font-bold">{initials}</span>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-medium text-white">{profile?.fullName ?? "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                    <Link href="/academy" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Academy
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[#E74C3C] hover:bg-white/5 transition-colors">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger — always visible (Figma svg) */}
            <button
              className="p-2 opacity-90 hover:opacity-100 transition-opacity"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <Image src="/images/ic_menu.svg" alt="Menu" width={24} height={24} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen hamburger overlay */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#0D0D0D]" />

        {/* Top bar inside overlay — 3-column: logo | centered nav | close */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 grid grid-cols-3 items-center py-3">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0 justify-self-start" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/ic_logo_navbar.svg"
              alt="Don't Skip Humanity"
              width={127}
              height={52}
              className="w-[127px] h-[52px]"
              priority
            />
          </Link>

          {/* Center: nav links */}
          <div className="hidden lg:flex items-center justify-center gap-7">
            {NAV_LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[13px] font-medium tracking-wide transition-colors ${active ? "" : "text-dsh-nav hover:text-dsh-nav-hover"}`}
                  style={active ? { color: NAV_ACTIVE_COLOR } : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="lg:hidden" />

          {/* Right: CLOSE */}
          <div className="justify-self-end">
            <button
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-dsh-nav hover:text-dsh-nav-hover transition-colors"
            >
              <span className="text-xs tracking-widest uppercase hidden sm:inline">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu content */}
        <div className="relative z-10 flex flex-col justify-between h-[calc(100vh-80px)] max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          {/* Large navigation links */}
          <nav className="flex flex-col gap-1 pt-8 sm:pt-16">
            {MENU_LINKS.map((link, i) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-bold leading-none hover:text-[#B23495] transition-colors duration-300 ${
                    active ? "" : "text-dsh-nav-hover"
                  } ${menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                  style={{
                    fontSize: "clamp(1.5rem, 3.2vw, 2.75rem)",
                    transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                    paddingTop: "0.4em",
                    paddingBottom: "0.4em",
                    ...(active ? { color: NAV_ACTIVE_COLOR } : {}),
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Login link in menu */}
            {!isLoggedIn && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className={`text-left text-dsh-nav-hover font-bold leading-none hover:text-[#B23495] transition-colors duration-300 ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{
                  fontSize: "clamp(1.5rem, 3.2vw, 2.75rem)",
                  transitionDelay: menuOpen ? `${MENU_LINKS.length * 60}ms` : "0ms",
                  paddingTop: "0.3em",
                  paddingBottom: "0.3em",
                }}
              >
                Login
              </button>
            )}
          </nav>

          {/* Bottom: social links */}
          <div className="pb-8 sm:pb-12 flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={() => { if (!link.href.startsWith("http")) setMenuOpen(false); }}
                className="text-dsh-nav/50 text-sm hover:text-dsh-nav-hover transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
