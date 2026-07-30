"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "./LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/#about" },
  { label: "Support", href: "/#support" },
];

const MENU_LINKS = [
  { label: "Films", href: "/films" },
  { label: "Academy", href: "/academy" },
  { label: "About", href: "/#about" },
  { label: "Support", href: "/#support" },
  { label: "Membership", href: "/#support" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/dontskiphumanity" },
  { label: "Vimeo", href: "https://vimeo.com/dontskiphumanity" },
  { label: "Newsletter", href: "/#newsletter" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, loading, signOut } = useAuth();
  const isLoggedIn = !!user;

  const [scrolled, setScrolled] = useState(false);

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
      <nav className={`nav-animate fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
        scrolled
          ? "bg-[#0D0D0D]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-1"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent py-3"
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/ic_logo.png"
              alt="Don't Skip Humanity"
              width={180}
              height={52}
              className={`w-auto transition-all duration-500 ${scrolled ? 'h-7 sm:h-8 lg:h-9' : 'h-8 sm:h-10 lg:h-11'}`}
              priority
            />
          </Link>

          {/* Desktop Nav — centered */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] tracking-wide text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side — Auth + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : !isLoggedIn ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-sm font-medium text-[#F0F0F0] border border-white/20 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors"
              >
                Log in
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

            {/* Hamburger — always visible */}
            <button
              className="p-2 text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
              </svg>
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

        {/* Top bar inside overlay */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between py-3">
          <Link href="/" className="flex items-center shrink-0" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/ic_logo.png"
              alt="Don't Skip Humanity"
              width={180}
              height={52}
              className="h-8 sm:h-10 lg:h-11 w-auto"
              priority
            />
          </Link>

          {/* Right: nav links (desktop) + CLOSE */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13px] tracking-wide text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-[#F0F0F0]/70 hover:text-[#F0F0F0] transition-colors"
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
            {MENU_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-[#F0F0F0] font-bold leading-none hover:text-[#1ABC9C] transition-colors duration-300 ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                  paddingTop: "0.4em",
                  paddingBottom: "0.4em",
                }}
              >
                {link.label}
              </Link>
            ))}
            {/* Login link in menu */}
            {!isLoggedIn && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className={`text-left text-[#F0F0F0] font-bold leading-none hover:text-[#1ABC9C] transition-colors duration-300 ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  transitionDelay: menuOpen ? `${MENU_LINKS.length * 60}ms` : "0ms",
                  paddingTop: "0.4em",
                  paddingBottom: "0.4em",
                }}
              >
                Login
              </button>
            )}
          </nav>

          {/* Bottom: social links */}
          <div className="pb-8 sm:pb-12 flex items-center gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                onClick={() => { if (!link.href.startsWith("http")) setMenuOpen(false); }}
                className="text-[#F0F0F0]/40 text-sm hover:text-[#F0F0F0] transition-colors"
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
